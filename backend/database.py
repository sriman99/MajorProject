"""
Async MongoDB Database Connection Module
Uses Motor for async operations
"""
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")

class Database:
    client: AsyncIOMotorClient = None
    db = None

# Create database instance
database = Database()

async def connect_to_mongo():
    """Connect to MongoDB on startup"""
    database.client = AsyncIOMotorClient(MONGODB_URL, maxPoolSize=50, minPoolSize=10)
    database.db = database.client.healthcare_db
    print("Connected to MongoDB")

async def close_mongo_connection():
    """Close MongoDB connection on shutdown"""
    database.client.close()
    print("Closed MongoDB connection")

def get_database():
    """Get database instance"""
    return database.db

# Collections
def get_users_collection():
    return database.db.users

def get_doctors_collection():
    return database.db.doctors

def get_hospitals_collection():
    return database.db.hospitals

def get_appointments_collection():
    return database.db.appointments

def get_analysis_collection():
    return database.db.analysis

def get_notifications_collection():
    return database.db.notifications
