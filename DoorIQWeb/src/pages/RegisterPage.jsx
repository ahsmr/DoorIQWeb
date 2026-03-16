import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function RegisterPage({ onNavigateToLogin, onBackToLanding }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert("Registration Error: " + error.message);
    } else {
      alert("Account initialized! Check your email for confirmation or proceed to login.");
      onNavigateToLogin();
    }
    setLoading(false);
  };

  return (
    <div className="register-wrapper">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap');
      </style>

      {/* Brand Logo / Back to Landing Button */}
      <button className="vita-logo-btn" onClick={onBackToLanding}>
        Door<span>IQ</span>
      </button>

      <div className="glass-card">
        <div className="badge">System Enrollment</div>
        <h1>New Device</h1>
        <p className="subtitle">Register your administrative account to manage your DoorIQ hardware.</p>
        
        <form onSubmit={handleRegister} className="auth-form">
          <div className="input-group">
            <label>Master Email</label>
            <input 
              type="email" 
              placeholder="admin@home.io" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="input-group">
            <label>Secure Password</label>
            <input 
              type="password" 
              placeholder="Min. 6 characters" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Encrypting Data...' : 'Initialize Account'}
          </button>
        </form>

        <p className="footer-text">
          Already registered? 
          <span onClick={onNavigateToLogin}> Access Portal</span>
        </p>
      </div>

      <style jsx>{`
        .register-wrapper {
          min-height: 100vh;
          background-color: #050505;
          background-image: radial-gradient(circle at 0% 100%, rgba(0, 212, 255, 0.1) 0%, transparent 40%),
                            radial-gradient(circle at 100% 0%, rgba(0, 212, 255, 0.08) 0%, transparent 40%);
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
          background: rgba(0, 212, 255, 0.05);
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
        .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        .footer-text { margin-top: 25px; font-size: 0.85rem; color: #64748b; }
        .footer-text span { color: #00d4ff; cursor: pointer; font-weight: 600; transition: 0.2s; }
        .footer-text span:hover { text-decoration: underline; }
      `}</style>
    </div>
  );
}