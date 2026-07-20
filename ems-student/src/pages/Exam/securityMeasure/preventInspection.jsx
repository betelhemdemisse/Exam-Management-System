import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const SecureEnvironment = ({ children, examId, onAutoSubmit }) => {
  const navigate = useNavigate();
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const countdownRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const isAwayRef = useRef(false);
  const violationCountRef = useRef(0);
  const lastViolationTimeRef = useRef(0);
  const isHandlingBrowserUI = useRef(false);
  const focusLostTimeRef = useRef(0);
  const isUserInteractingRef = useRef(false);

  // Auto-submit function
  const handleAutoSubmit = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    console.log('🚨 FORCE AUTO-SUBMIT triggered!');
    
    try {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      
      if (onAutoSubmit) {
        await onAutoSubmit();
      }
      
      navigate('/sign-in');
    } catch (error) {
      console.error('❌ Auto-submit failed:', error);
      navigate('/sign-in');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  // Check if focus loss is due to browser UI
  const isBrowserUIInteraction = () => {
    const now = Date.now();
    const timeSinceFocusLost = now - focusLostTimeRef.current;
    
    // Browser UI interactions typically happen very quickly (< 300ms)
    // and don't involve mouse movement or keyboard input
    if (timeSinceFocusLost < 300 && !isUserInteractingRef.current) {
      return true;
    }
    
    return false;
  };

  // Start countdown before auto-submit
  const startCountdown = () => {
    if (isSubmittingRef.current) return;
    if (showWarningModal) return;
    
    // Check if this is a browser UI interaction
    if (isBrowserUIInteraction()) {
      console.log('🛡️ Browser UI interaction detected - ignoring');
      isHandlingBrowserUI.current = true;
      
      // Reset after a short delay
      setTimeout(() => {
        isHandlingBrowserUI.current = false;
        isAwayRef.current = false;
      }, 500);
      
      return;
    }
    
    const now = Date.now();
    const timeSinceLastViolation = now - lastViolationTimeRef.current;
    
    // Increase threshold to 3 seconds to reduce false positives
    if (timeSinceLastViolation < 3000) {
      violationCountRef.current++;
      console.log(`⚠️ Frequent violations detected: ${violationCountRef.current}`);
      
      // Allow 4 false positives before actually triggering
      if (violationCountRef.current < 4) {
        lastViolationTimeRef.current = now;
        return;
      }
    } else {
      violationCountRef.current = 0;
    }
    
    lastViolationTimeRef.current = now;
    
    console.log('⏰ Starting countdown...');
    setShowWarningModal(true);
    setCountdown(10);
    
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        console.log(`⏳ Countdown: ${prev}`);
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Reset warning
  const resetWarning = () => {
    console.log('🔄 Resetting warning');
    setShowWarningModal(false);
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    isAwayRef.current = false;
    isHandlingBrowserUI.current = false;
  };

  // Detect actual navigation away from page
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      // Only trigger if user is actually navigating away
      if (!isHandlingBrowserUI.current) {
        console.log('🚪 Page navigation detected');
        handleAutoSubmit();
      }
    };

    const handlePageHide = (e) => {
      if (!isHandlingBrowserUI.current) {
        console.log('📄 Page hide detected');
        handleAutoSubmit();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);

  // METHOD 1: TAB SWITCH DETECTION
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Ignore if we're handling browser UI
      if (isHandlingBrowserUI.current) {
        console.log('🛡️ Ignoring visibility change due to browser UI');
        return;
      }

      if (document.visibilityState === 'hidden') {
        console.log('⚠️ Tab switched away');
        isAwayRef.current = true;
        focusLostTimeRef.current = Date.now();
        startCountdown();
      } else {
        console.log('✅ Tab is back');
        if (isAwayRef.current) {
          resetWarning();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // METHOD 2: WINDOW BLUR - With browser UI detection
  useEffect(() => {
    const handleBlur = () => {
      // Record the time when focus was lost
      focusLostTimeRef.current = Date.now();
      
      // Check if the blur is due to browser UI (notification, credential save, etc.)
      // Most browser UI interactions happen when clicking on browser chrome
      setTimeout(() => {
        if (!document.hasFocus() && !isHandlingBrowserUI.current) {
          console.log('⚠️ Window lost focus (Alt+Tab or browser UI)');
          isAwayRef.current = true;
          startCountdown();
        }
      }, 100);
    };

    const handleFocus = () => {
      console.log('✅ Window regained focus');
      if (isAwayRef.current) {
        resetWarning();
      }
      isUserInteractingRef.current = true;
      
      // Reset user interaction flag after a delay
      setTimeout(() => {
        isUserInteractingRef.current = false;
      }, 1000);
    };

    // Track user interaction to distinguish from browser UI
    const handleUserInteraction = () => {
      isUserInteractingRef.current = true;
      // Reset after a short delay
      setTimeout(() => {
        isUserInteractingRef.current = false;
      }, 500);
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('mousemove', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);
    window.addEventListener('click', handleUserInteraction);
    
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('mousemove', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('click', handleUserInteraction);
    };
  }, []);

  // METHOD 3: CONTINUOUS FOCUS CHECK - With browser UI detection
  useEffect(() => {
    const checkFocus = () => {
      // Skip if we're handling browser UI
      if (isHandlingBrowserUI.current) return;
      
      if (!document.hasFocus() && !showWarningModal) {
        console.log('⚠️ Document lost focus (continuous check)');
        isAwayRef.current = true;
        startCountdown();
      } else if (document.hasFocus() && isAwayRef.current) {
        resetWarning();
      }
    };

    const interval = setInterval(checkFocus, 2000); // Increased to 2 seconds

    return () => {
      clearInterval(interval);
    };
  }, [showWarningModal]);

  // METHOD 4: KEYBOARD SHORTCUTS (keep only essential ones)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only block critical shortcuts that are clearly intentional
      if ((e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
          (e.ctrlKey && e.key === 'u') || 
          e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔧 Dev tools shortcut detected!');
        handleAutoSubmit();
        return false;
      }

      // Block Ctrl+S, Ctrl+P only (not Ctrl+other)
      if ((e.ctrlKey && ['s', 'p'].includes(e.key.toLowerCase()))) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // METHOD 5: FULLSCREEN ENFORCEMENT - With browser UI detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (isHandlingBrowserUI.current) return;
      
      if (!document.fullscreenElement) {
        console.log('⚠️ Fullscreen exited');
        // Check if this is browser UI (e.g., notification, credential save)
        setTimeout(() => {
          if (!document.fullscreenElement && !isHandlingBrowserUI.current) {
            startCountdown();
          }
        }, 300);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleContinueExam = () => {
    console.log('🔄 User clicked Continue');
    resetWarning();
    window.focus();
    
    // Don't force fullscreen if browser is showing UI
    if (!document.fullscreenElement && !isHandlingBrowserUI.current) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const handleSubmitExam = () => {
    console.log('🔄 User clicked Exit Exam');
    handleAutoSubmit();
  };

  // Warning Modal (keep the same styling)
  const WarningModal = () => (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.9)',
      zIndex: 999999,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backdropFilter: 'blur(5px)'
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '2.5rem',
        borderRadius: '16px',
        maxWidth: '520px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        
        <h2 style={{
          color: '#d32f2f',
          fontSize: '1.75rem',
          fontWeight: '600',
          marginBottom: '1rem'
        }}>
          ⚠️ Security Violation!
        </h2>
        
        <p style={{
          color: '#555',
          fontSize: '1.1rem',
          lineHeight: '1.6',
          marginBottom: '1.5rem'
        }}>
          You left the exam window. This violates exam rules.
          <br /><br />
          <strong style={{ color: '#d32f2f', fontSize: '1.3rem' }}>
            Your exam will be auto-submitted in {countdown} seconds!
          </strong>
        </p>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginTop: '2rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleContinueExam}
            style={{
              padding: '0.75rem 1.75rem',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1565c0'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1976d2'}
          >
            Return to Exam
          </button>
          
          <button
            onClick={handleSubmitExam}
            style={{
              padding: '0.75rem 1.75rem',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d32f2f'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f44336'}
          >
            Submit & Exit
          </button>
        </div>
        
        <p style={{
          color: '#777',
          fontSize: '0.85rem',
          marginTop: '2rem',
          fontStyle: 'italic'
        }}>
          ⚠️ Any further attempts to leave this window will result in automatic submission.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {children}
      {showWarningModal && <WarningModal />}
    </>
  );
};

export default SecureEnvironment;