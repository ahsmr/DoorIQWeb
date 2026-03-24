import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient.js';

export default function Dashboard({ onNavigate }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unlockProgress, setUnlockProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [homeId, setHomeId] = useState(null); 
  const [invites, setInvites] = useState([]);

  const holdTimerRef = useRef(null);
  const isProcessingAction = useRef(false);

  useEffect(() => {
    initializeDashboard();
    fetchInvites();
  }, []);

  // REFINED REAL-TIME LOGIC
  useEffect(() => {
    if (!homeId) return;

    // Listen for new events (Unlocks/Alarms)
    const eventChannel = supabase
      .channel(`events-${homeId}`) // Unique channel name per home
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'events',
          filter: `home_id=eq.${homeId}` // Only listen for THIS home
        }, 
        (payload) => {
          setEvents((prev) => {
            // Check for duplicate ID to prevent UI glitches
            if (prev.some(e => e.id === payload.new.id)) return prev;
            // Add new event to top and keep only the latest 4
            return [payload.new, ...prev].slice(0, 4);
          });
        }
      )
      .subscribe();

    // Listen for invite changes (Status updates or new invites)
    const inviteChannel = supabase
      .channel(`invites-${homeId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'home_members' }, 
        () => fetchInvites() 
      )
      .subscribe();

    return () => {
      supabase.removeChannel(eventChannel);
      supabase.removeChannel(inviteChannel);
    };
  }, [homeId]);

  async function initializeDashboard() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: membership } = await supabase
        .from('home_members')
        .select('home_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (membership) {
        setHomeId(membership.home_id);
        fetchEvents(membership.home_id);
      }
    } catch (err) {
      console.error("Init error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchInvites() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('home_members')
      .select('id, homes(name)')
      .eq('user_id', user.id)
      .eq('status', 'pending');
    setInvites(data || []);
  }

  async function handleAcceptInvite(membershipId) {
    const { error } = await supabase
      .from('home_members')
      .update({ status: 'active' })
      .eq('id', membershipId);

    if (!error) {
      setInvites([]);
      initializeDashboard();
    }
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
    if (!homeId || isProcessingAction.current) return;
    isProcessingAction.current = true;
    
    try {
      // Insert to DB: This triggers the Realtime broadcast we set up earlier
      await supabase.from('events').insert([{ type: actionName, home_id: homeId }]);
    } catch (e) {
      console.error(e);
    } finally {
      // Cooldown to prevent spam
      setTimeout(() => { isProcessingAction.current = false; }, 1500);
    }
  }

  const startHold = () => {
    if (isProcessingAction.current) return;
    setIsHolding(true);
    
    const duration = 1200; 
    const interval = 10; // 100fps for smooth bar movement
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
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    setIsHolding(false);
    setUnlockProgress(0);
  };

  const handleStart = (e, type) => {
    if (e.type === 'touchstart') e.preventDefault();
    if (type === 'unlock') startHold();
    else if (type === 'mic') setIsRecording(true);
  };

  return (
    <div className="dashboard-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap');
        .dashboard-wrapper { min-height: 100vh; background: #050505; color: white; font-family: 'Plus Jakarta Sans', sans-serif; padding: 20px 5%; }
        .dash-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .logo { font-size: 1.5rem; font-weight: 800; letter-spacing: -1px; }
        .logo span { color: #00d4ff; }
        .settings-btn { background: #111; border: 1px solid #222; padding: 10px; border-radius: 12px; cursor: pointer; font-size: 1.2rem; color: white; transition: 0.2s; }
        .settings-btn:hover { border-color: #00d4ff; }
        
        .main-content { display: grid; grid-template-columns: 1.5fr 1fr; gap: 30px; }
        .video-card { background: #000; border-radius: 24px; position: relative; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); aspect-ratio: 16/9; }
        .video-feed { height: 100%; display: flex; align-items: center; justify-content: center; color: #444; }
        
        .mic-card { background: #0f0f0f; margin-top: 20px; border-radius: 24px; padding: 30px; text-align: center; border: 1px solid #1f1f1f; }
        .record-ring { width: 60px; height: 60px; margin: 0 auto 10px; border-radius: 50%; background: #222; display: flex; align-items: center; justify-content: center; transition: 0.3s; }
        .record-ring.active { background: #00d4ff; box-shadow: 0 0 20px #00d4ff; transform: scale(1.1); }
        .mic-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; }

        .hold-btn { width: 100%; height: 74px; background: #111; border: 1px solid #222; border-radius: 16px; position: relative; overflow: hidden; cursor: pointer; color: white; font-weight: 800; transition: transform 0.1s; }
        .hold-btn:active { transform: scale(0.98); }
        .progress-bar { position: absolute; left: 0; top: 0; height: 100%; background: #00d4ff; opacity: 0.8; transition: width 0.05s linear; }
        .btn-label { position: relative; z-index: 2; pointer-events: none; }
        
        .btn-alarm { width: 100%; margin-top: 15px; padding: 18px; border-radius: 16px; border: 1px solid #420000; background: #210000; color: #ff4d4d; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .btn-alarm:hover { background: #310000; }

        .activity-card { background: #0f0f0f; border-radius: 24px; padding: 25px; margin-top: 30px; border: 1px solid #1f1f1f; }
        .log-item { display: flex; align-items: center; gap: 15px; padding: 12px 0; border-bottom: 1px solid #1f1f1f; animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .invite-notification { background: linear-gradient(90deg, #00d4ff15, #0a0a0a); border: 1px solid #00d4ff44; border-radius: 20px; padding: 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; grid-column: span 2; }
        .btn-accept { background: #00d4ff; color: black; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 800; cursor: pointer; }

        @media (max-width: 900px) { .main-content { grid-template-columns: 1fr; } .invite-notification { grid-column: span 1; } }
      `}</style>

      <nav className="dash-nav">
        <div className="logo">Door<span>IQ</span></div>
        <button className="settings-btn" onClick={onNavigate}>⚙️</button>
      </nav>

      <div className="main-content">
        {invites.length > 0 && (
          <div className="invite-notification">
            <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
              <span>📩</span>
              <div>
                <p style={{margin:0, fontWeight:800}}>New Home Invitation</p>
                <p style={{margin:0, fontSize: '0.8rem', color: '#64748b'}}>Join <b>{invites[0].homes.name}</b>?</p>
              </div>
            </div>
            <div style={{display: 'flex', gap: '10px'}}>
              <button className="btn-accept" onClick={() => handleAcceptInvite(invites[0].id)}>Accept</button>
              <button style={{background: 'transparent', color: '#64748b', border: '1px solid #222', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer'}} onClick={() => setInvites([])}>Ignore</button>
            </div>
          </div>
        )}

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
                onMouseUp={() => setIsRecording(false)}
                onMouseLeave={() => setIsRecording(false)}
                className="mic-btn"
              >🎤</button>
            </div>
            <p style={{fontWeight: 700, fontSize: '0.9rem', color: isRecording ? '#00d4ff' : '#666'}}>
              {isRecording ? "TRANSMITTING..." : "HOLD TO TALK"}
            </p>
          </div>
        </div>

        <div className="control-section">
          {!homeId ? (
            <div style={{textAlign: 'center', padding: '40px', background: '#0a0a0a', borderRadius: '24px', border: '1px dashed #333'}}>
              <h3>No Home Found</h3>
              <p style={{color: '#64748b', marginBottom: '20px'}}>Please go to settings to create a home or wait for an invitation.</p>
              <button onClick={onNavigate} className="btn-accept">Open Settings</button>
            </div>
          ) : (
            <>
              <div className="unlock-container">
                 <button 
                    className="hold-btn" 
                    onMouseDown={(e) => handleStart(e, 'unlock')} 
                    onMouseUp={resetHold}
                    onMouseLeave={resetHold}
                  >
                    <div className="progress-bar" style={{ width: `${unlockProgress}%` }}></div>
                    <span className="btn-label">
                      {unlockProgress >= 100 ? "ACCESS GRANTED" : "HOLD TO UNLOCK"}
                    </span>
                 </button>
              </div>
              <button className="btn-alarm" onClick={() => triggerAction('alarm')}>🚨 ALERT ALARM</button>
              
              <div className="activity-card">
                <h3 style={{marginTop: 0, marginBottom: 20}}>Recent Activity</h3>
                <div className="log-list">
                  {events.length === 0 ? (
                    <p style={{color: '#444', fontSize: '0.9rem'}}>No recent activity</p>
                  ) : (
                    events.map((event) => (
                      <div key={event.id} className="log-item">
                        <span style={{fontSize: '1.2rem'}}>{event.type === 'unlock' ? '🔓' : '🚨'}</span>
                        <div className="log-info">
                          <p style={{margin:0, fontWeight:700}}>{event.type.toUpperCase()}</p>
                          <p style={{margin:0, fontSize: '0.75rem', color: '#64748b'}}>
                            {new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}