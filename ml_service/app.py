from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import joblib
import pandas as pd
import requests
import numpy as np
from auth import (
    init_database, create_user, authenticate_user, 
    generate_jwt_token, require_auth, get_user_by_id
)
from crop_plans import get_crop_plan, CROP_GROWING_DATABASE

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Initialize authentication database
init_database()

# --- Paths ---
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "processed", "recommender_bundle.joblib")
RAW_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "raw", "crop_data.csv")

# --- Load trained model ---
try:
    bundle = joblib.load(MODEL_PATH)
    model = bundle['model']
    scaler = bundle['scaler']
    le_crop = bundle['le_crop']
    print("✓ Model loaded successfully")
except FileNotFoundError:
    print("⚠ Model not found, will train a new one")
    model, scaler, le_crop = None, None, None

columns = ['N','P','K','temperature','humidity','ph','rainfall']

# --- Helper functions ---
def get_weather(location):
    API_KEY = "4d19f114b9a009de80879581e8003901"  # replace with your key
    
    # Clean and format location name
    location = location.strip().title()  # Convert to proper case
    
    # Try with original location first
    locations_to_try = [location]
    
    # Add state/country combinations for Indian locations
    if ',' not in location:
        # Common Indian agricultural regions for better matching
        state_combinations = [
            f"{location}, Maharashtra, India",
            f"{location}, Punjab, India", 
            f"{location}, Uttar Pradesh, India",
            f"{location}, Karnataka, India",
            f"{location}, Tamil Nadu, India",
            f"{location}, Gujarat, India",
            f"{location}, Rajasthan, India",
            f"{location}, Madhya Pradesh, India",
            f"{location}, India"
        ]
        locations_to_try.extend(state_combinations)
    
    for loc in locations_to_try:
        try:
            url = f"http://api.openweathermap.org/data/2.5/weather?q={loc}&appid={API_KEY}&units=metric"
            res = requests.get(url, timeout=10).json()
            
            # Check if API call was successful
            if res.get('cod') == 200:
                temp = res['main']['temp']
                humidity = res['main']['humidity']
                rainfall = res.get('rain', {}).get('1h', 0)  # rainfall in mm last 1 hour
                description = res['weather'][0]['description'] if 'weather' in res else 'clear'
                country = res.get('sys', {}).get('country', 'Unknown')
                state = res.get('name', loc)
                
                return {
                    'temperature': temp,
                    'humidity': humidity,
                    'rainfall': rainfall,
                    'description': description,
                    'location': state,
                    'country': country,
                    'matched_query': loc
                }
        except requests.exceptions.RequestException:
            continue
    
    # If no location worked, raise an error with suggestions
    raise ValueError(f"Location '{location}' not found. Try: Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad, Pune, Ahmedabad, Jaipur, Lucknow, or add state name like 'Nashik, Maharashtra'")

def comprehensive_soil_features(soil_type):
    """Enhanced soil nutrient mapping for comprehensive soil types"""
    mapping = {
        'sandy': [60, 25, 25, 6.0],      # Low nutrients, acidic
        'clay': [90, 45, 50, 7.2],       # High nutrients, alkaline
        'loamy': [80, 42, 40, 6.8],      # Balanced, ideal for crops
        'silty': [85, 40, 35, 6.5],      # Good nutrients, slightly acidic
        'peaty': [70, 30, 30, 5.5],      # Organic, acidic
        'chalky': [75, 35, 45, 8.0],     # Alkaline, good drainage
        'saline': [50, 20, 30, 7.5],     # Poor for most crops
        'black_cotton': [95, 50, 55, 7.0] # Very fertile
    }
    return mapping.get(soil_type.lower(), [80, 35, 35, 6.5])  # Default to balanced

def calculate_expected_income(crop, farm_size, soil_type):
    """Calculate expected income based on crop, farm size, and soil type"""
    # Market prices per quintal (100kg) in Indian Rupees
    crop_prices = {
        'rice': 2500, 'wheat': 2200, 'maize': 2000, 'cotton': 6000,
        'jute': 4500, 'coconut': 12000, 'coffee': 8000, 'banana': 1500,
        'apple': 8000, 'orange': 3000, 'mango': 4000, 'grapes': 6000,
        'watermelon': 800, 'muskmelon': 1200, 'papaya': 1800,
        'pomegranate': 7000, 'lentil': 5000, 'chickpea': 4500,
        'kidneybeans': 6000, 'pigeonpeas': 5500, 'mothbeans': 4000,
        'mungbean': 6500, 'blackgram': 5800
    }
    
    # Average yield per acre in quintals
    crop_yields = {
        'rice': 25, 'wheat': 20, 'maize': 28, 'cotton': 15,
        'jute': 20, 'coconut': 50, 'coffee': 8, 'banana': 300,
        'apple': 80, 'orange': 120, 'mango': 60, 'grapes': 100,
        'watermelon': 200, 'muskmelon': 150, 'papaya': 250,
        'pomegranate': 100, 'lentil': 12, 'chickpea': 15,
        'kidneybeans': 18, 'pigeonpeas': 14, 'mothbeans': 10,
        'mungbean': 8, 'blackgram': 10
    }
    
    base_price = crop_prices.get(crop.lower(), 3000)
    base_yield = crop_yields.get(crop.lower(), 20)
    farm_size_num = float(farm_size)
    
    # Soil factor - different soils have different productivity
    soil_factors = {
        'loamy': 1.2, 'black_cotton': 1.15, 'clay': 1.1,
        'silty': 1.05, 'sandy': 0.8, 'chalky': 0.9,
        'peaty': 0.95, 'saline': 0.6
    }
    
    soil_factor = soil_factors.get(soil_type.lower(), 1.0)
    
    # Calculate expected income
    total_yield = base_yield * farm_size_num * soil_factor
    gross_income = total_yield * base_price
    
    # Subtract estimated costs (seeds, fertilizers, labor, etc.)
    cost_factor = 0.6  # Assume 60% goes to costs
    net_income = gross_income * (1 - cost_factor)
    
    return round(net_income, 2)

def train_model_from_data():
    """Train model on-the-fly if not available"""
    global model, scaler, le_crop
    try:
        from sklearn.ensemble import RandomForestClassifier
        from sklearn.preprocessing import LabelEncoder, StandardScaler
        from sklearn.model_selection import train_test_split
        
        # Load raw data
        df = pd.read_csv(RAW_DATA_PATH)
        X = df[columns]
        y = df['label']
        
        # Encode labels and scale features
        le_crop = LabelEncoder()
        y_encoded = le_crop.fit_transform(y)
        
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Train model
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_scaled, y_encoded)
        
        # Save the bundle
        bundle = {'model': model, 'scaler': scaler, 'le_crop': le_crop}
        os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
        joblib.dump(bundle, MODEL_PATH)
        
        print("✓ Model trained and saved successfully")
        return True
    except Exception as e:
        print(f"✗ Model training failed: {str(e)}")
        return False

# --- API endpoint ---
@app.route('/recommend', methods=['POST'])
def recommend_crop():
    try:
        # Optional authentication - get current user if token provided
        current_user = None
        token = request.headers.get('Authorization')
        if token:
            if token.startswith('Bearer '):
                token = token[7:]
            from auth import verify_jwt_token, get_user_by_id
            payload = verify_jwt_token(token)
            if payload:
                current_user = get_user_by_id(payload['user_id'])
        data = request.get_json()

        # Validate inputs
        soil_type = data.get('soil_type')
        farm_size = float(data.get('farm_size', 1))
        location = data.get('location')

        if not soil_type or not location:
            return jsonify({'error': 'soil_type and location are required'}), 400

        if soil_type.lower() not in ['loamy', 'sandy', 'clay', 'silty']:
            return jsonify({'error': 'Invalid soil type'}), 400

        # Get weather data
        weather_data = get_weather(location)
        temp = weather_data['temperature']
        humidity = weather_data['humidity']
        rainfall = weather_data['rainfall']

        # 3️⃣ Prepare model features
        N, P, K, ph = comprehensive_soil_features(soil_type)
        input_df = pd.DataFrame([[N,P,K,temp,humidity,ph,rainfall]], columns=columns)
        
        # Handle case where model isn't loaded
        if model is None or scaler is None or le_crop is None:
            # Train model on the fly if not available
            train_model_from_data()
            return jsonify({'error': 'Model training in progress, please try again'}), 503
            
        input_scaled = scaler.transform(input_df)

        # 4️⃣ Predict crop with confidence scores
        pred_proba = model.predict_proba(input_scaled)[0]
        top_3_indices = np.argsort(pred_proba)[-3:][::-1]
        
        recommendations = []
        for i, idx in enumerate(top_3_indices):
            crop = le_crop.inverse_transform([idx])[0]
            confidence = pred_proba[idx] * 100
            
            # Calculate estimated income based on crop type and farm size
            expected_income = calculate_expected_income(crop, farm_size, soil_type)
            
            recommendations.append({
                'crop': crop,
                'confidence': round(confidence, 1),
                'expected_income': expected_income,
                'rank': i + 1
            })

        return jsonify({
            'recommendations': recommendations,
            'weather_data': weather_data,
            'soil_analysis': {
                'type': soil_type,
                'N': N, 'P': P, 'K': K, 'pH': ph
            },
            'farm_size': farm_size,
            'location': location
        })

    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- Weather endpoint for frontend ---
@app.route('/weather', methods=['GET'])
def weather_info():
    """Get weather information for a location"""
    try:
        location = request.args.get('location')
        if not location:
            return jsonify({'error': 'Location parameter is required'}), 400
            
        weather_data = get_weather(location)
        return jsonify(weather_data)
        
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- Authentication endpoints ---
@app.route('/auth/signup', methods=['POST'])
def signup():
    """User registration endpoint"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['phone', 'gmail', 'username', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        phone = data.get('phone')
        gmail = data.get('gmail')
        username = data.get('username')
        password = data.get('password')
        name = data.get('name', username)  # Use username as name if name not provided
        
        # Basic validation
        if len(phone) != 10 or not phone.isdigit():
            return jsonify({'error': 'Phone number must be exactly 10 digits'}), 400
        
        if not gmail.endswith('@gmail.com'):
            return jsonify({'error': 'Email must be a valid Gmail address'}), 400
        
        if len(password) < 8:
            return jsonify({'error': 'Password must be at least 8 characters long'}), 400
        
        # Create user
        result = create_user(phone, gmail, username, password, name)
        
        if not result['success']:
            return jsonify({'error': result['error']}), 400
        
        return jsonify({
            'success': True,
            'message': 'User created successfully',
            'user': result['user']
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/auth/signin', methods=['POST'])
def signin():
    """User login endpoint"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('identifier') or not data.get('password'):
            return jsonify({'error': 'Identifier (phone/email/username) and password are required'}), 400
        
        identifier = data.get('identifier')
        password = data.get('password')
        
        # Authenticate user
        result = authenticate_user(identifier, password)
        
        if not result['success']:
            return jsonify({'error': result['error']}), 401
        
        # Generate JWT token
        token = generate_jwt_token(result['user'])
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': result['user'],
            'token': token
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/auth/profile', methods=['GET'])
@require_auth
def get_profile():
    """Get current user profile (protected route)"""
    return jsonify({
        'success': True,
        'user': request.current_user
    }), 200

@app.route('/auth/verify', methods=['GET'])
@require_auth
def verify_token():
    """Verify if token is valid (protected route)"""
    return jsonify({
        'success': True,
        'message': 'Token is valid',
        'user': request.current_user
    }), 200

# --- Health check endpoint ---
@app.route('/health', methods=['GET'])
def health_check():
    """Check if the service is running and model is loaded"""
    model_status = "loaded" if model is not None else "not_loaded"
    return jsonify({
        'status': 'healthy',
        'model_status': model_status,
        'available_endpoints': ['/recommend', '/weather', '/health', '/auth/signup', '/auth/signin', '/auth/profile', '/auth/verify']
    })

# --- Crop Growing Plan Endpoints ---

@app.route('/crop-plan/<crop_name>', methods=['GET'])
def get_crop_growing_plan(crop_name):
    """Get detailed growing plan for a specific crop"""
    try:
        # Get optional parameters
        soil_type = request.args.get('soil_type')
        location = request.args.get('location')
        farm_size = request.args.get('farm_size', type=float)
        
        # Get weather data if location provided
        weather_data = None
        if location:
            weather_data = get_weather(location)
        
        # Get comprehensive crop plan
        crop_plan = get_crop_plan(
            crop_name=crop_name,
            soil_type=soil_type,
            weather_data=weather_data,
            farm_size=farm_size
        )
        
        if 'error' in crop_plan:
            return jsonify(crop_plan), 404
        
        return jsonify({
            'success': True,
            'crop_plan': crop_plan,
            'message': f'Growing plan for {crop_name} generated successfully'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to generate crop growing plan'
        }), 500

@app.route('/available-crops', methods=['GET'])
def get_available_crops():
    """Get list of all crops with growing plans available"""
    try:
        crops_info = []
        for crop_name, crop_data in CROP_GROWING_DATABASE.items():
            crops_info.append({
                'name': crop_name,
                'display_name': crop_data['name'],
                'duration_days': crop_data['duration_days'],
                'best_planting_months': crop_data['best_planting_months'],
                'category': get_crop_category(crop_name)
            })
        
        return jsonify({
            'success': True,
            'crops': crops_info,
            'total_crops': len(crops_info)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to fetch available crops'
        }), 500

def get_crop_category(crop_name):
    """Helper function to get crop category"""
    cereal_crops = ["rice", "wheat", "maize"]
    pulse_crops = ["chickpea", "kidneybeans", "pigeonpeas", "mothbeans", "mungbean", "blackgram", "lentil"]
    fruit_crops = ["pomegranate", "banana", "mango", "grapes", "watermelon", "muskmelon", "apple", "orange", "papaya", "coconut"]
    cash_crops = ["cotton", "jute", "coffee"]
    
    crop_lower = crop_name.lower()
    
    if crop_lower in cereal_crops:
        return "Cereal"
    elif crop_lower in pulse_crops:
        return "Pulse"
    elif crop_lower in fruit_crops:
        return "Fruit"
    elif crop_lower in cash_crops:
        return "Cash Crop"
    else:
        return "Other"

if __name__ == "__main__":
    # Train model if not available
    if model is None:
        print("Training model on startup...")
        train_model_from_data()
    
    print("🚀 Starting AgTech ML Service...")
    print("📡 Available endpoints:")
    print("  - POST /recommend - Get crop recommendations")
    print("  - GET /weather?location=<city> - Get weather data") 
    print("  - GET /crop-plan/<crop_name> - Get detailed growing plan")
    print("  - GET /available-crops - List all available crops")
    print("  - GET /health - Service health check")
    
    app.run(debug=True, port=5002, host='0.0.0.0')
