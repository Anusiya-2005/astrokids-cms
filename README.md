# CMS Project - Split Architecture

This project has been split into a separate Frontend (Next.js) and Backend (FastAPI).

## Structure

- `/frontend`: Next.js application.
  - API calls are proxied to the backend during development.
  - No longer contains database connection or Mongoose models.
- `/backend`: Python FastAPI application.
  - Handles all API requests.
  - Connects to MongoDB using Motor.

## Running Locally

### 1. Start the Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```
The backend runs on `http://localhost:8000`.

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend runs on `http://localhost:3000`.

## Configuration

Make sure to set the `MONGODB_URI` environment variable for both parts if needed (the backend currently loads it from `.env` in the backend folder).
