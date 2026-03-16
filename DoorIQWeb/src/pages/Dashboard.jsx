import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient.js';

export default function Dashboard({ onNavigate }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unlockProgress, setUnlockProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const holdTimerRef = useRef(null);

  useEffect(() => {
    fetchEvents();
    
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'events' }, 
        (payload) => {
          setEvents((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // --- Hold to Unlock Logic ---
  const startHold = () => {
    setIsHolding(true);
    const duration = 1500; 
    const interval = 50;
    const step = (100 / (duration / interval));

    holdTimerRef.current = setInterval(() => {
      setUnlockProgress((prev) => {
        if (prev >= 100) {
          clearInterval(holdTimerRef.current);
          triggerAction('unlock');
          return 100;
        }
        return prev + step;
      });
    }, interval);
  };

  const resetHold = () => {
    clearInterval(holdTimerRef.current);
    setIsHolding(false);
    setUnlockProgress(0);
  };

  async function fetchEvents() {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(4);
    if (data) setEvents(data);
  }

  async function triggerAction(actionName) {
    setLoading(true);
    const { error } = await supabase.from('events').insert([
      { type: actionName, metadata: { source: 'web_dashboard' } }
    ]);
    if (error) alert(error.message);
    setLoading(false);
  }

  return (
    <div className="dashboard-wrapper">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap');
      </style>

      {/* Top Navigation */}
      <nav className="dash-nav">
        <div className="logo">Door<span>IQ</span></div>
        <button className="settings-btn" onClick={onNavigate}>⚙️</button>
      </nav>

      <div className="main-content">
        {/* Left Column: Camera & Voice */}
        <div className="stream-section">
          <div className="video-card">
            <div className="live-badge"><span>•</span> LIVE</div>
            <div className="ir-badge">🌙 IR ACTIVE</div>
            {/* Placeholder for your Raspberry Pi Stream */}
            <div className="video-feed">
               <p>Raspberry Pi Camera Stream</p>
            </div>
          </div>

          <div className="mic-card">
            <div className={`record-ring ${isRecording ? 'active' : ''}`}>
               <button 
                onMouseDown={() => setIsRecording(true)} 
                onMouseUp={() => setIsRecording(false)}
                className="mic-btn"
              >
                🎤
              </button>
            </div>
            <p>{isRecording ? "TRANSMITTING AUDIO..." : "HOLD TO TALK"}</p>
          </div>
        </div>

        {/* Right Column: Controls & Activity */}
        <div className="control-section">
          <div className="unlock-container">
             <button 
                className={`hold-btn ${unlockProgress === 100 ? 'granted' : ''}`}
                onMouseDown={startHold}
                onMouseUp={resetHold}
                onMouseLeave={resetHold}
             >
                <div className="progress-bar" style={{ width: `${unlockProgress}%` }}></div>
                <span className="btn-label">
                  {unlockProgress >= 100 ? "ACCESS GRANTED" : "HOLD TO UNLOCK"}
                </span>
             </button>
          </div>

          <div className="secondary-actions">
            <button className="btn-alarm" onClick={() => triggerAction('alarm')}>🚨 ALERT ALARM</button>
          </div>

          <div className="activity-card">
            <h3>Recent Activity</h3>
            <div className="log-list">
              {events.map((event) => (
                <div key={event.id} className="log-item">
                  <span className="log-icon">{event.type === 'unlock' ? '🔓' : '🚨'}</span>
                  <div className="log-info">
                    <p className="log-type">{event.type.toUpperCase()}</p>
                    <p className="log-time">{new Date(event.created_at).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-wrapper {
          min-height: 100vh;
          background: #050505;
          color: white;
          font-family: 'Plus Jakarta Sans', sans-serif;
          padding: 20px 5%;
        }

        .dash-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .logo { font-size: 1.5rem; font-weight: 800; }
        .logo span { color: #00d4ff; }
        .settings-btn { background: #111; border: 1px solid #222; padding: 10px; border-radius: 12px; cursor: pointer; font-size: 1.2rem; transition: 0.3s; }
        .settings-btn:hover { background: #222; }

        .main-content { display: grid; grid-template-columns: 1.5fr 1fr; gap: 30px; }

        /* Video Feed */
        .video-card { 
          background: #000; border-radius: 24px; position: relative; overflow: hidden; 
          border: 1px solid rgba(255,255,255,0.1); aspect-ratio: 16/9; 
        }
        .video-feed { height: 100%; display: flex; align-items: center; justify-content: center; color: #444; }
        .live-badge { position: absolute; top: 15px; left: 15px; background: rgba(255,0,0,0.8); padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 800; }
        .ir-badge { position: absolute; top: 15px; right: 15px; background: rgba(0,212,255,0.2); color: #00d4ff; padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 800; border: 1px solid #00d4ff; }

        /* Mic Section */
        .mic-card { background: #0f0f0f; margin-top: 20px; border-radius: 24px; padding: 30px; text-align: center; border: 1px solid #1f1f1f; }
        .record-ring { width: 60px; height: 60px; margin: 0 auto 10px; border-radius: 50%; background: #222; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
        .record-ring.active { background: #00d4ff; box-shadow: 0 0 20px #00d4ff; transform: scale(1.1); }
        .mic-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; }

        /* Controls */
        .hold-btn { 
          width: 100%; height: 70px; background: #111; border: 1px solid #222; border-radius: 16px; 
          position: relative; overflow: hidden; cursor: pointer; color: white; font-weight: 800; font-size: 1rem;
        }
        .progress-bar { position: absolute; left: 0; top: 0; height: 100%; background: #00d4ff; transition: 0.05s linear; opacity: 0.6; }
        .btn-label { position: relative; z-index: 2; }
        .hold-btn.granted { background: #00d4ff; color: black; }

        .btn-alarm { width: 100%; margin-top: 15px; padding: 15px; border-radius: 16px; border: 1px solid #420000; background: #210000; color: #ff4d4d; font-weight: 700; cursor: pointer; transition: 0.3s; }
        .btn-alarm:hover { background: #420000; }

        /* Activity */
        .activity-card { background: #0f0f0f; border-radius: 24px; padding: 25px; margin-top: 30px; border: 1px solid #1f1f1f; }
        .activity-card h3 { font-size: 0.9rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
        .log-item { display: flex; align-items: center; gap: 15px; padding: 12px 0; border-bottom: 1px solid #1f1f1f; }
        .log-icon { font-size: 1.2rem; }
        .log-type { font-weight: 700; font-size: 0.85rem; margin: 0; }
        .log-time { color: #64748b; font-size: 0.75rem; margin: 0; }

        @media (max-width: 900px) {
          .main-content { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}