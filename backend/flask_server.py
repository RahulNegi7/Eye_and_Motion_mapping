from flask import Flask, jsonify
from flask_cors import CORS
import threading
import sys
import subprocess
import os
import time
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

eye_tracking_process = None

# Function to get last N days as a list of dates
def get_last_n_days(n):
    return [(datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(n)][::-1]

# Dummy sentiment analysis function (replace with actual analysis logic)
def analyze_sentiment(text):
    return {
        "sentiment": 50,  # Neutral sentiment (0-100 scale)
        "anxiety": 10,    # Dummy value
        "depression": 5,  # Dummy value
        "stress": 15      # Dummy value
    }

@app.route("/api/analyzeConversation", methods=["GET"])
def analyze_conversation():
    try:
        # Define the path of the conversation log file relative to this file
        log_file_path = os.path.join(os.path.dirname(__file__), "conversation_log.txt")

        # If file doesn't exist, return default metrics instead of 404
        if not os.path.exists(log_file_path):
            last_five_days = get_last_n_days(5)
            default_metrics = analyze_sentiment("")
            weekly_data = [
                {
                    "date": day,
                    "sentiment": default_metrics["sentiment"],
                    "anxiety": default_metrics["anxiety"],
                    "depression": default_metrics["depression"],
                    "stress": default_metrics["stress"],
                }
                for day in last_five_days
            ]

            response = {
                "sentiment": default_metrics["sentiment"],
                "anxiety": default_metrics["anxiety"],
                "depression": default_metrics["depression"],
                "stress": default_metrics["stress"],
                "weeklyData": weekly_data,
            }

            return jsonify(response)

        # Read conversation log file
        with open(log_file_path, "r", encoding="utf-8") as file:
            lines = [line.strip() for line in file.readlines() if line.strip()]

        # Get last 5 days for weekly data
        last_five_days = get_last_n_days(5)

        # Create daily chunks from the last 5 lines
        chunks = [{"text": lines[i], "date": last_five_days[i]} for i in range(-5, 0) if i >= -len(lines)]

        # Analyze each chunk
        weekly_data = []
        for chunk in chunks:
            analysis = analyze_sentiment(chunk["text"])
            weekly_data.append({
                "date": chunk["date"],
                "sentiment": analysis["sentiment"],
                "anxiety": analysis["anxiety"],
                "depression": analysis["depression"],
                "stress": analysis["stress"]
            })

        # Get current day's metrics (from last chunk)
        current_metrics = weekly_data[-1] if weekly_data else {
            "sentiment": 50,
            "anxiety": 0,
            "depression": 0,
            "stress": 0
        }

        response = {
            "sentiment": current_metrics["sentiment"],
            "anxiety": current_metrics["anxiety"],
            "depression": current_metrics["depression"],
            "stress": current_metrics["stress"],
            "weeklyData": weekly_data
        }

        return jsonify(response)

    except Exception as e:
        print("Error in sentiment analysis:", e)
        return jsonify({"error": "Failed to analyze conversation"}), 500

@app.route('/start-eye-tracking', methods=['POST'])
def start_eye_tracking():
    global eye_tracking_process
    try:
        if eye_tracking_process and eye_tracking_process.poll() is None:
            return jsonify({"status": "already running"})

        # Run the eye tracking script from the backend directory
        script_path = os.path.join(os.path.dirname(__file__), "eye_tracking_mouse_control.py")
        eye_tracking_process = subprocess.Popen(
            [sys.executable, script_path],
            cwd=os.path.dirname(__file__),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )

        # Give the process a moment to fail fast if dependencies are missing
        time.sleep(0.8)
        if eye_tracking_process.poll() is not None:
            stderr_output = eye_tracking_process.stderr.read().strip()
            return (
                jsonify({
                    "status": "error",
                    "message": stderr_output or "Eye tracking exited immediately. Check dependencies/camera access.",
                }),
                500,
            )

        return jsonify({"status": "started"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/stop-eye-tracking', methods=['POST'])
def stop_eye_tracking():
    global eye_tracking_process
    if eye_tracking_process and eye_tracking_process.poll() is None:
        eye_tracking_process.terminate()
        eye_tracking_process = None
        return jsonify({"status": "stopped"})
    return jsonify({"status": "not running"})

if __name__ == '__main__':
    app.run(port=5001)
