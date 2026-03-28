from pymongo import MongoClient
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from passlib.context import CryptContext
import uuid
from urllib.parse import quote

# Load environment variables
load_dotenv()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = MongoClient(MONGODB_URL)
db = client.healthcare_db

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_database():
    """Seed database with comprehensive sample data"""

    # Clear existing data for fresh start
    print("Clearing existing data...")
    db.users.delete_many({})
    db.doctors.delete_many({})
    db.hospitals.delete_many({})
    db.appointments.delete_many({})
    db.analysis.delete_many({})
    db.chat_messages.delete_many({})
    db.notifications.delete_many({})

    # ==================== USERS ====================
    print("Seeding users...")

    # Admin user
    admin_id = str(uuid.uuid4())
    admin = {
        "id": admin_id,
        "email": "admin@test.com",
        "full_name": "Admin User",
        "phone": "+91-9876543210",
        "password": pwd_context.hash("admin123"),
        "role": "admin",
        "is_active": True,
        "avatar_url": f"https://ui-avatars.com/api/?name={quote('Admin User')}&background=8b5cf6&color=fff&size=200&bold=true",
        "created_at": datetime.now().isoformat()
    }

    # Doctor users (will have doctor profiles linked)
    doctor_users = [
        {
            "id": str(uuid.uuid4()),
            "email": "doctor@test.com",
            "full_name": "Dr. John Doe",
            "phone": "+91-9876543211",
            "password": pwd_context.hash("doctor123"),
            "role": "doctor",
            "is_active": True,
            "avatar_url": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "doctor2@test.com",
            "full_name": "Dr. Sarah Smith",
            "phone": "+91-9876543212",
            "password": pwd_context.hash("doctor123"),
            "role": "doctor",
            "is_active": True,
            "avatar_url": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "doctor3@test.com",
            "full_name": "Dr. Michael Brown",
            "phone": "+91-9876543213",
            "password": pwd_context.hash("doctor123"),
            "role": "doctor",
            "is_active": True,
            "avatar_url": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "doctor4@test.com",
            "full_name": "Dr. Priya Patel",
            "phone": "+91-9876543214",
            "password": pwd_context.hash("doctor123"),
            "role": "doctor",
            "is_active": True,
            "avatar_url": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "doctor5@test.com",
            "full_name": "Dr. Rajesh Kumar",
            "phone": "+91-9876543215",
            "password": pwd_context.hash("doctor123"),
            "role": "doctor",
            "is_active": True,
            "avatar_url": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "doctor6@test.com",
            "full_name": "Dr. Anjali Sharma",
            "phone": "+91-9876543216",
            "password": pwd_context.hash("doctor123"),
            "role": "doctor",
            "is_active": True,
            "avatar_url": "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=200&h=200&fit=crop&crop=face",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "doctor7@test.com",
            "full_name": "Dr. Amit Verma",
            "phone": "+91-9876543217",
            "password": pwd_context.hash("doctor123"),
            "role": "doctor",
            "is_active": True,
            "avatar_url": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "doctor8@test.com",
            "full_name": "Dr. Neha Gupta",
            "phone": "+91-9876543218",
            "password": pwd_context.hash("doctor123"),
            "role": "doctor",
            "is_active": True,
            "avatar_url": "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=200&h=200&fit=crop&crop=face",
            "created_at": datetime.now().isoformat()
        }
    ]

    # Patient users
    patient_users = [
        {
            "id": str(uuid.uuid4()),
            "email": "patient@test.com",
            "full_name": "Rahul Sharma",
            "phone": "+91-9876543220",
            "password": pwd_context.hash("patient123"),
            "role": "user",
            "is_active": True,
            "avatar_url": f"https://ui-avatars.com/api/?name={quote('Rahul Sharma')}&background=ff7757&color=fff&size=200&bold=true",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "patient2@test.com",
            "full_name": "Anita Singh",
            "phone": "+91-9876543221",
            "password": pwd_context.hash("patient123"),
            "role": "user",
            "is_active": True,
            "avatar_url": f"https://ui-avatars.com/api/?name={quote('Anita Singh')}&background=ff7757&color=fff&size=200&bold=true",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "patient3@test.com",
            "full_name": "Vikram Reddy",
            "phone": "+91-9876543222",
            "password": pwd_context.hash("patient123"),
            "role": "user",
            "is_active": True,
            "avatar_url": f"https://ui-avatars.com/api/?name={quote('Vikram Reddy')}&background=ff7757&color=fff&size=200&bold=true",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "patient4@test.com",
            "full_name": "Meera Nair",
            "phone": "+91-9876543223",
            "password": pwd_context.hash("patient123"),
            "role": "user",
            "is_active": True,
            "avatar_url": f"https://ui-avatars.com/api/?name={quote('Meera Nair')}&background=ff7757&color=fff&size=200&bold=true",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "email": "patient5@test.com",
            "full_name": "Arjun Mehta",
            "phone": "+91-9876543224",
            "password": pwd_context.hash("patient123"),
            "role": "user",
            "is_active": True,
            "avatar_url": f"https://ui-avatars.com/api/?name={quote('Arjun Mehta')}&background=ff7757&color=fff&size=200&bold=true",
            "created_at": datetime.now().isoformat()
        }
    ]

    # Insert all users
    all_users = [admin] + doctor_users + patient_users
    for user in all_users:
        db.users.insert_one(user)

    # ==================== DOCTOR PROFILES ====================
    print("Seeding doctor profiles...")

    doctor_profiles = [
        {
            "id": str(uuid.uuid4()),
            "user_id": doctor_users[0]["id"],
            "name": "Dr. John Doe",
            "experience": "10 years",
            "qualifications": "MD, MBBS - Cardiology",
            "languages": ["English", "Hindi"],
            "specialties": ["Cardiology", "Internal Medicine"],
            "gender": "male",
            "image_url": "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face",
            "locations": [
                {"name": "Apollo Hospital, Downtown", "isMain": True},
                {"name": "City Medical Center, Midtown", "isMain": False}
            ],
            "timings": {
                "hours": "9:00 AM - 5:00 PM",
                "days": "Monday-Friday"
            },
            "consultation_fee": 500
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": doctor_users[1]["id"],
            "name": "Dr. Sarah Smith",
            "experience": "8 years",
            "qualifications": "MD, Pulmonology",
            "languages": ["English", "Hindi", "Tamil"],
            "specialties": ["Pulmonology", "Respiratory Medicine"],
            "gender": "female",
            "image_url": "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face",
            "locations": [
                {"name": "City Medical Center, Midtown", "isMain": True}
            ],
            "timings": {
                "hours": "10:00 AM - 6:00 PM",
                "days": "Monday-Saturday"
            },
            "consultation_fee": 600
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": doctor_users[2]["id"],
            "name": "Dr. Michael Brown",
            "experience": "15 years",
            "qualifications": "MD, PhD - Pulmonology",
            "languages": ["English"],
            "specialties": ["Pulmonology", "Critical Care", "Lung Diseases"],
            "gender": "male",
            "image_url": "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face",
            "locations": [
                {"name": "General Hospital, Uptown", "isMain": True},
                {"name": "Apollo Hospital, Downtown", "isMain": False}
            ],
            "timings": {
                "hours": "8:00 AM - 4:00 PM",
                "days": "Monday-Friday"
            },
            "consultation_fee": 800
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": doctor_users[3]["id"],
            "name": "Dr. Priya Patel",
            "experience": "12 years",
            "qualifications": "MBBS, MD - Respiratory Medicine",
            "languages": ["English", "Hindi", "Gujarati"],
            "specialties": ["Respiratory Medicine", "Asthma Specialist", "Allergology"],
            "gender": "female",
            "image_url": "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face",
            "locations": [
                {"name": "HealthCare Plus, East Side", "isMain": True}
            ],
            "timings": {
                "hours": "9:00 AM - 7:00 PM",
                "days": "Tuesday-Sunday"
            },
            "consultation_fee": 700
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": doctor_users[4]["id"],
            "name": "Dr. Rajesh Kumar",
            "experience": "20 years",
            "qualifications": "MD, DM - Pulmonology",
            "languages": ["English", "Hindi", "Telugu"],
            "specialties": ["Pulmonology", "Sleep Medicine", "Tuberculosis"],
            "gender": "male",
            "image_url": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face",
            "locations": [
                {"name": "Apollo Hospital, Downtown", "isMain": True},
                {"name": "Fortis Hospital, Whitefield", "isMain": False}
            ],
            "timings": {
                "hours": "10:00 AM - 5:00 PM",
                "days": "Monday-Saturday"
            },
            "consultation_fee": 1000
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": doctor_users[5]["id"],
            "name": "Dr. Anjali Sharma",
            "experience": "6 years",
            "qualifications": "MBBS, DNB - Pulmonology",
            "languages": ["English", "Hindi"],
            "specialties": ["Respiratory Medicine", "Allergology", "Pediatric Pulmonology"],
            "gender": "female",
            "image_url": "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=200&h=200&fit=crop&crop=face",
            "locations": [
                {"name": "City Medical Center, Midtown", "isMain": True}
            ],
            "timings": {
                "hours": "11:00 AM - 7:00 PM",
                "days": "Monday-Friday"
            },
            "consultation_fee": 500
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": doctor_users[6]["id"],
            "name": "Dr. Amit Verma",
            "experience": "14 years",
            "qualifications": "MD, FCCP - Chest Medicine",
            "languages": ["English", "Hindi", "Marathi"],
            "specialties": ["Chest Medicine", "Interventional Pulmonology", "COPD Specialist"],
            "gender": "male",
            "image_url": "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face",
            "locations": [
                {"name": "Max Hospital, Saket", "isMain": True}
            ],
            "timings": {
                "hours": "9:00 AM - 6:00 PM",
                "days": "Monday-Saturday"
            },
            "consultation_fee": 900
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": doctor_users[7]["id"],
            "name": "Dr. Neha Gupta",
            "experience": "9 years",
            "qualifications": "MBBS, MD - Pulmonary Medicine",
            "languages": ["English", "Hindi", "Bengali"],
            "specialties": ["Pulmonary Medicine", "Bronchoscopy", "Lung Cancer"],
            "gender": "female",
            "image_url": "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=200&h=200&fit=crop&crop=face",
            "locations": [
                {"name": "Medanta Hospital, Gurgaon", "isMain": True}
            ],
            "timings": {
                "hours": "10:00 AM - 6:00 PM",
                "days": "Monday-Friday"
            },
            "consultation_fee": 750
        }
    ]

    for doc in doctor_profiles:
        db.doctors.insert_one(doc)

    # ==================== HOSPITALS ====================
    print("Seeding hospitals...")

    hospitals = [
        {
            "id": str(uuid.uuid4()),
            "name": "Apollo Hospital",
            "address": "Plot No. 251, Road No. 1, Jubilee Hills, Hyderabad - 500033",
            "phone": "+91-40-23456789",
            "description": "Apollo Hospitals is India's first corporate hospital and a pioneer in healthcare services. Known for world-class medical infrastructure and expert doctors specializing in respiratory care.",
            "specialties": ["Pulmonology", "Cardiology", "Neurology", "Oncology", "Emergency Care", "Surgery"],
            "image_url": "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&h=400&fit=crop",
            "timings": {
                "emergency": "24/7",
                "opd": "Mon-Sat: 8:00 AM - 8:00 PM",
                "visiting": "10:00 AM - 1:00 PM, 4:00 PM - 7:00 PM"
            },
            "directions_url": "https://maps.google.com/?q=Apollo+Hospital+Hyderabad",
            "rating": 4.8,
            "beds": 350
        },
        {
            "id": str(uuid.uuid4()),
            "name": "City Medical Center",
            "address": "456 Health Avenue, Banjara Hills, Hyderabad - 500034",
            "phone": "+91-40-34567890",
            "description": "A comprehensive healthcare facility with specialized respiratory care unit featuring state-of-the-art diagnostic equipment and experienced pulmonologists.",
            "specialties": ["Respiratory Medicine", "Pediatrics", "Internal Medicine", "Dermatology"],
            "image_url": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop",
            "timings": {
                "emergency": "24/7",
                "opd": "Mon-Sat: 9:00 AM - 7:00 PM",
                "visiting": "11:00 AM - 1:00 PM, 5:00 PM - 7:00 PM"
            },
            "directions_url": "https://maps.google.com/?q=City+Medical+Center+Hyderabad",
            "rating": 4.5,
            "beds": 200
        },
        {
            "id": str(uuid.uuid4()),
            "name": "General Hospital",
            "address": "789 Care Boulevard, Secunderabad, Hyderabad - 500003",
            "phone": "+91-40-45678901",
            "description": "Government hospital providing affordable healthcare services to all. Equipped with modern respiratory care facilities and dedicated ICU for critical patients.",
            "specialties": ["Emergency Medicine", "General Medicine", "Pulmonology", "Surgery", "Orthopedics"],
            "image_url": "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&h=400&fit=crop",
            "timings": {
                "emergency": "24/7",
                "opd": "Mon-Sat: 8:00 AM - 4:00 PM",
                "visiting": "10:00 AM - 12:00 PM, 4:00 PM - 6:00 PM"
            },
            "directions_url": "https://maps.google.com/?q=General+Hospital+Secunderabad",
            "rating": 4.2,
            "beds": 500
        },
        {
            "id": str(uuid.uuid4()),
            "name": "HealthCare Plus",
            "address": "321 Wellness Street, Madhapur, Hyderabad - 500081",
            "phone": "+91-40-56789012",
            "description": "Modern healthcare facility specializing in respiratory diseases with advanced diagnostic labs, pulmonary function testing, and sleep study center.",
            "specialties": ["Pulmonology", "Respiratory Medicine", "Allergy & Immunology", "Sleep Medicine"],
            "image_url": "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&h=400&fit=crop",
            "timings": {
                "emergency": "24/7",
                "opd": "Mon-Sat: 7:00 AM - 9:00 PM",
                "visiting": "10:30 AM - 1:30 PM, 4:30 PM - 7:30 PM"
            },
            "directions_url": "https://maps.google.com/?q=HealthCare+Plus+Madhapur",
            "rating": 4.6,
            "beds": 150
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Fortis Hospital",
            "address": "154/9, Bannerghatta Road, Bangalore - 560076",
            "phone": "+91-80-66214444",
            "description": "Multi-specialty hospital with comprehensive respiratory care services including bronchoscopy, thoracoscopy, and lung transplant program.",
            "specialties": ["Pulmonology", "Cardiology", "Gastroenterology", "Nephrology", "Transplants"],
            "image_url": "https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=600&h=400&fit=crop",
            "timings": {
                "emergency": "24/7",
                "opd": "Mon-Sun: 8:00 AM - 8:00 PM",
                "visiting": "11:00 AM - 1:00 PM, 5:00 PM - 7:00 PM"
            },
            "directions_url": "https://maps.google.com/?q=Fortis+Hospital+Bangalore",
            "rating": 4.7,
            "beds": 400
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Max Hospital",
            "address": "1, 2, Press Enclave Road, Saket, New Delhi - 110017",
            "phone": "+91-11-26515050",
            "description": "Leading private healthcare provider with cutting-edge respiratory care unit, advanced ventilator facilities, and specialized lung disease treatment center.",
            "specialties": ["Respiratory Medicine", "Critical Care", "Oncology", "Cardiac Sciences", "Neurosciences"],
            "image_url": "https://images.unsplash.com/photo-1596541223130-5d31a73fb6c6?w=600&h=400&fit=crop",
            "timings": {
                "emergency": "24/7",
                "opd": "Mon-Sat: 8:00 AM - 8:00 PM",
                "visiting": "10:00 AM - 12:00 PM, 4:00 PM - 6:00 PM"
            },
            "directions_url": "https://maps.google.com/?q=Max+Hospital+Saket+Delhi",
            "rating": 4.8,
            "beds": 500
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Medanta Hospital",
            "address": "CH Baktawar Singh Road, Sector 38, Gurgaon - 122001",
            "phone": "+91-124-4141414",
            "description": "The Medicity - A world-renowned hospital with comprehensive chest and respiratory medicine department featuring PFT lab, sleep lab, and interventional pulmonology suite.",
            "specialties": ["Chest Medicine", "Interventional Pulmonology", "Cardiology", "Liver Transplant", "Kidney Transplant"],
            "image_url": "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=400&fit=crop",
            "timings": {
                "emergency": "24/7",
                "opd": "Mon-Sat: 8:00 AM - 8:00 PM",
                "visiting": "11:00 AM - 1:00 PM, 5:00 PM - 7:00 PM"
            },
            "directions_url": "https://maps.google.com/?q=Medanta+Hospital+Gurgaon",
            "rating": 4.9,
            "beds": 1250
        },
        {
            "id": str(uuid.uuid4()),
            "name": "AIIMS Delhi",
            "address": "Ansari Nagar, New Delhi - 110029",
            "phone": "+91-11-26588500",
            "description": "All India Institute of Medical Sciences - Premier government medical institution with excellent pulmonary medicine department and research facilities.",
            "specialties": ["Pulmonary Medicine", "General Medicine", "Surgery", "Pediatrics", "Research"],
            "image_url": "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&h=400&fit=crop",
            "timings": {
                "emergency": "24/7",
                "opd": "Mon-Sat: 8:00 AM - 1:00 PM",
                "visiting": "4:00 PM - 6:00 PM"
            },
            "directions_url": "https://maps.google.com/?q=AIIMS+Delhi",
            "rating": 4.7,
            "beds": 2500
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Manipal Hospital",
            "address": "98, HAL Airport Road, Bangalore - 560017",
            "phone": "+91-80-25024444",
            "description": "Multi-specialty tertiary care hospital with dedicated pulmonology department, respiratory ICU, and comprehensive lung health programs.",
            "specialties": ["Pulmonology", "Cardiology", "Orthopedics", "Oncology", "Neurology"],
            "image_url": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop",
            "timings": {
                "emergency": "24/7",
                "opd": "Mon-Sat: 8:00 AM - 8:00 PM",
                "visiting": "10:00 AM - 1:00 PM, 4:00 PM - 7:00 PM"
            },
            "directions_url": "https://maps.google.com/?q=Manipal+Hospital+Bangalore",
            "rating": 4.6,
            "beds": 600
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Narayana Health",
            "address": "258/A, Bommasandra Industrial Area, Bangalore - 560099",
            "phone": "+91-80-71222222",
            "description": "Affordable world-class healthcare with specialized respiratory medicine unit, COPD clinic, and pulmonary rehabilitation center.",
            "specialties": ["Respiratory Medicine", "Cardiac Surgery", "Nephrology", "Pediatrics", "Transplants"],
            "image_url": "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&h=400&fit=crop",
            "timings": {
                "emergency": "24/7",
                "opd": "Mon-Sat: 8:00 AM - 6:00 PM",
                "visiting": "11:00 AM - 1:00 PM, 5:00 PM - 7:00 PM"
            },
            "directions_url": "https://maps.google.com/?q=Narayana+Health+Bangalore",
            "rating": 4.5,
            "beds": 800
        }
    ]

    for hosp in hospitals:
        db.hospitals.insert_one(hosp)

    # ==================== APPOINTMENTS ====================
    print("Seeding appointments...")

    appointments = [
        {
            "id": str(uuid.uuid4()),
            "doctor_id": doctor_profiles[0]["id"],
            "patient_id": patient_users[0]["id"],
            "date": (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d"),
            "time": "10:00",
            "reason": "Regular cardiology checkup and ECG",
            "status": "confirmed",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "doctor_id": doctor_profiles[1]["id"],
            "patient_id": patient_users[1]["id"],
            "date": (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d"),
            "time": "11:30",
            "reason": "Persistent cough and breathing difficulty",
            "status": "pending",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "doctor_id": doctor_profiles[2]["id"],
            "patient_id": patient_users[2]["id"],
            "date": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"),
            "time": "14:00",
            "reason": "Follow-up for lung infection treatment",
            "status": "confirmed",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "doctor_id": doctor_profiles[3]["id"],
            "patient_id": patient_users[3]["id"],
            "date": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
            "time": "16:00",
            "reason": "Asthma management consultation",
            "status": "pending",
            "created_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "doctor_id": doctor_profiles[4]["id"],
            "patient_id": patient_users[4]["id"],
            "date": (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d"),
            "time": "09:30",
            "reason": "Sleep apnea evaluation",
            "status": "completed",
            "created_at": (datetime.now() - timedelta(days=5)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "doctor_id": doctor_profiles[0]["id"],
            "patient_id": patient_users[2]["id"],
            "date": (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d"),
            "time": "15:00",
            "reason": "Chest pain investigation",
            "status": "completed",
            "created_at": (datetime.now() - timedelta(days=4)).isoformat()
        }
    ]

    for apt in appointments:
        db.appointments.insert_one(apt)

    # ==================== ANALYSIS RECORDS ====================
    print("Seeding analysis records...")

    analysis_records = [
        {
            "id": str(uuid.uuid4()),
            "user_id": patient_users[0]["id"],
            "file_path": "uploads/sample_analysis_1.wav",
            "analysis_type": "audio",
            "status": "normal",
            "prediction": "Normal",
            "confidence": 0.92,
            "message": "Normal breathing pattern detected",
            "details": [
                "Regular respiratory rate",
                "No abnormal sounds detected",
                "Clear lung sounds"
            ],
            "created_at": (datetime.now() - timedelta(days=3)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": patient_users[1]["id"],
            "file_path": "uploads/sample_analysis_2.wav",
            "analysis_type": "audio",
            "status": "abnormal",
            "prediction": "Bronchitis",
            "confidence": 0.85,
            "message": "Signs of bronchitis detected",
            "details": [
                "Wheezing sounds detected",
                "Irregular breathing pattern",
                "Recommend consultation with pulmonologist"
            ],
            "created_at": (datetime.now() - timedelta(days=1)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": patient_users[2]["id"],
            "file_path": "uploads/sample_analysis_3.wav",
            "analysis_type": "audio",
            "status": "abnormal",
            "prediction": "Pneumonia",
            "confidence": 0.78,
            "message": "Possible pneumonia indicators found",
            "details": [
                "Crackling sounds in lower lobes",
                "Reduced breath sounds",
                "Urgent medical attention recommended"
            ],
            "created_at": datetime.now().isoformat()
        }
    ]

    for analysis in analysis_records:
        db.analysis.insert_one(analysis)

    # ==================== NOTIFICATIONS ====================
    print("Seeding notifications...")

    notifications = [
        {
            "id": str(uuid.uuid4()),
            "user_id": patient_users[0]["id"],
            "type": "appointment",
            "title": "Appointment Confirmed",
            "message": "Your appointment with Dr. John Doe on " + (datetime.now() + timedelta(days=2)).strftime("%B %d, %Y") + " has been confirmed.",
            "read": False,
            "created_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": patient_users[1]["id"],
            "type": "analysis",
            "title": "Analysis Complete",
            "message": "Your respiratory analysis has been completed. Please check the results.",
            "read": False,
            "created_at": (datetime.now() - timedelta(hours=2)).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "user_id": doctor_users[0]["id"],
            "type": "appointment",
            "title": "New Appointment Request",
            "message": "You have a new appointment request from Rahul Sharma.",
            "read": True,
            "created_at": (datetime.now() - timedelta(days=1)).isoformat()
        }
    ]

    for notif in notifications:
        db.notifications.insert_one(notif)

    # ==================== CHAT MESSAGES ====================
    print("Seeding chat messages...")

    chat_messages = [
        {
            "id": str(uuid.uuid4()),
            "conversation_id": f"{doctor_profiles[0]['id']}_{patient_users[0]['id']}",
            "sender_id": patient_users[0]["id"],
            "receiver_id": doctor_profiles[0]["id"],
            "text": "Hello Dr. John, I have some questions about my upcoming appointment.",
            "timestamp": (datetime.now() - timedelta(hours=5)).isoformat(),
            "read": True
        },
        {
            "id": str(uuid.uuid4()),
            "conversation_id": f"{doctor_profiles[0]['id']}_{patient_users[0]['id']}",
            "sender_id": doctor_profiles[0]["id"],
            "receiver_id": patient_users[0]["id"],
            "text": "Hello Rahul, of course! What would you like to know?",
            "timestamp": (datetime.now() - timedelta(hours=4)).isoformat(),
            "read": True
        },
        {
            "id": str(uuid.uuid4()),
            "conversation_id": f"{doctor_profiles[0]['id']}_{patient_users[0]['id']}",
            "sender_id": patient_users[0]["id"],
            "receiver_id": doctor_profiles[0]["id"],
            "text": "Should I fast before the ECG test?",
            "timestamp": (datetime.now() - timedelta(hours=3)).isoformat(),
            "read": True
        },
        {
            "id": str(uuid.uuid4()),
            "conversation_id": f"{doctor_profiles[0]['id']}_{patient_users[0]['id']}",
            "sender_id": doctor_profiles[0]["id"],
            "receiver_id": patient_users[0]["id"],
            "text": "No fasting is required for ECG. Just avoid caffeine and heavy exercise before the test.",
            "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(),
            "read": False
        }
    ]

    for msg in chat_messages:
        db.chat_messages.insert_one(msg)

    # Print summary
    print("\n" + "="*50)
    print("DATABASE SEEDING COMPLETE!")
    print("="*50)
    print(f"Users: {db.users.count_documents({})}")
    print(f"  - Admin: 1")
    print(f"  - Doctors: {len(doctor_users)}")
    print(f"  - Patients: {len(patient_users)}")
    print(f"Doctor Profiles: {db.doctors.count_documents({})}")
    print(f"Hospitals: {db.hospitals.count_documents({})}")
    print(f"Appointments: {db.appointments.count_documents({})}")
    print(f"Analysis Records: {db.analysis.count_documents({})}")
    print(f"Notifications: {db.notifications.count_documents({})}")
    print(f"Chat Messages: {db.chat_messages.count_documents({})}")
    print("="*50)
    print("\nTest Credentials:")
    print("  Admin:   admin@test.com   / admin123")
    print("  Doctor:  doctor@test.com  / doctor123")
    print("  Patient: patient@test.com / patient123")
    print("="*50)

if __name__ == "__main__":
    seed_database()
