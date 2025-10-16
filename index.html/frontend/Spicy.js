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

// ✅ YOUR EXACT BACKEND URL - NO CHANGES NEEDED
const API_BASE_URL = 'https://spicyzone-backend.onrender.com/api';

console.log('🎯 SpicyZone Configuration:');
console.log('Frontend: https://thespicyzone.netlify.app');
console.log('Backend:', API_BASE_URL);

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

// Connection test function
async function testBackendConnection() {
    try {
        console.log('🔍 Testing backend connection...');
        const response = await fetch('https://spicyzone-backend.onrender.com/health');
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend connected:', data);
            return true;
        }
    } catch (error) {
        console.error('❌ Backend connection failed:', error);
    }
    return false;
}

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
    
    // Test connection first
    const isConnected = await testBackendConnection();
    if (!isConnected) {
        alert('⚠️ Backend server is starting up... Please wait 30 seconds and try again. (Render free tier)');
        return;
    }
    
    try {
        console.log('🔐 Attempting login...');
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password: enteredPassword })
        });
        
        console.log('Login response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Login successful');
            currentPassword = enteredPassword;
            passwordModal.style.display = 'none';
            landingPage.style.display = 'none';
            mainContent.style.display = 'block';
            
            if (data.isAdmin) {
                enableAdminMode();
            }
            
            await loadMediaGallery();
        } else {
            console.log('❌ Login failed: Invalid password');
            showError();
        }
    } catch (error) {
        console.error('💥 Login error:', error);
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
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.isAdmin) {
            currentPassword = enteredPassword;
            adminModal.style.display = 'none';
            enableAdminMode();
            await loadMediaGallery();
        } else {
            showAdminError();
        }
    } catch (error) {
        console.error('Admin login error:', error);
        handleOfflineAdminLogin(enteredPassword);
    }
}

function handleOfflineLogin(enteredPassword) {
    const USER_PASSWORD = "spicy2023";
    const ADMIN_PASSWORD = "adminSpicy2023";
    
    if (enteredPassword === USER_PASSWORD || enteredPassword === ADMIN_PASSWORD) {
        console.log('📱 Offline login successful');
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
        mediaGallery.innerHTML = '<div style="text-align: center; padding: 40px; color: #ff3333; font-size: 18px;">🔄 Loading media from server...</div>';
        
        console.log('📥 Fetching media from backend...');
        const response = await fetch(`${API_BASE_URL}/media`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const mediaArray = await response.json();
        
        mediaGallery.innerHTML = '';
        
        if (mediaArray.length === 0) {
            mediaGallery.innerHTML = '<div style="text-align: center; padding: 40px; color: #ccc; font-size: 16px;">No media available yet. Upload some as admin!</div>';
            return;
        }
        
        console.log(`✅ Loaded ${mediaArray.length} media items`);
        mediaArray.forEach((media) => {
            addMediaToGallery(media);
        });
        
    } catch (error) {
        console.error('💥 Error loading media:', error);
        mediaGallery.innerHTML = '<div style="text-align: center; padding: 20px; color: #ff6b6b; background: #2a2a2a; margin: 10px; border-radius: 5px;">⚠️ Backend connection issue. Using local storage.</div>';
        loadMediaGalleryFromLocal();
    }
}

function loadMediaGalleryFromLocal() {
    mediaGallery.innerHTML = '';
    
    const STORAGE_KEY = "spicyZoneMedia";
    const storedMedia = localStorage.getItem(STORAGE_KEY);
    const mediaArray = storedMedia ? JSON.parse(storedMedia) : [];
    
    if (mediaArray.length === 0) {
        mediaGallery.innerHTML = '<div style="text-align: center; padding: 40px; color: #ccc;">No media available. Backend connection failed.</div>';
        return;
    }
    
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

    // Check file sizes (Render free tier limit)
    let totalSize = 0;
    for (let file of files) {
        totalSize += file.size;
        if (file.size > 10 * 1024 * 1024) { // 10MB per file
            alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
            return;
        }
    }
    
    if (totalSize > 20 * 1024 * 1024) { // 20MB total
        alert('Total files size too large. Maximum total size is 20MB.');
        return;
    }

    // Test connection first
    const isConnected = await testBackendConnection();
    if (!isConnected) {
        alert('🚨 Backend server is starting up... This can take up to 60 seconds on Render free tier. Please wait and try again.');
        return;
    }
    
    try {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('media', files[i]);
        }
        
        console.log('⬆️ Uploading files...');
        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData
        });
        
        console.log('Upload response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Upload failed:', errorText);
            throw new Error(`Upload failed: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('✅ Upload successful:', result);
        
        mediaFileInput.value = '';
        await loadMediaGallery();
        alert(`✅ ${result.message}`);
        
    } catch (error) {
        console.error('💥 Upload error:', error);
        alert('❌ Upload failed: ' + error.message + '\n\nFalling back to local storage...');
        handleMediaUploadToLocal(files);
    }
}

function handleMediaUploadToLocal(files) {
    const STORAGE_KEY = "spicyZoneMedia";
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
            alert(`File "${file.name}" is not an image or video.`);
            continue;
        }
        
        const fileURL = URL.createObjectURL(file);
        const storedMedia = localStorage.getItem(STORAGE_KEY);
        const mediaArray = storedMedia ? JSON.parse(storedMedia) : [];
        
        mediaArray.push({
            url: fileURL,
            type: file.type,
            name: file.name
        });
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mediaArray));
    }
    
    mediaFileInput.value = '';
    loadMediaGalleryFromLocal();
    alert('📱 Media saved to local storage (not shared with other users)');
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
            const mediaItem = document.querySelector(`.media-item[data-id="${filename}"]`);
            if (mediaItem) {
                mediaItem.remove();
            }
            alert('✅ Media deleted successfully!');
        } else {
            alert('❌ Delete failed: ' + result.error);
        }
        
    } catch (error) {
        console.error('Delete error:', error);
        alert('❌ Failed to delete media. Please try again.');
    }
}

function deleteMediaFromLocal(index) {
    const STORAGE_KEY = "spicyZoneMedia";
    
    if (!confirm('Are you sure you want to delete this media?')) {
        return;
    }
    
    const storedMedia = localStorage.getItem(STORAGE_KEY);
    const mediaArray = storedMedia ? JSON.parse(storedMedia) : [];
    
    if (index >= 0 && index < mediaArray.length) {
        URL.revokeObjectURL(mediaArray[index].url);
        mediaArray.splice(index, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mediaArray));
        loadMediaGalleryFromLocal();
    }
}

// Initialize the page
window.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 SpicyZone Website Initialized');
    console.log('🌐 Frontend: https://thespicyzone.netlify.app');
    console.log('🔧 Backend: https://spicyzone-backend.onrender.com');
    
    // Test backend connection on load
    await testBackendConnection();
});
