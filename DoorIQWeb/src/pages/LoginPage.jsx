import React, { useState } from 'react';
// Import the pre-configured Supabase client to interact with your database/auth
import { supabase } from '../supabaseClient';

/**
 * LoginPage Component
 * Props:
 * - onNavigateToRegister: Function to switch the view to the registration page
 * - onBackToLanding: Function to return the user to the landing page
 */
export default function LoginPage({ onNavigateToRegister, onBackToLanding }) {
  // --- STATE MANAGEMENT ---
  // Stores the user's email input
  const [email, setEmail] = useState('');
  // Stores the user's password input
  const [password, setPassword] = useState('');
  // Tracks if the login request is currently in progress (to show loading states)
  const [loading, setLoading] = useState(false);

  // --- LOGIC / EVENT HANDLERS ---
  const handleLogin = async (e) => {
    // Prevent the browser from refreshing the page on form submission
    e.preventDefault();
    // Start loading state
    setLoading(true);
    
    // Call Supabase Auth to sign in with email and password
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    // If Supabase returns an error (e.g., wrong password), show an alert
    if (error) {
      alert("Login Error: " + error.message);
    }
    
    // Stop loading state regardless of success or failure
    setLoading(false);
  };

  return (
    <div className="login-wrapper">
      {/* Injecting external Google Fonts */}
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap');
      </style>

      {/* Brand Logo / Back Button: Clicking this triggers the onBackToLanding prop */}
      <button className="vita-logo-btn" onClick={onBackToLanding}>
        Door<span>IQ</span>
      </button>

      {/* Main UI Card */}
      <div className="glass-card">
        <div className="badge">Secure Gateway</div>
        <h1>Welcome Back</h1>
        <p className="subtitle">Enter your credentials to access the DoorIQ hub.</p>
        
        {/* Login Form */}
        <form onSubmit={handleLogin} className="auth-form">
          {/* Email Input Field */}
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="name@company.com" 
              value={email} // Controlled component: value comes from state
              onChange={(e) => setEmail(e.target.value)} // Update state on typing
              required 
            />
          </div>

          {/* Password Input Field */}
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} // Controlled component: value comes from state
              onChange={(e) => setPassword(e.target.value)} // Update state on typing
              required 
            />
          </div>

          {/* Submit Button: Disabled while the 'loading' state is true */}
          <button type="submit" disabled={loading} className="btn-primary">
            {/* Conditional text: changes if the login is processing */}
            {loading ? 'Decrypting...' : 'Sign In to Portal'}
          </button>
        </form>

        {/* Navigation to Registration */}
        <p className="footer-text">
          New to the ecosystem? 
          <span onClick={onNavigateToRegister}> Register Device</span>
        </p>
      </div>

      {/* SCOPED CSS STYLING (Styled-JSX) */}
      <style jsx>{`
        .login-wrapper {
          min-height: 100vh;
          background-color: #050505;
          /* Creates the subtle glowing background effect */
          background-image: radial-gradient(circle at 100% 100%, rgba(0, 212, 255, 0.1) 0%, transparent 40%),
                            radial-gradient(circle at 0% 0%, rgba(0, 212, 255, 0.08) 0%, transparent 40%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: white;
          padding: 20px;
        }

        .vita-logo-btn {
          position: absolute;
          top: 30px;
          left: 30px;
          background: none;
          border: none;
          color: white;
          font-size: 1.5rem;
          font-weight: 800;
          cursor: pointer;
          letter-spacing: -1px;
        }
        .vita-logo-btn span { color: #00d4ff; }

        /* The frosted glass effect */
        .glass-card {
          background: rgba(15, 15, 15, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 40px;
          border-radius: 24px;
          width: 100%;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        .badge {
          display: inline-block;
          background: rgba(0, 212, 255, 0.1);
          color: #00d4ff;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          margin-bottom: 16px;
          border: 1px solid rgba(0, 212, 255, 0.2);
        }

        h1 { font-size: 2rem; font-weight: 800; margin: 0 0 10px; }
        .subtitle { color: #94a3b8; font-size: 0.9rem; margin-bottom: 30px; line-height: 1.5; }

        .auth-form { text-align: left; }
        
        .input-group { margin-bottom: 20px; }
        .input-group label { display: block; font-size: 0.8rem; font-weight: 600; color: #94a3b8; margin-bottom: 8px; }
        
        input {
          width: 100%;
          padding: 12px 16px;
          background: #0f0f0f;
          border: 1px solid #1f1f1f;
          border-radius: 10px;
          color: white;
          font-size: 0.95rem;
          transition: 0.3s;
          box-sizing: border-box;
        }
        input:focus {
          outline: none;
          border-color: #00d4ff;
          box-shadow: 0 0 0 4px rgba(0, 212, 255, 0.1);
        }

        .btn-primary {
          width: 100%;
          padding: 14px;
          background: #00d4ff;
          color: black;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          margin-top: 10px;
          transition: 0.3s;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 212, 255, 0.3);
        }
        /* Style for when the button is clicking/loading */
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .footer-text { margin-top: 25px; font-size: 0.85rem; color: #64748b; }
        .footer-text span { color: #00d4ff; cursor: pointer; font-weight: 600; transition: 0.2s; }
        .footer-text span:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}