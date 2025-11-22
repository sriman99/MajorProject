# Healthcare System Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [Technical Stack](#technical-stack)
5. [Backend Services](#backend-services)
6. [Frontend Application](#frontend-application)
7. [Machine Learning Model](#machine-learning-model)
8. [Database Schema](#database-schema)
9. [API Documentation](#api-documentation)
10. [Security](#security)
11. [Deployment](#deployment)

## 1. System Overview

The Healthcare System is a comprehensive platform that integrates telemedicine, respiratory health analysis, and patient management. It provides real-time respiratory disease detection using machine learning, secure doctor-patient communication, and appointment management.

### Key Features
- Real-time respiratory disease detection
- Secure video consultations
- Appointment scheduling and management
- Doctor-patient chat system
- Hospital and doctor directory
- Patient health records management
- AI-powered respiratory analysis

## 2. Architecture

The system follows a microservices architecture with three main components:

### Backend Services (FastAPI)
- Authentication and Authorization
- User Management
- Appointment Handling
- Real-time Communication
- Data Analysis

### Frontend Application (React)
- User Interface
- Real-time Updates
- State Management
- Responsive Design

### ML Service
- Disease Classification
- Audio Processing
- Feature Extraction

## 3. Components

### Backend Components
1. **Authentication Service**
   - JWT-based authentication
   - Role-based access control
   - Password hashing with bcrypt

2. **WebSocket Manager**
   - Real-time chat functionality
   - Message encryption
   - Connection management

3. **Appointment System**
   - Scheduling
   - Conflict resolution
   - Status management

4. **Analysis Service**
   - File upload handling
   - ML model integration
   - Results storage

### Frontend Components
1. **User Interface**
   - Dashboard views
   - Chat interface
   - Appointment calendar
   - Profile management

2. **State Management**
   - User context
   - Authentication state
   - Real-time updates

3. **Shared Components**
   - UI components library
   - Form components
   - Loading states

## 4. Technical Stack

### Backend
- FastAPI (Python web framework)
- MongoDB (Database)
- PyJWT (Authentication)
- WebSocket (Real-time communication)
- Pydantic (Data validation)

### Frontend
- React (UI framework)
- TypeScript
- TailwindCSS (Styling)
- React Query (Data fetching)
- React Router (Navigation)

### ML Model
- TensorFlow
- Librosa (Audio processing)
- NumPy
- FastAPI (Model serving)

## 5. Backend Services

### Authentication Flow
1. User submits credentials
2. Server validates credentials
3. JWT token generated
4. Token returned to client

### WebSocket Communication
1. Client establishes connection
2. Authentication middleware validates
3. Messages encrypted and stored
4. Real-time delivery to recipients

### Appointment Management
1. Check availability
2. Create appointment
3. Notify participants
4. Handle status updates

## 6. Frontend Application

### Page Structure
- Home
- Login/Signup
- Dashboard (Patient/Doctor)
- Appointments
- Chat
- Analysis
- Profile

### Component Hierarchy
```
App
├── Navigation
├── Routes
│   ├── Home
│   ├── Dashboard
│   │   ├── Patient
│   │   └── Doctor
│   ├── Appointments
│   ├── Analysis
│   └── Profile
└── Footer
```

## 7. Machine Learning Model

### Model Architecture
- Input Layer: Audio MFCC features (40x862x1)
- Convolutional Layers: Feature extraction
- GRU Layer: Temporal patterns
- Dense Layers: Classification

### Disease Classification
- Bronchiectasis
- Bronchiolitis
- Pneumonia
- URTI
- LRTI

### Processing Pipeline
1. Audio input
2. Feature extraction
3. Model prediction
4. Result classification

## 8. Database Schema

### Collections
1. **Users**
   ```json
   {
     "id": "string",
     "email": "string",
     "full_name": "string",
     "role": "enum(admin, doctor, user)",
     "password": "hashed_string"
   }
   ```

2. **Doctors**
   ```json
   {
     "id": "string",
     "user_id": "string",
     "specialties": "array",
     "qualifications": "string",
     "experience": "string"
   }
   ```

3. **Appointments**
   ```json
   {
     "id": "string",
     "doctor_id": "string",
     "patient_id": "string",
     "date": "string",
     "status": "enum"
   }
   ```

4. **Analysis**
   ```json
   {
     "id": "string",
     "user_id": "string",
     "result": "object",
     "timestamp": "date"
   }
   ```

## 9. API Documentation

### Authentication Endpoints
- POST `/signup`: User registration
- POST `/token`: Login
- GET `/users/me`: Current user

### Doctor Endpoints
- GET `/doctors`: List doctors
- GET `/doctors/{id}`: Doctor details
- PUT `/doctors/{id}`: Update doctor

### Appointment Endpoints
- POST `/appointments`: Create appointment
- GET `/appointments`: List appointments
- PUT `/appointments/{id}`: Update status

### Analysis Endpoints
- POST `/analysis/upload`: Upload file
- POST `/analysis/audio`: Process audio
- GET `/analysis`: Get results

## 10. Security

### Authentication
- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control

### Data Protection
- WebSocket message encryption
- Secure file uploads
- CORS protection

### API Security
- Rate limiting
- Input validation
- Error handling

## 11. Deployment

### Prerequisites
- Python 3.8+
- Node.js 14+
- MongoDB 4.4+
- NPM/Yarn

### Backend Setup
1. Install dependencies
2. Configure environment
3. Initialize database
4. Start server

### Frontend Setup
1. Install dependencies
2. Configure environment
3. Build application
4. Serve static files

### ML Model Setup
1. Install dependencies
2. Load model
3. Start prediction service

### Environment Variables
```env
MONGODB_URL=mongodb://localhost:27017
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

This documentation provides a comprehensive overview of the healthcare system's architecture, components, and implementation details. Use this as a reference for understanding the system flow and making architectural decisions.
