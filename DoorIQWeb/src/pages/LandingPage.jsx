import React from 'react';

const LandingPage = ({ onGetStarted, onLogin }) => {
  return (
    <div className="landing-wrapper">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap');
      </style>

      {/* Academic Disclaimer Top Bar */}
      <div className="academic-top-bar">
        Project for P&O II • Department of Computer Science • KU Leuven
      </div>

      {/* Navigation */}
      <nav className="glass-nav">
      <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src="/logo.png" alt="DoorIQ Icon" style={{ height: '32px', width: 'auto' }} />
        <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
          Door<span style={{ color: '#00d2ff' }}>IQ</span>
        </div>
      </div>
        <div className="nav-links">
          <a href="#tech">Technology</a>
          <a href="#features">Features</a>
          <a href="#ecosystem">Ecosystem</a>
        </div>
        <div className="auth-buttons">
          {/* This button now specifically calls onLogin */}
          <button onClick={onLogin} className="btn-login-link">Login</button>
          <button onClick={onGetStarted} className="btn-get-started">Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero">
        <div className="badge">IoT Security Prototype</div>
        <h1>Your Front Door, <span>Reimagined</span> with Intelligence.</h1>
        <p>
          DoorIQ blends Raspberry Pi edge computing with Supabase real-time architecture. 
          Monitor, speak, and secure your property with sub-100ms latency and infrared night vision.
        </p>
        <div className="hero-actions">
          <button onClick={onGetStarted} className="btn-get-started">Open Dashboard</button>
          <button className="btn-video"><span>▶</span> System Overview</button>
        </div>
      </header>

      {/* Technology Bento Grid */}
      <section id="tech" className="section-container">
        <div className="section-header">
          <h2>Cutting Edge Architecture</h2>
          <p>Powered by a professional-grade stack for sub-second response times.</p>
        </div>
        
        <div className="bento-container">
          <div className="bento-card">
            <div className="icon">📡</div>
            <h3>Edge Computing</h3>
            <p>Built on the Raspberry Pi Zero 2W. Local motion sensing and IR camera processing at the source.</p>
          </div>
          <div className="bento-card">
            <div className="icon">🎙️</div>
            <h3>LiveKit Bridge</h3>
            <p>Instant two-way audio. Talk to visitors through your browser and hear them via the Pi's cloud-connected mic.</p>
          </div>
          <div className="bento-card wide">
            <div className="icon">⚡</div>
            <h3>Supabase Realtime</h3>
            <p>Database and Auth managed via Supabase. Get instant notifications for motion events and doorbell presses across all your linked devices.</p>
          </div>
        </div>
      </section>

      {/* Features Detail */}
      <section id="features" className="features-showcase">
        <div className="feature-row">
          <div className="feature-text">
            <div className="tag">Live Interaction</div>
            <h3>Communicate in Real-Time</h3>
            <p>
              Use the LiveKit-powered hub to speak directly to your Raspberry Pi speaker. 
              Whether it’s a delivery person or a friend, the real-time room ensures your voice is heard instantly.
            </p>
          </div>
          <div className="feature-ui-box">
             <div className="ui-mockup-mic">
                <div className="pulse-ring"></div>
                <span>LIVE AUDIO ROOM</span>
             </div>
          </div>
        </div>

        <div className="feature-row reverse">
          <div className="feature-text">
            <div className="tag">Automation</div>
            <h3>Prerecorded Intelligence</h3>
            <p>
              Not available? Record custom voice notes to play automatically when the doorbell button is pressed. 
              Manage your library of "Play now" and "Standard" responses from your dashboard.
            </p>
          </div>
          <div className="feature-ui-box">
             <div className="ui-voice-stack">
                <div className="v-item">"I'll be there in 5 minutes"</div>
                <div className="v-item active">"Please leave the package"</div>
             </div>
          </div>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section id="ecosystem" className="ecosystem-cta">
        <div className="cta-inner">
          <h2>Manage Your Entire Home</h2>
          <p>Create separate "Homes," invite members via UUID, and link hardware effortlessly. All your devices, one unified interface.</p>
          <div className="stats-row">
            <div className="stat-item"><span>IR</span>Night Vision</div>
            <div className="stat-item"><span>LIVE</span>Motion Alerts</div>
            <div className="stat-item"><span>∞</span>Shared Access</div>
          </div>
          <button onClick={onGetStarted} className="btn-get-started btn-large">Register Your First Device</button>
        </div>
      </section>

      <footer>
        <div className="footer-content">
          <p>© 2026 DoorIQ Academic Prototype.</p>
          <div className="disclaimer">
            This project is developed as part of the <strong>P&O II (Problem-solving & Design)</strong> course 
            for the <strong>Department of Computer Science at KU Leuven</strong>. 
            <br />
            <span className="not-affiliated">DoorIQ has no affiliation with doorIQ.ai or any commercial entity of a similar name.</span>
          </div>
        </div>
      </footer>

      <style jsx>{`
        :root {
          --accent: #00d4ff;
          --bg: #050505;
          --card-bg: #0f0f0f;
          --text-dim: #94a3b8;
          --border: rgba(255, 255, 255, 0.1);
        }

        .landing-wrapper {
          background-color: var(--bg);
          background-image: 
            radial-gradient(circle at 10% 10%, rgba(0, 212, 255, 0.07) 0%, transparent 40%),
            radial-gradient(circle at 90% 90%, rgba(0, 212, 255, 0.04) 0%, transparent 40%);
          color: white;
          font-family: 'Plus Jakarta Sans', sans-serif;
          margin: 0; padding: 0;
        }

        .academic-top-bar {
          background: #00d4ff;
          color: #000;
          text-align: center;
          padding: 8px;
          font-size: 0.75rem;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        /* NAVIGATION */
        .glass-nav {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1.2rem 8%; background: rgba(5, 5, 5, 0.85);
          backdrop-filter: blur(12px); border-bottom: 1px solid var(--border);
          position: sticky; top: 0; z-index: 1000;
        }
        .logo { font-size: 1.6rem; font-weight: 800; letter-spacing: -0.5px; }
        .logo span { color: var(--accent); }
        .nav-links a { color: var(--text-dim); text-decoration: none; margin: 0 18px; font-size: 0.9rem; font-weight: 500; transition: 0.3s; }
        .nav-links a:hover { color: white; }

        /* BUTTONS */
        .btn-get-started {
          background: var(--accent); color: black; padding: 10px 24px;
          border-radius: 8px; border: none; cursor: pointer; font-weight: 700;
          box-shadow: 0 4px 15px rgba(0, 212, 255, 0.25); transition: 0.3s;
        }
        .btn-get-started:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0, 212, 255, 0.4); }
        .btn-login-link { background: none; border: none; color: white; margin-right: 15px; cursor: pointer; font-weight: 600; }

        /* HERO */
        .hero { text-align: center; padding: 100px 10% 100px; max-width: 1000px; margin: 0 auto; }
        .badge {
          display: inline-block; background: rgba(0, 212, 255, 0.1); color: var(--accent);
          padding: 6px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 800;
          border: 1px solid rgba(0, 212, 255, 0.2); margin-bottom: 25px;
        }
        .hero h1 { font-size: clamp(2.8rem, 7vw, 4.2rem); font-weight: 800; line-height: 1.1; margin: 0 0 25px; }
        .hero h1 span { color: var(--accent); }
        .hero p { color: var(--text-dim); font-size: 1.2rem; line-height: 1.6; max-width: 750px; margin: 0 auto 40px; }
        .hero-actions { display: flex; gap: 15px; justify-content: center; }
        .btn-video { background: #111; color: white; padding: 10px 24px; border-radius: 8px; border: 1px solid var(--border); cursor: pointer; font-weight: 600; }

        /* BENTO */
        .section-container { padding: 80px 8%; max-width: 1200px; margin: 0 auto; }
        .section-header { text-align: center; margin-bottom: 50px; }
        .section-header h2 { font-size: 2.5rem; margin-bottom: 10px; }
        .bento-container { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .bento-card { background: var(--card-bg); border: 1px solid #1f1f1f; padding: 35px; border-radius: 24px; transition: 0.3s; }
        .bento-card:hover { border-color: var(--accent); transform: translateY(-5px); }
        .bento-card .icon { font-size: 2.2rem; margin-bottom: 20px; display: block; }
        .wide { grid-column: span 2; }

        /* FEATURES SHOWCASE */
        .features-showcase { padding: 100px 8%; max-width: 1100px; margin: 0 auto; }
        .feature-row { display: flex; align-items: center; gap: 80px; margin-bottom: 120px; }
        .feature-row.reverse { flex-direction: row-reverse; }
        .feature-text { flex: 1; }
        .tag { color: var(--accent); font-weight: 800; font-size: 0.8rem; text-transform: uppercase; margin-bottom: 15px; }
        .feature-text h3 { font-size: 2.5rem; margin-bottom: 20px; }
        .feature-text p { color: var(--text-dim); font-size: 1.1rem; line-height: 1.7; }
        
        .feature-ui-box { flex: 1; height: 300px; background: #0a0a0a; border-radius: 24px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; }
        .ui-mockup-mic { text-align: center; color: var(--accent); font-weight: 800; font-size: 0.9rem; }
        .pulse-ring { width: 60px; height: 60px; background: var(--accent); border-radius: 50%; margin: 0 auto 20px; box-shadow: 0 0 20px var(--accent); opacity: 0.6; }
        .ui-voice-stack { display: flex; flex-direction: column; gap: 10px; width: 80%; }
        .v-item { background: #151515; padding: 15px; border-radius: 12px; font-size: 0.85rem; border: 1px solid #222; }
        .v-item.active { border-color: var(--accent); background: rgba(0, 212, 255, 0.05); }

        /* ECOSYSTEM */
        .ecosystem-cta { padding: 0 8% 100px; }
        .cta-inner { 
          background: linear-gradient(145deg, #0a0a0a 0%, #030303 100%); 
          border: 1px solid var(--border); border-radius: 40px; padding: 80px 40px; text-align: center; 
        }
        .stats-row { display: flex; justify-content: center; gap: 40px; margin: 40px 0; }
        .stat-item { color: var(--text-dim); font-weight: 600; }
        .stat-item span { display: block; color: var(--accent); font-size: 1.8rem; font-weight: 800; margin-bottom: 5px; }
        .btn-large { padding: 16px 40px; font-size: 1.1rem; }

        footer { text-align: center; padding: 60px 20px; border-top: 1px solid var(--border); color: #666; font-size: 0.85rem; line-height: 1.5; }
        .disclaimer { max-width: 800px; margin: 20px auto 0; }
        .not-affiliated { color: #444; font-size: 0.75rem; }

/* MOBILE FIXES */
        @media (max-width: 800px) {
          /* Navbar fixes from before */
          .glass-nav { 
            padding: 1rem 5%; 
            gap: 10px;
          }
          .nav-links { display: none; }
          .auth-buttons { gap: 8px; }
          .btn-login-link { font-size: 0.85rem; padding: 8px; margin: 0; }
          .btn-get-started { padding: 8px 16px; font-size: 0.85rem; }

          /* Bento Grid Fixes */
          .bento-container { 
            grid-template-columns: 1fr !important; /* Force single column */
            gap: 16px; 
          }
          
          .bento-card {
            grid-column: span 1 !important; /* Reset the 'wide' cards */
            padding: 25px; /* Slightly less padding for small screens */
            height: auto; /* Prevents vertical stretching */
          }

          .wide { 
            grid-column: span 1 !important; 
          }

          /* General Layout cleanup */
          .hero h1 { font-size: 2.2rem; }
          .section-container { padding: 40px 5%; }
          .section-header h2 { font-size: 2rem; }
          .feature-row, .feature-row.reverse { flex-direction: column; text-align: center; gap: 30px; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;