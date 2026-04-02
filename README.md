# Gaze Eye Tracking

This project features a React-based frontend and a Python Flask backend for eye-tracking control.

## Running the Project Manually

To run the project locally, you will need to open two separate terminal instances to start both the backend server and the frontend application.

### 1. Start the Backend (Flask)

Open your first terminal window, navigate to the project root directory, and run the following commands to activate the virtual environment and start the Flask server:

```bash
# Navigate to the backend directory
cd backend

# Activate the virtual environment
source ../.venv/bin/activate

# Start the Flask server
python flask_server.py
```

The backend server should now be running (typically on `http://localhost:5001`). Keep this terminal window open.

### 2. Start the Frontend (React)

Open a **second** terminal window, navigate to the project root directory, and run the following commands to start the React application:

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies (only needed the first time)
# npm install

# Start the development server
npm start
```

This will launch the frontend development server and should automatically open the project in your default web browser (typically at `http://localhost:3000`). Keep this terminal open as well.

---

## Alternative: Quick Start Script

If you prefer to start both servers simultaneously with a single command, you can use the provided shell script from the project's root directory:

```bash
./start.sh
```

*(Note: Press `Ctrl+C` in the terminal to terminate both the frontend and backend servers when using this script).*
