// DOM Elements
const landingPage = document.getElementById('landing-page');
const passwordModal = document.getElementById('password-modal');
const adminModal = document.getElementById('admin-modal');
const mainContent = document.getElementById('main-content');
const enterButton = document.getElementById('enter-button');
const passwordInput = document.getElementById('password-input');
const submitPassword = document.getElementById('submit-password');
const errorMessage = document.getElementById('error-message');
const adminLoginBtn = document.getElementById('admin-login-btn');
const logoutBtn = document.getElementById('logout-btn');
const adminPasswordInput = document.getElementById('admin-password-input');
const submitAdminPassword = document.getElementById('submit-admin-password');
const adminErrorMessage = document.getElementById('admin-error-message');
const mediaGallery = document.getElementById('media-gallery');
const mediaUploadForm = document.getElementById('media-upload-form');
const mediaFileInput = document.getElementById('media-file');
const uploadSection = document.getElementById('upload-section');

// Backend Configuration - DYNAMIC FOR DEPLOYMENT
const API_BASE_URL = (() => {
    const hostname = window.location.hostname;
    
    // Development environments
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:5000/api';
    }
    
    // Production - REPLACE WITH YOUR ACTUAL BACKEND URL AFTER DEPLOYMENT
    // Example for Render.com: return 'https://spicyzone-backend.onrender.com/api';
    // Example for Railway: return 'https://spicyzone-backend.up.railway.app/api';
    // Example for Heroku: return 'https://your-app-name.herokuapp.com/api';
    
    // TEMPORARY - Update this after you deploy your backend
    return 'https://spicyzone-backend.onrender.com/api'; // CHANGE THIS
})();

console.log('API Base URL:', API_BASE_URL);

// Track user state
let isAdmin = false;
let currentPassword = '';

// Event Listeners
enterButton.addEventListener('click', showPasswordModal);
submitPassword.addEventListener('click', checkUserPassword);
adminLoginBtn.addEventListener('click', showAdminModal);
submitAdminPassword.addEventListener('click', checkAdminPassword);
logoutBtn.addEventListener('click', logout);
mediaUploadForm.addEventListener('submit', handleMediaUpload);

// Password input enter key support
passwordInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        checkUserPassword();
    }
});

adminPasswordInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        checkAdminPassword();
    }
});

// Functions
function showPasswordModal() {
    passwordModal.style.display = 'flex';
    passwordInput.focus();
}

function showAdminModal() {
    adminModal.style.display = 'flex';
    adminPasswordInput.focus();
}

async function checkUserPassword() {
    const enteredPassword = passwordInput.value.trim();
    
    if (!enteredPassword) {
        showError();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password: enteredPassword })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Correct password
            currentPassword = enteredPassword;
            passwordModal.style.display = 'none';
            landingPage.style.display = 'none';
            mainContent.style.display = 'block';
            
            // If they entered the admin password, give them admin access
            if (data.isAdmin) {
                enableAdminMode();
            }
            
            await loadMediaGallery();
        } else {
            // Incorrect password
            showError();
        }
    } catch (error) {
        console.error('Login error:', error);
        // Fallback to local storage if backend is unavailable
        handleOfflineLogin(enteredPassword);
    }
}

async function checkAdminPassword() {
    const enteredPassword = adminPasswordInput.value.trim();
    
    if (!enteredPassword) {
        showAdminError();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password: enteredPassword })
        });
        
        const data = await response.json();
        
        if (data.success && data.isAdmin) {
            // Correct admin password
            currentPassword = enteredPassword;
            adminModal.style.display = 'none';
            enableAdminMode();
            await loadMediaGallery();
        } else {
            // Incorrect password
            showAdminError();
        }
    } catch (error) {
        console.error('Admin login error:', error);
        handleOfflineAdminLogin(enteredPassword);
    }
}

function handleOfflineLogin(enteredPassword) {
    // Fallback to original local storage logic
    const USER_PASSWORD = "spicy2023";
    const ADMIN_PASSWORD = "adminSpicy2023";
    
    if (enteredPassword === USER_PASSWORD || enteredPassword === ADMIN_PASSWORD) {
        passwordModal.style.display = 'none';
        landingPage.style.display = 'none';
        mainContent.style.display = 'block';
        currentPassword = enteredPassword;
        
        if (enteredPassword === ADMIN_PASSWORD) {
            enableAdminMode();
        }
        
        loadMediaGalleryFromLocal();
    } else {
        showError();
    }
}

function handleOfflineAdminLogin(enteredPassword) {
    const ADMIN_PASSWORD = "adminSpicy2023";
    
    if (enteredPassword === ADMIN_PASSWORD) {
        currentPassword = enteredPassword;
        adminModal.style.display = 'none';
        enableAdminMode();
        loadMediaGalleryFromLocal();
    } else {
        showAdminError();
    }
}

function showError() {
    errorMessage.style.display = 'block';
    passwordInput.value = '';
    passwordInput.focus();
}

function showAdminError() {
    adminErrorMessage.style.display = 'block';
    adminPasswordInput.value = '';
    adminPasswordInput.focus();
}

function enableAdminMode() {
    isAdmin = true;
    document.body.classList.add('admin-mode');
    adminLoginBtn.style.display = 'none';
}

function disableAdminMode() {
    isAdmin = false;
    document.body.classList.remove('admin-mode');
    adminLoginBtn.style.display = 'block';
}

function logout() {
    mainContent.style.display = 'none';
    landingPage.style.display = 'flex';
    passwordInput.value = '';
    adminPasswordInput.value = '';
    errorMessage.style.display = 'none';
    adminErrorMessage.style.display = 'none';
    disableAdminMode();
    currentPassword = '';
}

async function loadMediaGallery() {
    try {
        // Clear existing gallery
        mediaGallery.innerHTML = '<div class="loading">Loading media...</div>';
        
        const response = await fetch(`${API_BASE_URL}/media`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch media');
        }
        
        const mediaArray = await response.json();
        
        // Clear loading message
        mediaGallery.innerHTML = '';
        
        if (mediaArray.length === 0) {
            mediaGallery.innerHTML = '<div class="no-media">No media available yet.</div>';
            return;
        }
        
        // Add each media item to the gallery
        mediaArray.forEach((media) => {
            addMediaToGallery(media);
        });
        
    } catch (error) {
        console.error('Error loading media from backend:', error);
        // Fallback to local storage
        loadMediaGalleryFromLocal();
    }
}

function loadMediaGalleryFromLocal() {
    // Clear existing gallery
    mediaGallery.innerHTML = '';
    
    // Get media from localStorage (fallback)
    const STORAGE_KEY = "spicyZoneMedia";
    const storedMedia = localStorage.getItem(STORAGE_KEY);
    const mediaArray = storedMedia ? JSON.parse(storedMedia) : [];
    
    if (mediaArray.length === 0) {
        mediaGallery.innerHTML = '<div class="no-media">No media available. Backend connection failed.</div>';
        return;
    }
    
    // Add each media item to the gallery
    mediaArray.forEach((media, index) => {
        const mediaItem = document.createElement('div');
        mediaItem.className = 'media-item';
        
        if (media.type.startsWith('image')) {
            mediaItem.innerHTML = `
                <img src="${media.url}" alt="Gallery image">
                ${isAdmin ? `<button class="delete-btn" data-index="${index}">×</button>` : ''}
            `;
        } else if (media.type.startsWith('video')) {
            mediaItem.innerHTML = `
                <video controls>
                    <source src="${media.url}" type="${media.type}">
                    Your browser does not support the video tag.
                </video>
                ${isAdmin ? `<button class="delete-btn" data-index="${index}">×</button>` : ''}
            `;
        }
        
        mediaGallery.appendChild(mediaItem);
    });
    
    // Add event listeners to delete buttons (only if admin)
    if (isAdmin) {
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                deleteMediaFromLocal(index);
            });
        });
    }
}

function addMediaToGallery(media) {
    const mediaItem = document.createElement('div');
    mediaItem.className = 'media-item';
    mediaItem.setAttribute('data-id', media.id);
    
    if (media.type === 'image') {
        mediaItem.innerHTML = `
            <img src="${API_BASE_URL}/media/${media.filename}" alt="Gallery image" loading="lazy">
            ${isAdmin ? `<button class="delete-btn" data-filename="${media.filename}">×</button>` : ''}
        `;
    } else if (media.type === 'video') {
        mediaItem.innerHTML = `
            <video controls>
                <source src="${API_BASE_URL}/media/${media.filename}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            ${isAdmin ? `<button class="delete-btn" data-filename="${media.filename}">×</button>` : ''}
        `;
    }
    
    mediaGallery.appendChild(mediaItem);
    
    // Add event listener to delete button if admin
    if (isAdmin) {
        const deleteBtn = mediaItem.querySelector('.delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function() {
                const filename = this.getAttribute('data-filename');
                deleteMedia(filename);
            });
        }
    }
}

async function handleMediaUpload(e) {
    e.preventDefault();
    
    const files = mediaFileInput.files;
    
    if (files.length === 0) {
        alert('Please select at least one file to upload.');
        return;
    }
    
    try {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('media', files[i]);
        }
        
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Reset file input
            mediaFileInput.value = '';
            
            // Reload gallery
            await loadMediaGallery();
            
            alert(result.message);
        } else {
            alert('Upload failed: ' + result.error);
        }
        
    } catch (error) {
        console.error('Upload error:', error);
        // Fallback to local storage
        handleMediaUploadToLocal(files);
    }
}

function handleMediaUploadToLocal(files) {
    const STORAGE_KEY = "spicyZoneMedia";
    
    // Process each selected file
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check if file is image or video
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
            alert(`File "${file.name}" is not an image or video. Please select valid media files.`);
            continue;
        }
        
        // Create a URL for the file
        const fileURL = URL.createObjectURL(file);
        
        // Get existing media from localStorage
        const storedMedia = localStorage.getItem(STORAGE_KEY);
        const mediaArray = storedMedia ? JSON.parse(storedMedia) : [];
        
        // Add new media
        mediaArray.push({
            url: fileURL,
            type: file.type,
            name: file.name
        });
        
        // Save back to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mediaArray));
    }
    
    // Reset file input
    mediaFileInput.value = '';
    
    // Reload gallery
    loadMediaGalleryFromLocal();
    
    alert('Media uploaded successfully to local storage! (Backend connection failed)');
}

async function deleteMedia(filename) {
    if (!confirm('Are you sure you want to delete this media?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/media/${filename}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            // Remove from gallery
            const mediaItem = document.querySelector(`.media-item[data-id="${filename}"]`);
            if (mediaItem) {
                mediaItem.remove();
            }
            alert('Media deleted successfully!');
        } else {
            alert('Delete failed: ' + result.error);
        }
        
    } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete media. Please try again.');
    }
}

function deleteMediaFromLocal(index) {
    const STORAGE_KEY = "spicyZoneMedia";
    
    if (!confirm('Are you sure you want to delete this media?')) {
        return;
    }
    
    // Get existing media from localStorage
    const storedMedia = localStorage.getItem(STORAGE_KEY);
    const mediaArray = storedMedia ? JSON.parse(storedMedia) : [];
    
    // Remove the media item
    if (index >= 0 && index < mediaArray.length) {
        // Revoke the object URL to free memory
        URL.revokeObjectURL(mediaArray[index].url);
        mediaArray.splice(index, 1);
        
        // Save back to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mediaArray));
        
        // Reload gallery
        loadMediaGalleryFromLocal();
    }
}

// Initialize the page
window.addEventListener('DOMContentLoaded', function() {
    console.log('SpicyZone initialized with backend:', API_BASE_URL);

});
