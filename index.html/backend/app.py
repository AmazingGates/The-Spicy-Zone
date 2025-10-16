from flask import Flask, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
    app.config['UPLOAD_FOLDER'] = 'uploads'
    app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024
    
    # Simple CORS configuration
    CORS(app)
    
    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Import and register blueprints
    from auth import auth_bp
    from media_routes import media_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(media_bp, url_prefix='/api')
    
    # Health check endpoint
    @app.route('/')
    def home():
        return jsonify({
            'message': 'SpicyZone Backend API', 
            'status': 'running',
            'endpoints': {
                'health': '/health',
                'login': '/api/login',
                'media': '/api/media',
                'test': '/api/test'
            }
        })
    
    @app.route('/health')
    def health_check():
        return jsonify({'status': 'healthy', 'service': 'SpicyZone Backend'})
    
    # List all routes for debugging
    @app.route('/routes')
    def list_routes():
        routes = []
        for rule in app.url_map.iter_rules():
            routes.append({
                'endpoint': rule.endpoint,
                'methods': list(rule.methods),
                'path': str(rule)
            })
        return jsonify(routes)
    
    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
