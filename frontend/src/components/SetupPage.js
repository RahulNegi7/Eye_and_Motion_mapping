import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './NeuroCss.css';

function SetupPage() {
    const navigate = useNavigate();
    const [isTracking, setIsTracking] = useState(false);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [calibrated, setCalibrated] = useState(false);
    const apiBaseUrl = `http://${window.location.hostname}:5001`;
    
    useEffect(() => {
        // Show welcome notification on load
        showNotification('Welcome to NeuroNav Setup', false);
    }, []);
    
    const showNotification = (message, isError = false) => {
        setNotification({ 
            message, 
            type: isError ? 'error' : 'success' 
        });
        setTimeout(() => setNotification(null), 3000);
    };

    const startEyeTracking = async () => {
        setLoading(true);
        try {
            // In a real implementation, you would call your backend API
            const response = await axios.post(`${apiBaseUrl}/start-eye-tracking`);
            const { status, message } = response?.data || {};
            if (status === 'error') {
                throw new Error(message || 'Failed to start eye tracking');
            }
            
            // For demo purposes, let's simulate a successful API call
            setTimeout(() => {
                setIsTracking(true);
                showNotification('Eye tracking started successfully');
                setLoading(false);
            }, 1500);
        } catch (err) {
            const backendMessage = err?.response?.data?.message;
            showNotification(backendMessage || err.message || 'Failed to start eye tracking', true);
            console.error(err);
            setLoading(false);
        }
    };

    const stopEyeTracking = async () => {
        setLoading(true);
        try {
            // In a real implementation, you would call your backend API
            const response = await axios.post(`${apiBaseUrl}/stop-eye-tracking`);
            const { status, message } = response?.data || {};
            if (status === 'error') {
                throw new Error(message || 'Failed to stop eye tracking');
            }
            
            // For demo purposes, let's simulate a successful API call
            setTimeout(() => {
                setIsTracking(false);
                setCalibrated(false); // Reset calibration when tracking stops
                showNotification('Eye tracking stopped');
                setLoading(false);
            }, 1000);
        } catch (err) {
            const backendMessage = err?.response?.data?.message;
            showNotification(backendMessage || err.message || 'Failed to stop eye tracking', true);
            console.error(err);
            setLoading(false);
        }
    };
    
    const handleCalibrateEyeTracking = () => {
        if (!isTracking) {
            showNotification('Please start eye tracking first', true);
            return;
        }
        
        setLoading(true);
        showNotification('Calibration in progress...');
        
        // Simulate calibration process
        setTimeout(() => {
            setCalibrated(true);
            setLoading(false);
            showNotification('Calibration completed successfully');
        }, 3000);
    };
    
    const handleContinueToDashboard = () => {
        if (!isTracking) {
            showNotification('Please start eye tracking first', true);
            return;
        }
        
        if (!calibrated) {
            showNotification('Please calibrate eye tracking first', true);
            return;
        }
        
        // Navigate to the dashboard, add a log to verify click handling
        console.log("Navigating to dashboard...");
        navigate('/neuronavdashboard');
    };

    return (
        <div className="setup-page">
            <div className="particle-container">
                {[...Array(20)].map((_, i) => (
                    <motion.div 
                        key={i}
                        className="particle"
                        initial={{ 
                            x: Math.random() * window.innerWidth, 
                            y: Math.random() * window.innerHeight,
                            opacity: Math.random() * 0.5 + 0.3
                        }}
                        animate={{ 
                            x: [null, Math.random() * window.innerWidth],
                            y: [null, Math.random() * window.innerHeight],
                            opacity: [null, Math.random() * 0.5 + 0.3]
                        }}
                        transition={{ 
                            duration: Math.random() * 20 + 10,
                            repeat: Infinity,
                            ease: "linear" 
                        }}
                        style={{
                            width: `${Math.random() * 10 + 2}px`,
                            height: `${Math.random() * 10 + 2}px`,
                        }}
                    />
                ))}
            </div>
            
            <motion.div 
                className="setup-container"
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
                    >
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                            <circle cx="20" cy="20" r="18" stroke="#4a90e2" strokeWidth="2" />
                            <circle cx="20" cy="20" r="8" fill="#6a5acd" />
                            <motion.path 
                                d="M20 2 L20 38" 
                                stroke="#4a90e2" 
                                strokeWidth="2" 
                                strokeDasharray="3 3"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                style={{ transformOrigin: 'center' }}
                            />
                        </svg>
                    </motion.div>
                    <h1 className="logo-text">NeuroNav</h1>
                </motion.div>
                
                <motion.h2
                    className="setup-heading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                >
                    Eye Tracking Setup
                </motion.h2>
                
                <motion.div 
                    className="status-container"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                >
                    <div className="status-card">
                        <div className="status-header">System Status</div>
                        <div className="status-body">
                            <motion.div 
                                className={`status-indicator ${isTracking ? 'active' : 'inactive'}`}
                                animate={{ opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <motion.div 
                                    className={`status-dot ${isTracking ? 'active' : 'inactive'}`}
                                    animate={{ 
                                        scale: isTracking ? [1, 1.2, 1] : 1,
                                        boxShadow: isTracking ? [
                                            '0 0 0 0 rgba(74, 144, 226, 0.7)', 
                                            '0 0 0 10px rgba(74, 144, 226, 0)', 
                                            '0 0 0 0 rgba(74, 144, 226, 0)'
                                        ] : '0 0 0 0 rgba(74, 144, 226, 0)'
                                    }}
                                    transition={{ duration: 1.5, repeat: isTracking ? Infinity : 0 }}
                                ></motion.div>
                                <span className="status-text">
                                    {isTracking ? 'Tracking Active' : 'Not Tracking'}
                                </span>
                            </motion.div>
                            
                            <motion.div 
                                className={`status-indicator ${calibrated ? 'active' : 'inactive'}`}
                                animate={{ opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                            >
                                <motion.div 
                                    className={`status-dot ${calibrated ? 'active' : 'inactive'}`}
                                    animate={{ 
                                        scale: calibrated ? [1, 1.2, 1] : 1,
                                        boxShadow: calibrated ? [
                                            '0 0 0 0 rgba(106, 90, 205, 0.7)', 
                                            '0 0 0 10px rgba(106, 90, 205, 0)', 
                                            '0 0 0 0 rgba(106, 90, 205, 0)'
                                        ] : '0 0 0 0 rgba(106, 90, 205, 0)'
                                    }}
                                    transition={{ duration: 1.5, repeat: calibrated ? Infinity : 0 }}
                                ></motion.div>
                                <span className="status-text">
                                    {calibrated ? 'System Calibrated' : 'Not Calibrated'}
                                </span>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
                
                <motion.div 
                    className="setup-instructions"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                >
                    <div className="instructions-card">
                        <div className="instructions-header">Setup Process</div>
                        <div className="instructions-body">
                            <ol className="steps-list">
                                <li className={`step ${isTracking ? 'completed' : ''}`}>
                                    <div className="step-number">1</div>
                                    <div className="step-content">
                                        <div className="step-title">Start Eye Tracking</div>
                                        <div className="step-description">Initialize the eye tracking system</div>
                                    </div>
                                    {isTracking && <div className="step-check">✓</div>}
                                </li>
                                <li className={`step ${calibrated ? 'completed' : ''}`}>
                                    <div className="step-number">2</div>
                                    <div className="step-content">
                                        <div className="step-title">Calibrate System</div>
                                        <div className="step-description">Adjust for accuracy and precision</div>
                                    </div>
                                    {calibrated && <div className="step-check">✓</div>}
                                </li>
                                <li className={`step ${isTracking && calibrated ? 'completed' : ''}`}>
                                    <div className="step-number">3</div>
                                    <div className="step-content">
                                        <div className="step-title">Continue to Dashboard</div>
                                        <div className="step-description">Access full system functionality</div>
                                    </div>
                                    {isTracking && calibrated && <div className="step-check">✓</div>}
                                </li>
                            </ol>
                        </div>
                    </div>
                </motion.div>
                
                <motion.div 
                    className="button-container"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.6 }}
                >
                    <motion.button 
                        className={`control-button ${isTracking ? 'disabled' : 'primary'}`}
                        onClick={startEyeTracking}
                        disabled={isTracking || loading}
                        whileHover={{ scale: isTracking ? 1 : 1.03, boxShadow: isTracking ? '' : '0 8px 20px rgba(74, 144, 226, 0.3)' }}
                        whileTap={{ scale: isTracking ? 1 : 0.97 }}
                    >
                        {loading && !isTracking ? (
                            <motion.div 
                                className="loading-spinner"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            ></motion.div>
                        ) : (
                            <>
                                <motion.span 
                                    className="button-icon start"
                                    whileHover={{ rotate: 90 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                    </svg>
                                </motion.span>
                                <span>Start Eye Tracking</span>
                            </>
                        )}
                    </motion.button>

                    <motion.button 
                        className={`control-button ${!isTracking ? 'disabled' : 'secondary'}`}
                        onClick={stopEyeTracking}
                        disabled={!isTracking || loading}
                        whileHover={{ scale: !isTracking ? 1 : 1.03, boxShadow: !isTracking ? '' : '0 8px 20px rgba(239, 68, 68, 0.3)' }}
                        whileTap={{ scale: !isTracking ? 1 : 0.97 }}
                    >
                        {loading && isTracking ? (
                            <motion.div 
                                className="loading-spinner"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            ></motion.div>
                        ) : (
                            <>
                                <motion.span 
                                    className="button-icon stop"
                                    whileHover={{ scale: 1.2 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    </svg>
                                </motion.span>
                                <span>Stop Eye Tracking</span>
                            </>
                        )}
                    </motion.button>
                    
                    <motion.button 
                        className={`control-button calibrate ${!isTracking ? 'disabled' : ''}`}
                        onClick={handleCalibrateEyeTracking}
                        disabled={!isTracking || loading}
                        whileHover={{ scale: !isTracking ? 1 : 1.03, boxShadow: !isTracking ? '' : '0 8px 20px rgba(106, 90, 205, 0.3)' }}
                        whileTap={{ scale: !isTracking ? 1 : 0.97 }}
                    >
                        <motion.span 
                            className="button-icon calibrate"
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                        </motion.span>
                        <span>Calibrate System</span>
                    </motion.button>
                </motion.div>
                
                <motion.button 
                    className={`dashboard-button ${(!isTracking || !calibrated) ? 'disabled' : 'active'}`}
                    onClick={handleContinueToDashboard}
                    disabled={!isTracking || !calibrated || loading}
                    whileHover={{ 
                        scale: (!isTracking || !calibrated) ? 1 : 1.05,
                        boxShadow: (!isTracking || !calibrated) ? '' : '0 10px 25px rgba(74, 144, 226, 0.4)'
                    }}
                    whileTap={{ 
                        scale: (!isTracking || !calibrated) ? 1 : 0.98 
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                >
                    <span className="button-text">Continue to Dashboard</span>
                    <motion.span 
                        className="button-arrow"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </motion.span>
                </motion.button>
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
                        <div className="notification-icon">
                            {notification.type === 'success' ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="8" x2="12" y2="12"></line>
                                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                </svg>
                            )}
                        </div>
                        <div className="notification-message">{notification.message}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default SetupPage;
