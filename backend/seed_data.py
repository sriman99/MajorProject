from pymongo import MongoClient
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from passlib.context import CryptContext
import uuid

# Load environment variables
load_dotenv()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = MongoClient(MONGODB_URL)
db = client.healthcare_db

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_database():
    # Sample users
    users = [
        {
            "id": str(uuid.uuid4()),
            "email": "admin@example.com",
            "full_name": "Admin User",
            "phone": "+1234567890",
            "password": pwd_context.hash("admin123"),
            "role": "admin",
            "is_active": True
        },
        {
            "id": str(uuid.uuid4()),
            "email": "doctor@example.com",
            "full_name": "Dr. John Doe",
            "phone": "+1234567891",
            "password": pwd_context.hash("doctor123"),
            "role": "doctor",
            "is_active": True
        },
        {
            "id": str(uuid.uuid4()),
            "email": "patient@example.com",
            "full_name": "Patient User",
            "phone": "+1234567892",
            "password": pwd_context.hash("patient123"),
            "role": "user",
            "is_active": True
        }
    ]
    
    # Insert users
    for user in users:
        db.users.update_one(
            {"email": user["email"]},
            {"$set": user},
            upsert=True
        )
    
    # Sample doctor profile
    doctor = users[1]  # Get the doctor user
    doctor_profile = {
        "id": str(uuid.uuid4()),
        "user_id": doctor["id"],
        "name": doctor["full_name"],
        "experience": "10 years",
        "qualifications": "MD, MBBS",
        "languages": ["English", "Spanish"],
        "specialties": ["Cardiology", "Internal Medicine"],
        "gender": "male",
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
    
    db.doctors.update_one(
        {"user_id": doctor["id"]},
        {"$set": doctor_profile},
        upsert=True
    )
    
    # Sample hospital
    hospital = {
        "id": str(uuid.uuid4()),
        "name": "General Hospital",
        "address": "456 Health Ave",
        "phone": "+1234567893",
        "description": "A modern healthcare facility",
        "specialties": ["Emergency", "Surgery", "Pediatrics"],
        "timings": {
            "hours": "24/7",
            "days": "All days"
        },
        "directions_url": "https://maps.example.com/hospital"
    }
    
    db.hospitals.update_one(
        {"name": hospital["name"]},
        {"$set": hospital},
        upsert=True
    )
    
    # Sample appointment
    appointment = {
        "id": str(uuid.uuid4()),
        "doctor_id": doctor_profile["id"],
        "patient_id": users[2]["id"],  # Patient user
        "date": (datetime.now() + timedelta(days=7)).isoformat(),
        "time": "10:00 AM",
        "reason": "Regular checkup",
        "status": "pending",
        "created_at": datetime.now().isoformat()
    }
    
    db.appointments.insert_one(appointment)
    
    # Sample analysis
    analysis = {
        "id": str(uuid.uuid4()),
        "user_id": users[2]["id"],  # Patient user
        "file_path": "uploads/sample_analysis.wav",
        "analysis_type": "audio",
        "status": "normal",
        "message": "Normal breathing pattern detected",
        "details": [
            "Regular respiratory rate",
            "No abnormal sounds",
            "Clear lung sounds"
        ],
        "created_at": datetime.now().isoformat()
    }
    
    db.analysis.insert_one(analysis)
    
    print("Sample data has been seeded to the database:")
    print(f"- Users: {db.users.count_documents({})}")
    print(f"- Doctors: {db.doctors.count_documents({})}")
    print(f"- Hospitals: {db.hospitals.count_documents({})}")
    print(f"- Appointments: {db.appointments.count_documents({})}")
    print(f"- Analysis: {db.analysis.count_documents({})}")

if __name__ == "__main__":
    seed_database() 