from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile, Form, BackgroundTasks
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo import MongoClient
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

# Load environment variables
load_dotenv()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = MongoClient(MONGODB_URL)
db = client.healthcare_db

# Collections
users_collection = db.users
doctors_collection = db.doctors
hospitals_collection = db.hospitals
appointments_collection = db.appointments
analysis_collection = db.analysis

# JWT Settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI(title="Healthcare API", description="API for healthcare application")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Modify this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================
# MODELS
# =============================================

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: str
    role: Literal["admin", "doctor", "user"]

class UserCreate(UserBase):
    password: str
    confirm_password: str

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

# =============================================
# HELPER FUNCTIONS
# =============================================

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def get_user(username: str):
    user = users_collection.find_one({"username": username})
    return user

def authenticate_user(username: str, password: str):
    user = get_user(username)
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
    user = get_user(token_data.username)
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
async def signup(user: UserCreate):
    # Check if user already exists
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create new user
    user_dict = user.dict(exclude={'confirm_password'})
    user_dict["password"] = get_password_hash(user_dict["password"])
    user_dict["is_active"] = True
    user_dict["id"] = str(uuid.uuid4())
    
    users_collection.insert_one(user_dict)
    
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
        doctors_collection.insert_one(doctor_dict)
    
    return User(
        id=user_dict["id"],
        email=user_dict["email"],
        full_name=user_dict["full_name"],
        phone=user_dict["phone"],
        role=user_dict["role"],
        is_active=user_dict["is_active"]
    )

@app.post("/token", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    # Find user by email instead of username
    user = users_collection.find_one({"email": form_data.username})
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

@app.get("/users/me", response_model=User)
async def read_users_me(current_user = Depends(get_current_active_user)):
    return User(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        phone=current_user["phone"],
        role=current_user["role"],
        is_active=current_user.get("is_active", True)
    )

# =============================================
# DOCTOR ENDPOINTS
# =============================================

@app.get("/doctors", response_model=List[Doctor])
async def get_doctors(specialty: Optional[str] = None):
    query = {}
    if specialty:
        query["specialties"] = specialty
    
    doctors = list(doctors_collection.find(query))
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
    doctor = doctors_collection.find_one({"id": doctor_id})
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
    # Check if doctor exists
    existing_doctor = doctors_collection.find_one({"id": doctor_id})
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
    
    doctors_collection.update_one(
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

# =============================================
# HOSPITAL ENDPOINTS
# =============================================

@app.get("/hospitals", response_model=List[Hospital])
async def get_hospitals():
    hospitals = list(hospitals_collection.find())
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
    hospital = hospitals_collection.find_one({"id": hospital_id})
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
    # Check if doctor exists
    doctor = doctors_collection.find_one({"id": appointment.doctor_id})
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    
    # Create appointment
    appointment_dict = appointment.dict()
    appointment_dict["id"] = str(uuid.uuid4())
    appointment_dict["patient_id"] = current_user["id"]
    appointment_dict["created_at"] = datetime.utcnow().isoformat()
    
    appointments_collection.insert_one(appointment_dict)
    
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
    # If user is a doctor, get appointments for that doctor
    if current_user["role"] == "doctor":
        doctor = doctors_collection.find_one({"user_id": current_user["id"]})
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor profile not found")
        
        appointments = list(appointments_collection.find({"doctor_id": doctor["id"]}))
    else:
        # If user is a patient, get appointments for that patient
        appointments = list(appointments_collection.find({"patient_id": current_user["id"]}))
    
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
    # Check if appointment exists
    appointment = appointments_collection.find_one({"id": appointment_id})
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Check if user is authorized to update the appointment
    if current_user["role"] == "doctor":
        doctor = doctors_collection.find_one({"user_id": current_user["id"]})
        if not doctor or doctor["id"] != appointment["doctor_id"]:
            raise HTTPException(status_code=403, detail="Not authorized to update this appointment")
    elif current_user["role"] == "user" and appointment["patient_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized to update this appointment")
    
    # Update appointment
    appointments_collection.update_one(
        {"id": appointment_id},
        {"$set": {"status": status}}
    )
    
    updated_appointment = appointments_collection.find_one({"id": appointment_id})
    
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
    
    analysis_collection.insert_one(analysis_dict)
    
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
    
    analysis_collection.insert_one(analysis_dict)
    
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
    analyses = list(analysis_collection.find({"user_id": current_user["id"]}))
    
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
    current_user: User = Depends(get_current_user)
):
    # Forward the request to ML service
    files = {'audio_file': audio_file.file}
    response = requests.post('http://localhost:8000/predict', files=files)
    
    if response.status_code == 200:
        result = response.json()
        
        # Store analysis result in database
        analysis_data = {
            "user_id": current_user.id,
            "type": "lung_disease",
            "result": result,
            "timestamp": datetime.utcnow()
        }
        analysis_collection.insert_one(analysis_data)
        
        return result
    else:
        raise HTTPException(status_code=500, detail="Prediction service error")
# =============================================
# ROOT ENDPOINT
# =============================================

@app.get("/")
def read_root():
    return {"message": "Welcome to the Healthcare API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)