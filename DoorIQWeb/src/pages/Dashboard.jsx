import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient.js';

export default function Dashboard({ onNavigate }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unlockProgress, setUnlockProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [homeId, setHomeId] = useState(null); // Added to track current home

  const holdTimerRef = useRef(null);

  useEffect(() => {
    initializeDashboard();
    
    // Real-time subscription to see updates immediately
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

  async function initializeDashboard() {
    setLoading(true);
    try {
      // 1. Get the user's home membership first
      const { data: membership, error: memError } = await supabase
        .from('home_members')
        .select('home_id')
        .limit(1)
        .single();

      if (memError) throw memError;

      if (membership) {
        setHomeId(membership.home_id);
        // 2. Fetch events specifically for this home
        await fetchEvents(membership.home_id);
      }
    } catch (err) {
      console.error("Error initializing dashboard:", err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchEvents(id) {
    const targetId = id || homeId;
    if (!targetId) return;

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('home_id', targetId)
      .order('created_at', { ascending: false })
      .limit(4);
    
    if (data) setEvents(data);
  }

  // --- Hold Logic ---
  const handleStart = (e, type) => {
    if (e.type === 'touchstart') e.preventDefault();
    if (type === 'unlock') {
      startHold();
    } else if (type === 'mic') {
      setIsRecording(true);
    }
  };

  const handleEnd = (type) => {
    if (type === 'unlock') {
      resetHold();
    } else if (type === 'mic') {
      setIsRecording(false);
    }
  };

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

  async function triggerAction(actionName) {
    if (!homeId) {
      alert("Error: No home linked to this account.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('events').insert([
      { 
        type: actionName, 
        home_id: homeId, // Critical: Policy requires home_id
        metadata: { source: 'web_dashboard' } 
      }
    ]);
    
    if (error) alert(error.message);
    setLoading(false);
  }

  return (
    <div className="dashboard-wrapper">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap');
      </style>

      <nav className="dash-nav">
        <div className="logo">Door<span>IQ</span></div>
        <button className="settings-btn" onClick={onNavigate}>⚙️</button>
      </nav>

      <div className="main-content">
        <div className="stream-section">
          <div className="video-card">
            <div className="live-badge"><span>•</span> LIVE</div>
            <div className="ir-badge">🌙 IR ACTIVE</div>
            <div className="video-feed">
               <p>Raspberry Pi Camera Stream</p>
            </div>
          </div>

          <div className="mic-card">
            <div className={`record-ring ${isRecording ? 'active' : ''}`}>
               <button 
                onMouseDown={(e) => handleStart(e, 'mic')} 
                onMouseUp={() => handleEnd('mic')}
                onTouchStart={(e) => handleStart(e, 'mic')}
                onTouchEnd={() => handleEnd('mic')}
                className="mic-btn"
              >
                🎤
              </button>
            </div>
            <p>{isRecording ? "TRANSMITTING..." : "HOLD TO TALK"}</p>
          </div>
        </div>

        <div className="control-section">
          <div className="unlock-container">
             <button 
                className={`hold-btn ${unlockProgress === 100 ? 'granted' : ''}`}
                onMouseDown={(e) => handleStart(e, 'unlock')}
                onMouseUp={() => handleEnd('unlock')}
                onMouseLeave={() => handleEnd('unlock')}
                onTouchStart={(e) => handleStart(e, 'unlock')}
                onTouchEnd={() => handleEnd('unlock')}
                onContextMenu={(e) => e.preventDefault()}
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
            <h3>Recent Activity {loading && "..."}</h3>
            <div className="log-list">
              {events.length === 0 && <p style={{color: '#444', fontSize: '0.8rem'}}>No recent activity</p>}
              {events.map((event) => (
                <div key={event.id} className="log-item">
                  <span className="log-icon">
                    {event.type === 'unlock' ? '🔓' : 
                     event.type === 'alarm' ? '🚨' : 
                     event.type === 'motion' ? '🏃' : '🔔'}
                  </span>
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
          user-select: none; 
          -webkit-user-select: none;
        }
        .dash-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .logo { font-size: 1.5rem; font-weight: 800; }
        .logo span { color: #00d4ff; }
        .settings-btn { background: #111; border: 1px solid #222; padding: 10px; border-radius: 12px; cursor: pointer; font-size: 1.2rem; transition: 0.3s; }
        .main-content { display: grid; grid-template-columns: 1.5fr 1fr; gap: 30px; }
        .video-card { background: #000; border-radius: 24px; position: relative; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); aspect-ratio: 16/9; }
        .video-feed { height: 100%; display: flex; align-items: center; justify-content: center; color: #444; }
        .live-badge { position: absolute; top: 15px; left: 15px; background: rgba(255,0,0,0.8); padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 800; }
        .ir-badge { position: absolute; top: 15px; right: 15px; background: rgba(0,212,255,0.2); color: #00d4ff; padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 800; border: 1px solid #00d4ff; }
        .mic-card { background: #0f0f0f; margin-top: 20px; border-radius: 24px; padding: 30px; text-align: center; border: 1px solid #1f1f1f; }
        .record-ring { width: 60px; height: 60px; margin: 0 auto 10px; border-radius: 50%; background: #222; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
        .record-ring.active { background: #00d4ff; box-shadow: 0 0 20px #00d4ff; transform: scale(1.1); }
        .mic-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; outline: none; -webkit-tap-highlight-color: transparent; }
        .hold-btn { width: 100%; height: 70px; background: #111; border: 1px solid #222; border-radius: 16px; position: relative; overflow: hidden; cursor: pointer; color: white; font-weight: 800; font-size: 1rem; outline: none; -webkit-tap-highlight-color: transparent; }
        .progress-bar { position: absolute; left: 0; top: 0; height: 100%; background: #00d4ff; transition: 0.05s linear; opacity: 0.6; pointer-events: none; }
        .btn-label { position: relative; z-index: 2; pointer-events: none; }
        .hold-btn.granted { background: #00d4ff; color: black; }
        .btn-alarm { width: 100%; margin-top: 15px; padding: 15px; border-radius: 16px; border: 1px solid #420000; background: #210000; color: #ff4d4d; font-weight: 700; cursor: pointer; }
        .activity-card { background: #0f0f0f; border-radius: 24px; padding: 25px; margin-top: 30px; border: 1px solid #1f1f1f; }
        .activity-card h3 { font-size: 0.9rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
        .log-item { display: flex; align-items: center; gap: 15px; padding: 12px 0; border-bottom: 1px solid #1f1f1f; }
        .log-icon { font-size: 1.2rem; }
        .log-type { font-weight: 700; font-size: 0.85rem; margin: 0; }
        .log-time { color: #64748b; font-size: 0.75rem; margin: 0; }
        @media (max-width: 900px) { .main-content { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}