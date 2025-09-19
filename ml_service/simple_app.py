from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from crop_plans import get_crop_plan, CROP_GROWING_DATABASE

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Simple health check
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'AgTech Crop Plan Service is running'})

# --- Mock Authentication Endpoints ---

@app.route('/auth/signup', methods=['POST'])
def mock_signup():
    """Mock signup endpoint"""
    try:
        data = request.get_json()
        
        # Mock user creation (in real app, this would save to database)
        mock_user = {
            "id": 1,
            "phone": data.get('phone', ''),
            "gmail": data.get('gmail', ''),
            "username": data.get('username', ''),
            "name": data.get('name', 'Test User'),
            "created_at": "2025-09-19T00:00:00Z"
        }
        
        # Mock token
        mock_token = "mock_jwt_token_12345"
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'user': mock_user,
            'token': mock_token
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Signup failed'
        }), 400

@app.route('/auth/signin', methods=['POST'])
def mock_signin():
    """Mock signin endpoint"""
    try:
        data = request.get_json()
        
        # Mock authentication (in real app, this would verify credentials)
        identifier = data.get('identifier', '')
        password = data.get('password', '')
        
        # For demo purposes, accept any non-empty credentials
        if not identifier or not password:
            return jsonify({
                'success': False,
                'error': 'Identifier and password are required'
            }), 400
        
        # Mock user data
        mock_user = {
            "id": 1,
            "phone": "1234567890",
            "gmail": "test@example.com",
            "username": identifier,
            "name": "Test Farmer",
            "last_login": "2025-09-19T00:00:00Z"
        }
        
        # Mock token
        mock_token = "mock_jwt_token_12345"
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': mock_user,
            'token': mock_token
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Login failed'
        }), 400

@app.route('/auth/profile', methods=['GET'])
def mock_profile():
    """Mock profile endpoint"""
    try:
        # Mock user profile (in real app, this would be based on JWT token)
        mock_user = {
            "id": 1,
            "phone": "1234567890",
            "gmail": "test@example.com",
            "username": "testuser",
            "name": "Test Farmer",
            "created_at": "2025-09-19T00:00:00Z",
            "last_login": "2025-09-19T00:00:00Z"
        }
        
        return jsonify(mock_user)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to get profile'
        }), 400

# Mock recommendation endpoint for the nice UI
@app.route('/recommend', methods=['POST'])
def get_crop_recommendations():
    """Mock crop recommendations endpoint"""
    try:
        data = request.get_json()
        
        # Mock data for demonstration
        mock_recommendations = [
            {
                "crop": "wheat",
                "confidence": 87.5,
                "expected_income": 75000,
                "rank": 1
            },
            {
                "crop": "rice", 
                "confidence": 82.3,
                "expected_income": 68000,
                "rank": 2
            },
            {
                "crop": "maize",
                "confidence": 78.1,
                "expected_income": 62000,
                "rank": 3
            },
            {
                "crop": "chickpea",
                "confidence": 74.6,
                "expected_income": 58000,
                "rank": 4
            }
        ]
        
        # Mock weather data
        mock_weather = {
            "temperature": 25.5,
            "humidity": 68,
            "rainfall": 45,
            "description": "Partly cloudy",
            "location": data.get('location', 'Your Location'),
            "country": "India"
        }
        
        # Mock soil analysis
        mock_soil = {
            "type": data.get('soil_type', 'loamy'),
            "N": 85,
            "P": 42,
            "K": 78,
            "pH": 6.8
        }
        
        response_data = {
            "success": True,
            "recommendations": mock_recommendations,
            "weather_data": mock_weather,
            "soil_analysis": mock_soil,
            "farm_size": data.get('farm_size', 5),
            "location": data.get('location', 'Your Location'),
            "message": "Crop recommendations generated successfully"
        }
        
        return jsonify(response_data)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'message': 'Failed to generate crop recommendations'
        }), 500

# --- Crop Growing Plan Endpoints ---

@app.route('/crop-plan/<crop_name>', methods=['GET'])
def get_crop_growing_plan(crop_name):
    """Get detailed growing plan for a specific crop"""
    try:
        # Get optional parameters
        soil_type = request.args.get('soil_type')
        location = request.args.get('location')
        farm_size = request.args.get('farm_size', type=float)
        
        # For now, we'll skip weather data to avoid API issues
        weather_data = None
        
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

# --- Mock Weather endpoint ---
@app.route('/weather', methods=['GET'])
def mock_weather():
    """Mock weather endpoint for simplified testing"""
    location = request.args.get('location', 'Unknown Location')
    
    # Mock weather data
    mock_weather_data = {
        'temperature': 25.5,
        'humidity': 65,
        'rainfall': 2.5,
        'description': 'partly cloudy',
        'location': location,
        'country': 'India',
        'matched_query': location
    }
    
    return jsonify(mock_weather_data)

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
    print("🚀 Starting AgTech Crop Plan Service...")
    print("📡 Available endpoints:")
    print("  - POST /auth/signup - User registration (mock)")
    print("  - POST /auth/signin - User login (mock)")
    print("  - GET /auth/profile - User profile (mock)")
    print("  - GET /weather - Get weather data (mock)")
    print("  - POST /recommend - Get crop recommendations (mock data)")
    print("  - GET /crop-plan/<crop_name> - Get detailed growing plan")
    print("  - GET /available-crops - List all available crops")
    print("  - GET /health - Service health check")
    
    app.run(debug=True, port=5002, host='0.0.0.0')