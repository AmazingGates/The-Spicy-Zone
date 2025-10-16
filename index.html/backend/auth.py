from flask import Blueprint, request, jsonify
import os

auth_bp = Blueprint('auth', __name__)

# Passwords - using environment variables with fallbacks
USER_PASSWORD = os.getenv('USER_PASSWORD', 'spicy2023')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'adminSpicy2023')

@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        return '', 200
    
    try:
        # Get JSON data
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
            
        password = data.get('password', '').strip()
        
        print(f"Login attempt received")  # Debug log
        
        if not password:
            return jsonify({
                'success': False,
                'message': 'Password is required'
            }), 400
        
        # Check passwords
        if password == USER_PASSWORD:
            return jsonify({
                'success': True,
                'isAdmin': False,
                'message': 'User login successful'
            })
        elif password == ADMIN_PASSWORD:
            return jsonify({
                'success': True,
                'isAdmin': True,
                'message': 'Admin login successful'
            })
        else:
            return jsonify({
                'success': False,
                'message': 'Invalid password'
            }), 401
            
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@auth_bp.route('/test', methods=['GET'])
def test():
    return jsonify({
        'status': 'auth working',
        'message': 'Auth blueprint is functioning'
    })
