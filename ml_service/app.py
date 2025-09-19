from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import joblib
import pandas as pd
import requests
import numpy as np
from datetime import datetime, timedelta
import calendar
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
    """Get weather information for a given location with improved reliability and data"""
    # Get API key from environment variables or use the hardcoded one as backup
    API_KEY = os.environ.get("OPENWEATHER_API_KEY", "4d19f114b9a009de80879581e8003901")
    
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
            f"{location}, Andhra Pradesh, India",
            f"{location}, West Bengal, India",
            f"{location}, Bihar, India",
            f"{location}, Telangana, India",
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
                
                # Enhanced rainfall calculation - check both 1h and 3h rainfall
                rainfall_1h = res.get('rain', {}).get('1h', 0)  # rainfall in mm last 1 hour
                rainfall_3h = res.get('rain', {}).get('3h', 0)  # rainfall in mm last 3 hours
                rainfall = max(rainfall_1h, rainfall_3h/3)  # Use the higher value (normalized)
                
                # Get more detailed weather information
                weather_data = res.get('weather', [{}])[0]
                description = weather_data.get('description', 'clear')
                weather_main = weather_data.get('main', 'Clear')
                weather_id = weather_data.get('id', 800)
                
                # Get location information
                country = res.get('sys', {}).get('country', 'Unknown')
                state = res.get('name', loc)
                
                # Get current date
                current_date = datetime.now().strftime("%Y-%m-%d")
                
                # Calculate seasonal rainfall average for location based on month
                month = datetime.now().month
                season_rainfall = 0
                
                # Simplified seasonal rainfall pattern for India
                if 6 <= month <= 9:  # Monsoon season (June-September)
                    season_rainfall = 150  # mm per month average
                elif 10 <= month <= 11:  # Post-monsoon (October-November)
                    season_rainfall = 50   # mm per month average
                elif month == 12 or 1 <= month <= 2:  # Winter (December-February)
                    season_rainfall = 20   # mm per month average
                else:  # Summer/pre-monsoon (March-May)
                    season_rainfall = 30   # mm per month average
                
                # Adjust rainfall with seasonal context if actual rainfall is very low
                if rainfall < 0.1:
                    # Use seasonal average divided by days in a month for daily estimate
                    # Add location-based variation to avoid identical values for all locations
                    base_rainfall = season_rainfall / 30
                    
                    # Use location coordinates to create location-specific variation
                    lat = res.get('coord', {}).get('lat', 0)
                    lon = res.get('coord', {}).get('lon', 0)
                    
                    # More meaningful geographic adjustments for India's rainfall patterns
                    # Western coastal regions get more rain during monsoon
                    coastal_boost = 1.0
                    if 72 <= lon <= 77 and 8 <= lat <= 20:  # Western coast (Kerala, Karnataka, Goa, Maharashtra coast)
                        coastal_boost = 1.4  # 40% more rain on western coast during monsoon
                    
                    # North and central India typically gets less rainfall than coastal areas
                    interior_reduction = 1.0
                    if 75 <= lon <= 85 and 25 <= lat <= 32:  # North Indian plains
                        interior_reduction = 0.7  # 30% less in northern plains
                    
                    # Northeast gets high rainfall
                    northeast_boost = 1.0
                    if 90 <= lon <= 97 and 23 <= lat <= 28:  # Northeast India
                        northeast_boost = 1.5  # 50% more in northeast
                        
                    # Combine all geographic factors
                    location_factor = coastal_boost * interior_reduction * northeast_boost
                    
                    # Add some randomness to avoid too predictable patterns (±10%)
                    import random
                    random_factor = 0.9 + random.random() * 0.2
                    
                    # Use current humidity to further adjust rainfall (places with higher humidity likely have more rainfall)
                    humidity_factor = 0.9 + (humidity / 1000)  # Small adjustment based on humidity
                    
                    rainfall = base_rainfall * location_factor * humidity_factor * random_factor
                
                return {
                    'temperature': temp,
                    'humidity': humidity,
                    'rainfall': rainfall,
                    'description': description,
                    'weather_main': weather_main,
                    'weather_id': weather_id,
                    'location': state,
                    'country': country,
                    'date': current_date,
                    'matched_query': loc,
                    'season_rainfall': season_rainfall
                }
        except requests.exceptions.RequestException:
            continue
    
    # If no location worked, return default values based on region with a warning
    print(f"Warning: Location '{location}' not found. Using default values for India.")
    
    # Default values for India based on current month
    month = datetime.now().month
    default_temp = 28  # Average temperature
    default_humidity = 65  # Average humidity
    default_rainfall = 2  # mm/day
    
    # Adjust defaults by season
    if 6 <= month <= 9:  # Monsoon
        default_temp = 30
        default_humidity = 80
        default_rainfall = 8  # mm/day
    elif 10 <= month <= 11:  # Post-monsoon
        default_temp = 26
        default_humidity = 60
        default_rainfall = 2  # mm/day
    elif month == 12 or 1 <= month <= 2:  # Winter
        default_temp = 22
        default_humidity = 50
        default_rainfall = 0.5  # mm/day
    else:  # Summer/pre-monsoon
        default_temp = 35
        default_humidity = 40
        default_rainfall = 1  # mm/day
    
    return {
        'temperature': default_temp,
        'humidity': default_humidity,
        'rainfall': default_rainfall,
        'description': 'default weather data',
        'weather_main': 'Clear',
        'weather_id': 800,
        'location': location,
        'country': 'India',
        'date': datetime.now().strftime("%Y-%m-%d"),
        'matched_query': None,
        'is_default': True
    }

def calculate_planting_suitability(crop_name):
    """Calculate how suitable the current date is for planting this crop
    
    Returns:
    - planting_suitability: float (0-1) where 1 is perfect planting time
    - days_to_harvest: int - estimated days from now until harvest
    - harvest_date: string - estimated harvest date
    - is_optimal_planting: bool - whether current month is optimal for planting
    """
    crop_info = get_crop_details(crop_name)
    
    # Get current date
    current_date = datetime.now()
    current_month = current_date.month
    
    # Check if current month is in optimal planting months
    planting_months = crop_info.get('planting_months', [])
    is_optimal_planting = current_month in planting_months
    
    # Calculate planting suitability score (0-1)
    if is_optimal_planting:
        planting_suitability = 1.0
    else:
        # Find the closest optimal planting month
        if not planting_months:
            planting_suitability = 0.5  # Default if no data
        else:
            # Calculate months until next planting season
            months_until_next_planting = min(
                [(m - current_month) % 12 for m in planting_months])
            
            if months_until_next_planting == 0:
                planting_suitability = 1.0
            elif months_until_next_planting <= 1:
                planting_suitability = 0.8
            elif months_until_next_planting <= 3:
                planting_suitability = 0.6
            elif months_until_next_planting <= 6:
                planting_suitability = 0.3
            else:
                planting_suitability = 0.2
    
    # Calculate estimated harvest date
    growing_period_days = crop_info.get('growing_period_days', 120)  # Default to 120 days
    harvest_date = current_date + timedelta(days=growing_period_days)
    
    return {
        'planting_suitability': planting_suitability,
        'days_to_harvest': growing_period_days,
        'harvest_date': harvest_date.strftime('%Y-%m-%d'),
        'is_optimal_planting': is_optimal_planting,
        'optimal_planting_months': [calendar.month_name[m] for m in planting_months]
    }

def comprehensive_soil_features(soil_type):
    """Enhanced soil nutrient mapping for comprehensive soil types with more diverse values"""
    # Mapping structure: [N, P, K, pH]
    # This has been adjusted to provide more diversity in recommendations
    mapping = {
        'sandy': [55, 25, 20, 6.0],      # Low nutrients, acidic - adjusted for more diversity
        'clay': [95, 45, 55, 7.3],       # High nutrients, alkaline - slightly more alkaline
        'loamy': [75, 40, 38, 6.7],      # Balanced, ideal for crops - slightly adjusted
        'silty': [82, 38, 35, 6.4],      # Good nutrients, slightly acidic - minor adjustment
        'peaty': [68, 32, 28, 5.4],      # Organic, acidic - more acidic
        'chalky': [72, 36, 45, 8.2],     # Alkaline, good drainage - more alkaline
        'saline': [45, 18, 32, 7.6],     # Poor for most crops - more extreme
        'black_cotton': [98, 52, 55, 7.1] # Very fertile - enhanced fertility
    }
    
    # If soil type is not recognized, use a more balanced default
    # This helps avoid biased recommendations for unknown soil types
    if soil_type.lower() not in mapping:
        # Get current month to adjust default values by season
        month = datetime.now().month
        
        # Seasonal adjustments to default values
        if 6 <= month <= 9:  # Monsoon (June-Sept)
            return [75, 38, 40, 6.8]  # Higher N during rainy season
        elif 10 <= month <= 11:  # Post-monsoon (Oct-Nov)
            return [78, 40, 38, 6.9]  # Balanced post-rain
        elif month == 12 or 1 <= month <= 2:  # Winter (Dec-Feb) 
            return [72, 42, 35, 7.0]  # Higher P in winter
        else:  # Summer/pre-monsoon (Mar-May)
            return [65, 32, 42, 6.7]  # Higher K in summer
    
    return mapping.get(soil_type.lower())

def get_soil_health_status(n, p, k, ph):
    """Evaluate soil health based on NPK and pH values"""
    health_score = 0
    status = ""
    
    # Evaluate N (Nitrogen) - good range is typically 60-90
    if 70 <= n <= 95:
        health_score += 30
    elif 50 <= n < 70 or 95 < n <= 120:
        health_score += 20
    else:
        health_score += 10
    
    # Evaluate P (Phosphorus) - good range is typically 30-50
    if 35 <= p <= 50:
        health_score += 30
    elif 25 <= p < 35 or 50 < p <= 60:
        health_score += 20
    else:
        health_score += 10
    
    # Evaluate K (Potassium) - good range is typically 30-50
    if 30 <= k <= 50:
        health_score += 30
    elif 20 <= k < 30 or 50 < k <= 60:
        health_score += 20
    else:
        health_score += 10
    
    # Evaluate pH - good range is typically 6.0-7.5
    if 6.0 <= ph <= 7.5:
        health_score += 20
    elif 5.5 <= ph < 6.0 or 7.5 < ph <= 8.0:
        health_score += 15
    else:
        health_score += 5
    
    # Calculate overall health status
    if health_score >= 90:
        status = "Excellent"
    elif health_score >= 70:
        status = "Good"
    elif health_score >= 50:
        status = "Moderate"
    elif health_score >= 30:
        status = "Poor"
    else:
        status = "Very Poor"
    
    return {
        'score': health_score,
        'status': status,
        'n_status': 'Good' if 70 <= n <= 95 else 'Moderate' if 50 <= n < 70 or 95 < n <= 120 else 'Poor',
        'p_status': 'Good' if 35 <= p <= 50 else 'Moderate' if 25 <= p < 35 or 50 < p <= 60 else 'Poor',
        'k_status': 'Good' if 30 <= k <= 50 else 'Moderate' if 20 <= k < 30 or 50 < k <= 60 else 'Poor',
        'ph_status': 'Good' if 6.0 <= ph <= 7.5 else 'Moderate' if 5.5 <= ph < 6.0 or 7.5 < ph <= 8.0 else 'Poor'
    }

def get_soil_improvement_tips(soil_type, n, p, k, ph):
    """Get soil improvement recommendations based on soil analysis"""
    tips = []
    
    # N (Nitrogen) recommendations
    if n < 50:
        tips.append("Add nitrogen-rich fertilizers like urea, ammonium sulfate, or organic matter such as compost and well-rotted manure.")
    elif n > 100:
        tips.append("Reduce nitrogen application and consider planting nitrogen-consuming crops like corn or leafy greens.")
    
    # P (Phosphorus) recommendations
    if p < 30:
        tips.append("Add phosphorus-rich fertilizers like bone meal, rock phosphate, or DAP (Diammonium Phosphate).")
    elif p > 55:
        tips.append("Avoid additional phosphorus fertilizers. Excessive phosphorus can inhibit micronutrient uptake.")
    
    # K (Potassium) recommendations
    if k < 25:
        tips.append("Add potassium-rich fertilizers like potash, wood ash, or seaweed extract.")
    elif k > 55:
        tips.append("Avoid additional potassium fertilizers. Consider planting potassium-consuming crops.")
    
    # pH recommendations
    if ph < 5.5:
        tips.append("Apply agricultural lime or dolomite to raise soil pH. This makes nutrients more available to plants.")
    elif ph > 7.8:
        tips.append("Add elemental sulfur, aluminum sulfate, or organic matter like pine needles to lower soil pH.")
    
    # Soil type specific recommendations
    if soil_type.lower() == 'sandy':
        tips.append("Add organic matter like compost or well-rotted manure to improve water and nutrient retention.")
    elif soil_type.lower() == 'clay':
        tips.append("Add organic matter and consider deep tillage to improve drainage and aeration.")
    elif soil_type.lower() == 'silty':
        tips.append("Add organic matter and avoid overworking when wet to maintain soil structure.")
    
    # If soil is generally good
    if 70 <= n <= 95 and 35 <= p <= 50 and 30 <= k <= 50 and 6.0 <= ph <= 7.5:
        tips.append("Your soil is in good condition. Continue regular soil testing and maintain organic matter through crop rotation and cover cropping.")
    
    return tips

def get_crop_details(crop_name):
    """Get detailed information about a crop for recommendations"""
    crop_database = {
        'rice': {
            'growing_period': '3-6 months',
            'growing_period_days': 120,  # Average days to maturity
            'planting_months': [6, 7, 8],  # June to August (main Kharif season)
            'harvesting_months': [11, 12, 1],  # November to January
            'water_requirements': 'High',
            'soil_suitability': 'Clay, Loamy',
            'description': 'A staple food crop grown in flooded fields, requires ample water and warm climate.'
        },
        'wheat': {
            'growing_period': '4-5 months',
            'growing_period_days': 135,  # Average days to maturity
            'planting_months': [10, 11, 12],  # October to December
            'harvesting_months': [3, 4, 5],  # March to May
            'water_requirements': 'Medium',
            'soil_suitability': 'Loamy, Clay loam',
            'description': 'A hardy cereal crop suitable for cooler seasons, especially winter.'
        },
        'maize': {
            'growing_period': '3-4 months',
            'growing_period_days': 100,  # Average days to maturity
            'planting_months': [6, 7, 8, 2, 3],  # June-August (Kharif) and Feb-March (Rabi)
            'harvesting_months': [9, 10, 11, 5, 6],  # September-November and May-June
            'water_requirements': 'Medium',
            'soil_suitability': 'Loamy, Sandy loam',
            'description': 'Fast-growing crop with high yield potential, adaptable to various climates.'
        },
        'cotton': {
            'growing_period': '5-6 months',
            'growing_period_days': 160,  # Average days to maturity
            'planting_months': [4, 5, 6],  # April to June
            'harvesting_months': [10, 11, 12],  # October to December
            'water_requirements': 'Medium',
            'soil_suitability': 'Black cotton, Loamy',
            'description': 'Commercial fiber crop that thrives in warm weather with moderate rainfall.'
        },
        'jute': {
            'growing_period': '4-5 months',
            'growing_period_days': 140,  # Average days to maturity
            'planting_months': [3, 4, 5],  # March to May
            'harvesting_months': [7, 8, 9],  # July to September
            'water_requirements': 'High',
            'soil_suitability': 'Loamy, Clay',
            'description': 'Fiber crop that requires warm, humid conditions and well-drained soil.'
        },
        'coconut': {
            'growing_period': 'Perennial (6-9 years to first fruit)',
            'growing_period_days': 2555,  # ~7 years in days
            'planting_months': [6, 7, 8],  # Monsoon planting
            'harvesting_months': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],  # Year-round once mature
            'water_requirements': 'Medium',
            'soil_suitability': 'Sandy loam, Loamy',
            'description': 'Tropical palm that thrives in coastal areas with good sunlight.'
        },
        'coffee': {
            'growing_period': 'Perennial (3-4 years to first harvest)',
            'growing_period_days': 1277,  # ~3.5 years in days
            'planting_months': [6, 7, 8],  # Monsoon planting
            'harvesting_months': [11, 12, 1, 2],  # November to February once mature
            'water_requirements': 'Medium',
            'soil_suitability': 'Loamy, Well-drained',
            'description': 'Grows best in elevated regions with moderate temperature and rainfall.'
        },
        'banana': {
            'growing_period': '10-15 months',
            'growing_period_days': 365,  # ~12 months
            'planting_months': [1, 2, 3, 6, 7, 8],  # Jan-Mar or Jun-Aug
            'harvesting_months': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],  # Year-round depending on planting
            'water_requirements': 'High',
            'soil_suitability': 'Loamy, Alluvial',
            'description': 'Fast-growing tropical fruit crop that needs consistent moisture and warmth.'
        },
        'apple': {
            'growing_period': 'Perennial (3-5 years to fruit)',
            'growing_period_days': 1460,  # ~4 years in days
            'planting_months': [12, 1, 2],  # December to February
            'harvesting_months': [7, 8, 9, 10],  # July to October once mature
            'water_requirements': 'Medium',
            'soil_suitability': 'Loamy, Well-drained',
            'description': 'Temperate fruit tree that requires winter chilling and well-drained soil.'
        },
        'orange': {
            'growing_period': 'Perennial (2-3 years to fruit)',
            'water_requirements': 'Medium',
            'soil_suitability': 'Loamy, Sandy loam',
            'description': 'Citrus fruit that grows well in subtropical regions with moderate rainfall.'
        },
        'mango': {
            'growing_period': 'Perennial (4-5 years to fruit)',
            'water_requirements': 'Medium',
            'soil_suitability': 'Loamy, Well-drained',
            'description': 'Tropical fruit tree that needs dry conditions during flowering.'
        },
        'grapes': {
            'growing_period': 'Perennial (2-3 years to fruit)',
            'water_requirements': 'Low to Medium',
            'soil_suitability': 'Loamy, Sandy',
            'description': 'Vine crop that requires good sunlight and controlled water conditions.'
        },
        'watermelon': {
            'growing_period': '3-4 months',
            'growing_period_days': 100,  # Average days to maturity
            'planting_months': [1, 2, 3, 10, 11, 12],  # Jan-Mar (Spring crop) and Oct-Dec (Winter crop)
            'harvesting_months': [4, 5, 6, 1, 2, 3],  # Apr-Jun and Jan-Mar
            'water_requirements': 'Medium',
            'soil_suitability': 'Sandy loam, Loamy',
            'description': 'Summer fruit crop that needs warm conditions and well-drained soil.'
        },
        'muskmelon': {
            'growing_period': '3-4 months',
            'growing_period_days': 90,  # Average days to maturity
            'planting_months': [1, 2, 3, 10, 11],  # Jan-Mar (Spring crop) and Oct-Nov (Winter crop)
            'harvesting_months': [4, 5, 6, 1, 2],  # Apr-Jun and Jan-Feb
            'water_requirements': 'Medium',
            'soil_suitability': 'Sandy loam, Loamy',
            'description': 'Sweet summer fruit that grows well in warm, sunny conditions.'
        },
        'papaya': {
            'growing_period': '8-10 months to first fruit',
            'growing_period_days': 270,  # ~9 months in days
            'planting_months': [6, 7, 8],  # June to August
            'harvesting_months': [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2],  # Year-round once mature
            'water_requirements': 'Medium',
            'soil_suitability': 'Loamy, Sandy loam',
            'description': 'Fast-growing tropical fruit tree that produces year-round.'
        },
        'pomegranate': {
            'growing_period': 'Perennial (2-3 years to fruit)',
            'water_requirements': 'Low to Medium',
            'soil_suitability': 'Well-drained, Loamy',
            'description': 'Drought-resistant fruit tree suitable for arid and semi-arid regions.'
        },
        'lentil': {
            'growing_period': '3-4 months',
            'water_requirements': 'Low to Medium',
            'soil_suitability': 'Loamy, Well-drained',
            'description': 'Cool season pulse crop with high protein content.'
        },
        'chickpea': {
            'growing_period': '3-4 months',
            'water_requirements': 'Low to Medium',
            'soil_suitability': 'Sandy loam, Loamy',
            'description': 'Drought-tolerant pulse crop grown primarily in winter.'
        },
        'kidneybeans': {
            'growing_period': '3-4 months',
            'water_requirements': 'Medium',
            'soil_suitability': 'Loamy, Well-drained',
            'description': 'Legume crop that needs moderate temperatures and consistent moisture.'
        },
        'pigeonpeas': {
            'growing_period': '4-6 months',
            'water_requirements': 'Low to Medium',
            'soil_suitability': 'Loamy, Sandy loam',
            'description': 'Hardy legume crop that can withstand drought conditions.'
        },
        'mothbeans': {
            'growing_period': '2-3 months',
            'water_requirements': 'Low',
            'soil_suitability': 'Sandy, Sandy loam',
            'description': 'Drought-resistant legume suitable for arid regions.'
        },
        'mungbean': {
            'growing_period': '2-3 months',
            'growing_period_days': 75,  # Average days to maturity
            'planting_months': [3, 4, 6, 7],  # Mar-Apr (Spring) and Jun-Jul (Kharif)
            'harvesting_months': [5, 6, 9, 10],  # May-Jun and Sep-Oct
            'water_requirements': 'Low to Medium',
            'soil_suitability': 'Loamy, Sandy loam',
            'description': 'Short duration pulse crop that grows well in warm conditions.'
        },
        'blackgram': {
            'growing_period': '3-4 months',
            'growing_period_days': 90,  # Average days to maturity
            'planting_months': [6, 7, 10, 11],  # Jun-Jul (Kharif) and Oct-Nov (Rabi)
            'harvesting_months': [9, 10, 1, 2],  # Sep-Oct and Jan-Feb
            'water_requirements': 'Medium',
            'soil_suitability': 'Loamy, Clay loam',
            'description': 'Pulse crop that performs well in both dry and humid conditions.'
        }
    }
    
    # Return crop details or a default if not found
    return crop_database.get(crop_name, {
        'growing_period': '3-4 months',
        'growing_period_days': 100,  # Default average
        'planting_months': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],  # Default year-round
        'harvesting_months': [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],  # Default most of year
        'water_requirements': 'Medium',
        'soil_suitability': 'Loamy',
        'description': 'A recommended crop based on your soil and climate conditions.'
    })

def calculate_expected_income(crop, farm_size, soil_type):
    """Calculate expected income based on crop, farm size, soil type and season"""
    # Market prices per quintal (100kg) in Indian Rupees - updated with current market trends
    crop_prices = {
        'rice': 2800, 'wheat': 2400, 'maize': 2200, 'cotton': 6500,
        'jute': 4800, 'coconut': 12500, 'coffee': 8500, 'banana': 1800,
        'apple': 8500, 'orange': 3500, 'mango': 4500, 'grapes': 6500,
        'watermelon': 1000, 'muskmelon': 1400, 'papaya': 2000,
        'pomegranate': 7500, 'lentil': 5500, 'chickpea': 4800,
        'kidneybeans': 6200, 'pigeonpeas': 5800, 'mothbeans': 4200,
        'mungbean': 6800, 'blackgram': 6000
    }
    
    # Average yield per acre in quintals - refined for different soil types
    crop_yields_base = {
        'rice': 25, 'wheat': 20, 'maize': 28, 'cotton': 15,
        'jute': 20, 'coconut': 50, 'coffee': 8, 'banana': 300,
        'apple': 80, 'orange': 120, 'mango': 60, 'grapes': 100,
        'watermelon': 200, 'muskmelon': 150, 'papaya': 250,
        'pomegranate': 100, 'lentil': 12, 'chickpea': 15,
        'kidneybeans': 18, 'pigeonpeas': 14, 'mothbeans': 10,
        'mungbean': 8, 'blackgram': 10
    }
    
    # Crop specific soil suitability - which crops prefer which soils
    crop_soil_suitability = {
        'rice': {'loamy': 0.9, 'sandy': 0.6, 'clay': 1.3, 'silty': 1.0},
        'wheat': {'loamy': 1.2, 'sandy': 0.7, 'clay': 0.8, 'silty': 1.0},
        'maize': {'loamy': 1.3, 'sandy': 0.8, 'clay': 0.9, 'silty': 1.1},
        'cotton': {'loamy': 1.2, 'sandy': 0.7, 'clay': 0.8, 'silty': 0.9},
        'watermelon': {'loamy': 1.1, 'sandy': 1.3, 'clay': 0.7, 'silty': 0.9},
        'muskmelon': {'loamy': 1.1, 'sandy': 1.2, 'clay': 0.7, 'silty': 0.9}
        # Default values for other crops will use the general soil_factors below
    }
    
    base_price = crop_prices.get(crop.lower(), 3000)
    base_yield = crop_yields_base.get(crop.lower(), 20)
    farm_size_num = float(farm_size)
    
    # General soil factor - different soils have different productivity
    soil_factors = {
        'loamy': 1.2, 'black_cotton': 1.15, 'clay': 1.1,
        'silty': 1.05, 'sandy': 0.8, 'chalky': 0.9,
        'peaty': 0.95, 'saline': 0.6
    }
    
    # Get the current month to adjust seasonal yield
    current_month = datetime.now().month
    
    # Define seasons and yield adjustments
    seasonal_factors = {}
    
    # Winter crops yield best in winter months
    if crop.lower() in ['wheat', 'chickpea', 'lentil', 'peas', 'mustard', 'potato']:
        seasonal_factors = {1: 1.3, 2: 1.2, 3: 1.0, 4: 0.8, 5: 0.7, 6: 0.6, 
                            7: 0.6, 8: 0.7, 9: 0.8, 10: 1.0, 11: 1.2, 12: 1.3}
    # Summer crops yield best in summer months
    elif crop.lower() in ['rice', 'maize', 'cotton', 'muskmelon', 'watermelon', 'sunflower']:
        seasonal_factors = {1: 0.7, 2: 0.8, 3: 1.0, 4: 1.2, 5: 1.3, 6: 1.3, 
                            7: 1.2, 8: 1.0, 9: 0.9, 10: 0.8, 11: 0.7, 12: 0.7}
    # Monsoon crops yield best during rainy season
    elif crop.lower() in ['rice', 'maize', 'soybean', 'groundnut', 'cotton', 'mungbean']:
        seasonal_factors = {1: 0.7, 2: 0.7, 3: 0.8, 4: 0.9, 5: 1.0, 6: 1.1, 
                            7: 1.3, 8: 1.3, 9: 1.2, 10: 1.0, 11: 0.8, 12: 0.7}
    # Default seasonal factors (balanced across year)
    else:
        seasonal_factors = {month: 1.0 for month in range(1, 13)}
    
    # Get specific soil suitability for this crop, or use general soil factor
    if crop.lower() in crop_soil_suitability and soil_type.lower() in crop_soil_suitability[crop.lower()]:
        soil_factor = crop_soil_suitability[crop.lower()][soil_type.lower()]
    else:
        soil_factor = soil_factors.get(soil_type.lower(), 1.0)
    
    # Apply seasonal factor
    seasonal_factor = seasonal_factors.get(current_month, 1.0)
    
    # Calculate expected income with more factors
    total_yield = base_yield * farm_size_num * soil_factor * seasonal_factor
    gross_income = total_yield * base_price
    
    # More accurate cost estimation based on crop type
    if crop.lower() in ['rice', 'wheat', 'maize']:
        cost_factor = 0.55  # Staple crops have lower margin
    elif crop.lower() in ['apple', 'mango', 'grapes', 'pomegranate']:
        cost_factor = 0.65  # Fruits have higher production costs
    elif crop.lower() in ['cotton', 'jute']:
        cost_factor = 0.60  # Fiber crops
    else:
        cost_factor = 0.58  # Default cost factor
    
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
        
        # Get top 5 indices instead of just 3, to ensure diversity
        top_indices = np.argsort(pred_proba)[-10:][::-1]
        
        # Apply additional factors for more diverse and accurate recommendations
        
        # Get current month for seasonal awareness
        current_month = datetime.now().month
        
        # Define seasons and suitable crops
        winter_crops = ['wheat', 'chickpea', 'lentil', 'peas', 'mustard', 'potato']
        summer_crops = ['rice', 'maize', 'cotton', 'muskmelon', 'watermelon', 'sunflower']
        monsoon_crops = ['rice', 'maize', 'soybean', 'groundnut', 'cotton', 'mungbean']
        
        # Seasonal weights (increase probability for in-season crops)
        seasonal_boost = 0.2
        
        # Apply seasonal boost based on current month
        season = None
        if 11 <= current_month <= 12 or 1 <= current_month <= 2:  # Winter
            season = 'winter'
            season_crops = winter_crops
        elif 3 <= current_month <= 6:  # Summer
            season = 'summer'
            season_crops = summer_crops
        else:  # Monsoon
            season = 'monsoon'
            season_crops = monsoon_crops
        
        # Apply geographical considerations based on location
        location_lower = location.lower()
        
        # Define regional crop preferences
        north_india_crops = ['wheat', 'rice', 'maize', 'cotton', 'sugarcane']
        south_india_crops = ['rice', 'coconut', 'coffee', 'banana', 'mango']
        east_india_crops = ['rice', 'jute', 'tea', 'maize', 'potato']
        west_india_crops = ['cotton', 'groundnut', 'jowar', 'wheat', 'mango']
        
        # Boost for location suitability
        location_boost = 0.15
        
        # Get all crops and adjust scores
        all_crops = [le_crop.inverse_transform([idx])[0] for idx in range(len(pred_proba))]
        adjusted_scores = pred_proba.copy()
        
        # Store planting suitability information for response
        planting_info = {}
        
        for idx, crop in enumerate(all_crops):
            crop_lower = crop.lower()
            
            # Apply seasonal boost
            if crop_lower in season_crops:
                adjusted_scores[idx] += seasonal_boost
            
            # Apply regional boost
            if ('north' in location_lower and crop_lower in north_india_crops or
                'south' in location_lower and crop_lower in south_india_crops or
                'east' in location_lower and crop_lower in east_india_crops or
                'west' in location_lower and crop_lower in west_india_crops):
                adjusted_scores[idx] += location_boost
            
            # Calculate planting suitability and apply boost based on current date
            plant_info = calculate_planting_suitability(crop_lower)
            planting_info[crop_lower] = plant_info
            
            # Apply planting time boost - significantly boost crops that can be planted now
            planting_boost = plant_info['planting_suitability'] * 0.3  # Scale factor
            adjusted_scores[idx] += planting_boost
            
            # Apply harvest timeline consideration - prefer crops that will mature in appropriate conditions
            # Get harvest month
            harvest_date = datetime.strptime(plant_info['harvest_date'], '%Y-%m-%d')
            harvest_month = harvest_date.month
            
            # Check if harvest will be in optimal weather conditions
            harvest_season_boost = 0.0
            
            # Optimal harvest in winter (cool crops)
            if crop_lower in ['potato', 'peas', 'cabbage'] and (harvest_month in [11, 12, 1, 2]):
                harvest_season_boost = 0.15
            # Optimal harvest in summer (warm weather crops)
            elif crop_lower in ['watermelon', 'muskmelon', 'cucumber'] and (harvest_month in [3, 4, 5, 6]):
                harvest_season_boost = 0.15
            # Optimal harvest in monsoon (rain dependent crops)
            elif crop_lower in ['rice', 'soybean'] and (harvest_month in [8, 9, 10]):
                harvest_season_boost = 0.15
                
            adjusted_scores[idx] += harvest_season_boost
            
            # Penalize very long growing periods for seasonal farming
            if plant_info['days_to_harvest'] > 365:  # More than a year
                adjusted_scores[idx] -= 0.1  # Slight penalty for very long-term crops
        
        # Normalize scores if they exceed 1.0
        max_score = max(adjusted_scores)
        if max_score > 1.0:
            adjusted_scores = adjusted_scores / max_score
        
        # Get top 3 indices after adjustment
        top_3_indices = np.argsort(adjusted_scores)[-3:][::-1]
        
        recommendations = []
        for i, idx in enumerate(top_3_indices):
            crop = le_crop.inverse_transform([idx])[0]
            crop_lower = crop.lower()
            confidence = adjusted_scores[idx] * 100
            
            # Calculate estimated income based on crop type and farm size
            expected_income = calculate_expected_income(crop, farm_size, soil_type)
            
            # Get detailed crop information for better recommendations
            crop_info = get_crop_details(crop_lower)
            
            # Get planting suitability data
            plant_info = planting_info.get(crop_lower, calculate_planting_suitability(crop_lower))
            
            recommendations.append({
                'crop': crop,
                'confidence': round(confidence, 1),
                'expected_income': expected_income,
                'rank': i + 1,
                'seasonal_match': crop.lower() in season_crops,
                'season': season,
                'growing_period': crop_info.get('growing_period', '3-4 months'),
                'water_requirements': crop_info.get('water_requirements', 'Medium'),
                'soil_suitability': crop_info.get('soil_suitability', soil_type),
                'description': crop_info.get('description', f'Recommended crop based on your soil and weather conditions'),
                'planting_suitability': round(plant_info['planting_suitability'] * 100, 1),
                'days_to_harvest': plant_info['days_to_harvest'],
                'harvest_date': plant_info['harvest_date'],
                'is_optimal_planting_time': plant_info['is_optimal_planting'],
                'optimal_planting_months': plant_info['optimal_planting_months']
            })

        # Get current date and time for the response
        current_datetime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Get season based on current month
        month = datetime.now().month
        current_season = ""
        if 6 <= month <= 9:  
            current_season = "Monsoon (June-September)"
        elif 10 <= month <= 11:
            current_season = "Post-Monsoon (October-November)"
        elif month == 12 or 1 <= month <= 2:
            current_season = "Winter (December-February)"
        else:
            current_season = "Summer (March-May)"
            
        # Calculate next planting window for top crop
        top_crop = recommendations[0]["crop"].lower()
        top_crop_info = get_crop_details(top_crop)
        current_month = datetime.now().month
        
        # Find next planting month
        planting_months = top_crop_info.get('planting_months', [])
        if planting_months:
            upcoming_planting_months = [m for m in planting_months if m >= current_month] or [m for m in planting_months]
            next_planting_month = upcoming_planting_months[0] if upcoming_planting_months else planting_months[0]
            next_planting_month_name = calendar.month_name[next_planting_month]
        else:
            next_planting_month_name = "any suitable month"
        
        # Get harvest timeline
        harvest_date = recommendations[0]["harvest_date"]
        days_to_harvest = recommendations[0]["days_to_harvest"]
        
        return jsonify({
            'recommendations': recommendations,
            'weather_data': weather_data,
            'soil_analysis': {
                'type': soil_type,
                'n_value': N, 
                'p_value': P, 
                'k_value': K, 
                'ph_value': ph,
                'soil_health': get_soil_health_status(N, P, K, ph),
                'soil_improvement_tips': get_soil_improvement_tips(soil_type, N, P, K, ph)
            },
            'farm_size': farm_size,
            'farm_size_acres': farm_size,
            'location': location,
            'timestamp': current_datetime,
            'season': current_season,
            'planting_timeline': {
                'current_date': datetime.now().strftime('%Y-%m-%d'),
                'current_month': datetime.now().strftime('%B %Y'),
                'optimal_planting': recommendations[0]["is_optimal_planting_time"],
                'next_planting_window': next_planting_month_name,
                'estimated_days_to_harvest': days_to_harvest,
                'estimated_months_to_harvest': days_to_harvest // 30,
                'estimated_harvest_date': harvest_date,
                'estimated_harvest_month': (datetime.now() + timedelta(days=days_to_harvest)).strftime('%B %Y'),
                'growing_period': f'{datetime.now().strftime("%B %Y")} to {(datetime.now() + timedelta(days=days_to_harvest)).strftime("%B %Y")}'
            },
            'next_steps': {
                'soil_preparation': 'Prepare soil according to the recommended crop requirements',
                'planting_time': f'Best planting time for {recommendations[0]["crop"]} is {next_planting_month_name}' + 
                                (', which is now!' if recommendations[0]["is_optimal_planting_time"] else ''),
                'water_management': f'Ensure {recommendations[0]["water_requirements"].lower()} water availability for optimal growth',
                'harvest_planning': f'Expect harvest around {harvest_date} (growing from {datetime.now().strftime("%B %Y")} to {(datetime.now() + timedelta(days=days_to_harvest)).strftime("%B %Y")}, approximately {days_to_harvest//30} months)'
            },
            'success': True,
            'message': 'Crop recommendations generated successfully with optimal planting and harvest timeline'
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
