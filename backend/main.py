from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile, Form, BackgroundTasks, WebSocket, Request
from fastapi.websockets import WebSocketDisconnect
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, List, Literal, Dict, Any
from pydantic import BaseModel, EmailStr, Field, validator
import os
from dotenv import load_dotenv
import uuid
import json
from bson import ObjectId
import httpx
from websocket_manager import WebSocketManager
from middleware import WebSocketAuthMiddleware
from cryptography.fernet import Fernet
import base64
import hashlib
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from database import (
    connect_to_mongo,
    close_mongo_connection,
    get_users_collection,
    get_doctors_collection,
    get_hospitals_collection,
    get_appointments_collection,
    get_analysis_collection
)
from email_service import (
    send_welcome_email,
    send_appointment_confirmation,
    send_appointment_cancellation
)
from appointment_scheduler import scheduler

# Load environment variables
load_dotenv()

# MongoDB URL
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")

# JWT Settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 600

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="Healthcare API", description="API for healthcare application")

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware - Restricted to frontend origin
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173"],  # Only allow frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup and shutdown events
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()
    # Start appointment reminder scheduler
    await scheduler.start()

@app.on_event("shutdown")
async def shutdown_db_client():
    # Stop appointment reminder scheduler
    await scheduler.stop()
    await close_mongo_connection()

# =============================================
# MODELS
# =============================================

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: str
    role: Literal["admin", "doctor", "user"]
    username: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str
    confirm_password: str

    @validator('password')
    def password_strength(cls, v):
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(char.islower() for char in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(char in '!@#$%^&*()_+-=[]{}|;:,.<>?' for char in v):
            raise ValueError('Password must contain at least one special character')
        return v

    @validator('confirm_password')
    def passwords_match(cls, v, values):
        if 'password' in values and v != values['password']:
            raise ValueError('Passwords do not match')
        return v

class User(UserBase):
    id: str
    is_active: bool = True

    class Config:
        from_attributes = True

class UserWithDoctorProfile(User):
    doctor_profile: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class DoctorBase(BaseModel):
    name: str
    experience: str
    qualifications: str
    languages: List[str]
    specialties: List[str]
    gender: Literal["male", "female", "other"]
    image_url: Optional[str] = None

class DoctorCreate(DoctorBase):
    user_id: str

class Doctor(DoctorBase):
    id: str
    locations: List[Dict[str, Any]]
    timings: Dict[str, str]

    class Config:
        from_attributes = True

class HospitalBase(BaseModel):
    name: str
    address: str
    phone: str
    description: str
    specialties: List[str]
    image_url: Optional[str] = None

class HospitalCreate(HospitalBase):
    pass

class Hospital(HospitalBase):
    id: str
    timings: Dict[str, str]
    directions_url: str

    class Config:
        from_attributes = True

class AppointmentBase(BaseModel):
    doctor_id: str
    patient_id: str
    date: str
    time: str
    reason: str
    status: Literal["pending", "confirmed", "cancelled", "completed"] = "pending"

class AppointmentCreate(AppointmentBase):
    pass

class Appointment(AppointmentBase):
    id: str
    created_at: str

    class Config:
        from_attributes = True

class AnalysisBase(BaseModel):
    user_id: str
    file_path: str
    analysis_type: Literal["audio", "file"]
    status: Literal["normal", "warning", "critical"]
    message: str
    details: List[str]

class AnalysisCreate(AnalysisBase):
    pass

class Analysis(AnalysisBase):
    id: str
    created_at: str

    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    full_name: str
    phone: str
    username: Optional[str] = None

    @validator('phone')
    def validate_phone(cls, v):
        """Validate phone number format"""
        # Remove all non-digit characters
        digits = ''.join(filter(str.isdigit, v))
        if len(digits) < 10:
            raise ValueError('Phone number must be at least 10 digits')
        return v

class PasswordChange(BaseModel):
    current_password: str
    new_password: str
    confirm_new_password: str

    @validator('new_password')
    def password_strength(cls, v):
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(char.islower() for char in v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not any(char in '!@#$%^&*()_+-=[]{}|;:,.<>?' for char in v):
            raise ValueError('Password must contain at least one special character')
        return v

    @validator('confirm_new_password')
    def passwords_match(cls, v, values):
        if 'new_password' in values and v != values['new_password']:
            raise ValueError('Passwords do not match')
        return v

# =============================================
# HELPER FUNCTIONS
# =============================================

# File size limits (in bytes)
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
MAX_AUDIO_FILE_SIZE = 20 * 1024 * 1024  # 20MB

async def validate_file_size(file: UploadFile, max_size: int = MAX_FILE_SIZE):
    """Validate file size without reading entire file into memory"""
    # Read file in chunks to check size
    file_size = 0
    chunk_size = 1024 * 1024  # 1MB chunks

    # Reset file pointer
    await file.seek(0)

    while chunk := await file.read(chunk_size):
        file_size += len(chunk)
        if file_size > max_size:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size is {max_size / (1024*1024):.0f}MB"
            )

    # Reset file pointer for actual processing
    await file.seek(0)
    return file_size

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

async def get_user(username: str):
    """Get user by email (async)"""
    users_collection = get_users_collection()
    user = await users_collection.find_one({"email": username})
    return user

async def authenticate_user(username: str, password: str):
    """Authenticate user (async)"""
    user = await get_user(username)
    if not user:
        return False
    if not verify_password(password, user["password"]):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get current user from JWT token (async)"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username, role=role)
    except JWTError:
        raise credentials_exception
    user = await get_user(token_data.username)
    if user is None:
        raise credentials_exception
    return user

# Role-based authorization
async def get_current_active_user(current_user = Depends(get_current_user)):
    if not current_user.get("is_active", True):
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def check_admin_role(current_user = Depends(get_current_active_user)):
    if current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

async def check_doctor_role(current_user = Depends(get_current_active_user)):
    if current_user["role"] not in ["admin", "doctor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

# =============================================
# AUTHENTICATION ENDPOINTS
# =============================================

@app.post("/signup", response_model=User)
@limiter.limit("5/minute")  # Limit to 5 signups per minute per IP
async def signup(request: Request, user: UserCreate):
    users_collection = get_users_collection()
    doctors_collection = get_doctors_collection()

    # Check if user already exists
    existing_user = await users_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Create new user
    user_dict = user.dict(exclude={'confirm_password'})
    user_dict["password"] = get_password_hash(user_dict["password"])
    user_dict["is_active"] = True
    user_dict["id"] = str(uuid.uuid4())

    # Set username to email if not provided
    if not user_dict.get("username"):
        user_dict["username"] = user_dict["email"]

    await users_collection.insert_one(user_dict)

    # If user is a doctor, create a doctor profile
    if user.role == "doctor":
        doctor = DoctorCreate(
            user_id=user_dict["id"],
            name=user.full_name,
            experience="",
            qualifications="",
            languages=[],
            specialties=[],
            gender="other"
        )
        doctor_dict = doctor.dict()
        doctor_dict["id"] = str(uuid.uuid4())
        doctor_dict["locations"] = []
        doctor_dict["timings"] = {"hours": "", "days": ""}
        await doctors_collection.insert_one(doctor_dict)

    # Send welcome email (non-blocking)
    try:
        send_welcome_email(user_dict["email"], user_dict["full_name"])
    except Exception as e:
        # Log error but don't block signup
        print(f"Failed to send welcome email: {str(e)}")

    return User(
        id=user_dict["id"],
        email=user_dict["email"],
        full_name=user_dict["full_name"],
        phone=user_dict["phone"],
        role=user_dict["role"],
        is_active=user_dict["is_active"],
        username=user_dict["username"]
    )

@app.post("/token", response_model=Token)
@limiter.limit("10/minute")  # Limit to 10 login attempts per minute per IP
async def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    users_collection = get_users_collection()

    # Find user by email instead of username
    user = await users_collection.find_one({"email": form_data.username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me", response_model=UserWithDoctorProfile)
async def read_users_me(current_user = Depends(get_current_active_user)):
    doctors_collection = get_doctors_collection()

    response = {
        "id": current_user["id"],
        "email": current_user["email"],
        "full_name": current_user["full_name"],
        "phone": current_user["phone"],
        "role": current_user["role"],
        "is_active": current_user.get("is_active", True),
        "username": current_user.get("username", current_user["email"]),
        "avatar_url": current_user.get("avatar_url"),
        "doctor_profile": None
    }

    # If user is a doctor, include their doctor profile
    if current_user["role"] == "doctor":
        doctor = await doctors_collection.find_one({"user_id": current_user["id"]})
        if doctor:
            # Remove MongoDB _id field
            if "_id" in doctor:
                del doctor["_id"]
            response["doctor_profile"] = doctor

    return UserWithDoctorProfile(**response)

@app.put("/users/me", response_model=User)
async def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user = Depends(get_current_active_user)
):
    """Update current user's profile information"""
    users_collection = get_users_collection()

    # Prepare update data
    update_data = {
        "full_name": profile_data.full_name,
        "phone": profile_data.phone,
    }

    # Add username if provided
    if profile_data.username:
        update_data["username"] = profile_data.username

    # Update user in database
    await users_collection.update_one(
        {"id": current_user["id"]},
        {"$set": update_data}
    )

    # Fetch updated user
    updated_user = await users_collection.find_one({"id": current_user["id"]})

    return User(
        id=updated_user["id"],
        email=updated_user["email"],
        full_name=updated_user["full_name"],
        phone=updated_user["phone"],
        role=updated_user["role"],
        is_active=updated_user.get("is_active", True),
        username=updated_user.get("username", updated_user["email"]),
        avatar_url=updated_user.get("avatar_url")
    )

@app.put("/users/me/password")
async def change_password(
    password_data: PasswordChange,
    current_user = Depends(get_current_active_user)
):
    """Change current user's password"""
    users_collection = get_users_collection()

    # Verify current password
    if not verify_password(password_data.current_password, current_user["password"]):
        raise HTTPException(
            status_code=400,
            detail="Current password is incorrect"
        )

    # Hash new password
    hashed_password = get_password_hash(password_data.new_password)

    # Update password in database
    await users_collection.update_one(
        {"id": current_user["id"]},
        {"$set": {"password": hashed_password}}
    )

    return {"message": "Password updated successfully"}

@app.post("/users/me/avatar")
async def upload_avatar(
    avatar: UploadFile = File(...),
    current_user = Depends(get_current_active_user)
):
    """Upload user avatar/profile picture"""
    users_collection = get_users_collection()

    # Validate file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png"]
    if avatar.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only JPG and PNG images are allowed."
        )

    # Validate file size (5MB max)
    MAX_AVATAR_SIZE = 5 * 1024 * 1024  # 5MB
    await validate_file_size(avatar, MAX_AVATAR_SIZE)

    # Create avatars directory if it doesn't exist
    avatars_dir = "uploads/avatars"
    os.makedirs(avatars_dir, exist_ok=True)

    # Generate unique filename
    file_extension = avatar.filename.split(".")[-1]
    filename = f"{current_user['id']}_{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(avatars_dir, filename)

    # Save file
    await avatar.seek(0)
    with open(file_path, "wb") as buffer:
        content = await avatar.read()
        buffer.write(content)

    # Update user's avatar_url in database
    avatar_url = f"/{file_path}"
    await users_collection.update_one(
        {"id": current_user["id"]},
        {"$set": {"avatar_url": avatar_url}}
    )

    return {"avatar_url": avatar_url, "message": "Avatar uploaded successfully"}

@app.get("/users", response_model=List[User])
async def get_all_users(current_user = Depends(check_admin_role)):
    users_collection = get_users_collection()
    users = await users_collection.find().to_list(length=None)
    return [
        User(
            id=user["id"],
            email=user["email"],
            full_name=user["full_name"],
            phone=user["phone"],
            role=user["role"],
            is_active=user.get("is_active", True),
            username=user.get("username", user["email"]),
            avatar_url=user.get("avatar_url")
        ) for user in users
    ]

# =============================================
# DOCTOR ENDPOINTS
# =============================================

@app.get("/doctors", response_model=List[Doctor])
async def get_doctors(specialty: Optional[str] = None):
    doctors_collection = get_doctors_collection()
    query = {}
    if specialty:
        query["specialties"] = specialty

    doctors = await doctors_collection.find(query).to_list(length=None)
    return [
        Doctor(
            id=doctor["id"],
            name=doctor["name"],
            experience=doctor["experience"],
            qualifications=doctor["qualifications"],
            languages=doctor["languages"],
            specialties=doctor["specialties"],
            gender=doctor["gender"],
            image_url=doctor.get("image_url"),
            locations=doctor["locations"],
            timings=doctor["timings"]
        ) for doctor in doctors
    ]

@app.get("/doctors/{doctor_id}", response_model=Doctor)
async def get_doctor(doctor_id: str):
    doctors_collection = get_doctors_collection()
    doctor = await doctors_collection.find_one({"id": doctor_id})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    return Doctor(
        id=doctor["id"],
        name=doctor["name"],
        experience=doctor["experience"],
        qualifications=doctor["qualifications"],
        languages=doctor["languages"],
        specialties=doctor["specialties"],
        gender=doctor["gender"],
        image_url=doctor.get("image_url"),
        locations=doctor["locations"],
        timings=doctor["timings"]
    )

@app.put("/doctors/{doctor_id}", response_model=Doctor)
async def update_doctor(
    doctor_id: str,
    doctor: DoctorCreate,
    current_user = Depends(check_doctor_role)
):
    doctors_collection = get_doctors_collection()

    # Check if doctor exists
    existing_doctor = await doctors_collection.find_one({"id": doctor_id})
    if not existing_doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Check if the current user is the doctor or an admin
    if current_user["role"] != "admin" and existing_doctor["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this doctor")

    # Update doctor
    doctor_dict = doctor.dict()
    doctor_dict["user_id"] = existing_doctor["user_id"]
    doctor_dict["id"] = doctor_id
    doctor_dict["locations"] = existing_doctor["locations"]
    doctor_dict["timings"] = existing_doctor["timings"]

    await doctors_collection.update_one(
        {"id": doctor_id},
        {"$set": doctor_dict}
    )

    return Doctor(
        id=doctor_dict["id"],
        name=doctor_dict["name"],
        experience=doctor_dict["experience"],
        qualifications=doctor_dict["qualifications"],
        languages=doctor_dict["languages"],
        specialties=doctor_dict["specialties"],
        gender=doctor_dict["gender"],
        image_url=doctor_dict.get("image_url"),
        locations=doctor_dict["locations"],
        timings=doctor_dict["timings"]
    )

@app.get("/doctors/me", response_model=Doctor)
async def get_my_doctor_profile(current_user = Depends(check_doctor_role)):
    doctors_collection = get_doctors_collection()
    doctor = await doctors_collection.find_one({"user_id": current_user["id"]})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    return Doctor(
        id=doctor["id"],
        name=doctor["name"],
        experience=doctor["experience"],
        qualifications=doctor["qualifications"],
        languages=doctor["languages"],
        specialties=doctor["specialties"],
        gender=doctor["gender"],
        image_url=doctor.get("image_url"),
        locations=doctor["locations"],
        timings=doctor["timings"]
    )

# =============================================
# HOSPITAL ENDPOINTS
# =============================================

@app.get("/hospitals", response_model=List[Hospital])
async def get_hospitals():
    hospitals_collection = get_hospitals_collection()
    hospitals = await hospitals_collection.find().to_list(length=None)
    return [
        Hospital(
            id=hospital["id"],
            name=hospital["name"],
            address=hospital["address"],
            phone=hospital["phone"],
            description=hospital["description"],
            specialties=hospital["specialties"],
            image_url=hospital.get("image_url"),
            timings=hospital["timings"],
            directions_url=hospital["directions_url"]
        ) for hospital in hospitals
    ]

@app.get("/hospitals/{hospital_id}", response_model=Hospital)
async def get_hospital(hospital_id: str):
    hospitals_collection = get_hospitals_collection()
    hospital = await hospitals_collection.find_one({"id": hospital_id})
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")

    return Hospital(
        id=hospital["id"],
        name=hospital["name"],
        address=hospital["address"],
        phone=hospital["phone"],
        description=hospital["description"],
        specialties=hospital["specialties"],
        image_url=hospital.get("image_url"),
        timings=hospital["timings"],
        directions_url=hospital["directions_url"]
    )

# =============================================
# APPOINTMENT ENDPOINTS
# =============================================

@app.post("/appointments", response_model=Appointment)
async def create_appointment(
    appointment: AppointmentCreate,
    current_user = Depends(get_current_active_user)
):
    doctors_collection = get_doctors_collection()
    appointments_collection = get_appointments_collection()
    hospitals_collection = get_hospitals_collection()

    # Check if doctor exists
    doctor = await doctors_collection.find_one({"id": appointment.doctor_id})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")

    # Check for conflicting appointments
    existing_appointments = await appointments_collection.find_one({
        "doctor_id": appointment.doctor_id,
        "date": appointment.date,
        "time": appointment.time,
        "status": {"$ne": "cancelled"}  # Exclude cancelled appointments
    })

    if existing_appointments:
        raise HTTPException(status_code=400, detail="Appointment time is already booked for this doctor.")

    # Create appointment
    appointment_dict = appointment.dict()
    appointment_dict["id"] = str(uuid.uuid4())
    appointment_dict["patient_id"] = current_user["id"]
    appointment_dict["created_at"] = datetime.utcnow().isoformat()

    await appointments_collection.insert_one(appointment_dict)

    # Send appointment confirmation email
    try:
        # Get hospital details
        hospital_name = "N/A"
        if doctor.get("locations") and len(doctor["locations"]) > 0:
            hospital_id = doctor["locations"][0].get("hospital_id")
            if hospital_id:
                hospital = await hospitals_collection.find_one({"id": hospital_id})
                if hospital:
                    hospital_name = hospital.get("name", "N/A")

        appointment_details = {
            "patient_name": current_user.get("full_name", "Patient"),
            "doctor_name": doctor.get("name", "Unknown Doctor"),
            "appointment_date": appointment_dict["date"],
            "appointment_time": appointment_dict["time"],
            "hospital_name": hospital_name,
            "appointment_id": appointment_dict["id"]
        }

        send_appointment_confirmation(current_user["email"], appointment_details)
    except Exception as e:
        # Log error but don't block appointment creation
        print(f"Failed to send appointment confirmation email: {str(e)}")

    return Appointment(
        id=appointment_dict["id"],
        doctor_id=appointment_dict["doctor_id"],
        patient_id=appointment_dict["patient_id"],
        date=appointment_dict["date"],
        time=appointment_dict["time"],
        reason=appointment_dict["reason"],
        status=appointment_dict["status"],
        created_at=appointment_dict["created_at"]
    )

@app.get("/appointments", response_model=List[Appointment])
async def get_appointments(current_user = Depends(get_current_active_user)):
    doctors_collection = get_doctors_collection()
    appointments_collection = get_appointments_collection()

    # If user is a doctor, get appointments for that doctor
    if current_user["role"] == "doctor":
        doctor = await doctors_collection.find_one({"user_id": current_user["id"]})
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor profile not found")

        appointments = await appointments_collection.find({"doctor_id": doctor["id"]}).to_list(length=None)
    else:
        # If user is a patient, get appointments for that patient
        appointments = await appointments_collection.find({"patient_id": current_user["id"]}).to_list(length=None)

    return [
        Appointment(
            id=appointment["id"],
            doctor_id=appointment["doctor_id"],
            patient_id=appointment["patient_id"],
            date=appointment["date"],
            time=appointment["time"],
            reason=appointment["reason"],
            status=appointment["status"],
            created_at=appointment["created_at"]
        ) for appointment in appointments
    ]

@app.put("/appointments/{appointment_id}", response_model=Appointment)
async def update_appointment(
    appointment_id: str,
    status: Literal["pending", "confirmed", "cancelled", "completed"],
    current_user = Depends(get_current_active_user)
):
    doctors_collection = get_doctors_collection()
    appointments_collection = get_appointments_collection()
    hospitals_collection = get_hospitals_collection()
    users_collection = get_users_collection()

    # Check if appointment exists
    appointment = await appointments_collection.find_one({"id": appointment_id})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    # Check if user is authorized to update the appointment
    if current_user["role"] == "doctor":
        doctor = await doctors_collection.find_one({"user_id": current_user["id"]})
        if not doctor or doctor["id"] != appointment["doctor_id"]:
            raise HTTPException(status_code=403, detail="Not authorized to update this appointment")
    elif current_user["role"] == "user" and appointment["patient_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this appointment")

    # Update appointment
    await appointments_collection.update_one(
        {"id": appointment_id},
        {"$set": {"status": status}}
    )

    updated_appointment = await appointments_collection.find_one({"id": appointment_id})

    # Send cancellation email if status changed to cancelled
    if status == "cancelled" and appointment.get("status") != "cancelled":
        try:
            # Get patient, doctor, and hospital details
            patient = await users_collection.find_one({"id": appointment["patient_id"]})
            doctor = await doctors_collection.find_one({"id": appointment["doctor_id"]})

            hospital_name = "N/A"
            if doctor and doctor.get("locations") and len(doctor["locations"]) > 0:
                hospital_id = doctor["locations"][0].get("hospital_id")
                if hospital_id:
                    hospital = await hospitals_collection.find_one({"id": hospital_id})
                    if hospital:
                        hospital_name = hospital.get("name", "N/A")

            if patient and doctor:
                appointment_details = {
                    "patient_name": patient.get("full_name", "Patient"),
                    "doctor_name": doctor.get("name", "Unknown Doctor"),
                    "appointment_date": appointment["date"],
                    "appointment_time": appointment["time"],
                    "hospital_name": hospital_name,
                    "appointment_id": appointment["id"]
                }

                send_appointment_cancellation(patient["email"], appointment_details)
        except Exception as e:
            # Log error but don't block update
            print(f"Failed to send cancellation email: {str(e)}")

    return Appointment(
        id=updated_appointment["id"],
        doctor_id=updated_appointment["doctor_id"],
        patient_id=updated_appointment["patient_id"],
        date=updated_appointment["date"],
        time=updated_appointment["time"],
        reason=updated_appointment["reason"],
        status=updated_appointment["status"],
        created_at=updated_appointment["created_at"]
    )

# =============================================
# RESPIRATORY ANALYSIS ENDPOINTS
# =============================================

@app.post("/analysis/upload", response_model=Analysis)
async def upload_analysis(
    file: UploadFile = File(...),
    current_user = Depends(get_current_active_user)
):
    analysis_collection = get_analysis_collection()

    # Validate file size
    await validate_file_size(file, MAX_FILE_SIZE)

    # Save file to disk (in a real app, you would use cloud storage)
    file_path = f"uploads/{current_user['id']}_{file.filename}"
    os.makedirs("uploads", exist_ok=True)

    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    # In a real app, you would process the file here
    # For now, we'll just create a dummy analysis
    analysis_dict = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "file_path": file_path,
        "analysis_type": "file",
        "status": "normal",
        "message": "Breathing pattern analysis complete",
        "details": [
            "Normal respiratory rate detected",
            "No abnormal sounds identified",
            "Regular breathing pattern observed"
        ],
        "created_at": datetime.utcnow().isoformat()
    }

    await analysis_collection.insert_one(analysis_dict)

    return Analysis(
        id=analysis_dict["id"],
        user_id=analysis_dict["user_id"],
        file_path=analysis_dict["file_path"],
        analysis_type=analysis_dict["analysis_type"],
        status=analysis_dict["status"],
        message=analysis_dict["message"],
        details=analysis_dict["details"],
        created_at=analysis_dict["created_at"]
    )

@app.post("/analysis/audio", response_model=Analysis)
async def analyze_audio(
    background_tasks: BackgroundTasks,
    current_user = Depends(get_current_active_user)
):
    analysis_collection = get_analysis_collection()

    # In a real app, you would process the audio here
    # For now, we'll just create a dummy analysis
    analysis_dict = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "file_path": f"uploads/{current_user['id']}_audio_{datetime.utcnow().timestamp()}.wav",
        "analysis_type": "audio",
        "status": "warning",
        "message": "Potential irregularity detected",
        "details": [
            "Slightly elevated respiratory rate",
            "Mild wheezing detected",
            "Recommend consulting a doctor"
        ],
        "created_at": datetime.utcnow().isoformat()
    }

    await analysis_collection.insert_one(analysis_dict)

    return Analysis(
        id=analysis_dict["id"],
        user_id=analysis_dict["user_id"],
        file_path=analysis_dict["file_path"],
        analysis_type=analysis_dict["analysis_type"],
        status=analysis_dict["status"],
        message=analysis_dict["message"],
        details=analysis_dict["details"],
        created_at=analysis_dict["created_at"]
    )

@app.get("/analysis", response_model=List[Analysis])
async def get_analysis(current_user = Depends(get_current_active_user)):
    analysis_collection = get_analysis_collection()
    analyses = await analysis_collection.find({"user_id": current_user["id"]}).to_list(length=None)


    return [
        Analysis(
            id=analysis["id"],
            user_id=analysis["user_id"],
            file_path=analysis["file_path"],
            analysis_type=analysis["analysis_type"],
            status=analysis["status"],
            message=analysis["message"],
            details=analysis["details"],
            created_at=analysis["created_at"]
        ) for analysis in analyses
    ]

@app.post("/api/analysis/lung-disease")
async def analyze_lung_disease(
    audio_file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    analysis_collection = get_analysis_collection()

    # Validate audio file size
    await validate_file_size(audio_file, MAX_AUDIO_FILE_SIZE)

    # ML service URL from environment
    ML_SERVICE_URL = os.getenv("ML_SERVICE_URL", "http://localhost:8001/predict")

    try:
        # Reset file pointer before reading
        await audio_file.seek(0)
        file_content = await audio_file.read()

        # Forward the request to ML service using async httpx
        async with httpx.AsyncClient(timeout=60.0) as client:
            files = {'audio_file': (audio_file.filename, file_content, 'audio/wav')}
            response = await client.post(ML_SERVICE_URL, files=files)

            if response.status_code == 200:
                result = response.json()

                # Store analysis result in database
                analysis_data = {
                    "user_id": current_user["id"],
                    "disease_type": result.get("disease"),
                    "confidence": result.get("confidence"),
                    "result": result,
                    "timestamp": datetime.utcnow()
                }
                await analysis_collection.insert_one(analysis_data)

                return result
            else:
                raise HTTPException(
                    status_code=500,
                    detail=f"Prediction service error: {response.text}"
                )
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="ML service timeout")
    except httpx.RequestError as e:
        raise HTTPException(status_code=503, detail=f"ML service unavailable: {str(e)}")
# =============================================
# WEBSOCKET CHAT ENDPOINTS
# =============================================

# Generate Fernet key from SECRET_KEY
def generate_fernet_key(secret_key: str) -> bytes:
    # Convert the secret key to bytes and hash it using SHA-256
    hashed = hashlib.sha256(secret_key.encode()).digest()
    # Convert to URL-safe base64 encoding
    return base64.urlsafe_b64encode(hashed)

# Initialize WebSocket manager with proper Fernet key
fernet_key = generate_fernet_key(SECRET_KEY)
ws_manager = WebSocketManager(
    encryption_key=fernet_key,
    mongodb_url=MONGODB_URL
)

# Initialize WebSocket auth middleware
ws_auth = WebSocketAuthMiddleware(SECRET_KEY)

@app.websocket("/chat/{doctor_id}/{user_id}")
async def chat_endpoint(websocket: WebSocket, doctor_id: str, user_id: str):
    # Verify the WebSocket connection
    if not await ws_auth.verify_connection(websocket):
        return

    # Accept the connection and store it
    await ws_manager.connect(websocket, user_id)
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            
            # Validate message format
            if not all(key in data for key in ["text", "sender_id", "receiver_id"]):
                await websocket.send_json({"error": "Invalid message format"})
                continue
            
            # Create message document
            message = {
                "id": str(uuid.uuid4()),
                "conversation_id": f"{doctor_id}_{user_id}",
                "text": data["text"],
                "sender_id": data["sender_id"],
                "receiver_id": data["receiver_id"],
                "timestamp": datetime.utcnow().isoformat()
            }
            
            # Store message in database
            await ws_manager.store_message(message)
            
            # Send message to receiver
            await ws_manager.send_personal_message(message, data["receiver_id"])
            
    except WebSocketDisconnect:
        ws_manager.disconnect(user_id)
    
@app.get("/chat/history/{conversation_id}")
async def get_chat_history(
    conversation_id: str,
    limit: int = 50,
    current_user = Depends(get_current_active_user)
):
    # Verify that the user is part of the conversation
    user_ids = conversation_id.split("_")
    if current_user["id"] not in user_ids and current_user["role"] != "admin":
        raise HTTPException(
            status_code=403,
            detail="Not authorized to view this conversation"
        )
    
    # Load chat history
    messages = await ws_manager.load_chat_history(conversation_id, limit)
    return messages

# =============================================
# ROOT ENDPOINT
# =============================================

@app.get("/")
def read_root():
    return {"message": "Welcome to the Healthcare API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)