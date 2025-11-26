"""
Appointment Reminder Scheduler
Sends reminder emails 24 hours and 1 hour before appointments
"""

import os
import asyncio
from datetime import datetime, timedelta
from typing import List, Dict, Any
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import logging

from email_service import send_appointment_reminder

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")

# Global database client
db_client: AsyncIOMotorClient = None
db = None


async def init_scheduler_db():
    """Initialize database connection for scheduler"""
    global db_client, db
    db_client = AsyncIOMotorClient(MONGODB_URL)
    db = db_client.healthcare_db
    logger.info("Scheduler database connection established")


async def close_scheduler_db():
    """Close database connection"""
    global db_client
    if db_client:
        db_client.close()
        logger.info("Scheduler database connection closed")


async def check_and_send_reminders():
    """
    Check for upcoming appointments and send reminders
    - 24 hours before appointment
    - 1 hour before appointment
    """
    try:
        if db is None:
            logger.error("Database not initialized")
            return

        # Get current time
        now = datetime.utcnow()

        # Calculate time windows for reminders
        # 24-hour reminder window: 23.5 to 24.5 hours from now
        reminder_24h_start = now + timedelta(hours=23, minutes=30)
        reminder_24h_end = now + timedelta(hours=24, minutes=30)

        # 1-hour reminder window: 0.5 to 1.5 hours from now
        reminder_1h_start = now + timedelta(minutes=30)
        reminder_1h_end = now + timedelta(hours=1, minutes=30)

        # Find appointments that need 24-hour reminders
        appointments_24h = await find_appointments_in_window(
            reminder_24h_start,
            reminder_24h_end,
            "24h_reminder_sent"
        )

        # Find appointments that need 1-hour reminders
        appointments_1h = await find_appointments_in_window(
            reminder_1h_start,
            reminder_1h_end,
            "1h_reminder_sent"
        )

        # Send 24-hour reminders
        for appointment in appointments_24h:
            await send_reminder_email(appointment, "24h")

        # Send 1-hour reminders
        for appointment in appointments_1h:
            await send_reminder_email(appointment, "1h")

        logger.info(f"Reminder check complete: {len(appointments_24h)} 24h reminders, {len(appointments_1h)} 1h reminders sent")

    except Exception as e:
        logger.error(f"Error in check_and_send_reminders: {str(e)}")


async def find_appointments_in_window(
    start_time: datetime,
    end_time: datetime,
    reminder_flag: str
) -> List[Dict[str, Any]]:
    """
    Find appointments within a time window that haven't been sent a specific reminder

    Args:
        start_time: Start of the time window
        end_time: End of the time window
        reminder_flag: Flag name to check if reminder was sent (e.g., "24h_reminder_sent")

    Returns:
        List of appointment documents
    """
    try:
        # Convert datetime to date string (YYYY-MM-DD format)
        start_date = start_time.strftime("%Y-%m-%d")
        end_date = end_time.strftime("%Y-%m-%d")

        # Query for appointments
        # Note: This assumes appointments are stored with date as string in YYYY-MM-DD format
        # and time as string in HH:MM format
        query = {
            "status": {"$in": ["pending", "confirmed"]},  # Only active appointments
            "$or": [
                {reminder_flag: {"$exists": False}},  # Reminder not sent
                {reminder_flag: False}  # Or explicitly set to False
            ]
        }

        # Get all appointments on the target dates
        appointments = []
        cursor = db.appointments.find(query)

        async for appointment in cursor:
            # Parse appointment datetime
            try:
                appointment_date = datetime.strptime(appointment["date"], "%Y-%m-%d")
                appointment_time_parts = appointment["time"].split(":")
                appointment_datetime = appointment_date.replace(
                    hour=int(appointment_time_parts[0]),
                    minute=int(appointment_time_parts[1])
                )

                # Check if appointment is within the window
                if start_time <= appointment_datetime <= end_time:
                    appointments.append(appointment)

            except (ValueError, KeyError) as e:
                logger.warning(f"Error parsing appointment {appointment.get('id')}: {str(e)}")
                continue

        return appointments

    except Exception as e:
        logger.error(f"Error finding appointments: {str(e)}")
        return []


async def send_reminder_email(appointment: Dict[str, Any], reminder_type: str):
    """
    Send reminder email for an appointment

    Args:
        appointment: Appointment document from database
        reminder_type: Type of reminder ("24h" or "1h")
    """
    try:
        # Get patient details
        patient = await db.users.find_one({"id": appointment["patient_id"]})
        if not patient:
            logger.warning(f"Patient not found for appointment {appointment['id']}")
            return

        # Get doctor details
        doctor = await db.doctors.find_one({"id": appointment["doctor_id"]})
        if not doctor:
            logger.warning(f"Doctor not found for appointment {appointment['id']}")
            return

        # Get hospital details
        hospital_name = "N/A"
        if doctor.get("locations") and len(doctor["locations"]) > 0:
            hospital_id = doctor["locations"][0].get("hospital_id")
            if hospital_id:
                hospital = await db.hospitals.find_one({"id": hospital_id})
                if hospital:
                    hospital_name = hospital.get("name", "N/A")

        # Prepare appointment details
        appointment_details = {
            "patient_name": patient.get("full_name", "Patient"),
            "doctor_name": doctor.get("name", "Unknown Doctor"),
            "appointment_date": appointment["date"],
            "appointment_time": appointment["time"],
            "hospital_name": hospital_name
        }

        # Send reminder email
        success = send_appointment_reminder(
            user_email=patient["email"],
            appointment_details=appointment_details,
            reminder_type=reminder_type
        )

        if success:
            # Mark reminder as sent
            reminder_flag = f"{reminder_type}_reminder_sent"
            await db.appointments.update_one(
                {"id": appointment["id"]},
                {"$set": {reminder_flag: True}}
            )
            logger.info(f"Sent {reminder_type} reminder for appointment {appointment['id']}")
        else:
            logger.error(f"Failed to send {reminder_type} reminder for appointment {appointment['id']}")

    except Exception as e:
        logger.error(f"Error sending reminder email for appointment {appointment.get('id')}: {str(e)}")


class AppointmentScheduler:
    """
    Background scheduler for appointment reminders
    """
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.scheduler.add_job(
            check_and_send_reminders,
            IntervalTrigger(minutes=30),  # Check every 30 minutes
            id='appointment_reminders',
            name='Check and send appointment reminders',
            replace_existing=True
        )

    async def start(self):
        """Start the scheduler"""
        await init_scheduler_db()
        self.scheduler.start()
        logger.info("Appointment scheduler started (checking every 30 minutes)")

    async def stop(self):
        """Stop the scheduler"""
        self.scheduler.shutdown()
        await close_scheduler_db()
        logger.info("Appointment scheduler stopped")


# Create global scheduler instance
scheduler = AppointmentScheduler()


# Example: How to integrate with FastAPI
"""
from appointment_scheduler import scheduler

@app.on_event("startup")
async def startup_scheduler():
    await scheduler.start()

@app.on_event("shutdown")
async def shutdown_scheduler():
    await scheduler.stop()
"""
