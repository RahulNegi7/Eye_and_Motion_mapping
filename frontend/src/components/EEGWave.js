import React, { useState, useEffect, useRef } from "react";

const EEGWave = () => {
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [mentalState, setMentalState] = useState("Relaxed");
  const [eegData, setEegData] = useState([]);
  const [blinkCount, setBlinkCount] = useState(0);
  const [blinkTimer, setBlinkTimer] = useState(null);
  const [brightness, setBrightness] = useState(50);
  const [showBrightnessBar, setShowBrightnessBar] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [isDraggingBrightness, setIsDraggingBrightness] = useState(false);
  const brightnessBarRef = useRef(null);
  const serialPort = useRef(null);
  const reader = useRef(null);
  const canvasRef = useRef(null);
  const relaxedAudioRef = useRef(null);
  const focusedAudioRef = useRef(null);
  let readBuffer = "";
  
  // Track cursor position
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  
  // Track blink timestamps to detect frequency
  const blinkTimestamps = useRef([]);
  const BLINK_WINDOW_MS = 3000; // 3 seconds window to count blinks
  
  // Lower blink threshold to 700 (from 850)
  const BLINK_THRESHOLD = 700;
  
  useEffect(() => {
    if (canvasRef.current && eegData.length > 0) {
      drawEEGWave();
    }
    
    // Create audio elements
    relaxedAudioRef.current = new Audio("/path-to-relaxed-music.mp3");
    relaxedAudioRef.current.loop = true;
    
    focusedAudioRef.current = new Audio("/path-to-focused-music.mp3");
    focusedAudioRef.current.loop = true;
    
    // Setup cursor position tracking
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      stopAllAudio();
    };
  }, [eegData]);

  // Handle mouse events for brightness control
  const handleMouseMove = (event) => {
    setCursorPosition({
      x: event.clientX,
      y: event.clientY
    });
    
    // Update brightness if dragging the brightness control
    if (isDraggingBrightness && brightnessBarRef.current) {
      const barRect = brightnessBarRef.current.getBoundingClientRect();
      const relativeX = Math.max(0, Math.min(event.clientX - barRect.left, barRect.width));
      const newBrightness = Math.round((relativeX / barRect.width) * 100);
      setBrightness(newBrightness);
      document.body.style.filter = `brightness(${newBrightness}%)`;
    }
  };
  
  const handleMouseDown = (event) => {
    if (showBrightnessBar && brightnessBarRef.current) {
      setIsDraggingBrightness(true);
      const barRect = brightnessBarRef.current.getBoundingClientRect();
      const relativeX = Math.max(0, Math.min(event.clientX - barRect.left, barRect.width));
      const newBrightness = Math.round((relativeX / barRect.width) * 100);
      setBrightness(newBrightness);
      document.body.style.filter = `brightness(${newBrightness}%)`;
    }
  };
  
  const handleMouseUp = () => {
    setIsDraggingBrightness(false);
  };
  
  // Handle blink count and actions
  useEffect(() => {
    if (blinkCount === 2) {
      setShowBrightnessBar(true);
      // Auto-hide after 5 seconds of inactivity
      const hideTimer = setTimeout(() => {
        setShowBrightnessBar(false);
      }, 5000);
      
      return () => clearTimeout(hideTimer);
    } else if (blinkCount === 4) {
      setMentalState("Focused");
      setBrightness(100);
      document.body.style.filter = "brightness(100%)";
      playFocusedAudio();
    } else if (blinkCount === 8) {
      setMentalState("Relaxed");
      setBrightness(30);
      document.body.style.filter = "brightness(30%)";
      playRelaxedAudio();
    }
  }, [blinkCount]);
  
  const drawEEGWave = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "#8454EE";
    ctx.lineWidth = 2;
    ctx.beginPath();

    const xStep = width / (eegData.length - 1);
    const min = Math.min(...eegData);
    const max = Math.max(...eegData);
    const range = max - min || 1;

    eegData.forEach((value, index) => {
      const x = index * xStep;
      const y = height - ((value - min) / range) * height * 0.8 - height * 0.1;

      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();

    // Draw horizontal marker for blink threshold - lowered from 850 to 700
    const markerY = height - ((BLINK_THRESHOLD - min) / range) * height * 0.7 - height * 0.1;
    ctx.strokeStyle = "red";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, markerY);
    ctx.lineTo(width, markerY);
    ctx.stroke();
  };

  const processEEGData = (data) => {
    setEegData((prevData) => {
      const newData = [...prevData, data].slice(-100); // Keep more values for better visualization
      
      // Check for blink pattern using the lower threshold
      // Changed threshold from 850 to 700 for easier detection
      if (data > BLINK_THRESHOLD && prevData[prevData.length - 1] < 500) {
        detectBlink();
      }
      
      return newData;
    });
  };
  
  const detectBlink = () => {
    const now = Date.now();
    
    // Add current blink to timestamps
    blinkTimestamps.current.push(now);
    
    // Remove old blinks outside the counting window
    const recentBlinks = blinkTimestamps.current.filter(
      timestamp => now - timestamp < BLINK_WINDOW_MS
    );
    blinkTimestamps.current = recentBlinks;
    
    // Count blinks in the window
    setBlinkCount(recentBlinks.length);
    
    // Reset blink count after 5 seconds of no new blinks
    if (blinkTimer) clearTimeout(blinkTimer);
    
    const timer = setTimeout(() => {
      setBlinkCount(0);
    }, 5000);
    
    setBlinkTimer(timer);
  };
  
  const playRelaxedAudio = () => {
    stopAllAudio();
    relaxedAudioRef.current.play();
    setAudioPlaying(true);
  };
  
  const playFocusedAudio = () => {
    stopAllAudio();
    focusedAudioRef.current.play();
    setAudioPlaying(true);
  };
  
  const stopAllAudio = () => {
    if (relaxedAudioRef.current) {
      relaxedAudioRef.current.pause();
      relaxedAudioRef.current.currentTime = 0;
    }
    
    if (focusedAudioRef.current) {
      focusedAudioRef.current.pause();
      focusedAudioRef.current.currentTime = 0;
    }
  };

  const connectToArduino = async () => {
    try {
      if (serialPort.current) {
        console.warn("Already connected.");
        return;
      }

      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 230400 });
      serialPort.current = port;
      setConnectionStatus("Connected");

      reader.current = port.readable.getReader();
      readSerialData();
    } catch (error) {
      console.error("Error connecting:", error);
      setConnectionStatus("Error: " + error.message);
    }
  };

  const readSerialData = async () => {
    try {
      while (serialPort.current && reader.current) {
        const { value, done } = await reader.current.read();
        if (done) break;

        const textDecoder = new TextDecoder("utf-8");
        readBuffer += textDecoder.decode(value);

        let lines = readBuffer.split("\n");
        readBuffer = lines.pop();

        lines.forEach((line) => {
          const dataValue = parseFloat(line.trim());
          if (!isNaN(dataValue)) processEEGData(dataValue);
        });
      }
    } catch (error) {
      console.error("Serial Read Error:", error);
    }
  };

  const disconnectFromArduino = async () => {
    if (reader.current) {
      await reader.current.cancel();
      reader.current = null;
    }

    if (serialPort.current) {
      await serialPort.current.close();
      serialPort.current = null;
      setConnectionStatus("Disconnected");
    }
  };

  useEffect(() => {
    return () => {
      disconnectFromArduino();
      stopAllAudio();
      // Reset any brightness changes
      document.body.style.filter = "brightness(100%)";
    };
  }, []);

  return (
    <div style={{ backgroundColor: "#19212E", color: "white", borderRadius: "12px", padding: "20px", marginBottom: "30px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ fontSize: "18px", fontWeight: "bold" }}>Neural Activity ({connectionStatus})</div>
        <button onClick={connectionStatus === "Disconnected" ? connectToArduino : disconnectFromArduino} style={{ padding: "8px 16px", borderRadius: "5px", backgroundColor: connectionStatus === "Disconnected" ? "#8454EE" : "#FF5E5E", color: "white", border: "none", cursor: "pointer" }}>
          {connectionStatus === "Disconnected" ? "Connect" : "Disconnect"}
        </button>
      </div>

      <div style={{ backgroundColor: "#2A3343", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
        <div style={{ fontSize: "14px", color: "#8A8D91" }}>Current Mental State</div>
        <div style={{ fontSize: "18px", fontWeight: "bold" }}>{mentalState}</div>
      </div>
      
      <div style={{ backgroundColor: "#2A3343", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
        <div style={{ fontSize: "14px", color: "#8A8D91" }}>Blink Count</div>
        <div style={{ fontSize: "18px", fontWeight: "bold" }}>{blinkCount}</div>
        <div style={{ fontSize: "12px", color: "#8A8D91", marginTop: "5px" }}>
          2 blinks: Toggle brightness bar | 4 blinks: Focus mode | 8 blinks: Relaxation mode
        </div>
      </div>
      
      {showBrightnessBar && (
        <div style={{ backgroundColor: "#2A3343", padding: "15px", borderRadius: "8px", marginBottom: "20px" }}>
          <div style={{ fontSize: "14px", color: "#8A8D91", marginBottom: "10px" }}>Brightness Control</div>
          <div 
            ref={brightnessBarRef}
            style={{ 
              height: "20px", 
              width: "100%", 
              backgroundColor: "#1D2531", 
              borderRadius: "5px", 
              cursor: "pointer",
              position: "relative"
            }}
            onMouseDown={handleMouseDown}
          >
            <div 
              style={{ 
                height: "100%", 
                width: `${brightness}%`, 
                backgroundColor: "#8454EE", 
                borderRadius: "5px", 
                transition: isDraggingBrightness ? "none" : "width 0.2s" 
              }}
            ></div>
            <div 
              style={{
                position: "absolute",
                top: "0",
                left: `${brightness}%`,
                transform: "translateX(-50%)",
                width: "16px",
                height: "20px",
                backgroundColor: "#FFF",
                borderRadius: "3px",
                cursor: "grab"
              }}
            ></div>
          </div>
          <div style={{ fontSize: "18px", fontWeight: "bold", marginTop: "5px" }}>{Math.round(brightness)}%</div>
        </div>
      )}

      <div style={{ backgroundColor: "#2A3343", padding: "15px", borderRadius: "8px" }}>
        <div style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>EEG Wave Pattern</div>
        <canvas ref={canvasRef} width={800} height={200} style={{ width: "100%", height: "200px", backgroundColor: "#1D2531", borderRadius: "5px" }} />
      </div>
    </div>
  );
};

export default EEGWave;
