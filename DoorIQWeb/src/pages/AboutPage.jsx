import React from 'react';

const AboutPage = ({ onBack }) => {
  const teamMembers = [
    "Robbe Piessens", "Amir Hossein Saber Moghaddam Ranjbar", "Jonas Van Oevelen",
    "Arnaud Vanstraelen", "Louis Verloo", "Kangyu Zhao"
  ];

  return (
    <div className="about-wrapper">
      {/* Navigation */}
      <nav className="glass-nav">
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.png" alt="DoorIQ Icon" style={{ height: '32px', width: 'auto' }} />
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            Door<span style={{ color: '#00d2ff' }}>IQ</span>
          </div>
        </div>
        <div className="auth-buttons">
          <button onClick={onBack} className="btn-get-started">Back to Home</button>
        </div>
      </nav>

      {/* Hero */}
      <header className="hero">
        <div className="badge">KU Leuven • Group Project</div>
        <h1>Innovation through <span>Collaboration</span>.</h1>
        <p>
          A unified approach to IoT security, developed by a dedicated team of 
          six Computer Science students for the P&O II curriculum.
        </p>
      </header>

      {/* Team & Hardware Section */}
      <section className="section-container">
        <div className="about-grid">
          
          {/* Unified Team Card */}
          <div className="bento-card team-card">
            <div className="icon">👥</div>
            <h3>The Team</h3>
            <div className="team-list">
              {teamMembers.map((name, index) => (
                <span key={index} className="team-name">{name}</span>
              ))}
            </div>
          </div>

          {/* Contact Card */}
          <div className="bento-card contact-card">
            <div className="icon">✉️</div>
            <h3>Get in Touch</h3>
            <p>For inquiries regarding the DoorIQ prototype or technical documentation:</p>
            <a href="mailto:yourprojectemail@example.com" className="email-link">
              dooriqproject@gmail.com
            </a>
          </div>

          {/* 3D Modeling Gallery */}
          <div className="bento-card wide gallery-card">
            <div className="gallery-header">
              <div className="icon">🛠️</div>
              <div>
                <h3>Hardware Design</h3>
                <p>Casing designed in SolidEdge and optimized for Raspberry Pi Zero 2W integration.</p>
              </div>
            </div>
            
            <div className="hardware-display">
              {/* Replace these src paths with your actual 3D render screenshots */}
              <div className="render-box">
                <img src="/path-to-render1.png" alt="3D Casing Front View" />
                <span>3D Case Render</span>
              </div>
              <div className="render-box">
                <img src="/path-to-render2.png" alt="Exploded View" />
                <span>Assembly View</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      <style jsx>{`
        .about-wrapper {
          background-color: #050505;
          background-image: radial-gradient(circle at 50% 0%, rgba(0, 212, 255, 0.05) 0%, transparent 50%);
          color: white;
          font-family: 'Plus Jakarta Sans', sans-serif;
          min-height: 100vh;
        }

        .glass-nav {
          display: flex; justify-content: space-between; align-items: center;
          padding: 1.2rem 8%; background: rgba(5, 5, 5, 0.85);
          backdrop-filter: blur(12px); border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          position: sticky; top: 0; z-index: 1000;
        }

        .btn-get-started {
          background: #00d4ff; color: black; padding: 10px 24px;
          border-radius: 8px; border: none; cursor: pointer; font-weight: 700;
          box-shadow: 0 4px 15px rgba(0, 212, 255, 0.25); transition: 0.3s;
        }

        .hero { text-align: center; padding: 80px 10% 40px; max-width: 1000px; margin: 0 auto; }
        .hero h1 { font-size: clamp(2.5rem, 6vw, 3.8rem); font-weight: 800; line-height: 1.1; margin-bottom: 20px; }
        .hero h1 span { color: #00d4ff; }
        .hero p { color: #94a3b8; font-size: 1.2rem; line-height: 1.6; }

        .section-container { padding: 40px 8% 80px; max-width: 1200px; margin: 0 auto; }
        
        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .bento-card {
          background: #0f0f0f;
          border: 1px solid #1f1f1f;
          padding: 40px;
          border-radius: 24px;
          transition: 0.3s ease;
        }

        .team-card .team-list {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 20px;
        }

        .team-name {
          background: rgba(255, 255, 255, 0.05);
          padding: 8px 16px;
          border-radius: 100px;
          font-size: 0.9rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .email-link {
          display: inline-block;
          margin-top: 15px;
          color: #00d4ff;
          text-decoration: none;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .wide { grid-column: span 2; }

        .gallery-header { display: flex; gap: 20px; align-items: center; margin-bottom: 30px; }
        .gallery-header h3 { margin: 0; }
        .gallery-header p { margin: 5px 0 0; color: #94a3b8; }

        .hardware-display {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .render-box {
          background: #050505;
          border-radius: 16px;
          padding: 15px;
          text-align: center;
          border: 1px solid #1f1f1f;
        }

        .render-box img {
          width: 100%;
          border-radius: 8px;
          margin-bottom: 10px;
          filter: grayscale(0.2) contrast(1.1);
          transition: 0.4s;
        }

        .render-box:hover img { filter: grayscale(0); transform: scale(1.02); }

        .render-box span { font-size: 0.8rem; color: #666; text-transform: uppercase; letter-spacing: 1px; }

        @media (max-width: 850px) {
          .about-grid { grid-template-columns: 1fr; }
          .wide { grid-column: span 1; }
          .hardware-display { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default AboutPage;