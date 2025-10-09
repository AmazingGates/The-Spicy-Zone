// DOM Elements
const landingPage = document.getElementById('landing-page');
const passwordModal = document.getElementById('password-modal');
const mainContent = document.getElementById('main-content');
const enterButton = document.getElementById('enter-button');
const passwordInput = document.getElementById('password-input');
const submitPassword = document.getElementById('submit-password');
const errorMessage = document.getElementById('error-message');
const logoutBtn = document.getElementById('logout-btn');
const mediaGallery = document.getElementById('media-gallery');
const mediaUploadForm = document.getElementById('media-upload-form');
const mediaFileInput = document.getElementById('media-file');

// Configuration
const CORRECT_PASSWORD = "spicy2023"; // Change this to your desired password
const STORAGE_KEY = "spicyZoneMedia";

// Event Listeners
enterButton.addEventListener('click', showPasswordModal);
submitPassword.addEventListener('click', checkPassword);
logoutBtn.addEventListener('click', logout);
mediaUploadForm.addEventListener('submit', handleMediaUpload);

// Password input enter key support
passwordInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        checkPassword();
    }
});

// Functions
function showPasswordModal() {
    passwordModal.style.display = 'flex';
}

function checkPassword() {
    const enteredPassword = passwordInput.value.trim();
    
    if (enteredPassword === CORRECT_PASSWORD) {
        // Correct password
        passwordModal.style.display = 'none';
        landingPage.style.display = 'none';
        mainContent.style.display = 'block';
        loadMediaGallery();
    } else {
        // Incorrect password
        errorMessage.style.display = 'block';
        passwordInput.value = '';
        passwordInput.focus();
    }
}

function logout() {
    mainContent.style.display = 'none';
    landingPage.style.display = 'flex';
    passwordInput.value = '';
    errorMessage.style.display = 'none';
}

function loadMediaGallery() {
    // Clear existing gallery
    mediaGallery.innerHTML = '';
    
    // Get media from localStorage
    const storedMedia = localStorage.getItem(STORAGE_KEY);
    const mediaArray = storedMedia ? JSON.parse(storedMedia) : [];
    
    // Add each media item to the gallery
    mediaArray.forEach((media, index) => {
        const mediaItem = document.createElement('div');
        mediaItem.className = 'media-item';
        
        if (media.type.startsWith('image')) {
            mediaItem.innerHTML = `
                <img src="${media.url}" alt="Gallery image">
                <button class="delete-btn" data-index="${index}">×</button>
            `;
        } else if (media.type.startsWith('video')) {
            mediaItem.innerHTML = `
                <video controls>
                    <source src="${media.url}" type="${media.type}">
                    Your browser does not support the video tag.
                </video>
                <button class="delete-btn" data-index="${index}">×</button>
            `;
        }
        
        mediaGallery.appendChild(mediaItem);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            deleteMedia(index);
        });
    });
}

function handleMediaUpload(e) {
    e.preventDefault();
    
    const files = mediaFileInput.files;
    
    if (files.length === 0) {
        alert('Please select at least one file to upload.');
        return;
    }
    
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
    loadMediaGallery();
    
    alert('Media uploaded successfully!');
}

function deleteMedia(index) {
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
        loadMediaGallery();
    }
}

// Initialize the page
window.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in (for demo purposes, we're not using sessions)
    // In a real application, you would use a more secure authentication method
});