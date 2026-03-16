import React, { useState } from 'react';
import { supabase } from '../supabaseClient.js';

export default function SettingPage({ onNavigate }) {
  const [irEnabled, setIrEnabled] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert(error.message);
  };

  return (
    <div className="settings-wrapper">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap');
      </style>

      {/* Header */}
      <nav className="settings-nav">
        <div className="logo">Door<span>IQ</span></div>
        <button onClick={onNavigate} className="back-link">
          ✕ Close
        </button>
      </nav>

      <div className="settings-content">
        <header className="page-title">
          <h1>System Settings</h1>
          <p>Configure your IoT node and account security.</p>
        </header>

        {/* Hardware Configuration Section */}
        <section className="settings-card">
          <div className="card-header">
            <span className="icon">📟</span>
            <h3>Hardware Configuration</h3>
          </div>
          
          <div className="setting-row">
            <div className="setting-info">
              <span className="label">Infrared (IR) Mode</span>
              <span className="desc">Enable night vision for the Pi Camera.</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={irEnabled} onChange={() => setIrEnabled(!irEnabled)} />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="setting-row">
            <div className="setting-info">
              <span className="label">Real-time Notifications</span>
              <span className="desc">Push alerts when motion is detected.</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={alertsEnabled} onChange={() => setAlertsEnabled(!alertsEnabled)} />
              <span className="slider round"></span>
            </label>
          </div>
        </section>

        {/* Home Section */}
        <section className="settings-card">
          <div className="card-header">
            <span className="icon">🏠</span>
            <h3>Home & Ecosystem</h3>
          </div>
          <button className="menu-item">Device Pairing (Pi Node-01)</button>
          <button className="menu-item">Delivery & Guest Access</button>
          <button className="menu-item">Network Diagnostics</button>
        </section>

        {/* Danger Zone */}
        <div className="action-footer">
          <button onClick={handleSignOut} className="btn-logout">
            Terminate Session (Sign Out)
          </button>
          <p className="version">DoorIQ v1.0.4 | Secure IoT Link</p>
        </div>
      </div>

      <style jsx>{`
        .settings-wrapper {
          min-height: 100vh;
          background: #050505;
          color: white;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 20px 8%;
        }

        .settings-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .logo { font-size: 1.5rem; font-weight: 800; }
        .logo span { color: #00d4ff; }
        .back-link { background: none; border: none; color: #94a3b8; font-weight: 600; cursor: pointer; font-size: 0.9rem; }
        .back-link:hover { color: white; }

        .page-title { margin-bottom: 40px; }
        .page-title h1 { font-size: 2rem; font-weight: 800; margin: 0; }
        .page-title p { color: #64748b; margin: 5px 0 0; }

        .settings-card { 
          background: rgba(15, 15, 15, 0.6); 
          border: 1px solid #1f1f1f; 
          border-radius: 20px; 
          padding: 25px; 
          margin-bottom: 20px; 
        }

        .card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 25px; }
        .card-header .icon { font-size: 1.2rem; }
        .card-header h3 { font-size: 1rem; margin: 0; font-weight: 700; color: #f1f5f9; }

        /* Toggle & Row Design */
        .setting-row { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #1f1f1f; }
        .setting-row:last-child { border-bottom: none; }
        .setting-info { display: flex; flex-direction: column; }
        .label { font-weight: 600; font-size: 0.95rem; }
        .desc { font-size: 0.8rem; color: #64748b; }

        .menu-item { 
          width: 100%; text-align: left; background: none; border: none; 
          color: #94a3b8; padding: 15px 0; border-bottom: 1px solid #1f1f1f; 
          font-size: 0.95rem; cursor: pointer; transition: 0.2s;
        }
        .menu-item:hover { color: #00d4ff; padding-left: 5px; }

        /* Toggle Switch Styling */
        .switch { position: relative; display: inline-block; width: 44px; height: 24px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #222; transition: .4s; border-radius: 34px; }
        .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: #00d4ff; }
        input:checked + .slider:before { transform: translateX(20px); }

        .action-footer { margin-top: 50px; text-align: center; }
        .btn-logout { background: #111; color: #ff4d4d; border: 1px solid #420000; padding: 12px 30px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.3s; }
        .btn-logout:hover { background: #420000; }
        .version { color: #334155; font-size: 0.75rem; margin-top: 20px; font-weight: 600; }
      `}</style>
    </div>
  );
}