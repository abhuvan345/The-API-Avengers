import sqlite3
import hashlib
import jwt
import datetime
from functools import wraps
from flask import request, jsonify, current_app
import os

# Database setup
DB_PATH = os.path.join(os.path.dirname(__file__), 'users.db')
JWT_SECRET = 'your-secret-key-change-in-production'

def init_database():
    """Initialize the user database with required tables"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT UNIQUE NOT NULL,
            gmail TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP
        )
    ''')
    
    # Create user_sessions table for session management
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS user_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            token TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NOT NULL,
            is_active BOOLEAN DEFAULT 1,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✓ User database initialized")

def hash_password(password):
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password, password_hash):
    """Verify password against hash"""
    return hash_password(password) == password_hash

def generate_jwt_token(user_data):
    """Generate JWT token for user"""
    payload = {
        'user_id': user_data['id'],
        'phone': user_data['phone'],
        'username': user_data['username'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)  # Token expires in 7 days
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

def verify_jwt_token(token):
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def create_user(phone, gmail, username, password, name=None):
    """Create a new user in the database"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if user already exists
        cursor.execute('SELECT id FROM users WHERE phone = ? OR gmail = ? OR username = ?', 
                      (phone, gmail, username))
        if cursor.fetchone():
            conn.close()
            return {'success': False, 'error': 'User with this phone, email, or username already exists'}
        
        # Create new user
        password_hash = hash_password(password)
        cursor.execute('''
            INSERT INTO users (phone, gmail, username, password_hash, name)
            VALUES (?, ?, ?, ?, ?)
        ''', (phone, gmail, username, password_hash, name))
        
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return {
            'success': True, 
            'user': {
                'id': user_id,
                'phone': phone,
                'gmail': gmail,
                'username': username,
                'name': name
            }
        }
    except Exception as e:
        conn.close()
        return {'success': False, 'error': str(e)}

def authenticate_user(identifier, password):
    """Authenticate user by phone/gmail/username and password"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Try to find user by phone, gmail, or username
    cursor.execute('''
        SELECT id, phone, gmail, username, password_hash, name 
        FROM users 
        WHERE phone = ? OR gmail = ? OR username = ?
    ''', (identifier, identifier, identifier))
    
    user = cursor.fetchone()
    
    if not user:
        conn.close()
        return {'success': False, 'error': 'User not found'}
    
    user_data = {
        'id': user[0],
        'phone': user[1],
        'gmail': user[2],
        'username': user[3],
        'password_hash': user[4],
        'name': user[5]
    }
    
    if not verify_password(password, user_data['password_hash']):
        conn.close()
        return {'success': False, 'error': 'Invalid password'}
    
    # Update last login
    cursor.execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', (user_data['id'],))
    conn.commit()
    conn.close()
    
    # Remove password hash from returned data
    del user_data['password_hash']
    
    return {'success': True, 'user': user_data}

def get_user_by_id(user_id):
    """Get user data by user ID"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        SELECT id, phone, gmail, username, name, created_at, last_login
        FROM users 
        WHERE id = ?
    ''', (user_id,))
    
    user = cursor.fetchone()
    conn.close()
    
    if not user:
        return None
    
    return {
        'id': user[0],
        'phone': user[1],
        'gmail': user[2],
        'username': user[3],
        'name': user[4],
        'created_at': user[5],
        'last_login': user[6]
    }

def require_auth(f):
    """Decorator to require authentication for protected routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Authentication token required'}), 401
        
        # Remove 'Bearer ' prefix if present
        if token.startswith('Bearer '):
            token = token[7:]
        
        payload = verify_jwt_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        # Add user data to request
        request.current_user = get_user_by_id(payload['user_id'])
        if not request.current_user:
            return jsonify({'error': 'User not found'}), 401
        
        return f(*args, **kwargs)
    
    return decorated_function

# Initialize database when module is imported
if not os.path.exists(DB_PATH):
    init_database()