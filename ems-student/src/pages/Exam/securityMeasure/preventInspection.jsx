import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const SecureEnvironment = ({ children, examId, onAutoSubmit }) => {
  const navigate = useNavigate();
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [countdown, setCountdown] = useState(1);
  const countdownRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const isAwayRef = useRef(false);

  // Auto-submit function - FORCEFUL version
  const handleAutoSubmit = async () => {
    // Prevent multiple submissions
    if (isSubmittingRef.current) {
      console.log('⚠️ Already submitting, skipping...');
      return;
    }
    
    isSubmittingRef.current = true;
    console.log('🚨 FORCE AUTO-SUBMIT triggered!');
    
    try {
      // Clear all timers first
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
      
      // Call the parent's auto-submit function
      if (onAutoSubmit) {
        console.log('📤 Calling onAutoSubmit...');
        await onAutoSubmit();
        console.log('✅ onAutoSubmit completed');
      }
      
      // Force navigation to sign-in
      console.log('🚪 Navigating to sign-in...');
      navigate('/sign-in');
      
    } catch (error) {
      console.error('❌ Auto-submit failed:', error);
      // Even if submit fails, still navigate out
      navigate('/sign-in');
    } finally {
      isSubmittingRef.current = false;
    }
  };

  // Start countdown before auto-submit
  const startCountdown = () => {
    if (isSubmittingRef.current) return;
    if (showWarningModal) return; // Don't show multiple modals
    
    console.log('⏰ Starting countdown...');
    setShowWarningModal(true);
    setCountdown(1);
    
    if (countdownRef.current) clearInterval(countdownRef.current);
    
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        console.log(`⏳ Countdown: ${prev}`);
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
          // FORCE auto-submit when countdown reaches 0
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
  };

  // METHOD 1: TAB SWITCH DETECTION
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        console.log('⚠️ Tab switched away');
        isAwayRef.current = true;
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

  // METHOD 2: WINDOW BLUR - Catches Alt+Tab
  useEffect(() => {
    const handleBlur = () => {
      console.log('⚠️ Window lost focus (Alt+Tab or Start menu)');
      isAwayRef.current = true;
      startCountdown();
    };

    const handleFocus = () => {
      console.log('✅ Window regained focus');
      if (isAwayRef.current) {
        resetWarning();
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // METHOD 3: CONTINUOUS FOCUS CHECK
  useEffect(() => {
    const checkFocus = () => {
      if (!document.hasFocus() && !showWarningModal) {
        console.log('⚠️ Document lost focus (continuous check)');
        isAwayRef.current = true;
        startCountdown();
      } else if (document.hasFocus() && isAwayRef.current) {
        resetWarning();
      }
    };

    const interval = setInterval(checkFocus, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [showWarningModal]);

  // METHOD 4: MOUSE LEAVE DETECTION
  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (e.clientY < 0 || e.clientX < 0 || 
          e.clientX > window.innerWidth || e.clientY > window.innerHeight) {
        console.log('⚠️ Mouse left the window');
        startCountdown();
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  // METHOD 5: DEV TOOLS & KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      console.log('🚫 Right-click blocked');
      handleAutoSubmit();
    };

    const handleSelectStart = (e) => e.preventDefault();

    const handleKeyDown = (e) => {
      // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
      if ((e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
          (e.ctrlKey && e.key === 'u') || 
          e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        console.log('🔧 Dev tools shortcut detected!');
        handleAutoSubmit();
        return false;
      }

      // Block Ctrl+S, Ctrl+P
      if ((e.ctrlKey && ['s', 'p'].includes(e.key.toLowerCase()))) {
        e.preventDefault();
        return false;
      }
    };

    // Detect DevTools by window size
    const checkDevTools = () => {
      const threshold = 160;
      if ((window.outerWidth - window.innerWidth > threshold) || 
          (window.outerHeight - window.innerHeight > threshold)) {
        console.log('🔧 DevTools detected by window size!');
        handleAutoSubmit();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('keydown', handleKeyDown);
    
    const devToolsCheckInterval = setInterval(checkDevTools, 500);

    // Prevent text selection
    const style = document.createElement('style');
    style.innerHTML = '* { user-select: none !important; }';
    document.head.appendChild(style);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('keydown', handleKeyDown);
      clearInterval(devToolsCheckInterval);
      document.head.removeChild(style);
    };
  }, []);

  // METHOD 6: FULLSCREEN ENFORCEMENT
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        console.log('⚠️ Fullscreen exited');
        startCountdown();
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
    
    // Re-enter fullscreen
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const handleSubmitExam = () => {
    console.log('🔄 User clicked Exit Exam');
    handleAutoSubmit();
  };

  // Warning Modal
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