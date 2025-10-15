README.md

# SpicyZone Website

A premium content sharing platform with admin and subscriber access.

## Deployment Instructions

### Backend Deployment (Render.com)

1. **Fork this repository** to your GitHub account
2. **Deploy to Render.com**:
   - Go to [render.com](https://render.com)
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Use these settings:
     - **Name**: `spicyzone-backend`
     - **Environment**: `Python 3`
     - **Build Command**: `pip install -r backend/requirements.txt`
     - **Start Command**: `cd backend && gunicorn app:app`
   - Add environment variables:
     - `SECRET_KEY`: (generate a random string)
     - `USER_PASSWORD`: `spicy2023` (change this)
     - `ADMIN_PASSWORD`: `adminSpicy2023` (change this)

3. **Get your backend URL** from Render (e.g., `https://spicyzone-backend.onrender.com`)

### Frontend Deployment (Netlify)

1. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import from Git"
   - Connect your GitHub repository
   - Build settings:
     - **Base directory**: `frontend`
     - **Build command**: (leave empty)
     - **Publish directory**: `frontend`

2. **Update the backend URL**:
   - In `frontend/Spicy.js`, change `API_BASE_URL` to your actual Render backend URL