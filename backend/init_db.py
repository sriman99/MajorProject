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
    # Create collections if they don't exist
    collections = {
        'users': db.users,
        'doctors': db.doctors,
        'hospitals': db.hospitals,
        'appointments': db.appointments,
        'analysis': db.analysis
    }
    
    # Create indexes for users collection
    collections['users'].create_index([("email", ASCENDING)], unique=True)
    collections['users'].create_index([("phone", ASCENDING)], unique=True)
    
    # Create indexes for doctors collection
    collections['doctors'].create_index([("user_id", ASCENDING)], unique=True)
    collections['doctors'].create_index([("specialties", ASCENDING)])
    
    # Create indexes for hospitals collection
    collections['hospitals'].create_index([("name", ASCENDING)])
    collections['hospitals'].create_index([("specialties", ASCENDING)])
    
    # Create indexes for appointments collection
    collections['appointments'].create_index([("doctor_id", ASCENDING)])
    collections['appointments'].create_index([("patient_id", ASCENDING)])
    collections['appointments'].create_index([("date", ASCENDING)])
    collections['appointments'].create_index([("status", ASCENDING)])
    
    # Create indexes for analysis collection
    collections['analysis'].create_index([("user_id", ASCENDING)])
    collections['analysis'].create_index([("created_at", DESCENDING)])
    
    print("Database initialized with collections and indexes:")
    for collection_name, collection in collections.items():
        print(f"- {collection_name}: {collection.count_documents({})} documents")
        print(f"  Indexes: {collection.list_indexes()}")

if __name__ == "__main__":
    init_database() 