from flask import Blueprint, request, jsonify, send_from_directory
import os
from werkzeug.utils import secure_filename
import uuid
from datetime import datetime

media_bp = Blueprint('media', __name__)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'avi', 'webm', 'mkv'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_media_list():
    """Get list of all media files with their metadata"""
    media_files = []
    upload_folder = media_bp.config['UPLOAD_FOLDER']
    
    try:
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
            return []
            
        for filename in os.listdir(upload_folder):
            file_path = os.path.join(upload_folder, filename)
            if os.path.isfile(file_path):
                # Get file stats
                stat = os.stat(file_path)
                file_ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
                
                media_type = 'video' if file_ext in {'mp4', 'mov', 'avi', 'webm', 'mkv'} else 'image'
                
                media_files.append({
                    'id': filename,
                    'filename': filename,
                    'type': media_type,
                    'url': f'/api/media/{filename}',
                    'uploaded_at': datetime.fromtimestamp(stat.st_ctime).isoformat(),
                    'size': stat.st_size
                })
        
        # Sort by upload date, newest first
        media_files.sort(key=lambda x: x['uploaded_at'], reverse=True)
        return media_files
        
    except Exception as e:
        print(f"Error getting media list: {e}")
        return []

@media_bp.route('/media', methods=['GET'])  # ✅ REMOVED duplicate /api
def get_media():
    """Get all media files"""
    try:
        media_files = get_media_list()
        return jsonify(media_files)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@media_bp.route('/media/<filename>')  # ✅ REMOVED duplicate /api
def serve_media(filename):
    """Serve media files"""
    try:
        return send_from_directory(media_bp.config['UPLOAD_FOLDER'], filename)
    except FileNotFoundError:
        return jsonify({'error': 'File not found'}), 404

@media_bp.route('/upload', methods=['POST'])  # ✅ REMOVED duplicate /api
def upload_media():
    """Upload new media files"""
    try:
        # Check if files are present
        if 'media' not in request.files:
            return jsonify({'error': 'No files provided'}), 400
        
        files = request.files.getlist('media')
        uploaded_files = []
        
        if len(files) == 0 or (len(files) == 1 and files[0].filename == ''):
            return jsonify({'error': 'No files selected'}), 400
        
        for file in files:
            if file.filename == '':
                continue
                
            if file and allowed_file(file.filename):
                # Generate secure filename with UUID to avoid conflicts
                original_ext = file.filename.rsplit('.', 1)[-1].lower()
                unique_filename = f"{uuid.uuid4().hex}.{original_ext}"
                secure_name = secure_filename(unique_filename)
                
                # Ensure upload directory exists
                os.makedirs(media_bp.config['UPLOAD_FOLDER'], exist_ok=True)
                
                # Save file
                file.save(os.path.join(media_bp.config['UPLOAD_FOLDER'], secure_name))
                uploaded_files.append(secure_name)
            else:
                return jsonify({'error': f'File type not allowed: {file.filename}'}), 400
        
        return jsonify({
            'success': True,
            'message': f'Successfully uploaded {len(uploaded_files)} files',
            'files': uploaded_files
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@media_bp.route('/media/<filename>', methods=['DELETE'])  # ✅ REMOVED duplicate /api
def delete_media(filename):
    """Delete a media file"""
    try:
        file_path = os.path.join(media_bp.config['UPLOAD_FOLDER'], filename)
        
        if os.path.exists(file_path):
            os.remove(file_path)
            return jsonify({'success': True, 'message': 'File deleted successfully'})
        else:
            return jsonify({'error': 'File not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def init_app(app):
    """Initialize the media blueprint with app configuration"""
    media_bp.config = app.config
