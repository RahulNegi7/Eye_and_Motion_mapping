import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        if self._pageNumber == 1:
            return  # Skip page number on cover page
        
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header
        self.drawString(54, letter[1] - 36, "NeuroNav — Gaze Eye Tracking & Neural Interface System")
        self.setStrokeColor(colors.HexColor("#e2e8f0"))
        self.setLineWidth(0.75)
        self.line(54, letter[1] - 42, letter[0] - 54, letter[1] - 42)
        
        # Footer
        self.line(54, 45, letter[0] - 54, 45)
        self.drawString(54, 30, "Comprehensive Interview Preparation & Technical Architecture Guide")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 54, 30, page_text)
        self.restoreState()

def build_pdf(filename=None):
    if filename is None:
        filename = os.path.join(os.path.dirname(os.path.abspath(__file__)), "NeuroNav_Interview_Preparation_Guide.pdf")
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    primary_color = colors.HexColor("#1e1b4b")   # Dark indigo
    accent_color = colors.HexColor("#4338ca")    # Indigo
    teal_color = colors.HexColor("#0284c7")      # Cyan/Blue
    dark_slate = colors.HexColor("#0f172a")      # Text slate
    body_color = colors.HexColor("#334155")      # Text body
    card_bg = colors.HexColor("#f8fafc")         # Light card bg
    border_color = colors.HexColor("#cbd5e1")
    code_bg = colors.HexColor("#f1f5f9")
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=primary_color,
        alignment=0,
        spaceAfter=8
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=13,
        leading=18,
        textColor=accent_color,
        alignment=0,
        spaceAfter=15
    )
    
    meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=14,
        textColor=colors.HexColor("#64748b")
    )
    
    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=21,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )
    
    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=accent_color,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=body_color,
        spaceAfter=6
    )
    
    bold_body_style = ParagraphStyle(
        'BoldBody_Custom',
        parent=body_style,
        fontName='Helvetica-Bold',
        textColor=dark_slate
    )
    
    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )
    
    code_style = ParagraphStyle(
        'Code_Custom',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor("#0f172a")
    )
    
    table_text = ParagraphStyle(
        'TableText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=dark_slate
    )
    
    table_header = ParagraphStyle(
        'TableHead',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.white
    )
    
    callout_text = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13.5,
        textColor=colors.HexColor("#1e293b")
    )

    story = []
    
    # -------------------------------------------------------------
    # COVER / HEADER BLOCK
    # -------------------------------------------------------------
    story.append(Paragraph("NEURONAV: GAZE EYE TRACKING & NEURAL INTERFACE", title_style))
    story.append(Paragraph("Technical Architecture, Systems Deep Dive & Comprehensive Interview Handbook", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=accent_color, spaceBefore=4, spaceAfter=10))
    
    meta_data = [
        [
            Paragraph("<b>Candidate / Author:</b> Interview Preparation", meta_style),
            Paragraph("<b>Primary Stack:</b> Python, OpenCV, MediaPipe, React 19, Flask", meta_style)
        ],
        [
            Paragraph("<b>Domain:</b> Computer Vision, BCI, Multimodal HCI, NLP", meta_style),
            Paragraph("<b>Target Roles:</b> Software Engineer, Full Stack, Computer Vision, AI/ML", meta_style)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[250, 254])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), card_bg),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0")),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # -------------------------------------------------------------
    # 1. EXECUTIVE ELEVATOR PITCH
    # -------------------------------------------------------------
    story.append(Paragraph("1. Executive Summary & Elevator Pitch", h1_style))
    story.append(Paragraph("Use these scripted responses to introduce the project concisely in interviews:", body_style))
    
    pitch_30 = """<b>⏱️ 30-Second Elevator Pitch:</b><br/>
    <i>'NeuroNav is a multimodal assistive computing platform enabling hands-free system navigation and mental wellness telemetry. It leverages real-time computer vision (MediaPipe Face Landmarker Tasks API) to map ocular gaze and distinct blink patterns to OS-level mouse movement and clicks. It interfaces with a React 19 single-page dashboard offering voice-activated control (Web Speech API), real-time Arduino EEG telemetry (Web Serial API at 230,400 baud), and BERT-based conversational sentiment analytics.'</i>"""
    
    pitch_table = Table([[Paragraph(pitch_30, callout_text)]], colWidths=[504])
    pitch_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#eef2ff")),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LINELEFT', (0,0), (0,-1), 4, accent_color),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#c7d2fe")),
    ]))
    story.append(pitch_table)
    story.append(Spacer(1, 12))

    # -------------------------------------------------------------
    # 2. COMPLETE PROJECT STRUCTURE
    # -------------------------------------------------------------
    story.append(Paragraph("2. Project Directory Structure & Architecture Breakdown", h1_style))
    story.append(Paragraph("The codebase is logically split into an independent backend computer vision server and a modern React frontend client application:", body_style))
    
    file_map = [
        [Paragraph("File / Directory", table_header), Paragraph("Layer", table_header), Paragraph("Core Technical Responsibility", table_header)],
        [Paragraph("<code>backend/eye_tracking_mouse_control.py</code>", table_text), Paragraph("Python / CV", table_text), Paragraph("OpenCV camera capture (30 FPS @ 720p), MediaPipe Face Landmarker (478 3D points), Exponential Moving Average (EMA) coordinate mapping, temporal blink state machine, and PyAutoGUI cursor actuation.", table_text)],
        [Paragraph("<code>backend/face_landmarker.task</code>", table_text), Paragraph("Model Asset", table_text), Paragraph("Pre-trained MediaPipe Tasks vision bundle enabling real-time on-device landmark inference without external cloud APIs.", table_text)],
        [Paragraph("<code>backend/flask_server.py</code>", table_text), Paragraph("Python / Flask", table_text), Paragraph("REST API on port 5001. Asynchronously orchestrates CV script lifecycle via <code>subprocess.Popen</code> and serves conversational sentiment data.", table_text)],
        [Paragraph("<code>frontend/src/App.js</code>", table_text), Paragraph("React SPA", table_text), Paragraph("Central client-side routing (React Router Dom) managing Login, Setup/Calibration, Dashboard, and Gaming routes.", table_text)],
        [Paragraph("<code>frontend/src/components/LoginPage.js</code>", table_text), Paragraph("React Component", table_text), Paragraph("Hands-free authentication interface integrating Web Speech API (<code>react-speech-recognition</code>) for continuous vocal wake words ('hello', 'login', 'bye').", table_text)],
        [Paragraph("<code>frontend/src/components/SetupPage.js</code>", table_text), Paragraph("React Component", table_text), Paragraph("Interactive 3-step hardware initialization and calibration wizard communicating with Flask backend via Axios REST endpoints.", table_text)],
        [Paragraph("<code>frontend/src/components/NeuroNavDashboard.js</code>", table_text), Paragraph("React Component", table_text), Paragraph("Central neural wellness cockpit with Recharts time-series data visualizations, cognitive health status categorizers, and system metrics.", table_text)],
        [Paragraph("<code>frontend/src/components/EEGWave.js</code>", table_text), Paragraph("React / BCI", table_text), Paragraph("Web Serial API (230,400 baud) stream reader, real-time HTML5 2D Canvas EEG waveform renderer, and hardware multi-blink action controller.", table_text)],
        [Paragraph("<code>frontend/src/components/Sentimentanalysis.py</code>", table_text), Paragraph("NLP / PyTorch", table_text), Paragraph("BERT sequence classification pipeline evaluating emotional indices (Sentiment, Anxiety, Depression, Stress).", table_text)],
        [Paragraph("<code>start.sh</code>", table_text), Paragraph("Bash Script", table_text), Paragraph("Root process orchestration script launching Flask and React simultaneously with POSIX signal trapping (SIGINT/SIGTERM).", table_text)],
    ]
    
    file_table = Table(file_map, colWidths=[130, 65, 309])
    file_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg]),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('PADDING', (0,0), (-1,-1), 4.5),
    ]))
    story.append(file_table)
    story.append(Spacer(1, 14))

    # -------------------------------------------------------------
    # 3. CORE TECHNICAL MODULES DEEP DIVE
    # -------------------------------------------------------------
    story.append(Paragraph("3. Deep Dive into Core Technical Modules", h1_style))
    
    story.append(Paragraph("A. Real-Time Gaze Tracking & Anti-Jitter Filter", h2_style))
    story.append(Paragraph("• <b>De-coupled Asymmetric Tracking:</b> The right eye iris center (Landmark 473) controls cursor position, while the left eye vertical eyelid aperture (Landmarks 159 & 145) handles click detection. This decouples navigation from clicking, solving the notorious <i>Midas Touch</i> problem.", bullet_style))
    story.append(Paragraph("• <b>Dynamic Screen Calibration:</b> Captures 200 initial frames to calculate bounding range [x_min, x_max, y_min, y_max] with a 5% safety margin. Clamps and normalizes incoming landmark points to a [0, 1] range before mapping via linear interpolation (<code>np.interp</code>).", bullet_style))
    story.append(Paragraph("• <b>Exponential Moving Average (EMA) Smoothing:</b> Dampens micro-saccades and camera noise without introducing sluggish latency:<br/>&nbsp;&nbsp;&nbsp;&nbsp;<code>screen_x = 0.6 * prev_screen_x + 0.4 * raw_screen_x</code>", bullet_style))
    story.append(Paragraph("• <b>Temporal Blink State Machine:</b> Calculates eyelid distance <code>|y_top - y_bottom| &lt; 0.01</code>. Only eye closures between 50ms and 500ms trigger a click, rejecting involuntary twitches and prolonged resting eyes. A 700ms cooldown prevents double-click bouncing.", bullet_style))
    story.append(Spacer(1, 8))

    story.append(Paragraph("B. Subprocess Lifecycle Management in Flask", h2_style))
    story.append(Paragraph("• Heavy computer vision loops cannot run inside Flask's request threads without locking the server. The backend spawns <code>eye_tracking_mouse_control.py</code> as an isolated OS process via <code>subprocess.Popen([sys.executable, script_path])</code>.", bullet_style))
    story.append(Paragraph("• Implements <b>fail-fast detection</b>: after spawning, the server polls the PID after 800ms; if it exited prematurely (e.g. camera permission denied), it captures <code>stderr</code> and returns an informative HTTP 500 JSON payload.", bullet_style))
    story.append(Spacer(1, 8))

    story.append(Paragraph("C. Direct Browser-to-Hardware BCI (Web Serial API & Canvas)", h2_style))
    story.append(Paragraph("• <b>Web Serial API:</b> Uses <code>navigator.serial.requestPort()</code> with a 230,400 baud rate to establish a direct, driverless serial stream between Arduino/EEG hardware and the client browser.", bullet_style))
    story.append(Paragraph("• <b>Non-Blocking Canvas Rendering:</b> Serial packets are buffered in a streaming text decoder. Waveforms are drawn directly on an HTML5 2D <code>&lt;canvas&gt;</code> to achieve high refresh rates without triggering React DOM re-renders.", bullet_style))
    story.append(Paragraph("• <b>Multi-Blink Gesture Macros:</b> High-voltage bioelectric spikes (&gt;700uV) counted within a 3-second sliding window trigger environmental modes: 2 blinks = brightness slider, 4 blinks = Focus Mode (100% brightness + audio), 8 blinks = Relax Mode (30% brightness + audio).", bullet_style))
    story.append(Spacer(1, 14))

    # -------------------------------------------------------------
    # 4. KEY ENGINEERING CHALLENGES & TRADE-OFFS
    # -------------------------------------------------------------
    story.append(Paragraph("4. Key Engineering Challenges & Solutions", h1_style))
    
    tradeoffs_data = [
        [Paragraph("Challenge", table_header), Paragraph("Root Cause / Difficulty", table_header), Paragraph("Architectural Solution", table_header)],
        [
            Paragraph("<b>Gaze Jitter vs. Input Lag</b>", table_text),
            Paragraph("Human eyes constantly produce involuntary micro-saccades. Heavy averaging causes cursor drag.", table_text),
            Paragraph("Employed calibrated min-max coordinate clamping coupled with a tuned 0.6 Exponential Moving Average (EMA) filter.", table_text)
        ],
        [
            Paragraph("<b>The 'Midas Touch' Problem</b>", table_text),
            Paragraph("Using the same eye for moving and clicking triggers false clicks whenever the user blinks naturally.", table_text),
            Paragraph("Separated ocular responsibilities (Right eye = position, Left eye = click) and enforced temporal windowing (50ms - 500ms) with 700ms cooldown.", table_text)
        ],
        [
            Paragraph("<b>Cross-Process Orchestration</b>", table_text),
            Paragraph("Managing long-running Python vision processes from a web dashboard without zombie processes.", table_text),
            Paragraph("Managed background subprocesses in Flask with explicit PID tracking, graceful termination, and POSIX signal trapping in <code>start.sh</code>.", table_text)
        ],
        [
            Paragraph("<b>High-Frequency Serial Data in React</b>", table_text),
            Paragraph("230.4k baud serial streaming causes React component state updates to bottleneck the UI thread.", table_text),
            Paragraph("Decoupled telemetry state from React virtual DOM by streaming chunks to a ref buffer and rendering on an HTML5 2D Canvas.", table_text)
        ],
    ]
    
    tradeoffs_table = Table(tradeoffs_data, colWidths=[110, 150, 244])
    tradeoffs_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, card_bg]),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(tradeoffs_table)
    story.append(Spacer(1, 14))

    # -------------------------------------------------------------
    # 5. TOP INTERVIEW QUESTIONS & MODEL ANSWERS
    # -------------------------------------------------------------
    story.append(Paragraph("5. Top 10 Technical Interview Questions & Answers", h1_style))
    
    qa_list = [
        ("Q1: Why choose MediaPipe Face Landmarker over dlib or OpenCV Haar Cascades?",
         "MediaPipe Face Landmarker provides 478 3D landmarks (including dedicated sub-pixel iris points like #473) using lightweight, hardware-accelerated deep neural networks capable of 30+ FPS on CPU. Haar cascades only detect 2D bounding boxes, and dlib's 68-point model is computationally heavier and lacks fine-grained iris landmarks."),
        
        ("Q2: How does your coordinate mapping algorithm work mathematically?",
         "During calibration, the system records 200 frames of eye movement to establish [x_min, x_max, y_min, y_max]. During runtime, normalized coordinates (x - x_min)/(x_max - x_min) are scaled via linear interpolation (np.interp) to screen dimensions (e.g. 1920x1080) and smoothed using an Exponential Moving Average: S_t = alpha * S_{t-1} + (1-alpha) * Y_t where alpha = 0.6."),
        
        ("Q3: How did you solve the Midas Touch problem?",
         "By decoupling tracking into an asymmetric multi-facial scheme: the right eye coordinates navigation, while the left eye vertical aperture handles clicks. Blinks are validated against a strict temporal window (50ms to 500ms) with a 700ms debounce cooldown."),
        
        ("Q4: Why use the Web Serial API instead of WebSockets for Arduino/EEG communication?",
         "The Web Serial API enables direct, zero-latency, driverless peer-to-peer communication between the browser and USB microcontrollers. It removes the need for users to run a local daemon/WebSocket relay, dramatically simplifying deployment."),
        
        ("Q5: How do you handle process termination and prevent zombie processes?",
         "Flask maintains a global reference to the spawned subprocess.Popen instance. The /stop-eye-tracking endpoint checks poll() and executes terminate(). Additionally, the root start.sh script registers a POSIX trap on SIGINT/SIGTERM to kill all child PIDs upon exit."),
        
        ("Q6: How does head movement affect gaze accuracy, and how would you improve it?",
         "Currently, coordinates are frame-relative. To make tracking invariant to head rotation, we can implement 3D Pose Estimation: using solvePnP on rigid facial landmarks (nose bridge, chin) to compute head rotation vectors and subtracting head yaw/pitch from raw gaze vectors."),
        
        ("Q7: How is conversational sentiment analyzed in this system?",
         "The NLP engine utilizes a pre-trained BERT sequence classification model (bert-base-uncased) in PyTorch. It calculates a weighted softmax distribution across 5 sentiment classes and derives anxiety, depression, and stress indices plotted over time with Recharts."),
        
        ("Q8: Why did you choose React 19 for the frontend architecture?",
         "React provides component-driven isolation for managing asynchronous states (Web Speech API, Web Serial streams, REST polling, and dynamic SVG chart re-renders). Pairing it with Framer Motion ensures smooth 60 FPS transitions."),
        
        ("Q9: What security considerations exist in this architecture?",
         "Camera access and serial port access are protected by browser security sandboxes (requiring explicit user permissions). For production, Flask endpoints should require JWT authentication and CORS should be restricted to trusted origins."),
        
        ("Q10: What would you do differently in a Production V2?",
         "1) Port the eye-tracking model entirely into the browser via MediaPipe WebAssembly / ONNX Web to eliminate Python backend dependencies. 2) Replace EMA with a dynamic One Euro (1€) filter. 3) Store user calibration profiles in a cloud database.")
    ]
    
    for q, a in qa_list:
        qa_data = [
            [Paragraph(f"<b>{q}</b>", bold_body_style)],
            [Paragraph(f"<b>Answer:</b> {a}", body_style)]
        ]
        qa_table = Table(qa_data, colWidths=[504])
        qa_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
            ('BACKGROUND', (0,1), (-1,1), colors.white),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#e2e8f0")),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(qa_table)
        story.append(Spacer(1, 6))

    # -------------------------------------------------------------
    # 6. FUTURE ROADMAP & SYSTEM SCALABILITY
    # -------------------------------------------------------------
    story.append(Spacer(1, 6))
    story.append(Paragraph("6. Future Enhancements & Production Roadmap", h1_style))
    story.append(Paragraph("• <b>Full Browser WebAssembly Migration:</b> Run MediaPipe Face Landmarker client-side in WebAssembly/WebGL using the JavaScript Tasks API to remove Python/OpenCV desktop requirements.", bullet_style))
    story.append(Paragraph("• <b>1€ Filter Implementation:</b> Dynamically adapt smoothing coefficients based on eye velocity—high smoothing during fixations, zero latency during rapid saccades.", bullet_style))
    story.append(Paragraph("• <b>Cloud Profiles & Telemetry:</b> Store user calibration matrices, preferred sensitivities, and longitudinal wellness data in PostgreSQL with OAuth2 authentication.", bullet_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated {filename}")

if __name__ == "__main__":
    build_pdf()
