# Quick Start: Run the App

This project has 3 services:
- Backend API (FastAPI) on port 8000
- ML Service (FastAPI) on port 8001
- Frontend (Vite + React) on port 5173

## Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB running on localhost:27017

## 1) Start Backend
Open Terminal 1:

```powershell
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 2) Start ML Service
Open Terminal 2:

```powershell
cd ml_model
pip install -r requirements.txt
python main.py
```

## 3) Start Frontend
Open Terminal 3:

```powershell
cd frontend
npm install
npm run dev -- --port 5173
```

## 4) Verify Services
In a new terminal:

```powershell
curl http://localhost:8000/docs
curl http://localhost:8001/health
curl http://localhost:5173/
```

Expected:
- Backend docs page loads
- ML health returns JSON with status
- Frontend returns HTML

## If a Port Is Busy
Use these commands (Windows):

```powershell
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

Repeat for 8000 or 8001 if needed.
