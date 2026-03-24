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

  // --- NEW VIDEO VAULT STATE ---
  const [videos, setVideos] = useState([]);
  const [fetchingVideos, setFetchingVideos] = useState(false);

  const holdTimerRef = useRef(null);
  const isProcessingAction = useRef(false);

  useEffect(() => {
    initializeDashboard();
    fetchInvites();
  }, []);

  // REFINED REAL-TIME LOGIC
  useEffect(() => {
    if (!homeId) return;

    // Fetch videos for this specific home folder
    fetchAllVideos();

    const eventChannel = supabase
      .channel(`events-${homeId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'events',
          filter: `home_id=eq.${homeId}` 
        }, 
        (payload) => {
          setEvents((prev) => {
            if (prev.some(e => e.id === payload.new.id)) return prev;
            return [payload.new, ...prev].slice(0, 4);
          });
        }
      )
      .subscribe();

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

  // --- NEW FETCH VIDEOS LOGIC ---
  async function fetchAllVideos() {
    if (!homeId) return;
    setFetchingVideos(true);
    try {
      // 1. List files inside the folder named after the homeId
      const { data: files, error: listError } = await supabase.storage
        .from('camera-video')
        .list(homeId, {
          limit: 20,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (listError) throw listError;

      if (files && files.length > 0) {
        // Filter out any non-video files or placeholders
        const videoFiles = files.filter(f => f.name.endsWith('.mp4') || f.name.endsWith('.mov'));
        const videoPaths = videoFiles.map(f => `${homeId}/${f.name}`);

        // 2. Create Signed URLs for private access
        const { data: signedUrls, error: signedError } = await supabase.storage
          .from('camera-video')
          .createSignedUrls(videoPaths, 3600); // 1 hour link

        if (signedError) throw signedError;

        const videosWithLinks = videoFiles.map((file, index) => ({
          ...file,
          url: signedUrls[index].signedUrl
        }));

        setVideos(videosWithLinks);
      } else {
        setVideos([]);
      }
    } catch (err) {
      console.error("Video fetch error:", err);
    } finally {
      setFetchingVideos(false);
    }
  }

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
      await supabase.from('events').insert([{ type: actionName, home_id: homeId }]);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => { isProcessingAction.current = false; }, 1500);
    }
  }

  const startHold = () => {
    if (isProcessingAction.current) return;
    setIsHolding(true);
    const duration = 1200; 
    const interval = 10;
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
        
        /* VIDEO VAULT STYLES */
        .video-vault { background: #0f0f0f; border-radius: 24px; padding: 25px; margin-top: 25px; border: 1px solid #1f1f1f; }
        .vault-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .video-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 15px; max-height: 350px; overflow-y: auto; padding-right: 5px; }
        .video-item { background: #141414; border-radius: 16px; overflow: hidden; border: 1px solid #222; cursor: pointer; transition: 0.2s; position: relative; }
        .video-item:hover { border-color: #00d4ff; transform: translateY(-3px); }
        .video-item video { width: 100%; aspect-ratio: 1; object-fit: cover; opacity: 0.6; }
        .video-item:hover video { opacity: 1; }
        .vid-info { padding: 10px; }
        .vid-info p { margin: 0; font-size: 0.7rem; font-weight: 600; }
        .vid-badge { position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,0.6); padding: 2px 6px; border-radius: 4px; font-size: 0.6rem; color: #00d4ff; }

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

          {/* NEW CAPTURED CLIPS VAULT */}
          <div className="video-vault">
            <div className="vault-header">
               <h3 style={{margin:0}}>📁 Captured Clips</h3>
               <button onClick={fetchAllVideos} style={{background:'none', border:'none', color:'#00d4ff', cursor:'pointer', fontSize:'0.8rem'}}>Refresh</button>
            </div>
            <div className="video-grid">
               {fetchingVideos ? <p style={{color:'#444'}}>Scanning Vault...</p> : 
                videos.length === 0 ? <p style={{color:'#444', fontSize:'0.8rem'}}>No clips found for this home.</p> :
                videos.map((vid, i) => (
                  <div key={i} className="video-item" onClick={() => window.open(vid.url, '_blank')}>
                    <span className="vid-badge">REC</span>
                    <video src={vid.url} preload="metadata" />
                    <div className="vid-info">
                       <p>{new Date(vid.created_at).toLocaleDateString()}</p>
                       <p style={{color:'#64748b'}}>{new Date(vid.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p>
                    </div>
                  </div>
                ))
               }
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