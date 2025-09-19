import requests
import json

# Test the ML service endpoints
BASE_URL = "http://localhost:5002"

def test_health():
    try:
        response = requests.get(f"{BASE_URL}/health")
        print("Health Check:")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        print()
    except Exception as e:
        print(f"Health check failed: {e}")

def test_weather():
    try:
        response = requests.get(f"{BASE_URL}/weather", params={"location": "Mumbai"})
        print("Weather API:")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        print()
    except Exception as e:
        print(f"Weather API failed: {e}")

def test_recommend():
    try:
        data = {
            "soil_type": "loamy",
            "location": "Mumbai",
            "farm_size": 5.0
        }
        response = requests.post(f"{BASE_URL}/recommend", json=data)
        print("Recommendation API:")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        print()
    except Exception as e:
        print(f"Recommendation API failed: {e}")

if __name__ == "__main__":
    print("Testing AgTech ML Service...")
    print("=" * 50)
    test_health()
    test_weather()
    test_recommend()