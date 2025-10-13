from flask import Blueprint, request, jsonify
import os
from dotenv import load_dotenv

load_dotenv()

auth_bp = Blueprint('auth', __name__)

# Get passwords from environment variables
USER_PASSWORD = os.getenv('USER_PASSWORD', 'spicy2023')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'adminSpicy2023')

@auth_bp.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'message': 'No data provided'
            }), 400
            
        password = data.get('password', '')
        
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
        return jsonify({
            'success': False,
            'message': f'Server error: {str(e)}'
        }), 500

@auth_bp.route('/api/check-auth', methods=['GET'])
def check_auth():
    return jsonify({'status': 'ok', 'service': 'auth'})