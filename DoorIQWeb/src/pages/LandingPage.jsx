import React from 'react';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="landing-wrapper">
      {/* Import Font directly in component for simplicity */}
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap');
      </style>

      <nav className="glass-nav">
        <div className="logo">Door<span>IQ</span></div>
        <div className="nav-links">
          <a href="#how-it-works">Technology</a>
          <a href="#features">Features</a>
        </div>
        <div className="auth-buttons">
          {/* We use onGetStarted to trigger the App.jsx auth view */}
          <button onClick={onGetStarted} className="btn-login-link">Login</button>
          <button onClick={onGetStarted} className="btn-get-started">Get Started</button>
        </div>
      </nav>

      <header className="hero">
        <div className="badge">IoT Powered Security</div>
        <h1>Unlock the power of <span>Intelligence</span> at your door.</h1>
        <p>DoorIQ isn't just a lock; it's a communicative hub that integrates sensors, real-time audio, and cloud analytics into one sleek interface.</p>
        <div className="hero-actions">
          <button onClick={onGetStarted} className="btn-get-started">See How It Works</button>
          <button className="btn-video"><span>▶</span> Watch Demo</button>
        </div>
      </header>

      <section id="how-it-works" className="tech-section">
        <div className="section-header">
          <h2>The Architecture</h2>
          <p>Our stack ensures sub-100ms latency from the moment someone touches your door.</p>
        </div>
        
        <div className="bento-container">
          <div className="bento-card">
            <div className="icon">📡</div>
            <h3>Edge Hardware</h3>
            <p>Raspberry Pi Zero 2W-based modules with built-in Wi-Fi and IR camera sensors.</p>
          </div>
          <div className="bento-card">
            <div className="icon">☁️</div>
            <h3>Supabase Cloud</h3>
            <p>Real-time backend managing your data, auth, and security protocols.</p>
          </div>
          <div className="bento-card wide">
            <div className="icon">📱</div>
            <h3>Real-time Dashboard</h3>
            <p>Control everything from a single pane of glass, featuring live microphone and video feed.</p>
          </div>
        </div>
      </section>

      <style jsx>{`
        :root {
          --bg-color: #050505;
          --accent-color: #00d4ff;
          --text-dim: #94a3b8;
          --glass-border: rgba(255, 255, 255, 0.1);
        }

        .landing-wrapper {
          background-color: #050505;
          background-image: radial-gradient(circle at 0% 0%, rgba(0, 212, 255, 0.12) 0%, transparent 50%);
          color: white;
          font-family: 'Plus Jakarta Sans', sans-serif;
          min-height: 100vh;
          margin: 0;
        }

        /* NAVIGATION */
        .glass-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 8%;
          background: rgba(5, 5, 5, 0.8);
          backdrop-filter: blur(15px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          position: sticky;
          top: 0;
          z-index: 1000;
        }

        .logo { font-size: 1.5rem; font-weight: 800; }
        .logo span { color: #00d4ff; }

        .nav-links a { color: #94a3b8; text-decoration: none; margin: 0 15px; font-size: 0.9rem; transition: 0.3s; }
        .nav-links a:hover { color: white; }

        .auth-buttons { display: flex; gap: 20px; align-items: center; }

        .btn-login-link { 
          background: none; border: none; color: white; 
          font-size: 0.9rem; font-weight: 600; cursor: pointer; 
        }

        .btn-get-started {
          background: #00d4ff;
          color: black;
          padding: 10px 24px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 700;
          box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
          transition: 0.3s;
        }
        .btn-get-started:hover { transform: scale(1.05); }

        /* HERO */
        .hero {
          text-align: center;
          padding: 100px 10%;
          max-width: 1000px;
          margin: 0 auto;
        }

        .badge {
          display: inline-block;
          background: rgba(0, 212, 255, 0.1);
          color: #00d4ff;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 800;
          border: 1px solid rgba(0, 212, 255, 0.2);
          margin-bottom: 20px;
        }

        .hero h1 { font-size: clamp(2.5rem, 6vw, 4rem); font-weight: 800; margin: 0 0 20px; letter-spacing: -1px; line-height: 1.1; }
        .hero h1 span { color: #00d4ff; }

        .hero p { color: #94a3b8; font-size: 1.1rem; max-width: 700px; margin: 0 auto 40px; }

        .hero-actions { display: flex; gap: 15px; justify-content: center; }

        .btn-video {
          background: #111;
          color: white;
          padding: 10px 24px;
          border-radius: 8px;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-weight: 600;
        }

        /* BENTO GRID */
        .tech-section { padding: 80px 8%; max-width: 1200px; margin: 0 auto; }
        .section-header { text-align: center; margin-bottom: 50px; }

        .bento-container {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .bento-card {
          background: #0f0f0f;
          border: 1px solid #1f1f1f;
          padding: 30px;
          border-radius: 20px;
          transition: 0.3s;
          text-align: left;
        }

        .bento-card:hover { border-color: #00d4ff; transform: translateY(-5px); }
        .bento-card .icon { font-size: 2rem; margin-bottom: 15px; display: block; }
        .bento-card h3 { margin: 0 0 10px; font-size: 1.2rem; }
        .bento-card p { color: #94a3b8; font-size: 0.9rem; margin: 0; }

        .wide { grid-column: span 2; }

        @media (max-width: 768px) {
          .bento-container { grid-template-columns: 1fr; }
          .wide { grid-column: span 1; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;