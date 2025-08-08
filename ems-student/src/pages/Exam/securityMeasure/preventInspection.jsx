import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SecureEnvironment = ({ children }) => {
  const navigate = useNavigate();
  const [showWarningModal, setShowWarningModal] = useState(false);

  // Tab/window switching detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Tab switched away - show warning immediately
        setShowWarningModal(true);
      } else if (document.visibilityState === 'visible' && showWarningModal) {
        // Tab switched back while warning was shown - redirect immediately
        handleSubmitExam();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [showWarningModal]);

  // Mouse leaving window detection
  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (e.clientY < 0 || e.clientX < 0 || 
          e.clientX > window.innerWidth || e.clientY > window.innerHeight) {
        setShowWarningModal(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  // Security measures
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    const handleSelectStart = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
          (e.ctrlKey && e.key === 'u') || e.key === 'F12') {
        e.preventDefault();
        setShowWarningModal(true);
      }
    };

    // Detect dev tools opening
    const checkDevTools = () => {
      const threshold = 160;
      if ((window.outerWidth - window.innerWidth > threshold) || 
          (window.outerHeight - window.innerHeight > threshold)) {
        handleSubmitExam();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('keydown', handleKeyDown);
    const devToolsCheckInterval = setInterval(checkDevTools, 500);

    // Disable text selection
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

  const handleContinueExam = () => {
    setShowWarningModal(false);
    window.focus();
  };

  const handleSubmitExam = () => {
    navigate('/sign-in'); 
  };

  return (
    <>
      {children}
      
    {showWarningModal && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    zIndex: 9999,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backdropFilter: 'blur(5px)'
  }}>
    <div style={{
      backgroundColor: '#fff',
      padding: '2.5rem',
      borderRadius: '12px',
      maxWidth: '520px',
      width: '90%',
      textAlign: 'center',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
      border: '1px solid rgba(255,255,255,0.1)'
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
        Exam Session Interrupted
      </h2>
      
      <p style={{
        color: '#555',
        fontSize: '1.1rem',
        lineHeight: '1.6',
        marginBottom: '1.5rem'
      }}>
        You switched away from the exam window. This violates exam rules.
        <br /><br />
        <strong style={{ color: '#d32f2f' }}>
          If you switch tabs again, you will be automatically logged out.
        </strong>
      </p>
      
      <div style={{ 
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        marginTop: '2rem'
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
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
          Continue Exam
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
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 3H6a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h4M16 17l5-5-5-5M19.8 12H9"></path>
          </svg>
          Exit Exam
        </button>
      </div>
      
      <p style={{
        color: '#777',
        fontSize: '0.85rem',
        marginTop: '2rem',
        fontStyle: 'italic'
      }}>
        Note: Any further attempts to leave this window will result in automatic logout.
      </p>
    </div>
  </div>
)}
    </>
  );
};

export default SecureEnvironment;