# Healthcare API Documentation

## Backend Setup Documentation

### Prerequisites
- Ensure you have the following installed:
  - Node.js (version 14 or higher)
  - npm (Node Package Manager)
  - MongoDB (or your preferred database)

### Installation Steps
1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/MajorProject.git
   cd MajorProject/backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   - Create a `.env` file in the `backend` directory and add the following variables:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/yourdbname
     JWT_SECRET=your_jwt_secret
     ```

4. **Run the Server**
   ```bash
   npm start
   ```

### Testing the API
- Use tools like Postman or curl to test the API endpoints.
- Ensure the server is running on the specified port (default is 5000).

### Additional Notes
- Make sure MongoDB is running before starting the server.
- For production, consider using a process manager like PM2 to manage the application.

This document provides detailed information about the Healthcare API endpoints, including request and response formats.

## Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Doctor Management](#doctor-management)
4. [Hospital Management](#hospital-management)
5. [Appointment Management](#appointment-management)
6. [Respiratory Analysis](#respiratory-analysis)
7. [Error Handling](#error-handling)

## Authentication

### Sign Up

Create a new user account.

**Endpoint:** `POST /signup`

**Request Body:**
```json
{
  "email": "user@example.com",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "role": "user",
  "password": "securepassword",
  "confirm_password": "securepassword"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "role": "user",
  "is_active": true
}
```

### Login

Authenticate a user and receive an access token.

**Endpoint:** `POST /token`

**Request Body (form-data):**
```
username: user@example.com
password: securepassword
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Get Current User

Get the current authenticated user's information.

**Endpoint:** `GET /users/me`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "role": "user",
  "is_active": true
}
```

## Doctor Management

### Get All Doctors

Retrieve a list of all doctors, optionally filtered by specialty.

**Endpoint:** `GET /doctors`

**Query Parameters:**
- `specialty` (optional): Filter doctors by specialty

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Dr. Jane Smith",
    "experience": "10 years",
    "qualifications": "MD, MBBS",
    "languages": ["English", "Spanish"],
    "specialties": ["Cardiology", "Internal Medicine"],
    "gender": "female",
    "image_url": "https://example.com/images/doctor.jpg",
    "locations": [
      {
        "name": "Main Clinic",
        "address": "123 Medical St",
        "phone": "+1234567891"
      }
    ],
    "timings": {
      "hours": "9:00 AM - 5:00 PM",
      "days": "Monday-Friday"
    }
  }
]
```

### Get Doctor by ID

Retrieve a specific doctor by ID.

**Endpoint:** `GET /doctors/{doctor_id}`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Dr. Jane Smith",
  "experience": "10 years",
  "qualifications": "MD, MBBS",
  "languages": ["English", "Spanish"],
  "specialties": ["Cardiology", "Internal Medicine"],
  "gender": "female",
  "image_url": "https://example.com/images/doctor.jpg",
  "locations": [
    {
      "name": "Main Clinic",
      "address": "123 Medical St",
      "phone": "+1234567891"
    }
  ],
  "timings": {
    "hours": "9:00 AM - 5:00 PM",
    "days": "Monday-Friday"
  }
}
```

### Update Doctor

Update a doctor's profile (requires doctor or admin role).

**Endpoint:** `PUT /doctors/{doctor_id}`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "name": "Dr. Jane Smith",
  "experience": "12 years",
  "qualifications": "MD, MBBS, PhD",
  "languages": ["English", "Spanish", "French"],
  "specialties": ["Cardiology", "Internal Medicine", "Emergency Medicine"],
  "gender": "female",
  "image_url": "https://example.com/images/doctor.jpg"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "name": "Dr. Jane Smith",
  "experience": "12 years",
  "qualifications": "MD, MBBS, PhD",
  "languages": ["English", "Spanish", "French"],
  "specialties": ["Cardiology", "Internal Medicine", "Emergency Medicine"],
  "gender": "female",
  "image_url": "https://example.com/images/doctor.jpg",
  "locations": [
    {
      "name": "Main Clinic",
      "address": "123 Medical St",
      "phone": "+1234567891"
    }
  ],
  "timings": {
    "hours": "9:00 AM - 5:00 PM",
    "days": "Monday-Friday"
  }
}
```

## Hospital Management

### Get All Hospitals

Retrieve a list of all hospitals.

**Endpoint:** `GET /hospitals`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "name": "General Hospital",
    "address": "456 Health Ave",
    "phone": "+1234567893",
    "description": "A modern healthcare facility",
    "specialties": ["Emergency", "Surgery", "Pediatrics"],
    "image_url": "https://example.com/images/hospital.jpg",
    "timings": {
      "hours": "24/7",
      "days": "All days"
    },
    "directions_url": "https://maps.example.com/hospital"
  }
]
```

### Get Hospital by ID

Retrieve a specific hospital by ID.

**Endpoint:** `GET /hospitals/{hospital_id}`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "name": "General Hospital",
  "address": "456 Health Ave",
  "phone": "+1234567893",
  "description": "A modern healthcare facility",
  "specialties": ["Emergency", "Surgery", "Pediatrics"],
  "image_url": "https://example.com/images/hospital.jpg",
  "timings": {
    "hours": "24/7",
    "days": "All days"
  },
  "directions_url": "https://maps.example.com/hospital"
}
```

## Appointment Management

### Create Appointment

Create a new appointment.

**Endpoint:** `POST /appointments`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
  "date": "2023-05-15",
  "time": "10:00 AM",
  "reason": "Regular checkup",
  "status": "pending"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
  "patient_id": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2023-05-15",
  "time": "10:00 AM",
  "reason": "Regular checkup",
  "status": "pending",
  "created_at": "2023-04-15T12:00:00Z"
}
```

### Get Appointments

Retrieve appointments for the current user (as patient or doctor).

**Endpoint:** `GET /appointments`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440003",
    "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
    "patient_id": "550e8400-e29b-41d4-a716-446655440000",
    "date": "2023-05-15",
    "time": "10:00 AM",
    "reason": "Regular checkup",
    "status": "pending",
    "created_at": "2023-04-15T12:00:00Z"
  }
]
```

### Update Appointment Status

Update the status of an appointment.

**Endpoint:** `PUT /appointments/{appointment_id}`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Query Parameters:**
- `status`: New status for the appointment (pending, confirmed, cancelled, completed)

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "doctor_id": "550e8400-e29b-41d4-a716-446655440001",
  "patient_id": "550e8400-e29b-41d4-a716-446655440000",
  "date": "2023-05-15",
  "time": "10:00 AM",
  "reason": "Regular checkup",
  "status": "confirmed",
  "created_at": "2023-04-15T12:00:00Z"
}
```

## Respiratory Analysis

### Upload Analysis File

Upload a file for respiratory analysis.

**Endpoint:** `POST /analysis/upload`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body (form-data):**
```
file: [binary file data]
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "file_path": "uploads/550e8400-e29b-41d4-a716-446655440000_breathing.wav",
  "analysis_type": "file",
  "status": "normal",
  "message": "Breathing pattern analysis complete",
  "details": [
    "Normal respiratory rate detected",
    "No abnormal sounds identified",
    "Regular breathing pattern observed"
  ],
  "created_at": "2023-04-15T12:00:00Z"
}
```

### Analyze Audio

Record and analyze audio for respiratory sounds.

**Endpoint:** `POST /analysis/audio`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440005",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "file_path": "uploads/550e8400-e29b-41d4-a716-446655440000_audio_1618483200.wav",
  "analysis_type": "audio",
  "status": "warning",
  "message": "Potential irregularity detected",
  "details": [
    "Slightly elevated respiratory rate",
    "Mild wheezing detected",
    "Recommend consulting a doctor"
  ],
  "created_at": "2023-04-15T12:00:00Z"
}
```

### Get Analysis History

Retrieve the analysis history for the current user.

**Endpoint:** `GET /analysis`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "file_path": "uploads/550e8400-e29b-41d4-a716-446655440000_breathing.wav",
    "analysis_type": "file",
    "status": "normal",
    "message": "Breathing pattern analysis complete",
    "details": [
      "Normal respiratory rate detected",
      "No abnormal sounds identified",
      "Regular breathing pattern observed"
    ],
    "created_at": "2023-04-15T12:00:00Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440005",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "file_path": "uploads/550e8400-e29b-41d4-a716-446655440000_audio_1618483200.wav",
    "analysis_type": "audio",
    "status": "warning",
    "message": "Potential irregularity detected",
    "details": [
      "Slightly elevated respiratory rate",
      "Mild wheezing detected",
      "Recommend consulting a doctor"
    ],
    "created_at": "2023-04-15T12:00:00Z"
  }
]
```

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses include a JSON body with a `detail` field explaining the error:

```json
{
  "detail": "Email already registered"
}
```

## Authentication

All endpoints except `/signup` and `/token` require authentication using a JWT token. Include the token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Tokens expire after 30 minutes. When a token expires, the client should request a new one using the `/token` endpoint. 