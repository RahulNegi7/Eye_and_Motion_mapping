import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff } from 'lucide-react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import './NeuroCss.css';

function LoginPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [activeListening, setActiveListening] = useState(false);

    // Voice command integration
    const handleHelloCommand = () => {
        if (!activeListening) {
            setActiveListening(true);
            resetTranscript();
            showNotification('Voice commands activated');
        }
    };
    
    const handleByeCommand = () => {
        if (activeListening) {
            setActiveListening(false);
            resetTranscript();
            showNotification('Voice commands deactivated');
        }
    };

    // Define voice commands for login
    const commands = [
        {
            command: ['hello', 'hey', 'listen'],
            callback: () => handleHelloCommand(),
            matchInterim: true,
            fuzzyMatch: true
        },
        {
            command: ['bye', 'goodbye', 'stop listening'],
            callback: () => handleByeCommand(),
            matchInterim: true,
            fuzzyMatch: true
        },
        {
            command: ['login', 'log in', 'face login'],
            callback: () => {
                if (activeListening && !loading) {
                    handleLogin();
                    resetTranscript();
                }
            },
            matchInterim: true,
            fuzzyMatch: true
        },
        {
            command: ['clear', 'reset'],
            callback: () => {
                if (activeListening) {
                    resetTranscript();
                    showNotification('Transcript cleared');
                }
            },
            matchInterim: true,
            fuzzyMatch: true
        }
    ];
    
    const { transcript, listening, browserSupportsSpeechRecognition, isMicrophoneAvailable, resetTranscript } = 
    useSpeechRecognition({
        commands,
        clearTranscriptOnListen: false,
        transcribing: true,
        interimResults: true
    });
    
    // Speech recognition setup
    useEffect(() => {
        if (!browserSupportsSpeechRecognition) {
            showNotification('Browser doesn\'t support speech recognition', true);
            return;
        }
        
        if (!isMicrophoneAvailable) {
            showNotification('Microphone access is required', true);
            return;
        }
        
        // Start with optimized settings for faster response
        const startListening = () => {
            try {
                SpeechRecognition.startListening({ 
                    continuous: true,
                    language: 'en-US',
                    interimResults: true,
                    maxAlternatives: 1
                });
            } catch (error) {
                console.error('Error starting speech recognition:', error);
            }
        };
        
        startListening();
        
        // Quick restart if recognition stops
        const intervalId = setInterval(() => {
            if (!listening) {
                startListening();
            }
        }, 500);
        
        return () => {
            clearInterval(intervalId);
            SpeechRecognition.stopListening();
        };
    }, [browserSupportsSpeechRecognition, isMicrophoneAvailable, listening]);

    // Listen for commands in the transcript
    useEffect(() => {
        if (!listening || !transcript) return;
        
        // Process immediately without debounce
        const lowerTranscript = transcript.toLowerCase().trim();
        
        // Fast activation/deactivation response
        if (!activeListening) {
            if (lowerTranscript.includes('hey') || lowerTranscript.includes('hello') || lowerTranscript.includes('listen')) {
                handleHelloCommand();
                resetTranscript();
                return;
            }
        } else {
            // Fast deactivation
            if (lowerTranscript.includes('bye') || lowerTranscript.includes('stop lis')) {
                handleByeCommand();
                resetTranscript();
                return;
            }
            
            if (lowerTranscript.includes('login') && !loading) {
                handleLogin();
                resetTranscript();
            }
        }
        
        // Reset transcript if it gets too long
        if (transcript.length > 50) {
            resetTranscript();
        }
    }, [transcript, listening, activeListening, loading]);
    
    const showNotification = (message, isError = false) => {
        setNotification({ 
            message, 
            type: isError ? 'error' : 'success' 
        });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleLogin = () => {
        setLoading(true);
        showNotification('Face authentication in progress...');
    
        // Simulate face authentication
        setTimeout(() => {
            setLoading(false);
            showNotification('Authentication successful');
    
            // Navigate to setup flow within the app
            navigate('/setpage');
        }, 2000);
    };
    

    const toggleActiveListening = () => {
        // Always try to ensure microphone is active
        if (!listening) {
            try {
                SpeechRecognition.startListening({ 
                    continuous: true,
                    language: 'en-US',
                    interimResults: true,
                    maxAlternatives: 1
                });
            } catch (error) {
                console.error('Failed to start listening:', error);
                showNotification('Voice recognition failed to start', true);
                return;
            }
        }
        
        // Toggle state and provide immediate feedback
        setActiveListening(prev => !prev);
        resetTranscript();
        
        // Provide feedback
        showNotification(!activeListening ? 'Voice commands activated' : 'Voice commands deactivated');
    };

    // Style for voice control button
    const micButtonStyle = {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: "10",
        cursor: "pointer",
        backgroundColor: activeListening ? "#9c27b0" : "#651fff",
        borderRadius: "50%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
        transition: "all 0.3s ease",
        padding: activeListening ? "20px" : "15px",
        transform: activeListening ? "scale(1.2)" : "scale(1)"
    };

    return (
        <div className="login-page">
            <div className="particle-container"></div>
            
            <motion.div 
                className="login-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <motion.div 
                    className="logo-container"
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.div 
                        className="logo-icon"
                        animate={{ 
                            rotate: [0, 10, 0, -10, 0],
                            scale: [1, 1.1, 1, 1.1, 1]
                        }}
                        transition={{ duration: 5, repeat: Infinity }}
                    ></motion.div>
                    <h1 className="logo-text">NeuroNav</h1>
                </motion.div>
                
                <motion.h2
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    Neural Interface System
                </motion.h2>
                
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                >
                    Please login to continue
                </motion.p>
                
                <motion.button 
                    className="login-button"
                    onClick={handleLogin}
                    disabled={loading}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                >
                    {loading ? (
                        <motion.div 
                            className="loading-spinner"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        ></motion.div>
                    ) : (
                        <>
                            <motion.span 
                                className="button-icon login"
                                animate={{ 
                                    y: [0, -3, 0, 3, 0]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                            ></motion.span>
                            Login with Face Authentication
                        </>
                    )}
                </motion.button>
                
                <motion.p
                    className="voice-hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.6 }}
                >
                    You can also say "login" to authenticate
                </motion.p>
            </motion.div>
            
            {/* Notification */}
            <AnimatePresence>
                {notification && (
                    <motion.div 
                        className={`notification ${notification.type}`}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {notification.message}
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Voice Control Button */}
            <div
                onClick={toggleActiveListening}
                style={micButtonStyle}
            >
                {activeListening ? 
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <MicOff size={24} color="white" />
                        <span style={{ color: "white", fontSize: "12px", marginTop: "5px", fontWeight: "500" }}>Active</span>
                    </div> : 
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Mic size={24} color="white" />
                        <span style={{ color: "white", fontSize: "12px", marginTop: "5px", fontWeight: "500" }}>Waiting</span>
                    </div>
                }
            </div>

            {/* Voice commands help overlay - only shown when listening is active */}
            {activeListening && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3 }}
                    style={{
                        position: "fixed",
                        bottom: "80px",
                        right: "20px",
                        backgroundColor: "rgba(101, 31, 255, 0.9)",
                        borderRadius: "8px",
                        padding: "12px",
                        color: "white",
                        maxWidth: "220px",
                        fontSize: "12px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                        zIndex: 9
                    }}
                >
                    <h4 style={{ margin: "0 0 8px 0", fontSize: "14px" }}>Voice Commands:</h4>
                    <ul style={{ margin: "0", paddingLeft: "16px" }}>
                        <li>"login"</li>
                        <li>"hello" (start listening)</li>
                        <li>"bye" (stop listening)</li>
                    </ul>
                </motion.div>
            )}
        </div>
    );
}

export default LoginPage;
