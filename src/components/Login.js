import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './Auth.css'; 

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [message, setMessage] = useState(''); // Success message ke liye
  
  // Forgot Password Screen Toggle State
  const [showForgot, setShowForgot] = useState(false);
  
  const navigate = useNavigate();

  // --- LOGIN LOGIC ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEmailError('');
    setPasswordError('');
    setMessage('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/profile');
    } catch (error) {
      if (error.code === 'auth/user-not-found') setEmailError('Email not registered.');
      else if (error.code === 'auth/wrong-password') setPasswordError('Wrong password.');
      else if (error.code === 'auth/invalid-email') setEmailError('Invalid email format.');
      else if (error.code === 'auth/invalid-credential') setPasswordError('Incorrect email or password.');
      else alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- FORGOT PASSWORD LOGIC ---
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setEmailError('Please enter your email first.');
      return;
    }
    
    setLoading(true);
    setEmailError('');
    setMessage('');

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('✅ Password reset link sent to your email!');
      // 3 second baad wapas login form dikha denge
      setTimeout(() => {
        setShowForgot(false);
        setMessage('');
      }, 3000);
    } catch (error) {
      if (error.code === 'auth/user-not-found') setEmailError('This email is not registered.');
      else if (error.code === 'auth/invalid-email') setEmailError('Invalid email format.');
      else alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-container">
        
        {/* Agar ShowForgot TRUE hai, toh Reset form dikhao, warna Login form */}
        {!showForgot ? (
          <>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <div style={{ width: '100%', textAlign: 'left' }}>
                <input 
                  type="email" 
                  placeholder="Email" 
                  required 
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(''); }} 
                  style={{ borderColor: emailError ? '#ff4757' : 'rgba(255, 255, 255, 0.15)' }}
                />
                {emailError && <span className="error-text">{emailError}</span>}
              </div>

              <div style={{ width: '100%', textAlign: 'left' }}>
                <input 
                  type="password" 
                  placeholder="Password" 
                  required 
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }} 
                  style={{ borderColor: passwordError ? '#ff4757' : 'rgba(255, 255, 255, 0.15)' }}
                />
                {passwordError && <span className="error-text">{passwordError}</span>}
              </div>
              
              {/* Forgot Password Link */}
              <div style={{ textAlign: 'right', marginTop: '-5px', marginBottom: '10px' }}>
                <span 
                  style={{ color: '#868CFF', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }} 
                  onClick={() => { setShowForgot(true); setEmailError(''); setPasswordError(''); }}
                >
                  Forgot Password?
                </span>
              </div>

              <button type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
            <p>Don't have an account? <a href="/signup">Sign up here</a></p>
          </>
        ) : (
          // --- FORGOT PASSWORD UI ---
          <>
            <h2>Reset Password</h2>
            <p style={{ marginTop: '0', marginBottom: '20px', color: '#a3aed1' }}>
              Enter your registered email to receive a password reset link.
            </p>
            <form onSubmit={handleResetPassword}>
              <div style={{ width: '100%', textAlign: 'left' }}>
                <input 
                  type="email" 
                  placeholder="Enter your Email" 
                  required 
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(''); }} 
                  style={{ borderColor: emailError ? '#ff4757' : 'rgba(255, 255, 255, 0.15)' }}
                />
                {emailError && <span className="error-text">{emailError}</span>}
                {message && <span style={{ color: '#2ecc71', fontSize: '14px', display: 'block', marginTop: '5px', fontWeight: '600' }}>{message}</span>}
              </div>

              <button type="submit" disabled={loading}>
                {loading ? "Sending Link..." : "Send Reset Link"}
              </button>
            </form>
            
            {/* Back to Login Link */}
            <p style={{ marginTop: '20px' }}>
              Remember your password? 
              <span 
                style={{ color: '#4318FF', cursor: 'pointer', fontWeight: '600', marginLeft: '5px' }} 
                onClick={() => { setShowForgot(false); setMessage(''); setEmailError(''); }}
              >
                Back to Login
              </span>
            </p>
          </>
        )}

      </div>
    </div>
  );
}

export default Login;