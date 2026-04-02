import cv2
import mediapipe as mp
import pyautogui
import numpy as np
import time

class EyeTrackingMouseControl:
    def __init__(self):
        # Disable PyAutoGUI fail-safe (use with caution)
        pyautogui.FAILSAFE = False
        
        # Screen and camera setup
        self.screen_w, self.screen_h = pyautogui.size()
        self.cam = cv2.VideoCapture(0)
        
        # Verify camera is opened
        if not self.cam.isOpened():
            raise RuntimeError("Unable to open camera. Check camera connection.")
        
        # Set camera resolution and fps for better performance
        self.cam.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        self.cam.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        self.cam.set(cv2.CAP_PROP_FPS, 30)
        
        # Face mesh configuration using Tasks API
        import os
        model_path = os.path.join(os.path.dirname(__file__), "face_landmarker.task")
        base_options = mp.tasks.BaseOptions(model_asset_path=model_path)
        options = mp.tasks.vision.FaceLandmarkerOptions(
            base_options=base_options,
            num_faces=1,
            min_face_detection_confidence=0.6,
            min_face_presence_confidence=0.6,
            min_tracking_confidence=0.6,
            output_face_blendshapes=False
        )
        self.face_mesh = mp.tasks.vision.FaceLandmarker.create_from_options(options)
        
        # Sensitivity and smoothing parameters
        self.sensitivity_x = 1.2
        self.sensitivity_y = 1.0
        self.smooth_factor = 0.6
        
        # Position tracking
        self.prev_screen_x = self.screen_w // 2
        self.prev_screen_y = self.screen_h // 2
        
        # Calibration parameters
        self.calibration_frames = 200
        self.x_min, self.x_max = None, None
        self.y_min, self.y_max = None, None
        
        # Simplified blink detection parameters
        self.blink_state = {
            'is_blinking': False,
            'start_time': 0,
            'last_blink_end_time': 0,
            'blink_complete': False
        }
        
        # Blink detection thresholds
        self.blink_threshold = 0.01
        self.min_blink_duration = 0.05  # Minimum time eye must be closed to count as intentional blink
        self.max_blink_duration = 0.5   # Maximum time for a blink (longer is considered intentional closing)
        self.click_cooldown = 0.7       # Prevent accidental double-clicks
        
        # Key landmarks
        # Right eye landmark for movement (right eye center)
        self.RIGHT_EYE_CENTER = 473
        # Left eye landmarks for blink detection
        self.LEFT_EYE_TOP = 159
        self.LEFT_EYE_BOTTOM = 145
    
    def calibrate(self):
        """Enhanced calibration process focused on right eye tracking."""
        print("Calibrating... Look around the screen edges using your right eye.")
        x_vals, y_vals = [], []
        start_time = time.time()
        
        # Position cursor at screen center
        pyautogui.moveTo(self.screen_w // 2, self.screen_h // 2)
        
        while len(x_vals) < self.calibration_frames:
            ret, frame = self.cam.read()
            if not ret:
                print("Failed to capture frame. Retrying...")
                continue
            
            frame = cv2.flip(frame, 1)
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
            output = self.face_mesh.detect(mp_image)
            
            # Calibration visual feedback
            cv2.putText(frame, 
                f"Calibrating: {len(x_vals)}/{self.calibration_frames}", 
                (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.imshow("Calibration", frame)
            
            if output.face_landmarks:
                landmarks = output.face_landmarks[0]
                # Use right eye for movement calibration
                right_eye_landmark = landmarks[self.RIGHT_EYE_CENTER]
                x_vals.append(right_eye_landmark.x)
                y_vals.append(right_eye_landmark.y)
            
            # Timeout and exit handling
            if time.time() - start_time > 45:
                print("Calibration timed out. Ensure good lighting and face visibility.")
                break
            
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        
        cv2.destroyWindow("Calibration")
        
        # Validate calibration data
        if len(x_vals) < 50 or len(y_vals) < 50:
            raise ValueError("Insufficient landmarks detected during calibration.")
        
        # Calculate ranges with some buffer
        self.x_min = min(x_vals) * 0.95
        self.x_max = max(x_vals) * 1.05
        self.y_min = min(y_vals) * 0.95
        self.y_max = max(y_vals) * 1.05
        
        print("Calibration complete.")
    
    def map_coordinates(self, x, y, frame_w, frame_h):
        """Precise coordinate mapping with improved range handling."""
        if self.x_min is None:
            return self.screen_w // 2, self.screen_h // 2
        
        # Clamp input within calibration range
        x = max(self.x_min, min(x, self.x_max))
        y = max(self.y_min, min(y, self.y_max))
        
        # Normalize and map to screen
        norm_x = (x - self.x_min) / (self.x_max - self.x_min)
        norm_y = (y - self.y_min) / (self.y_max - self.y_min)
        
        screen_x = int(np.interp(norm_x, [0, 1], [0, self.screen_w]) * self.sensitivity_x)
        screen_y = int(np.interp(norm_y, [0, 1], [0, self.screen_h]) * self.sensitivity_y)
        
        # Smooth movement
        screen_x = int(self.smooth_factor * self.prev_screen_x + 
                       (1 - self.smooth_factor) * screen_x)
        screen_y = int(self.smooth_factor * self.prev_screen_y + 
                       (1 - self.smooth_factor) * screen_y)
        
        # Ensure screen bounds
        screen_x = max(0, min(screen_x, self.screen_w))
        screen_y = max(0, min(screen_y, self.screen_h))
        
        self.prev_screen_x = screen_x
        self.prev_screen_y = screen_y
        
        return screen_x, screen_y
    
    def detect_blink(self, left_eye_top, left_eye_bottom):
        """
        Left eye dedicated blink detection - single blink for click
        
        Args:
            left_eye_top: Top landmark of left eye
            left_eye_bottom: Bottom landmark of left eye
        
        Returns:
            bool: True if click should be performed
        """
        current_time = time.time()
        eye_height = abs(left_eye_top.y - left_eye_bottom.y)
        should_click = False
        
        # Detect when eye closes
        if eye_height < self.blink_threshold:
            if not self.blink_state['is_blinking']:
                # First frame of blink - eye just closed
                self.blink_state['is_blinking'] = True
                self.blink_state['start_time'] = current_time
                self.blink_state['blink_complete'] = False
        # Detect when eye opens
        else:
            if self.blink_state['is_blinking']:
                # Eye just opened after being closed
                blink_duration = current_time - self.blink_state['start_time']
                
                # Only count as a blink if duration is within our thresholds
                # This helps distinguish intentional blinks from noise or very long eye closures
                if (self.min_blink_duration <= blink_duration <= self.max_blink_duration and
                    current_time - self.blink_state['last_blink_end_time'] > self.click_cooldown):
                    
                    # This is a valid blink that should trigger a click
                    pyautogui.click()
                    should_click = True
                    self.blink_state['last_blink_end_time'] = current_time
                
                # Reset blink state
                self.blink_state['is_blinking'] = False
        
        return should_click
    
    def run(self):
        # Calibration
        try:
            self.calibrate()
        except Exception as e:
            print(f"Calibration failed: {e}")
            return
        
        print("Eye tracking started. Press 'q' to quit.")
        print("Right eye controls cursor movement, left eye controls clicking (single blink = click).")
        
        while True:
            ret, frame = self.cam.read()
            if not ret:
                print("Frame capture failed")
                break
            
            frame = cv2.flip(frame, 1)
            frame_h, frame_w, _ = frame.shape
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)
            output = self.face_mesh.detect(mp_image)
            
            if output.face_landmarks:
                landmarks = output.face_landmarks[0]
                
                # RIGHT EYE FOR MOVEMENT
                right_eye_landmark = landmarks[self.RIGHT_EYE_CENTER]
                
                # Compute screen coordinates from right eye
                screen_x, screen_y = self.map_coordinates(
                    right_eye_landmark.x, right_eye_landmark.y, frame_w, frame_h
                )
                
                # LEFT EYE FOR BLINK DETECTION
                left_eye_top = landmarks[self.LEFT_EYE_TOP]
                left_eye_bottom = landmarks[self.LEFT_EYE_BOTTOM]
                
                # Detect blink using left eye only
                is_click = self.detect_blink(left_eye_top, left_eye_bottom)
                
                # Move mouse based on right eye - this keeps happening even during blinks
                pyautogui.moveTo(screen_x, screen_y)
                
                # Visualization
                # Right eye tracking point
                rx = int(right_eye_landmark.x * frame_w)
                ry = int(right_eye_landmark.y * frame_h)
                cv2.circle(frame, (rx, ry), 5, (0, 255, 0), -1)
                
                # Left eye blink detection points
                ltx = int(left_eye_top.x * frame_w)
                lty = int(left_eye_top.y * frame_h)
                lbx = int(left_eye_bottom.x * frame_w)
                lby = int(left_eye_bottom.y * frame_h)
                
                # Different color for left eye detection points
                cv2.circle(frame, (ltx, lty), 3, (255, 0, 0), -1)
                cv2.circle(frame, (lbx, lby), 3, (255, 0, 0), -1)
                
                # Draw line between left eye points to visualize blink
                cv2.line(frame, (ltx, lty), (lbx, lby), (255, 0, 0), 1)
                
                # Show blink status
                if self.blink_state['is_blinking']:
                    cv2.putText(frame, "BLINK DETECTED", (30, 30), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                
                # Show click status
                if is_click:
                    cv2.putText(frame, "CLICK!", (30, 60), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)
            
            # Display frame
            cv2.imshow("Eye Tracking Mouse Control", frame)
            
            # Exit condition
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
        
        # Cleanup
        self.cam.release()
        cv2.destroyAllWindows()

# Run the eye tracking mouse control
if __name__ == "__main__":
    try:
        mouse_control = EyeTrackingMouseControl()
        mouse_control.run()
    except Exception as e:
        print(f"An error occurred: {e}")
