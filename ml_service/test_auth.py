import requests
import json

# Test the authentication endpoints
BASE_URL = "http://localhost:5002"

def test_auth_flow():
    """Test complete authentication flow"""
    print("🔐 Testing Authentication System")
    print("=" * 50)
    
    # Test user data
    test_user = {
        "phone": "9876543210",
        "gmail": "testuser@gmail.com", 
        "username": "testfarmer",
        "password": "SecurePass123!",
        "name": "Test Farmer"
    }
    
    # 1. Test Signup
    print("\n1️⃣ Testing User Signup...")
    try:
        response = requests.post(f"{BASE_URL}/auth/signup", json=test_user)
        print(f"Status: {response.status_code}")
        signup_result = response.json()
        print(f"Response: {json.dumps(signup_result, indent=2)}")
        
        if response.status_code == 201:
            print("✅ Signup successful!")
        else:
            print("⚠️ Signup failed or user already exists")
    except Exception as e:
        print(f"❌ Signup test failed: {e}")
    
    # 2. Test Signin
    print("\n2️⃣ Testing User Signin...")
    try:
        signin_data = {
            "identifier": test_user["phone"],  # Can use phone, email, or username
            "password": test_user["password"]
        }
        response = requests.post(f"{BASE_URL}/auth/signin", json=signin_data)
        print(f"Status: {response.status_code}")
        signin_result = response.json()
        print(f"Response: {json.dumps(signin_result, indent=2)}")
        
        if response.status_code == 200 and 'token' in signin_result:
            token = signin_result['token']
            print("✅ Signin successful! Token received.")
            
            # 3. Test Protected Route
            print("\n3️⃣ Testing Protected Route (Profile)...")
            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"{BASE_URL}/auth/profile", headers=headers)
            print(f"Status: {response.status_code}")
            profile_result = response.json()
            print(f"Response: {json.dumps(profile_result, indent=2)}")
            
            if response.status_code == 200:
                print("✅ Protected route access successful!")
            else:
                print("❌ Protected route access failed")
            
            # 4. Test Crop Recommendation with Auth
            print("\n4️⃣ Testing Crop Recommendation with Authentication...")
            crop_data = {
                "soil_type": "Loamy",
                "location": "Mumbai",
                "farm_size": 5,
                "climate": "Tropical"
            }
            response = requests.post(f"{BASE_URL}/recommend", json=crop_data, headers=headers)
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                crop_result = response.json()
                print(f"Recommendations received: {len(crop_result.get('recommendations', []))} crops")
                print("✅ Authenticated crop recommendation successful!")
            else:
                print(f"❌ Crop recommendation failed: {response.text}")
                
        else:
            print("❌ Signin failed")
    except Exception as e:
        print(f"❌ Signin test failed: {e}")
    
    # 5. Test Invalid Token
    print("\n5️⃣ Testing Invalid Token...")
    try:
        invalid_headers = {"Authorization": "Bearer invalid_token_123"}
        response = requests.get(f"{BASE_URL}/auth/profile", headers=invalid_headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 401:
            print("✅ Invalid token properly rejected!")
        else:
            print("❌ Invalid token handling failed")
    except Exception as e:
        print(f"❌ Invalid token test failed: {e}")

def test_validation():
    """Test input validation"""
    print("\n🔍 Testing Input Validation")
    print("=" * 50)
    
    # Test invalid phone
    invalid_user = {
        "phone": "123",  # Too short
        "gmail": "test@gmail.com",
        "username": "test",
        "password": "SecurePass123!"
    }
    
    response = requests.post(f"{BASE_URL}/auth/signup", json=invalid_user)
    print(f"Invalid phone test - Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Test invalid email
    invalid_user["phone"] = "9876543210"
    invalid_user["gmail"] = "test@yahoo.com"  # Not Gmail
    
    response = requests.post(f"{BASE_URL}/auth/signup", json=invalid_user)
    print(f"Invalid email test - Status: {response.status_code}")
    print(f"Response: {response.json()}")

if __name__ == "__main__":
    # Test health first
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print("✅ Service is running!")
            test_auth_flow()
            test_validation()
        else:
            print("❌ Service is not running properly")
    except Exception as e:
        print(f"❌ Cannot connect to service: {e}")
        print("Please make sure the Flask app is running on port 5002")