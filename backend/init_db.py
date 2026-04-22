from pymongo import MongoClient, ASCENDING, DESCENDING
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = MongoClient(MONGODB_URL)
db = client.healthcare_db

def init_database():
    """Initialize database with collections and indexes"""

    # Create collections if they don't exist
    collections = {
        'users': db.users,
        'doctors': db.doctors,
        'hospitals': db.hospitals,
        'appointments': db.appointments,
        'analysis': db.analysis,
        'chat_messages': db.chat_messages,
        'notifications': db.notifications,
        'payments': db.payments,
        'feedback': db.feedback
    }

    print("Creating indexes...")

    # Create indexes for users collection
    collections['users'].create_index([("email", ASCENDING)], unique=True)
    collections['users'].create_index([("phone", ASCENDING)], sparse=True)
    collections['users'].create_index([("role", ASCENDING)])
    collections['users'].create_index([("id", ASCENDING)], unique=True)

    # Create indexes for doctors collection
    collections['doctors'].create_index([("user_id", ASCENDING)], unique=True)
    collections['doctors'].create_index([("id", ASCENDING)], unique=True)
    collections['doctors'].create_index([("specialties", ASCENDING)])
    collections['doctors'].create_index([("name", ASCENDING)])
    collections['doctors'].create_index([("gender", ASCENDING)])

    # Create indexes for hospitals collection
    collections['hospitals'].create_index([("id", ASCENDING)], unique=True)
    collections['hospitals'].create_index([("name", ASCENDING)])
    collections['hospitals'].create_index([("specialties", ASCENDING)])
    collections['hospitals'].create_index([("address", ASCENDING)])

    # Create indexes for appointments collection
    collections['appointments'].create_index([("id", ASCENDING)], unique=True)
    collections['appointments'].create_index([("doctor_id", ASCENDING)])
    collections['appointments'].create_index([("patient_id", ASCENDING)])
    collections['appointments'].create_index([("date", ASCENDING)])
    collections['appointments'].create_index([("status", ASCENDING)])
    collections['appointments'].create_index([
        ("doctor_id", ASCENDING),
        ("date", ASCENDING),
        ("time", ASCENDING)
    ])

    # Create indexes for analysis collection
    collections['analysis'].create_index([("id", ASCENDING)], unique=True)
    collections['analysis'].create_index([("user_id", ASCENDING)])
    collections['analysis'].create_index([("created_at", DESCENDING)])
    collections['analysis'].create_index([("status", ASCENDING)])

    # Create indexes for chat_messages collection
    collections['chat_messages'].create_index([("id", ASCENDING)], unique=True)
    collections['chat_messages'].create_index([("conversation_id", ASCENDING)])
    collections['chat_messages'].create_index([("sender_id", ASCENDING)])
    collections['chat_messages'].create_index([("receiver_id", ASCENDING)])
    collections['chat_messages'].create_index([("timestamp", DESCENDING)])
    collections['chat_messages'].create_index([
        ("conversation_id", ASCENDING),
        ("timestamp", DESCENDING)
    ])

    # Create indexes for notifications collection
    collections['notifications'].create_index([("id", ASCENDING)], unique=True)
    collections['notifications'].create_index([("user_id", ASCENDING)])
    collections['notifications'].create_index([("read", ASCENDING)])
    collections['notifications'].create_index([("created_at", DESCENDING)])
    collections['notifications'].create_index([("type", ASCENDING)])

    # Create indexes for payments collection
    collections['payments'].create_index([("id", ASCENDING)], unique=True)
    collections['payments'].create_index([("user_id", ASCENDING)])
    collections['payments'].create_index([("appointment_id", ASCENDING)])
    collections['payments'].create_index([("status", ASCENDING)])
    collections['payments'].create_index([("created_at", DESCENDING)])

    # Create indexes for feedback collection
    collections['feedback'].create_index([("id", ASCENDING)], unique=True)
    collections['feedback'].create_index([("user_id", ASCENDING)])
    collections['feedback'].create_index([("created_at", DESCENDING)])

    print("\n" + "="*50)
    print("DATABASE INITIALIZED SUCCESSFULLY!")
    print("="*50)
    print("\nCollections and document counts:")
    for collection_name, collection in collections.items():
        count = collection.count_documents({})
        print(f"  - {collection_name}: {count} documents")
    print("="*50)
    print("\nIndexes created for all collections.")
    print("Run 'python seed_data.py' to populate with sample data.")
    print("="*50)

if __name__ == "__main__":
    init_database()
