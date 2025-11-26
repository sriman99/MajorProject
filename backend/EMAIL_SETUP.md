# Email Notification System Setup Guide

This guide explains how to set up and use the email notification system for the Healthcare Management Platform.

## Features

The email notification system includes:

1. **Welcome Email** - Sent when a new user signs up
2. **Appointment Confirmation** - Sent when a new appointment is created
3. **Appointment Reminders** - Automated reminders sent 24 hours and 1 hour before appointments
4. **Password Reset** - Sent when a user requests a password reset

## Configuration

### Environment Variables

Add the following variables to your `.env` file in the `backend` directory:

```bash
# Email Configuration
EMAIL_PROVIDER=smtp                      # Options: "smtp" or "sendgrid"
FROM_EMAIL=noreply@healthcare.com        # Sender email address
FROM_NAME=Healthcare System              # Sender name

# SMTP Configuration (if using EMAIL_PROVIDER=smtp)
SMTP_HOST=smtp.mailtrap.io              # SMTP server host
SMTP_PORT=2525                          # SMTP server port
SMTP_USER=your-smtp-username            # SMTP username
SMTP_PASSWORD=your-smtp-password        # SMTP password
SMTP_USE_TLS=true                       # Use TLS (true/false)

# SendGrid Configuration (if using EMAIL_PROVIDER=sendgrid)
SENDGRID_API_KEY=your-sendgrid-api-key  # SendGrid API key
```

### Email Provider Options

#### Option 1: Development/Testing with Mailtrap (Recommended for Development)

[Mailtrap.io](https://mailtrap.io/) is a free email testing service that captures emails without sending them.

1. Sign up for a free account at https://mailtrap.io/
2. Create a new inbox
3. Copy the SMTP credentials from your inbox settings
4. Update your `.env`:

```bash
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-username
SMTP_PASSWORD=your-mailtrap-password
SMTP_USE_TLS=true
```

#### Option 2: Production with SendGrid

1. Sign up for SendGrid at https://sendgrid.com/
2. Create an API key in your SendGrid dashboard
3. Update your `.env`:

```bash
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=verified-sender@yourdomain.com
```

#### Option 3: Gmail SMTP (For Testing)

1. Enable 2-factor authentication on your Gmail account
2. Create an App Password: https://myaccount.google.com/apppasswords
3. Update your `.env`:

```bash
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_USE_TLS=true
```

## Installation

Install the required dependencies:

```bash
cd backend
pip install -r requirements.txt
```

This will install:
- `sendgrid` - SendGrid API client (optional, only needed if using SendGrid)
- `apscheduler` - Background scheduler for appointment reminders

## Usage

### Email Templates

HTML email templates are located in `backend/templates/emails/`:

- `welcome.html` - Welcome email for new users
- `appointment_confirmation.html` - Appointment confirmation
- `appointment_reminder.html` - Appointment reminder (24h and 1h before)
- `password_reset.html` - Password reset instructions

You can customize these templates by editing the HTML files. Use `{{variable_name}}` syntax for dynamic content.

### API Endpoints

#### 1. User Signup (Sends Welcome Email)

```bash
POST /signup
Content-Type: application/json

{
  "email": "user@example.com",
  "full_name": "John Doe",
  "phone": "1234567890",
  "role": "user",
  "password": "SecurePass123!",
  "confirm_password": "SecurePass123!"
}
```

#### 2. Create Appointment (Sends Confirmation Email)

```bash
POST /appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "doctor_id": "doctor-uuid",
  "date": "2025-11-25",
  "time": "14:00",
  "reason": "Regular checkup"
}
```

#### 3. Request Password Reset

```bash
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### 4. Reset Password

```bash
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "new_password": "NewSecurePass123!",
  "confirm_password": "NewSecurePass123!"
}
```

### Appointment Reminder Scheduler (Optional)

The appointment reminder scheduler is a background service that automatically sends reminder emails.

#### Enable Scheduler in main.py

Add the following to your `backend/main.py`:

```python
from appointment_scheduler import scheduler

@app.on_event("startup")
async def startup_events():
    await connect_to_mongo()
    await scheduler.start()  # Start appointment reminder scheduler

@app.on_event("shutdown")
async def shutdown_events():
    await close_mongo_connection()
    await scheduler.stop()  # Stop appointment reminder scheduler
```

#### How It Works

- Runs every 30 minutes
- Sends 24-hour reminder: 23.5-24.5 hours before appointment
- Sends 1-hour reminder: 0.5-1.5 hours before appointment
- Only sends reminders for pending/confirmed appointments
- Tracks sent reminders to avoid duplicates

## Testing

### Test Email Sending

1. Start the backend server:
```bash
cd backend
uvicorn main:app --reload --port 8000
```

2. Test signup (should send welcome email):
```bash
curl -X POST "http://localhost:8000/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "full_name": "Test User",
    "phone": "1234567890",
    "role": "user",
    "password": "Test123!@#",
    "confirm_password": "Test123!@#"
  }'
```

3. Check your email inbox (or Mailtrap inbox if using Mailtrap)

### Test Password Reset

1. Request password reset:
```bash
curl -X POST "http://localhost:8000/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

2. Check email for reset token
3. Use the token to reset password:
```bash
curl -X POST "http://localhost:8000/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_TOKEN_HERE",
    "new_password": "NewPass123!@#",
    "confirm_password": "NewPass123!@#"
  }'
```

### View Email Logs

If SMTP/SendGrid credentials are not configured, emails will be logged to console instead:

```
[EMAIL SIMULATION] To: user@example.com
[EMAIL SIMULATION] Subject: Welcome to Healthcare System
[EMAIL SIMULATION] Content:
<html email content>
```

## Troubleshooting

### Emails Not Sending

1. **Check environment variables**: Ensure all required variables are set in `.env`
2. **Check logs**: Look for error messages in the console
3. **Verify credentials**: Test SMTP/SendGrid credentials separately
4. **Check firewall**: Ensure outbound SMTP connections are allowed (port 587/2525)

### SendGrid Errors

- **401 Unauthorized**: Invalid API key
- **403 Forbidden**: Sender email not verified in SendGrid
- **429 Too Many Requests**: Rate limit exceeded

### SMTP Errors

- **Connection refused**: Wrong SMTP_HOST or SMTP_PORT
- **Authentication failed**: Wrong SMTP_USER or SMTP_PASSWORD
- **TLS errors**: Try setting SMTP_USE_TLS=false

### Scheduler Not Running

1. Ensure `apscheduler` is installed: `pip install apscheduler`
2. Check that scheduler startup code is added to `main.py`
3. Look for scheduler logs: "Appointment scheduler started"
4. Verify database connection for scheduler

## Production Considerations

1. **Use SendGrid or professional SMTP service** - Don't use Gmail for production
2. **Verify sender domain** - Set up SPF, DKIM, and DMARC records
3. **Monitor email delivery** - Track bounces and complaints
4. **Rate limiting** - Be aware of email sending limits
5. **Email templates** - Test on multiple email clients (Gmail, Outlook, etc.)
6. **Unsubscribe links** - Add unsubscribe functionality for marketing emails
7. **Error handling** - Log failed email sends and implement retry logic

## Email Template Customization

To customize email templates:

1. Edit HTML files in `backend/templates/emails/`
2. Use `{{variable_name}}` for dynamic content
3. Test with different email clients
4. Keep styles inline (many email clients strip `<style>` tags)
5. Use tables for layout (better email client compatibility)

Available variables for each template:

### welcome.html
- `{{user_name}}` - User's full name
- `{{login_url}}` - URL to login page
- `{{current_year}}` - Current year

### appointment_confirmation.html
- `{{patient_name}}` - Patient's name
- `{{doctor_name}}` - Doctor's name
- `{{appointment_date}}` - Appointment date
- `{{appointment_time}}` - Appointment time
- `{{hospital_name}}` - Hospital name
- `{{appointment_id}}` - Appointment ID
- `{{appointments_url}}` - URL to appointments page
- `{{current_year}}` - Current year

### appointment_reminder.html
- Same as appointment_confirmation.html plus:
- `{{reminder_text}}` - "24 hours" or "1 hour"

### password_reset.html
- `{{user_name}}` - User's full name
- `{{reset_link}}` - Full password reset URL with token
- `{{reset_token}}` - Reset token (for manual entry)
- `{{current_year}}` - Current year

## Support

For issues or questions:
1. Check the logs for error messages
2. Verify environment configuration
3. Test email service credentials separately
4. Review the email service code in `backend/email_service.py`
