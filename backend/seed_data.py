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

# ── Helpers ──────────────────────────────────────────────────────────
now = datetime.now()

def uid():
    return str(uuid.uuid4())

def avatar(name, bg="ff7757"):
    return f"https://ui-avatars.com/api/?name={quote(name)}&background={bg}&color=fff&size=200&bold=true"

def unsplash(photo_id, w=200, h=200):
    return f"https://images.unsplash.com/photo-{photo_id}?w={w}&h={h}&fit=crop&crop=face"

# Strong passwords that pass validation (8+ chars, upper, lower, digit, special)
ADMIN_PASS = "Admin@123"
DOCTOR_PASS = "Doctor@123"
PATIENT_PASS = "Patient@123"


def seed_database():
    """Seed database with comprehensive demo data"""

    # Clear all collections
    print("Clearing existing data...")
    for col in ["users", "doctors", "hospitals", "appointments", "analysis",
                 "chat_messages", "notifications", "payments"]:
        db[col].delete_many({})

    # ==================== USERS ====================
    print("Seeding users...")

    admin_id = uid()
    admin = {
        "id": admin_id,
        "email": "admin@neumoai.com",
        "full_name": "Admin User",
        "username": "admin",
        "phone": "+91-9000000001",
        "password": pwd_context.hash(ADMIN_PASS),
        "role": "admin",
        "is_active": True,
        "avatar_url": avatar("Admin User", "8b5cf6"),
        "created_at": (now - timedelta(days=90)).isoformat()
    }

    # ── Doctor users ──
    doctor_data = [
        {"name": "Dr. Arun Kapoor",     "email": "arun.kapoor@neumoai.com",   "phone": "+91-9000000010", "gender": "male",   "photo": "1612349317150-e413f6a5b16d"},
        {"name": "Dr. Sarah Smith",      "email": "sarah.smith@neumoai.com",   "phone": "+91-9000000011", "gender": "female", "photo": "1559839734-2b71ea197ec2"},
        {"name": "Dr. Michael Brown",    "email": "michael.brown@neumoai.com", "phone": "+91-9000000012", "gender": "male",   "photo": "1622253692010-333f2da6031d"},
        {"name": "Dr. Priya Patel",      "email": "priya.patel@neumoai.com",   "phone": "+91-9000000013", "gender": "female", "photo": "1594824476967-48c8b964273f"},
        {"name": "Dr. Rajesh Kumar",     "email": "rajesh.kumar@neumoai.com",  "phone": "+91-9000000014", "gender": "male",   "photo": "1537368910025-700350fe46c7"},
        {"name": "Dr. Anjali Sharma",    "email": "anjali.sharma@neumoai.com", "phone": "+91-9000000015", "gender": "female", "photo": "1651008376811-b90baee60c1f"},
        {"name": "Dr. Amit Verma",       "email": "amit.verma@neumoai.com",    "phone": "+91-9000000016", "gender": "male",   "photo": "1582750433449-648ed127bb54"},
        {"name": "Dr. Neha Gupta",       "email": "neha.gupta@neumoai.com",    "phone": "+91-9000000017", "gender": "female", "photo": "1614608682850-e0d6ed316d47"},
    ]

    doctor_users = []
    for d in doctor_data:
        doc_user = {
            "id": uid(),
            "email": d["email"],
            "full_name": d["name"],
            "username": d["email"].split("@")[0],
            "phone": d["phone"],
            "password": pwd_context.hash(DOCTOR_PASS),
            "role": "doctor",
            "is_active": True,
            "avatar_url": unsplash(d["photo"]),
            "created_at": (now - timedelta(days=60)).isoformat()
        }
        doctor_users.append(doc_user)

    # ── Patient users ──
    patient_data = [
        {"name": "Rahul Sharma",   "email": "rahul@neumoai.com",   "phone": "+91-9000000020"},
        {"name": "Anita Singh",    "email": "anita@neumoai.com",   "phone": "+91-9000000021"},
        {"name": "Vikram Reddy",   "email": "vikram@neumoai.com",  "phone": "+91-9000000022"},
        {"name": "Meera Nair",     "email": "meera@neumoai.com",   "phone": "+91-9000000023"},
        {"name": "Arjun Mehta",    "email": "arjun@neumoai.com",   "phone": "+91-9000000024"},
    ]

    patient_users = []
    for p in patient_data:
        pat_user = {
            "id": uid(),
            "email": p["email"],
            "full_name": p["name"],
            "username": p["email"].split("@")[0],
            "phone": p["phone"],
            "password": pwd_context.hash(PATIENT_PASS),
            "role": "user",
            "is_active": True,
            "avatar_url": avatar(p["name"]),
            "created_at": (now - timedelta(days=30)).isoformat()
        }
        patient_users.append(pat_user)

    # Insert all users
    all_users = [admin] + doctor_users + patient_users
    for u in all_users:
        db.users.insert_one(u)

    # ==================== DOCTOR PROFILES ====================
    print("Seeding doctor profiles...")

    specialties_map = [
        {
            "experience": "12 years",
            "qualifications": "MD, MBBS - Pulmonology",
            "languages": ["English", "Hindi"],
            "specialties": ["Pulmonology", "Internal Medicine"],
            "locations": [
                {"name": "Apollo Hospital, Jubilee Hills, Hyderabad", "isMain": True},
                {"name": "City Medical Center, Banjara Hills, Hyderabad", "isMain": False}
            ],
            "timings": {"hours": "9:00 AM - 5:00 PM", "days": "Monday - Friday"},
            "consultation_fee": 500,
        },
        {
            "experience": "8 years",
            "qualifications": "MD, Pulmonology",
            "languages": ["English", "Hindi", "Tamil"],
            "specialties": ["Pulmonology", "Respiratory Medicine"],
            "locations": [
                {"name": "City Medical Center, Banjara Hills, Hyderabad", "isMain": True}
            ],
            "timings": {"hours": "10:00 AM - 6:00 PM", "days": "Monday - Saturday"},
            "consultation_fee": 600,
        },
        {
            "experience": "15 years",
            "qualifications": "MD, PhD - Pulmonology",
            "languages": ["English"],
            "specialties": ["Pulmonology", "Critical Care", "Lung Diseases"],
            "locations": [
                {"name": "General Hospital, Secunderabad, Hyderabad", "isMain": True},
                {"name": "Apollo Hospital, Jubilee Hills, Hyderabad", "isMain": False}
            ],
            "timings": {"hours": "8:00 AM - 4:00 PM", "days": "Monday - Friday"},
            "consultation_fee": 800,
        },
        {
            "experience": "10 years",
            "qualifications": "MBBS, MD - Respiratory Medicine",
            "languages": ["English", "Hindi", "Gujarati"],
            "specialties": ["Respiratory Medicine", "Asthma Specialist", "Allergology"],
            "locations": [
                {"name": "HealthCare Plus, Madhapur, Hyderabad", "isMain": True}
            ],
            "timings": {"hours": "9:00 AM - 7:00 PM", "days": "Tuesday - Sunday"},
            "consultation_fee": 700,
        },
        {
            "experience": "20 years",
            "qualifications": "MD, DM - Pulmonology",
            "languages": ["English", "Hindi", "Telugu"],
            "specialties": ["Pulmonology", "Sleep Medicine", "Tuberculosis"],
            "locations": [
                {"name": "Apollo Hospital, Jubilee Hills, Hyderabad", "isMain": True},
                {"name": "Fortis Hospital, Bannerghatta Road, Bangalore", "isMain": False}
            ],
            "timings": {"hours": "10:00 AM - 5:00 PM", "days": "Monday - Saturday"},
            "consultation_fee": 1000,
        },
        {
            "experience": "6 years",
            "qualifications": "MBBS, DNB - Pulmonology",
            "languages": ["English", "Hindi"],
            "specialties": ["Respiratory Medicine", "Allergology", "Pediatric Pulmonology"],
            "locations": [
                {"name": "City Medical Center, Banjara Hills, Hyderabad", "isMain": True}
            ],
            "timings": {"hours": "11:00 AM - 7:00 PM", "days": "Monday - Friday"},
            "consultation_fee": 500,
        },
        {
            "experience": "14 years",
            "qualifications": "MD, FCCP - Chest Medicine",
            "languages": ["English", "Hindi", "Marathi"],
            "specialties": ["Chest Medicine", "Interventional Pulmonology", "COPD Specialist"],
            "locations": [
                {"name": "Max Hospital, Saket, New Delhi", "isMain": True}
            ],
            "timings": {"hours": "9:00 AM - 6:00 PM", "days": "Monday - Saturday"},
            "consultation_fee": 900,
        },
        {
            "experience": "9 years",
            "qualifications": "MBBS, MD - Pulmonary Medicine",
            "languages": ["English", "Hindi", "Bengali"],
            "specialties": ["Pulmonary Medicine", "Bronchoscopy", "Lung Cancer"],
            "locations": [
                {"name": "Medanta Hospital, Sector 38, Gurgaon", "isMain": True}
            ],
            "timings": {"hours": "10:00 AM - 6:00 PM", "days": "Monday - Friday"},
            "consultation_fee": 750,
        },
    ]

    doctor_profiles = []
    for i, spec in enumerate(specialties_map):
        profile = {
            "id": uid(),
            "user_id": doctor_users[i]["id"],
            "name": doctor_users[i]["full_name"],
            "gender": doctor_data[i]["gender"],
            "image_url": doctor_users[i]["avatar_url"],
            **spec,
        }
        doctor_profiles.append(profile)
        db.doctors.insert_one(profile)

    # ==================== HOSPITALS ====================
    print("Seeding hospitals...")

    hospitals = [
        {
            "id": uid(),
            "name": "Apollo Hospital",
            "address": "Plot No. 251, Road No. 1, Jubilee Hills, Hyderabad - 500033",
            "phone": "+91-40-23456789",
            "description": "India's first corporate hospital — world-class respiratory care, advanced ICU, and expert pulmonologists on staff.",
            "specialties": ["Pulmonology", "Cardiology", "Neurology", "Oncology", "Emergency Care"],
            "image_url": "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&h=400&fit=crop",
            "timings": {"emergency": "24/7", "opd": "Mon-Sat: 8:00 AM - 8:00 PM", "visiting": "10:00 AM - 1:00 PM, 4:00 PM - 7:00 PM"},
            "directions_url": "https://maps.google.com/?q=Apollo+Hospital+Hyderabad",
            "rating": 4.8, "beds": 350
        },
        {
            "id": uid(),
            "name": "City Medical Center",
            "address": "456 Health Avenue, Banjara Hills, Hyderabad - 500034",
            "phone": "+91-40-34567890",
            "description": "Comprehensive respiratory care unit with state-of-the-art diagnostics and experienced pulmonologists.",
            "specialties": ["Respiratory Medicine", "Pediatrics", "Internal Medicine", "Dermatology"],
            "image_url": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop",
            "timings": {"emergency": "24/7", "opd": "Mon-Sat: 9:00 AM - 7:00 PM", "visiting": "11:00 AM - 1:00 PM, 5:00 PM - 7:00 PM"},
            "directions_url": "https://maps.google.com/?q=City+Medical+Center+Hyderabad",
            "rating": 4.5, "beds": 200
        },
        {
            "id": uid(),
            "name": "General Hospital",
            "address": "789 Care Boulevard, Secunderabad, Hyderabad - 500003",
            "phone": "+91-40-45678901",
            "description": "Government hospital with affordable respiratory care facilities, modern equipment, and a dedicated critical care unit.",
            "specialties": ["Emergency Medicine", "General Medicine", "Pulmonology", "Surgery", "Orthopedics"],
            "image_url": "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&h=400&fit=crop",
            "timings": {"emergency": "24/7", "opd": "Mon-Sat: 8:00 AM - 4:00 PM", "visiting": "10:00 AM - 12:00 PM, 4:00 PM - 6:00 PM"},
            "directions_url": "https://maps.google.com/?q=General+Hospital+Secunderabad",
            "rating": 4.2, "beds": 500
        },
        {
            "id": uid(),
            "name": "HealthCare Plus",
            "address": "321 Wellness Street, Madhapur, Hyderabad - 500081",
            "phone": "+91-40-56789012",
            "description": "Specializing in respiratory diseases — advanced PFT labs, sleep study center, and pulmonary rehabilitation.",
            "specialties": ["Pulmonology", "Respiratory Medicine", "Allergy & Immunology", "Sleep Medicine"],
            "image_url": "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&h=400&fit=crop",
            "timings": {"emergency": "24/7", "opd": "Mon-Sat: 7:00 AM - 9:00 PM", "visiting": "10:30 AM - 1:30 PM, 4:30 PM - 7:30 PM"},
            "directions_url": "https://maps.google.com/?q=HealthCare+Plus+Madhapur",
            "rating": 4.6, "beds": 150
        },
        {
            "id": uid(),
            "name": "Fortis Hospital",
            "address": "154/9, Bannerghatta Road, Bangalore - 560076",
            "phone": "+91-80-66214444",
            "description": "Multi-specialty hospital with bronchoscopy, thoracoscopy, and a lung transplant programme.",
            "specialties": ["Pulmonology", "Cardiology", "Gastroenterology", "Nephrology", "Transplants"],
            "image_url": "https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=600&h=400&fit=crop",
            "timings": {"emergency": "24/7", "opd": "Mon-Sun: 8:00 AM - 8:00 PM", "visiting": "11:00 AM - 1:00 PM, 5:00 PM - 7:00 PM"},
            "directions_url": "https://maps.google.com/?q=Fortis+Hospital+Bangalore",
            "rating": 4.7, "beds": 400
        },
        {
            "id": uid(),
            "name": "Max Hospital",
            "address": "1, 2, Press Enclave Road, Saket, New Delhi - 110017",
            "phone": "+91-11-26515050",
            "description": "Cutting-edge respiratory care unit with advanced ventilators and specialized lung disease treatment.",
            "specialties": ["Respiratory Medicine", "Critical Care", "Oncology", "Cardiac Sciences"],
            "image_url": "https://images.unsplash.com/photo-1596541223130-5d31a73fb6c6?w=600&h=400&fit=crop",
            "timings": {"emergency": "24/7", "opd": "Mon-Sat: 8:00 AM - 8:00 PM", "visiting": "10:00 AM - 12:00 PM, 4:00 PM - 6:00 PM"},
            "directions_url": "https://maps.google.com/?q=Max+Hospital+Saket+Delhi",
            "rating": 4.8, "beds": 500
        },
        {
            "id": uid(),
            "name": "Medanta Hospital",
            "address": "CH Baktawar Singh Road, Sector 38, Gurgaon - 122001",
            "phone": "+91-124-4141414",
            "description": "The Medicity — world-renowned chest medicine department with PFT lab, sleep lab, and interventional pulmonology.",
            "specialties": ["Chest Medicine", "Interventional Pulmonology", "Cardiology", "Liver Transplant"],
            "image_url": "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&h=400&fit=crop",
            "timings": {"emergency": "24/7", "opd": "Mon-Sat: 8:00 AM - 8:00 PM", "visiting": "11:00 AM - 1:00 PM, 5:00 PM - 7:00 PM"},
            "directions_url": "https://maps.google.com/?q=Medanta+Hospital+Gurgaon",
            "rating": 4.9, "beds": 1250
        },
        {
            "id": uid(),
            "name": "AIIMS Delhi",
            "address": "Ansari Nagar, New Delhi - 110029",
            "phone": "+91-11-26588500",
            "description": "Premier government medical institution with excellent pulmonary medicine department and research facilities.",
            "specialties": ["Pulmonary Medicine", "General Medicine", "Surgery", "Pediatrics", "Research"],
            "image_url": "https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&h=400&fit=crop",
            "timings": {"emergency": "24/7", "opd": "Mon-Sat: 8:00 AM - 1:00 PM", "visiting": "4:00 PM - 6:00 PM"},
            "directions_url": "https://maps.google.com/?q=AIIMS+Delhi",
            "rating": 4.7, "beds": 2500
        },
        {
            "id": uid(),
            "name": "Manipal Hospital",
            "address": "98, HAL Airport Road, Bangalore - 560017",
            "phone": "+91-80-25024444",
            "description": "Multi-specialty tertiary care with a dedicated pulmonology department and respiratory ICU.",
            "specialties": ["Pulmonology", "Cardiology", "Orthopedics", "Oncology", "Neurology"],
            "image_url": "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop",
            "timings": {"emergency": "24/7", "opd": "Mon-Sat: 8:00 AM - 8:00 PM", "visiting": "10:00 AM - 1:00 PM, 4:00 PM - 7:00 PM"},
            "directions_url": "https://maps.google.com/?q=Manipal+Hospital+Bangalore",
            "rating": 4.6, "beds": 600
        },
        {
            "id": uid(),
            "name": "Narayana Health",
            "address": "258/A, Bommasandra Industrial Area, Bangalore - 560099",
            "phone": "+91-80-71222222",
            "description": "Affordable world-class healthcare with a specialized COPD clinic and pulmonary rehabilitation centre.",
            "specialties": ["Respiratory Medicine", "Cardiac Surgery", "Nephrology", "Pediatrics"],
            "image_url": "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&h=400&fit=crop",
            "timings": {"emergency": "24/7", "opd": "Mon-Sat: 8:00 AM - 6:00 PM", "visiting": "11:00 AM - 1:00 PM, 5:00 PM - 7:00 PM"},
            "directions_url": "https://maps.google.com/?q=Narayana+Health+Bangalore",
            "rating": 4.5, "beds": 800
        },
    ]

    for h in hospitals:
        db.hospitals.insert_one(h)

    # ==================== APPOINTMENTS ====================
    print("Seeding appointments...")

    dp = doctor_profiles
    pu = patient_users

    appointments = [
        # ── Today's appointments (doctor dashboard will show these) ──
        {"doctor_id": dp[0]["id"], "patient_id": pu[0]["id"], "date": now.strftime("%Y-%m-%d"),
         "time": "09:00", "reason": "Chest tightness and breathing difficulty", "status": "confirmed",
         "created_at": (now - timedelta(days=3)).isoformat()},

        {"doctor_id": dp[0]["id"], "patient_id": pu[1]["id"], "date": now.strftime("%Y-%m-%d"),
         "time": "10:30", "reason": "Follow-up after respiratory analysis", "status": "confirmed",
         "created_at": (now - timedelta(days=2)).isoformat()},

        {"doctor_id": dp[0]["id"], "patient_id": pu[2]["id"], "date": now.strftime("%Y-%m-%d"),
         "time": "14:00", "reason": "Chronic cough evaluation", "status": "pending",
         "created_at": (now - timedelta(days=1)).isoformat()},

        {"doctor_id": dp[1]["id"], "patient_id": pu[0]["id"], "date": now.strftime("%Y-%m-%d"),
         "time": "11:00", "reason": "Persistent wheezing and shortness of breath", "status": "confirmed",
         "created_at": (now - timedelta(days=2)).isoformat()},

        {"doctor_id": dp[1]["id"], "patient_id": pu[3]["id"], "date": now.strftime("%Y-%m-%d"),
         "time": "15:00", "reason": "Allergy-induced asthma consultation", "status": "pending",
         "created_at": (now - timedelta(hours=12)).isoformat()},

        # ── Upcoming appointments (next few days) ──
        {"doctor_id": dp[2]["id"], "patient_id": pu[2]["id"], "date": (now + timedelta(days=1)).strftime("%Y-%m-%d"),
         "time": "14:00", "reason": "Follow-up for lung infection treatment", "status": "confirmed",
         "created_at": (now - timedelta(days=4)).isoformat()},

        {"doctor_id": dp[3]["id"], "patient_id": pu[3]["id"], "date": (now + timedelta(days=2)).strftime("%Y-%m-%d"),
         "time": "16:00", "reason": "Asthma management consultation", "status": "pending",
         "created_at": (now - timedelta(days=1)).isoformat()},

        {"doctor_id": dp[4]["id"], "patient_id": pu[4]["id"], "date": (now + timedelta(days=3)).strftime("%Y-%m-%d"),
         "time": "10:00", "reason": "Sleep apnea initial evaluation", "status": "pending",
         "created_at": now.isoformat()},

        {"doctor_id": dp[0]["id"], "patient_id": pu[4]["id"], "date": (now + timedelta(days=4)).strftime("%Y-%m-%d"),
         "time": "11:00", "reason": "Annual pulmonary function test", "status": "pending",
         "created_at": now.isoformat()},

        # ── Past completed appointments (history) ──
        {"doctor_id": dp[0]["id"], "patient_id": pu[0]["id"], "date": (now - timedelta(days=7)).strftime("%Y-%m-%d"),
         "time": "09:30", "reason": "Initial respiratory check-up", "status": "completed",
         "created_at": (now - timedelta(days=10)).isoformat()},

        {"doctor_id": dp[1]["id"], "patient_id": pu[1]["id"], "date": (now - timedelta(days=5)).strftime("%Y-%m-%d"),
         "time": "10:00", "reason": "Persistent cough for 3 weeks", "status": "completed",
         "created_at": (now - timedelta(days=8)).isoformat()},

        {"doctor_id": dp[2]["id"], "patient_id": pu[2]["id"], "date": (now - timedelta(days=3)).strftime("%Y-%m-%d"),
         "time": "14:00", "reason": "Pneumonia follow-up", "status": "completed",
         "created_at": (now - timedelta(days=6)).isoformat()},

        {"doctor_id": dp[4]["id"], "patient_id": pu[4]["id"], "date": (now - timedelta(days=14)).strftime("%Y-%m-%d"),
         "time": "09:00", "reason": "Snoring and daytime drowsiness", "status": "completed",
         "created_at": (now - timedelta(days=17)).isoformat()},

        {"doctor_id": dp[3]["id"], "patient_id": pu[0]["id"], "date": (now - timedelta(days=10)).strftime("%Y-%m-%d"),
         "time": "16:00", "reason": "Allergy testing for respiratory triggers", "status": "completed",
         "created_at": (now - timedelta(days=13)).isoformat()},

        # ── Cancelled appointment ──
        {"doctor_id": dp[5]["id"], "patient_id": pu[1]["id"], "date": (now - timedelta(days=2)).strftime("%Y-%m-%d"),
         "time": "11:00", "reason": "General breathing difficulty", "status": "cancelled",
         "created_at": (now - timedelta(days=5)).isoformat()},
    ]

    apt_records = []
    for apt in appointments:
        apt["id"] = uid()
        apt_records.append(apt)
        db.appointments.insert_one(apt)

    # ==================== ANALYSIS RECORDS ====================
    print("Seeding analysis records...")

    analysis_records = [
        {
            "id": uid(), "user_id": pu[0]["id"],
            "file_path": "uploads/sample_healthy.wav", "analysis_type": "audio",
            "status": "normal", "prediction": "Healthy", "confidence": 0.94,
            "message": "Normal breathing patterns detected. No abnormalities found.",
            "details": ["Clear lung sounds", "Regular respiratory rate", "No wheezing or crackles"],
            "created_at": (now - timedelta(days=7)).isoformat()
        },
        {
            "id": uid(), "user_id": pu[1]["id"],
            "file_path": "uploads/sample_pneumonia.wav", "analysis_type": "audio",
            "status": "critical", "prediction": "Pneumonia", "confidence": 0.87,
            "message": "Strong indicators of Pneumonia detected. Please consult a pulmonologist immediately.",
            "details": ["Crackling sounds in lower lobes", "Reduced breath sounds on right side", "Elevated respiratory rate"],
            "created_at": (now - timedelta(days=5)).isoformat()
        },
        {
            "id": uid(), "user_id": pu[2]["id"],
            "file_path": "uploads/sample_copd.wav", "analysis_type": "audio",
            "status": "critical", "prediction": "COPD", "confidence": 0.82,
            "message": "Indicators of Chronic Obstructive Pulmonary Disease detected.",
            "details": ["Prolonged expiratory phase", "Wheezing on exhalation", "Reduced air flow patterns"],
            "created_at": (now - timedelta(days=3)).isoformat()
        },
        {
            "id": uid(), "user_id": pu[3]["id"],
            "file_path": "uploads/sample_asthma.wav", "analysis_type": "audio",
            "status": "warning", "prediction": "Asthma", "confidence": 0.76,
            "message": "Possible Asthma indicators found. Consult a respiratory specialist.",
            "details": ["Intermittent wheezing detected", "Variable airflow limitation", "Episodic breathing pattern"],
            "created_at": (now - timedelta(days=2)).isoformat()
        },
        {
            "id": uid(), "user_id": pu[0]["id"],
            "file_path": "uploads/sample_bronchiolitis.wav", "analysis_type": "audio",
            "status": "warning", "prediction": "Bronchiolitis", "confidence": 0.71,
            "message": "Signs of Bronchiolitis detected. Monitor symptoms and consult if worsening.",
            "details": ["Fine crackles heard", "Mild tachypnoea", "Possible viral etiology"],
            "created_at": (now - timedelta(days=1)).isoformat()
        },
        {
            "id": uid(), "user_id": pu[4]["id"],
            "file_path": "uploads/sample_urti.wav", "analysis_type": "audio",
            "status": "warning", "prediction": "URTI", "confidence": 0.68,
            "message": "Upper Respiratory Tract Infection indicators found.",
            "details": ["Nasal congestion sounds", "Mild throat irritation patterns", "Generally mild severity"],
            "created_at": now.isoformat()
        },
        {
            "id": uid(), "user_id": pu[2]["id"],
            "file_path": "uploads/sample_lrti.wav", "analysis_type": "audio",
            "status": "critical", "prediction": "LRTI", "confidence": 0.80,
            "message": "Lower Respiratory Tract Infection detected. Seek medical attention.",
            "details": ["Coarse crackles in bilateral lung fields", "Increased respiratory effort", "Productive cough patterns"],
            "created_at": (now - timedelta(hours=6)).isoformat()
        },
    ]

    for a in analysis_records:
        db.analysis.insert_one(a)

    # ==================== PAYMENTS ====================
    print("Seeding payments...")

    completed_apts = [a for a in apt_records if a["status"] == "completed"]
    for apt in completed_apts:
        doc_profile = next((d for d in dp if d["id"] == apt["doctor_id"]), None)
        fee = doc_profile["consultation_fee"] if doc_profile else 500
        payment = {
            "id": uid(),
            "user_id": apt["patient_id"],
            "appointment_id": apt["id"],
            "amount": fee,
            "status": "completed",
            "payment_method": "card",
            "created_at": apt["created_at"],
        }
        db.payments.insert_one(payment)

    # ==================== NOTIFICATIONS ====================
    print("Seeding notifications...")

    notifications = [
        {"user_id": pu[0]["id"], "type": "appointment", "title": "Appointment Confirmed",
         "message": f"Your appointment with {dp[0]['name']} today at 9:00 AM has been confirmed.",
         "read": False, "created_at": (now - timedelta(hours=2)).isoformat()},

        {"user_id": pu[0]["id"], "type": "analysis", "title": "Analysis Complete",
         "message": "Your respiratory analysis detected Bronchiolitis. Please review the detailed report.",
         "read": False, "created_at": (now - timedelta(days=1)).isoformat()},

        {"user_id": pu[0]["id"], "type": "analysis", "title": "Analysis Complete",
         "message": "Your respiratory analysis shows healthy lung patterns. Great news!",
         "read": True, "created_at": (now - timedelta(days=7)).isoformat()},

        {"user_id": pu[1]["id"], "type": "analysis", "title": "Analysis Complete — Action Needed",
         "message": "Your respiratory analysis detected Pneumonia indicators. Please consult a doctor.",
         "read": False, "created_at": (now - timedelta(days=5)).isoformat()},

        {"user_id": pu[1]["id"], "type": "appointment", "title": "Appointment Confirmed",
         "message": f"Your appointment with {dp[0]['name']} today at 10:30 AM is confirmed.",
         "read": True, "created_at": (now - timedelta(hours=6)).isoformat()},

        {"user_id": pu[2]["id"], "type": "analysis", "title": "LRTI Detected",
         "message": "Your latest analysis indicates Lower Respiratory Tract Infection. Review recommended.",
         "read": False, "created_at": (now - timedelta(hours=6)).isoformat()},

        {"user_id": pu[3]["id"], "type": "appointment", "title": "Appointment Scheduled",
         "message": f"Your appointment with {dp[3]['name']} on {(now + timedelta(days=2)).strftime('%B %d')} is pending confirmation.",
         "read": False, "created_at": (now - timedelta(days=1)).isoformat()},

        {"user_id": pu[4]["id"], "type": "analysis", "title": "URTI Detected",
         "message": "Mild Upper Respiratory Tract Infection detected. Monitor and rest.",
         "read": False, "created_at": now.isoformat()},

        {"user_id": doctor_users[0]["id"], "type": "appointment", "title": "New Appointment Request",
         "message": "Vikram Reddy requested an appointment for today at 2:00 PM.",
         "read": False, "created_at": (now - timedelta(hours=1)).isoformat()},

        {"user_id": doctor_users[0]["id"], "type": "appointment", "title": "3 Appointments Today",
         "message": "You have 3 appointments scheduled for today. Check your dashboard.",
         "read": True, "created_at": (now - timedelta(hours=8)).isoformat()},

        {"user_id": doctor_users[1]["id"], "type": "appointment", "title": "New Appointment",
         "message": "Meera Nair booked an appointment for today at 3:00 PM.",
         "read": False, "created_at": (now - timedelta(hours=4)).isoformat()},

        {"user_id": admin_id, "type": "system", "title": "Weekly Summary",
         "message": f"System stats: {len(all_users)} users, {len(apt_records)} appointments, {len(analysis_records)} analyses this week.",
         "read": True, "created_at": (now - timedelta(days=1)).isoformat()},
    ]

    for n in notifications:
        n["id"] = uid()
        db.notifications.insert_one(n)

    # ==================== CHAT MESSAGES ====================
    print("Seeding chat messages...")

    conv1 = f"{dp[0]['id']}_{pu[0]['id']}"
    chat_messages = [
        {"conversation_id": conv1, "sender_id": pu[0]["id"], "receiver_id": dp[0]["id"],
         "text": "Hello Dr. Arun, I've been experiencing chest tightness for the past week. Should I be concerned?",
         "timestamp": (now - timedelta(hours=24)).isoformat(), "read": True},

        {"conversation_id": conv1, "sender_id": dp[0]["id"], "receiver_id": pu[0]["id"],
         "text": "Hello Rahul. Chest tightness can have many causes. Can you tell me — does it worsen with physical activity or deep breathing?",
         "timestamp": (now - timedelta(hours=23)).isoformat(), "read": True},

        {"conversation_id": conv1, "sender_id": pu[0]["id"], "receiver_id": dp[0]["id"],
         "text": "Yes, it gets worse when I climb stairs or exercise. I also feel slightly breathless.",
         "timestamp": (now - timedelta(hours=22)).isoformat(), "read": True},

        {"conversation_id": conv1, "sender_id": dp[0]["id"], "receiver_id": pu[0]["id"],
         "text": "I see. I'd recommend uploading a breathing sample on NeumoAI for a quick analysis. We can discuss the results during your appointment.",
         "timestamp": (now - timedelta(hours=21)).isoformat(), "read": True},

        {"conversation_id": conv1, "sender_id": pu[0]["id"], "receiver_id": dp[0]["id"],
         "text": "I did the analysis — it detected Bronchiolitis with 71% confidence. Is that serious?",
         "timestamp": (now - timedelta(hours=5)).isoformat(), "read": True},

        {"conversation_id": conv1, "sender_id": dp[0]["id"], "receiver_id": pu[0]["id"],
         "text": "Don't worry, we'll review it thoroughly during your appointment today. Bring any previous reports if you have them. See you at 9 AM!",
         "timestamp": (now - timedelta(hours=4)).isoformat(), "read": False},
    ]

    conv2 = f"{dp[1]['id']}_{pu[1]['id']}"
    chat_messages += [
        {"conversation_id": conv2, "sender_id": pu[1]["id"], "receiver_id": dp[1]["id"],
         "text": "Dr. Sarah, my NeumoAI analysis shows pneumonia indicators. I'm very worried.",
         "timestamp": (now - timedelta(hours=10)).isoformat(), "read": True},

        {"conversation_id": conv2, "sender_id": dp[1]["id"], "receiver_id": pu[1]["id"],
         "text": "Anita, I've reviewed your report. The AI analysis is a screening tool — we need to confirm with an X-ray. I've scheduled you for today.",
         "timestamp": (now - timedelta(hours=9)).isoformat(), "read": True},

        {"conversation_id": conv2, "sender_id": pu[1]["id"], "receiver_id": dp[1]["id"],
         "text": "Thank you, doctor. Should I bring anything specific?",
         "timestamp": (now - timedelta(hours=8)).isoformat(), "read": True},

        {"conversation_id": conv2, "sender_id": dp[1]["id"], "receiver_id": pu[1]["id"],
         "text": "Just your previous health records and the audio file if possible. Also avoid eating heavy food before the appointment. See you soon!",
         "timestamp": (now - timedelta(hours=7)).isoformat(), "read": False},
    ]

    for msg in chat_messages:
        msg["id"] = uid()
        db.chat_messages.insert_one(msg)

    # ==================== SUMMARY ====================
    print("\n" + "=" * 60)
    print("  DATABASE SEEDING COMPLETE!")
    print("=" * 60)
    print(f"  Users          : {db.users.count_documents({})}")
    print(f"    Admin        : 1")
    print(f"    Doctors      : {len(doctor_users)}")
    print(f"    Patients     : {len(patient_users)}")
    print(f"  Doctor Profiles: {db.doctors.count_documents({})}")
    print(f"  Hospitals      : {db.hospitals.count_documents({})}")
    print(f"  Appointments   : {db.appointments.count_documents({})}")
    print(f"    Today        : {sum(1 for a in apt_records if a['date'] == now.strftime('%Y-%m-%d'))}")
    print(f"    Upcoming     : {sum(1 for a in apt_records if a['status'] in ('pending','confirmed') and a['date'] > now.strftime('%Y-%m-%d'))}")
    print(f"    Completed    : {sum(1 for a in apt_records if a['status'] == 'completed')}")
    print(f"  Analysis       : {db.analysis.count_documents({})}")
    print(f"  Payments       : {db.payments.count_documents({})}")
    print(f"  Notifications  : {db.notifications.count_documents({})}")
    print(f"  Chat Messages  : {db.chat_messages.count_documents({})}")
    print("=" * 60)
    print()
    print("  LOGIN CREDENTIALS")
    print("  " + "-" * 56)
    print(f"  Admin   : admin@neumoai.com       / {ADMIN_PASS}")
    print(f"  Doctor  : arun.kapoor@neumoai.com / {DOCTOR_PASS}")
    print(f"  Doctor  : sarah.smith@neumoai.com / {DOCTOR_PASS}")
    print(f"  Patient : rahul@neumoai.com       / {PATIENT_PASS}")
    print(f"  Patient : anita@neumoai.com       / {PATIENT_PASS}")
    print("  " + "-" * 56)
    print(f"  (All doctors use '{DOCTOR_PASS}', all patients use '{PATIENT_PASS}')")
    print("=" * 60)


if __name__ == "__main__":
    seed_database()
