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
    app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size
    
    # Enhanced CORS configuration for production
    CORS(app, resources={
        r"/api/*": {
            "origins": [
                "http://localhost:3000",
                "http://127.0.0.1:3000",
                "http://localhost:5000",
                "https://*.netlify.app",
                "https://*.vercel.app",
                "https://*.github.io",
                "https://your-spicyzone-frontend.netlify.app"  # Update with your actual frontend URL
            ],
            "methods": ["GET", "POST", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Register blueprints
    from backend.auth import auth_bp
    from backend.media_routes import media_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(media_bp)
    
    # Health check endpoint
    @app.route('/')
    def home():
        return {'message': 'SpicyZone Backend API', 'status': 'running'}
    
    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'service': 'SpicyZone Backend'}
    
    return app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)