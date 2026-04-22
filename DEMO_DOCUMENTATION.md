# NeumoAI - Chronic Lung Disease Predictive Analytics

## Project Overview
A healthcare platform that uses AI/ML to detect respiratory diseases from audio samples (lung/breathing sounds). Built for Teladoc Health as a major project.

**Tech Stack:** React + TypeScript | FastAPI (Python) | TensorFlow/Keras | MongoDB | WebSocket

---

## Features & How They Work

### 1. User Authentication
- **Signup** - Register as Patient, Doctor, or Admin with email & password
- **Login** - JWT-based authentication with role-based access control
- **Google OAuth** - Sign in with Google account
- **Forgot/Reset Password** - Email-based password recovery

### 2. Respiratory Disease Prediction (Core Feature)
- Patient uploads a lung/breathing audio file (.wav)
- Backend sends it to the ML service
- ML service extracts **MFCC features** (40 coefficients x 862 time frames) from the audio
- **CNN-GRU hybrid model** predicts the disease with confidence scores
- Detects: **Pneumonia, COPD, Asthma, Bronchiectasis, Bronchiolitis, LRTI, URTI, Healthy**
- Results stored in database with severity classification (normal/warning/critical)

### 3. AI Chatbot
- Powered by **Google Gemini AI** (gemini-2.0-flash)
- Helps users understand their diagnosis
- Provides health tips and disease information
- Smart fallback responses when API is unavailable

### 4. Doctor Management
- Browse doctors with **area/city-wise filtering** and specialty search
- View doctor profiles with qualifications, languages, timings
- Admin can **add, update, and delete** doctors

### 5. Appointment System
- Book appointments with available doctors
- **Conflict detection** - prevents double-booking same doctor at same time
- Status tracking: Pending → Confirmed → Completed/Cancelled
- Email notifications on booking and cancellation
- Automated appointment reminders (scheduler runs every 30 min)

### 6. Real-time Chat (WebSocket)
- Doctor-patient communication via WebSocket
- Messages stored in MongoDB
- Supports real-time bidirectional messaging

### 7. User Feedback System
- Patients can submit feedback with subject, message, and 1-5 star rating
- Admin can view all feedback and delete entries
- Admin receives notification when new feedback is submitted

### 8. Notifications
- Real-time notification system for appointments, alerts, and messages
- Mark as read / Mark all as read functionality

### 9. Admin Dashboard
- View all registered users with search and role filter
- Activate/deactivate user accounts
- View all appointments across the system
- User distribution pie chart and appointment status bar chart
- Feedback management and doctor management

### 10. Doctor Dashboard
- Today's appointments with patient search and status filter
- Patient list with contact details and last visit date
- Practice statistics (total patients, pending, completed)
- Appointment overview pie chart and practice summary bar chart

### 11. Patient Dashboard
- Upcoming appointments and health records
- Respiratory analysis history with disease distribution pie chart
- Feedback form to submit feedback to admin
- Quick actions: schedule appointment, start new analysis

---

## Architecture

```
Frontend (React + Vite)     →  Port 5173
        ↓ REST API + WebSocket
Backend (FastAPI)           →  Port 8000
        ↓                          ↓
MongoDB (healthcare_db)     ML Service (TensorFlow)  →  Port 8001
```

- **Microservices design** - ML service is separate to avoid blocking the main API
- **8 MongoDB collections** - users, doctors, hospitals, appointments, analysis, chat_messages, notifications, feedback

---

## Login Credentials (Demo)

| Role    | Email                      | Password     |
|---------|----------------------------|--------------|
| Admin   | admin@neumoai.com          | Admin@123    |
| Doctor  | arun.kapoor@neumoai.com    | Doctor@123   |
| Patient | rahul@neumoai.com          | Patient@123  |

---

## Demo Flow (Suggested)

1. **Signup** → Create a new patient account (show simple password works)
2. **Login** → Login with the new account
3. **Upload Audio** → Go to Analysis → Upload a .wav file → Show prediction results
4. **Chatbot** → Ask about the detected disease
5. **Book Appointment** → Browse doctors → Filter by city → Book an appointment
6. **Submit Feedback** → Go to dashboard → Submit feedback with rating
7. **Doctor Login** → Show doctor dashboard with appointments and charts
8. **Admin Login** → Show admin dashboard → View feedback → Add/delete doctor → View charts

---

## Key Technical Highlights

- **ML Model**: CNN-GRU hybrid with 95% accuracy on 8 disease classes
- **Feature Extraction**: MFCC (Mel-Frequency Cepstral Coefficients) from audio
- **Security**: JWT authentication, rate limiting (5 signups/min, 10 logins/min), CORS protection
- **Real-time**: WebSocket for doctor-patient chat
- **Charts**: Recharts for visual analytics in all dashboards
- **UI**: Tailwind CSS + shadcn/ui + Framer Motion animations
