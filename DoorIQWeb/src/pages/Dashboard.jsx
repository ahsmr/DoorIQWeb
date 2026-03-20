import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient.js';

export default function Dashboard({ onNavigate }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unlockProgress, setUnlockProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [homeId, setHomeId] = useState(null); 
  const [invites, setInvites] = useState([]); // NEW: Pending invites state

  const holdTimerRef = useRef(null);

  useEffect(() => {
    initializeDashboard();
    fetchInvites();

    // Listener for Events (Existing)
    const eventChannel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'events' }, 
        (payload) => {
          setEvents((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    // NEW: Listener for Invitations
    const inviteChannel = supabase
      .channel('invite-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'home_members' }, 
        () => fetchInvites() 
      )
      .subscribe();

    return () => {
      supabase.removeChannel(eventChannel);
      supabase.removeChannel(inviteChannel);
    };
  }, []);

  async function initializeDashboard() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: membership } = await supabase
        .from('home_members')
        .select('home_id')
        .eq('user_id', user.id)
        .eq('status', 'active') // Only fetch if they are ACTIVE
        .maybeSingle();

      if (membership) {
        setHomeId(membership.home_id);
        await fetchEvents(membership.home_id);
      } else {
        setHomeId(null);
      }
    } catch (err) {
      console.error("Init error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchInvites() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase
      .from('home_members')
      .select('id, homes(name)')
      .eq('user_id', user.id)
      .eq('status', 'pending');
    setInvites(data || []);
  }

  async function handleAcceptInvite(membershipId) {
    setLoading(true);
    const { error } = await supabase
      .from('home_members')
      .update({ status: 'active' })
      .eq('id', membershipId);

    if (!error) {
      setInvites([]);
      initializeDashboard(); // This unlocks the dashboard immediately
    } else {
      alert(error.message);
    }
    setLoading(false);
  }

  async function fetchEvents(id) {
    const { data } = await supabase
      .from('events')
      .select('*')
      .eq('home_id', id)
      .order('created_at', { ascending: false })
      .limit(4);
    if (data) setEvents(data);
  }

  async function triggerAction(actionName) {
    if (!homeId) return alert("Access Denied: Join a home first.");
    setLoading(true);
    await supabase.from('events').insert([{ type: actionName, home_id: homeId }]);
    setLoading(false);
  }

  const handleStart = (e, type) => {
    if (e.type === 'touchstart') e.preventDefault();
    if (type === 'unlock') startHold();
    else if (type === 'mic') setIsRecording(true);
  };

  const handleEnd = (type) => {
    if (type === 'unlock') resetHold();
    else if (type === 'mic') setIsRecording(false);
  };

  const startHold = () => {
    setIsHolding(true);
    const step = (100 / (1500 / 50));
    holdTimerRef.current = setInterval(() => {
      setUnlockProgress((prev) => {
        if (prev >= 100) {
          clearInterval(holdTimerRef.current);
          triggerAction('unlock');
          return 100;
        }
        return prev + step;
      });
    }, 50);
  };

  const resetHold = () => {
    clearInterval(holdTimerRef.current);
    setIsHolding(false);
    setUnlockProgress(0);
  };

  return (
    <div className="dashboard-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap');
        .dashboard-wrapper { min-height: 100vh; background: #050505; color: white; font-family: 'Plus Jakarta Sans', sans-serif; padding: 20px 5%; }
        .dash-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .logo { font-size: 1.5rem; font-weight: 800; }
        .logo span { color: #00d4ff; }
        .settings-btn { background: #111; border: 1px solid #222; padding: 10px; border-radius: 12px; cursor: pointer; font-size: 1.2rem; }
        
        /* NOTIFICATION STYLES */
        .invite-notification { background: linear-gradient(90deg, #00d4ff15, #0a0a0a); border: 1px solid #00d4ff44; border-radius: 20px; padding: 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; animation: slideDown 0.5s ease; }
        @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .invite-info { display: flex; align-items: center; gap: 15px; }
        .invite-actions { display: flex; gap: 10px; }
        .btn-accept { background: #00d4ff; color: black; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 800; cursor: pointer; }
        .btn-later { background: transparent; color: #64748b; border: 1px solid #222; padding: 10px 20px; border-radius: 10px; cursor: pointer; }

        .main-content { display: grid; grid-template-columns: 1.5fr 1fr; gap: 30px; }
        .video-card { background: #000; border-radius: 24px; position: relative; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); aspect-ratio: 16/9; }
        .video-feed { height: 100%; display: flex; align-items: center; justify-content: center; color: #444; }
        .mic-card { background: #0f0f0f; margin-top: 20px; border-radius: 24px; padding: 30px; text-align: center; border: 1px solid #1f1f1f; }
        .record-ring { width: 60px; height: 60px; margin: 0 auto 10px; border-radius: 50%; background: #222; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
        .record-ring.active { background: #00d4ff; box-shadow: 0 0 20px #00d4ff; }
        .mic-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
        .hold-btn { width: 100%; height: 70px; background: #111; border: 1px solid #222; border-radius: 16px; position: relative; overflow: hidden; cursor: pointer; color: white; font-weight: 800; }
        .progress-bar { position: absolute; left: 0; top: 0; height: 100%; background: #00d4ff; opacity: 0.6; transition: 0.05s linear; }
        .btn-label { position: relative; z-index: 2; }
        .btn-alarm { width: 100%; margin-top: 15px; padding: 15px; border-radius: 16px; border: 1px solid #420000; background: #210000; color: #ff4d4d; font-weight: 700; cursor: pointer; }
        .activity-card { background: #0f0f0f; border-radius: 24px; padding: 25px; margin-top: 30px; border: 1px solid #1f1f1f; }
        .log-item { display: flex; align-items: center; gap: 15px; padding: 12px 0; border-bottom: 1px solid #1f1f1f; }
        @media (max-width: 900px) { .main-content { grid-template-columns: 1fr; } }
      `}</style>

      <nav className="dash-nav">
        <div className="logo">Door<span>IQ</span></div>
        <button className="settings-btn" onClick={onNavigate}>⚙️</button>
      </nav>

      <div className="main-content">
        {/* INVITE BANNER */}
        {invites.length > 0 && (
          <div className="invite-notification">
            <div className="invite-info">
              <span>📩</span>
              <div>
                <p style={{margin:0, fontWeight:800}}>New Home Invitation</p>
                <p style={{margin:0, fontSize: '0.8rem', color: '#64748b'}}>Join <b>{invites[0].homes.name}</b>?</p>
              </div>
            </div>
            <div className="invite-actions">
              <button className="btn-accept" onClick={() => handleAcceptInvite(invites[0].id)}>Accept</button>
              <button className="btn-later" onClick={() => setInvites([])}>Ignore</button>
            </div>
          </div>
        )}

        {/* LEFT COLUMN: VIDEO & MIC */}
        <div className="stream-section" style={{opacity: homeId ? 1 : 0.3, pointerEvents: homeId ? 'all' : 'none'}}>
          <div className="video-card">
            <div className="video-feed">
                {homeId ? <p>Raspberry Pi Camera Stream</p> : <p>Connect to a home to view stream</p>}
            </div>
          </div>
          <div className="mic-card">
            <div className={`record-ring ${isRecording ? 'active' : ''}`}>
               <button 
                onMouseDown={(e) => handleStart(e, 'mic')} 
                onMouseUp={() => handleEnd('mic')}
                className="mic-btn"
              >🎤</button>
            </div>
            <p>{isRecording ? "TRANSMITTING..." : "HOLD TO TALK"}</p>
          </div>
        </div>

        {/* RIGHT COLUMN: CONTROLS */}
        <div className="control-section">
          {!homeId ? (
            <div className="setup-notice" style={{textAlign: 'center', padding: '40px', background: '#0a0a0a', borderRadius: '24px', border: '1px dashed #333'}}>
              <h3>No Home Found</h3>
              <p style={{color: '#64748b'}}>Please go to settings to create a home or wait for an invitation.</p>
              <button onClick={onNavigate} className="btn-accept">Open Settings</button>
            </div>
          ) : (
            <>
              <div className="unlock-container">
                 <button className={`hold-btn ${unlockProgress === 100 ? 'granted' : ''}`} onMouseDown={(e) => handleStart(e, 'unlock')} onMouseUp={() => handleEnd('unlock')}>
                    <div className="progress-bar" style={{ width: `${unlockProgress}%` }}></div>
                    <span className="btn-label">{unlockProgress >= 100 ? "ACCESS GRANTED" : "HOLD TO UNLOCK"}</span>
                 </button>
              </div>
              <button className="btn-alarm" onClick={() => triggerAction('alarm')}>🚨 ALERT ALARM</button>
              <div className="activity-card">
                <h3>Recent Activity</h3>
                <div className="log-list">
                  {events.map((event) => (
                    <div key={event.id} className="log-item">
                      <span className="log-icon">{event.type === 'unlock' ? '🔓' : '🚨'}</span>
                      <div className="log-info">
                        <p style={{margin:0, fontWeight:700}}>{event.type.toUpperCase()}</p>
                        <p style={{margin:0, fontSize: '0.7rem', color: '#64748b'}}>{new Date(event.created_at).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}