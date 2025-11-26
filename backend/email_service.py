"""
Email Service Module for Healthcare System
Supports both SendGrid and SMTP for sending emails
"""

import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Dict, Any
from datetime import datetime
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Email configuration
EMAIL_PROVIDER = os.getenv("EMAIL_PROVIDER", "smtp")  # "sendgrid" or "smtp"
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@healthcare.com")
FROM_NAME = os.getenv("FROM_NAME", "Healthcare System")

# SendGrid configuration
SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY", "")

# SMTP configuration
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.mailtrap.io")
SMTP_PORT = int(os.getenv("SMTP_PORT", "2525"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_USE_TLS = os.getenv("SMTP_USE_TLS", "true").lower() == "true"

# Frontend URL for links
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


def load_email_template(template_name: str, context: Dict[str, Any]) -> str:
    """
    Load and render email template with context variables

    Args:
        template_name: Name of the template file (without .html extension)
        context: Dictionary of variables to replace in template

    Returns:
        Rendered HTML content
    """
    template_path = os.path.join(
        os.path.dirname(__file__),
        "templates",
        "emails",
        f"{template_name}.html"
    )

    try:
        with open(template_path, 'r', encoding='utf-8') as f:
            template_content = f.read()

        # Simple template variable replacement
        for key, value in context.items():
            placeholder = f"{{{{{key}}}}}"
            template_content = template_content.replace(placeholder, str(value))

        return template_content
    except FileNotFoundError:
        logger.warning(f"Template {template_name}.html not found. Using fallback.")
        return generate_fallback_template(template_name, context)


def generate_fallback_template(template_name: str, context: Dict[str, Any]) -> str:
    """Generate a simple fallback template if HTML template is not found"""
    if template_name == "welcome":
        return f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Welcome to Healthcare System!</h2>
                <p>Dear {context.get('user_name', 'User')},</p>
                <p>Thank you for registering with our healthcare platform.</p>
                <p>You can now log in and start using our services.</p>
                <p>Best regards,<br>Healthcare Team</p>
            </body>
        </html>
        """
    elif template_name == "appointment_confirmation":
        return f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Appointment Confirmation</h2>
                <p>Dear {context.get('patient_name', 'Patient')},</p>
                <p>Your appointment has been confirmed with the following details:</p>
                <ul>
                    <li><strong>Doctor:</strong> {context.get('doctor_name', 'N/A')}</li>
                    <li><strong>Date:</strong> {context.get('appointment_date', 'N/A')}</li>
                    <li><strong>Time:</strong> {context.get('appointment_time', 'N/A')}</li>
                    <li><strong>Hospital:</strong> {context.get('hospital_name', 'N/A')}</li>
                </ul>
                <p>Best regards,<br>Healthcare Team</p>
            </body>
        </html>
        """
    elif template_name == "appointment_reminder":
        return f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Appointment Reminder</h2>
                <p>Dear {context.get('patient_name', 'Patient')},</p>
                <p>This is a reminder for your upcoming appointment:</p>
                <ul>
                    <li><strong>Doctor:</strong> {context.get('doctor_name', 'N/A')}</li>
                    <li><strong>Date:</strong> {context.get('appointment_date', 'N/A')}</li>
                    <li><strong>Time:</strong> {context.get('appointment_time', 'N/A')}</li>
                    <li><strong>Hospital:</strong> {context.get('hospital_name', 'N/A')}</li>
                </ul>
                <p>Please arrive 10 minutes early.</p>
                <p>Best regards,<br>Healthcare Team</p>
            </body>
        </html>
        """
    elif template_name == "password_reset":
        return f"""
        <html>
            <body style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Password Reset Request</h2>
                <p>Dear {context.get('user_name', 'User')},</p>
                <p>We received a request to reset your password.</p>
                <p>Click the link below to reset your password (valid for 1 hour):</p>
                <p><a href="{context.get('reset_link', '#')}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
                <p>If you didn't request this, please ignore this email.</p>
                <p>Best regards,<br>Healthcare Team</p>
            </body>
        </html>
        """
    return "<html><body><p>Email notification</p></body></html>"


def send_email_smtp(to_email: str, subject: str, html_content: str) -> bool:
    """
    Send email using SMTP

    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML content of the email

    Returns:
        True if email sent successfully, False otherwise
    """
    try:
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{FROM_NAME} <{FROM_EMAIL}>"
        message["To"] = to_email

        # Add HTML content
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)

        # Send email
        if SMTP_USER and SMTP_PASSWORD:
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                if SMTP_USE_TLS:
                    server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.send_message(message)
            logger.info(f"Email sent successfully to {to_email} via SMTP")
            return True
        else:
            # Log email instead of sending if credentials not configured
            logger.info(f"[EMAIL SIMULATION] To: {to_email}")
            logger.info(f"[EMAIL SIMULATION] Subject: {subject}")
            logger.info(f"[EMAIL SIMULATION] Content:\n{html_content}")
            return True

    except Exception as e:
        logger.error(f"Failed to send email via SMTP to {to_email}: {str(e)}")
        return False


def send_email_sendgrid(to_email: str, subject: str, html_content: str) -> bool:
    """
    Send email using SendGrid API

    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML content of the email

    Returns:
        True if email sent successfully, False otherwise
    """
    try:
        from sendgrid import SendGridAPIClient
        from sendgrid.helpers.mail import Mail

        message = Mail(
            from_email=(FROM_EMAIL, FROM_NAME),
            to_emails=to_email,
            subject=subject,
            html_content=html_content
        )

        if SENDGRID_API_KEY:
            sg = SendGridAPIClient(SENDGRID_API_KEY)
            response = sg.send(message)
            logger.info(f"Email sent successfully to {to_email} via SendGrid (Status: {response.status_code})")
            return True
        else:
            # Log email instead of sending if API key not configured
            logger.info(f"[EMAIL SIMULATION] To: {to_email}")
            logger.info(f"[EMAIL SIMULATION] Subject: {subject}")
            logger.info(f"[EMAIL SIMULATION] Content:\n{html_content}")
            return True

    except ImportError:
        logger.error("SendGrid library not installed. Install with: pip install sendgrid")
        return False
    except Exception as e:
        logger.error(f"Failed to send email via SendGrid to {to_email}: {str(e)}")
        return False


def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """
    Send email using configured provider

    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML content of the email

    Returns:
        True if email sent successfully, False otherwise
    """
    if EMAIL_PROVIDER == "sendgrid":
        return send_email_sendgrid(to_email, subject, html_content)
    else:
        return send_email_smtp(to_email, subject, html_content)


# =============================================
# EMAIL FUNCTIONS
# =============================================

def send_welcome_email(user_email: str, user_name: str) -> bool:
    """
    Send welcome email to new user

    Args:
        user_email: User's email address
        user_name: User's full name

    Returns:
        True if email sent successfully, False otherwise
    """
    context = {
        "user_name": user_name,
        "login_url": f"{FRONTEND_URL}/login",
        "current_year": datetime.now().year
    }

    html_content = load_email_template("welcome", context)
    subject = "Welcome to Healthcare System"

    return send_email(user_email, subject, html_content)


def send_appointment_confirmation(
    user_email: str,
    appointment_details: Dict[str, Any]
) -> bool:
    """
    Send appointment confirmation email

    Args:
        user_email: Patient's email address
        appointment_details: Dictionary containing appointment information
            - patient_name: str
            - doctor_name: str
            - appointment_date: str
            - appointment_time: str
            - hospital_name: str
            - appointment_id: str (optional)

    Returns:
        True if email sent successfully, False otherwise
    """
    context = {
        "patient_name": appointment_details.get("patient_name", "Patient"),
        "doctor_name": appointment_details.get("doctor_name", "N/A"),
        "appointment_date": appointment_details.get("appointment_date", "N/A"),
        "appointment_time": appointment_details.get("appointment_time", "N/A"),
        "hospital_name": appointment_details.get("hospital_name", "N/A"),
        "appointment_id": appointment_details.get("appointment_id", ""),
        "appointments_url": f"{FRONTEND_URL}/patient/appointments",
        "current_year": datetime.now().year
    }

    html_content = load_email_template("appointment_confirmation", context)
    subject = "Appointment Confirmation - Healthcare System"

    return send_email(user_email, subject, html_content)


def send_appointment_reminder(
    user_email: str,
    appointment_details: Dict[str, Any],
    reminder_type: str = "24h"
) -> bool:
    """
    Send appointment reminder email

    Args:
        user_email: Patient's email address
        appointment_details: Dictionary containing appointment information
        reminder_type: Type of reminder ("24h" or "1h")

    Returns:
        True if email sent successfully, False otherwise
    """
    reminder_text = "24 hours" if reminder_type == "24h" else "1 hour"

    context = {
        "patient_name": appointment_details.get("patient_name", "Patient"),
        "doctor_name": appointment_details.get("doctor_name", "N/A"),
        "appointment_date": appointment_details.get("appointment_date", "N/A"),
        "appointment_time": appointment_details.get("appointment_time", "N/A"),
        "hospital_name": appointment_details.get("hospital_name", "N/A"),
        "reminder_text": reminder_text,
        "appointments_url": f"{FRONTEND_URL}/patient/appointments",
        "current_year": datetime.now().year
    }

    html_content = load_email_template("appointment_reminder", context)
    subject = f"Appointment Reminder - {reminder_text} - Healthcare System"

    return send_email(user_email, subject, html_content)


def send_password_reset(user_email: str, user_name: str, reset_token: str) -> bool:
    """
    Send password reset email

    Args:
        user_email: User's email address
        user_name: User's full name
        reset_token: Password reset token

    Returns:
        True if email sent successfully, False otherwise
    """
    reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"

    context = {
        "user_name": user_name,
        "reset_link": reset_link,
        "reset_token": reset_token,
        "current_year": datetime.now().year
    }

    html_content = load_email_template("password_reset", context)
    subject = "Password Reset Request - Healthcare System"

    return send_email(user_email, subject, html_content)


def send_appointment_cancellation(
    user_email: str,
    appointment_details: Dict[str, Any],
    cancelled_by: str = "patient"
) -> bool:
    """
    Send appointment cancellation notification email

    Args:
        user_email: Recipient's email address
        appointment_details: Dictionary containing appointment information
        cancelled_by: Who cancelled the appointment ("patient" or "doctor")

    Returns:
        True if email sent successfully, False otherwise
    """
    cancellation_message = (
        "Your appointment has been cancelled."
        if cancelled_by == "patient"
        else "Your appointment has been cancelled by the doctor."
    )

    context = {
        "patient_name": appointment_details.get("patient_name", "Patient"),
        "doctor_name": appointment_details.get("doctor_name", "N/A"),
        "appointment_date": appointment_details.get("appointment_date", "N/A"),
        "appointment_time": appointment_details.get("appointment_time", "N/A"),
        "hospital_name": appointment_details.get("hospital_name", "N/A"),
        "cancellation_message": cancellation_message,
        "appointments_url": f"{FRONTEND_URL}/patient/appointments",
        "current_year": datetime.now().year
    }

    # Using appointment_confirmation template with modified context for now
    # Can create a separate cancellation template if needed
    html_content = generate_fallback_template("appointment_confirmation", context)
    subject = "Appointment Cancelled - Healthcare System"

    return send_email(user_email, subject, html_content)
