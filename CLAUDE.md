# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a healthcare management system focused on **respiratory disease detection** using AI/ML. The platform enables:
- AI-powered respiratory disease diagnosis from audio samples
- Real-time doctor-patient communication via WebSocket chat
- Appointment scheduling and management
- Multi-role user system (Admin, Doctor, Patient)

**Tech Stack:**
- **Frontend:** React 19 + TypeScript + Vite + TailwindCSS
- **Backend:** FastAPI (Python) + MongoDB
- **ML Service:** Separate FastAPI service with TensorFlow/Keras model
- **Real-time:** WebSocket for chat functionality

## Repository Structure

```
MajorProject/
├── backend/              # FastAPI backend (port 8000)
│   ├── main.py          # Main API with auth, CRUD, WebSocket
│   ├── websocket_manager.py  # WebSocket connection handling
│   ├── middleware.py    # Auth middleware
│   ├── init_db.py       # Database initialization
│   ├── seed_data.py     # Sample data seeding
│   └── uploads/         # Audio file storage
├── ml_model/            # ML inference service (port 8001)
│   ├── main.py          # TensorFlow model serving API
│   └── prediction_lung_disease_model.keras  # Trained model
├── frontend/            # React TypeScript app
│   └── src/
│       ├── components/  # Reusable components
│       ├── pages/       # Route pages (patient/doctor/admin)
│       └── services/    # API integration
└── documentation/       # Project documentation
```

## Development Commands

### Backend (FastAPI)

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Initialize database (creates collections)
python init_db.py

# Seed sample data (doctors, hospitals)
python seed_data.py

# Run backend server (port 8000)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### ML Service

```bash
cd ml_model

# Install ML dependencies (TensorFlow, Librosa)
pip install tensorflow librosa numpy

# Run ML inference service (port 8001)
python main.py
# Or: uvicorn main:app --reload --port 8001
```

### Frontend (React)

```bash
cd frontend

# Install dependencies
npm install

# Run development server (port 5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### MongoDB

Ensure MongoDB is running on `localhost:27017` (or set `MONGODB_URL` in `.env`).

Database: `healthcare_db`
Collections: `users`, `doctors`, `hospitals`, `appointments`, `analysis`, `chat_messages`

## Architecture Notes

### Microservices Design

The system uses **two separate FastAPI services**:

1. **Main Backend (port 8000)**: Handles authentication, CRUD operations, WebSocket chat, appointment management
2. **ML Service (port 8001)**: Isolated TensorFlow model for respiratory disease prediction

**Why separate?** ML inference is CPU/GPU intensive. Separating it prevents blocking the main API and allows independent scaling.

### Authentication Flow

- **JWT-based authentication** with 10-hour token expiration
- OAuth2 password flow for login (`/token` endpoint)
- Role-based access control: `admin`, `doctor`, `user` (patient)
- `get_current_user()` dependency for protected routes

**Key files:**
- `backend/main.py`: JWT creation/validation (lines 199-227)
- Frontend stores token in localStorage and includes in Authorization header

### WebSocket Chat Implementation

**Backend:** `backend/websocket_manager.py` + `backend/main.py:760-814`
- Connection manager maintains active WebSocket connections
- Messages stored in MongoDB `chat_messages` collection
- Conversation ID format: `{doctor_id}_{user_id}`

**Frontend:** `frontend/src/services/ChatService.ts` (if exists) or inline WebSocket logic
- Connects to `ws://localhost:8000/chat/{doctor_id}/{user_id}`
- Real-time bidirectional messaging

**Important:** WebSocket endpoints require authentication middleware (`WebSocketAuthMiddleware`)

### ML Model Pipeline

**Model:** CNN-GRU hybrid architecture (5 disease classes)
- Input: Audio file (WAV format)
- Feature extraction: MFCC (40 coefficients × 862 time frames)
- Output: Disease prediction with confidence scores

**Classes:** Bronchiectasis, Bronchiolitis, LRTI, Pneumonia, URTI

**Flow:**
1. Frontend uploads audio → `/api/analysis/lung-disease` (backend:715-738)
2. Backend forwards to ML service → `http://localhost:8001/predict`
3. ML service processes MFCC features → model.predict()
4. Result stored in `analysis` collection and returned

**Key files:**
- `ml_model/main.py:41-79` - Prediction endpoint
- `ml_model/main.py:27-39` - MFCC feature extraction

### Database Schema

**MongoDB collections** (see PROJECT_DOCUMENTATION.md lines 583-815 for detailed schemas):

- **users**: Authentication, roles, profile data
- **doctors**: Doctor profiles linked to users via `user_id`
- **appointments**: Scheduling with status tracking (pending/confirmed/cancelled/completed)
- **analysis**: Respiratory analysis results with file paths
- **chat_messages**: WebSocket chat history
- **hospitals**: Hospital directory

**Important indexes:**
- `users.email` (unique)
- `doctors.user_id` (unique)
- `appointments.{doctor_id, date, time}` for conflict detection

## Common Development Tasks

### Adding a New API Endpoint

1. Define Pydantic model in `backend/main.py` (models section: lines 63-176)
2. Create endpoint function with proper decorators
3. Add authorization dependency if needed: `Depends(get_current_active_user)`
4. Update frontend API service to call the endpoint

### Modifying ML Model

1. Update model file: `ml_model/prediction_lung_disease_model.keras`
2. Adjust CLASSES list in `ml_model/main.py:25` if disease categories change
3. Update feature extraction if input shape changes (`max_pad_len` parameter)
4. Restart ML service: `uvicorn main:app --reload --port 8001`

### Testing WebSocket Chat

Use `backend/test_websocket.py` or browser dev console:

```javascript
const ws = new WebSocket('ws://localhost:8000/chat/{doctor_id}/{user_id}');
ws.onmessage = (event) => console.log(JSON.parse(event.data));
ws.send(JSON.stringify({
  text: "Hello",
  sender_id: "{user_id}",
  receiver_id: "{doctor_id}"
}));
```

### Running Tests

Currently no automated tests. To add:
- Backend: Use `pytest` with `TestClient` from `fastapi.testclient`
- Frontend: Use Vitest (already in devDependencies)

## Important Configuration

### Environment Variables

Create `.env` files:

**backend/.env:**
```
MONGODB_URL=mongodb://localhost:27017
SECRET_KEY=your-secret-key-here
```

**frontend/.env:**
```
VITE_BACKEND_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

### CORS Configuration

Currently set to `allow_origins=["*"]` in both services. **Change in production!**

- `backend/main.py:52-58`
- `ml_model/main.py:12-18`

## Known Limitations & Future Work

1. **File Upload Storage**: Currently saves to local `backend/uploads/`. Should use cloud storage (S3, GCS) in production.
2. **WebSocket Scaling**: Single-server WebSocket doesn't scale horizontally. Need Redis pub/sub for multi-server deployment.
3. **ML Model Updates**: No versioning system. Consider MLflow or model registry.
4. **Authentication**: JWT tokens in localStorage are vulnerable to XSS. Consider httpOnly cookies.
5. **Error Handling**: Basic error handling. Add centralized error tracking (Sentry).

## Troubleshooting

**ML service connection error:**
- Ensure ML service is running on port 8001
- Check model file exists at `ml_model/prediction_lung_disease_model.keras`
- Verify TensorFlow and Librosa are installed

**WebSocket connection fails:**
- Check backend is running on port 8000
- Verify authentication token is valid
- Look for CORS errors in browser console

**MongoDB connection issues:**
- Ensure MongoDB service is running
- Check MONGODB_URL environment variable
- Run `python backend/init_db.py` to create collections

**Frontend build fails:**
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Check Node.js version compatibility (requires Node 18+)

## Project Context

This is a **major project/final year project** demonstrating:
- Full-stack development capabilities
- ML/AI integration in healthcare
- Real-time communication systems
- Microservices architecture

Key features to highlight:
- 95% ML model accuracy (per documentation)
- Multi-role authentication system
- Real-time WebSocket chat
- Appointment conflict detection
- MFCC-based audio feature extraction with CNN-GRU model

For comprehensive technical details, see:
- `PROJECT_DOCUMENTATION.md` - Complete system architecture
- `TECHNICAL_INTERVIEW_GUIDE.md` - Interview preparation guide
