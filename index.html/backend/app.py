from flask import Flask
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
    app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
    
    # EXACT CORS for your deployment
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:3000",
                "http://127.0.0.1:3000", 
                "http://localhost:5000",
                "https://thespicyzone.netlify.app",  # ✅ Your exact frontend
                "https://*.netlify.app"
            ],
            "methods": ["GET", "POST", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Register blueprints
    from auth import auth_bp
    from media_routes import media_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(media_bp)
    
    # Health check endpoint
    @app.route('/')
    def home():
        return {'message': 'SpicyZone Backend API', 'status': 'running', 'version': '1.0'}
    
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'service': 'SpicyZone Backend'}
    
    # Warmup endpoint for Render free tier
    @app.route('/warmup')
    def warmup():
        return {'status': 'warmed up'}
    
    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
