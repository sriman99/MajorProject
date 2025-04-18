# Healthcare Backend Setup

This guide will help you set up and run the backend with MongoDB Compass.

## Prerequisites

1. Python 3.8 or higher
2. MongoDB Community Edition
3. MongoDB Compass

## Installation

1. Install MongoDB Community Edition:
   - Windows: Download and install from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Make sure to install MongoDB as a service

2. Install MongoDB Compass:
   - Download from [MongoDB Compass Download Page](https://www.mongodb.com/try/download/compass)
   - Install the application

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Database Setup

1. Start MongoDB service:
   - Windows: MongoDB should run as a service automatically
   - If not running, start it from Services

2. Connect to MongoDB using Compass:
   - Open MongoDB Compass
   - Use connection string: `mongodb://localhost:27017`
   - Click "Connect"

3. Initialize the database:
   ```bash
   python init_db.py
   ```
   This will create all necessary collections and indexes.

4. Seed sample data (optional):
   ```bash
   python seed_data.py
   ```
   This will add sample users, doctors, hospitals, appointments, and analysis data.

## Running the Backend

1. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

2. The API will be available at: `http://localhost:8000`

## Sample Data

After running `seed_data.py`, you can log in with these credentials:

1. Admin User:
   - Email: admin@example.com
   - Password: admin123

2. Doctor User:
   - Email: doctor@example.com
   - Password: doctor123

3. Patient User:
   - Email: patient@example.com
   - Password: patient123

## Database Collections

The application uses the following collections:

1. `users` - User accounts and authentication
2. `doctors` - Doctor profiles and information
3. `hospitals` - Hospital information
4. `appointments` - Patient appointments
5. `analysis` - Respiratory analysis results

## Viewing Data in Compass

1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Select the `healthcare_db` database
4. Browse collections:
   - Click on a collection name
   - View documents in the collection
   - Use the filter and sort options to find specific data

## Troubleshooting

1. If MongoDB won't connect:
   - Check if MongoDB service is running
   - Verify connection string in `.env` file
   - Make sure port 27017 is not blocked

2. If data is not showing in Compass:
   - Refresh the database view
   - Check if the database and collections exist
   - Verify that data was properly seeded

3. If the backend can't connect to MongoDB:
   - Check MongoDB service status
   - Verify MONGODB_URL in .env file
   - Make sure no other service is using port 27017
