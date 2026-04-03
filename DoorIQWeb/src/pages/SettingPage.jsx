import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient.js';

export default function SettingPage({ onNavigate }) {
  // --- 1. STATE CONFIGURATION ---
  const [irEnabled, setIrEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Multi-home states
  const [userHomes, setUserHomes] = useState([]); 
  const [membersByHome, setMembersByHome] = useState({}); 
  const [pendingInvites, setPendingInvites] = useState([]); 
  
  // App Context State (Which home is the user currently viewing?)
  const [activeHomeId, setActiveHomeId] = useState(localStorage.getItem('activeDoorIQHome') || null);
  
  // Input states
  const [newHomeName, setNewHomeName] = useState('');
  const [inviteInputs, setInviteInputs] = useState({}); 
  const [editingHomeId, setEditingHomeId] = useState(null);
  const [editHomeName, setEditHomeName] = useState('');

  // Fetch all data when the page loads
  useEffect(() => {
    fetchInitialData();
  }, []);

  /**
   * --- 2. DATA LOADING ---
   */
  async function fetchInitialData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: homeMemberships } = await supabase
        .from('home_members')
        .select('id, role, status, homes(id, name)')
        .eq('user_id', user.id)
        .eq('status', 'active');

      if (homeMemberships && homeMemberships.length > 0) {
        setUserHomes(homeMemberships);
        
        // Default logic: If no active home is set, or the previously set one was deleted,
        // default to the first home in the list.
        const currentSavedHome = localStorage.getItem('activeDoorIQHome');
        const isSavedHomeStillValid = homeMemberships.some(m => m.homes.id === currentSavedHome);
        
        if (!currentSavedHome || !isSavedHomeStillValid) {
          const firstHomeId = homeMemberships[0].homes.id;
          setActiveHomeId(firstHomeId);
          localStorage.setItem('activeDoorIQHome', firstHomeId);
        }

        // Fetch members for each home
        homeMemberships.forEach(membership => {
          fetchHomeMembers(membership.homes.id);
        });
      } else {
        setUserHomes([]);
        setActiveHomeId(null);
        localStorage.removeItem('activeDoorIQHome');
      }

      // Check for pending invites
      const { data: invites } = await supabase
        .from('home_members')
        .select('id, homes(name)')
        .eq('user_id', user.id)
        .eq('status', 'pending');
      
      setPendingInvites(invites || []);
    } catch (err) {
      console.error("Error loading settings data:", err);
    }
  }

  async function fetchHomeMembers(homeId) {
    const { data, error } = await supabase
      .from('home_members')
      .select(`id, user_id, role, status`) 
      .eq('home_id', homeId);
    
    if (!error) {
      setMembersByHome(prev => ({ ...prev, [homeId]: data || [] }));
    }
  }

  // --- 4. ACTION HANDLERS ---

  // --- NEW: SWITCH ACTIVE HOME ---
  const handleSwitchHome = (homeId) => {
    setActiveHomeId(homeId);
    localStorage.setItem('activeDoorIQHome', homeId);
    // Optional: If your app uses a global context/provider, you might call a prop here like onContextChange(homeId)
    // or trigger a brief notification/toast confirming the switch.
  };

  const handleCreateHome = async () => {
    if (!newHomeName) return alert("Please name your home.");
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: home, error: homeErr } = await supabase
        .from('homes')
        .insert([{ name: newHomeName, created_by: user.id }])
        .select().single();

      if (homeErr) throw homeErr;

      await supabase.from('home_members').insert([{ 
        home_id: home.id, user_id: user.id, role: 'owner', status: 'active' 
      }]);
      
      // Automatically switch to the newly created home
      handleSwitchHome(home.id);
      
      setNewHomeName('');
      fetchInitialData();
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  const handleRenameHome = async (homeId) => {
    if (!editHomeName) return alert("Home name cannot be empty.");
    setLoading(true);
    const { error } = await supabase.from('homes').update({ name: editHomeName }).eq('id', homeId);

    if (error) alert(error.message);
    else {
      setEditingHomeId(null);
      setEditHomeName('');
      fetchInitialData();
    }
    setLoading(false);
  };

  const handleDeleteHome = async (homeId) => {
    if (!window.confirm("Are you sure you want to permanently delete this home? All members will lose access.")) return;
    setLoading(true);
    const { error } = await supabase.from('homes').delete().eq('id', homeId);

    if (error) alert(error.message);
    else fetchInitialData();
    setLoading(false);
  };

  const handleAcceptInvite = async (membershipId) => {
    setLoading(true);
    await supabase.from('home_members').update({ status: 'active' }).eq('id', membershipId);
    fetchInitialData(); 
    setLoading(false);
  };

  const handleInviteMember = async (homeId) => {
    const inviteUserId = inviteInputs[homeId];
    if (!inviteUserId) return alert("Provide a User UUID.");
    setLoading(true);
    
    const { error } = await supabase.from('home_members').insert([{ 
      home_id: homeId, user_id: inviteUserId, role: 'member', status: 'pending' 
    }]);

    if (error) alert(error.message);
    else {
      setInviteInputs(prev => ({ ...prev, [homeId]: '' }));
      fetchHomeMembers(homeId);
      alert("Invite Sent!");
    }
    setLoading(false);
  };

  const handleRemoveMember = async (membershipId, homeId) => {
    if (!window.confirm("Revoke user access?")) return;
    await supabase.from('home_members').delete().eq('id', membershipId);
    fetchHomeMembers(homeId);
  };

  const handleSignOut = async () => {
    localStorage.removeItem('activeDoorIQHome');
    await supabase.auth.signOut();
  };

  const handleInviteInputChange = (homeId, value) => {
    setInviteInputs(prev => ({ ...prev, [homeId]: value }));
  };

  // --- 5. RENDER ---
  return (
    <div className="settings-wrapper">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;800&display=swap');
      </style>

      <nav className="settings-nav">
        <div className="logo">Door<span>IQ</span></div>
        <button onClick={onNavigate} className="back-link">✕ Close</button>
      </nav>

      <div className="settings-content">
        <header className="page-title">
          <h1>System Settings</h1>
          <p>Manage your properties, hardware, and access controls.</p>
        </header>

        {pendingInvites.length > 0 && (
          <section className="settings-card alert-card">
            <div className="card-header">
              <span className="icon">📩</span>
              <h3>New Invitations</h3>
            </div>
            {pendingInvites.map(invite => (
              <div key={invite.id} className="setting-row">
                <div className="setting-info">
                  <span className="label">Join: {invite.homes.name}</span>
                </div>
                <button className="btn-accept" onClick={() => handleAcceptInvite(invite.id)}>
                  Accept
                </button>
              </div>
            ))}
          </section>
        )}

        {/* RENDER ALL HOMES */}
        {userHomes.map((userHome) => {
          const homeId = userHome.homes.id;
          const homeName = userHome.homes.name;
          const isOwner = userHome.role === 'owner';
          const isActiveContext = activeHomeId === homeId;
          const homeMembers = membersByHome[homeId] || [];

          return (
            <section key={userHome.id} className={`settings-card ${isActiveContext ? 'active-home-card' : ''}`}>
              <div className="card-header" style={{ justifyContent: 'space-between', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="icon">🏠</span>
                  
                  {editingHomeId === homeId ? (
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <input 
                        type="text" 
                        value={editHomeName} 
                        onChange={(e) => setEditHomeName(e.target.value)} 
                        style={{ padding: '4px 8px' }}
                      />
                      <button onClick={() => handleRenameHome(homeId)} disabled={loading}>Save</button>
                      <button className="btn-cancel" onClick={() => setEditingHomeId(null)}>Cancel</button>
                    </div>
                  ) : (
                    <h3 style={{ margin: 0 }}>
                      {homeName} 
                      {isActiveContext && <span className="active-badge">ACTIVE DASHBOARD</span>}
                    </h3>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  
                  {/* CONTEXT SWITCHER */}
                  {!isActiveContext && (
                    <button className="btn-switch" onClick={() => handleSwitchHome(homeId)}>
                      Switch to this Home
                    </button>
                  )}

                  <span className="value-tag">{userHome.role.toUpperCase()}</span>
                  
                  {isOwner && editingHomeId !== homeId && (
                    <div className="owner-actions">
                      <button className="btn-text" onClick={() => { setEditingHomeId(homeId); setEditHomeName(homeName); }}>Rename</button>
                      <button className="btn-remove btn-text" onClick={() => handleDeleteHome(homeId)} disabled={loading}>Delete</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="home-details">
                {isOwner && (
                  <div className="owner-controls">
                    <h4>Member Access</h4>
                    <div className="member-list">
                      {homeMembers.map(m => (
                        <div key={m.id} className="member-item">
                          <div className="setting-info">
                            <span className="label email-display">
                              {`User ID: ${m.user_id.slice(0, 8)}...`}
                            </span>
                            <span className={`status-tag ${m.status}`}>{m.status}</span>
                          </div>
                          {m.role !== 'owner' && (
                            <button className="btn-remove" onClick={() => handleRemoveMember(m.id, homeId)}>Remove</button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="invite-section">
                      <div className="input-group">
                        <input 
                          type="text" 
                          placeholder="Paste User UUID to invite..." 
                          value={inviteInputs[homeId] || ''} 
                          onChange={(e) => handleInviteInputChange(homeId, e.target.value)} 
                        />
                        <button onClick={() => handleInviteMember(homeId)} disabled={loading}>Invite</button>
                      </div>
                    </div>
                  </div>
                )}
                
                {!isOwner && (
                  <p className="desc" style={{ marginTop: '10px' }}>
                    You are a member of this home. Contact the owner to manage settings.
                  </p>
                )}
              </div>
            </section>
          );
        })}

        <section className="settings-card">
           <div className="card-header">
             <span className="icon">➕</span>
             <h3>Create New Home</h3>
           </div>
           <div className="setup-home">
             <div className="input-group">
               <input 
                 type="text" 
                 placeholder="New Home Name (e.g. Vacation House)" 
                 value={newHomeName} 
                 onChange={(e) => setNewHomeName(e.target.value)} 
               />
               <button onClick={handleCreateHome} disabled={loading}>Create</button>
             </div>
           </div>
        </section>

        <section className="settings-card">
          <div className="card-header"><span className="icon">📟</span><h3>Hardware Settings (Active Home)</h3></div>
          <div className="setting-row" style={{ borderBottom: 'none' }}>
            <div className="setting-info">
              <span className="label">Infrared (IR) Mode</span>
              <span className="desc">Night vision toggle for camera nodes in {userHomes.find(h => h.homes.id === activeHomeId)?.homes.name || "this home"}.</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={irEnabled} onChange={() => setIrEnabled(!irEnabled)} />
              <span className="slider round"></span>
            </label>
          </div>
        </section>

        <div className="action-footer">
          <button onClick={handleSignOut} className="btn-logout">Sign Out</button>
          <p className="version">DoorIQ v1.1.0 | Multi-Home Enabled</p>
        </div>
      </div>

      <style jsx>{`
        .settings-wrapper { min-height: 100vh; background: #050505; color: white; font-family: 'Plus Jakarta Sans', sans-serif; padding: 20px 8%; }
        .settings-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .logo { font-size: 1.5rem; font-weight: 800; }
        .logo span { color: #00d4ff; }
        .back-link { background: none; border: none; color: #94a3b8; font-weight: 600; cursor: pointer; }

        .page-title h1 { font-size: 2rem; font-weight: 800; margin: 0; }
        .page-title p { color: #64748b; margin-top: 5px; margin-bottom: 30px; }

        .settings-card { background: rgba(15, 15, 15, 0.6); border: 1px solid #1f1f1f; border-radius: 20px; padding: 25px; margin-bottom: 20px; transition: 0.3s; }
        .active-home-card { border-color: #00d4ff88; box-shadow: 0 0 15px #00d4ff11; }
        .alert-card { border: 1px solid #00d4ff44; background: linear-gradient(145deg, #00d4ff0a, #000); }
        .card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; border-bottom: 1px solid #1f1f1f; padding-bottom: 15px; }
        .card-header h3 { font-size: 1.2rem; margin: 0; display: flex; align-items: center; gap: 10px; }

        .active-badge { font-size: 0.65rem; background: #00d4ff; color: #000; padding: 3px 8px; border-radius: 10px; font-weight: 800; letter-spacing: 0.5px; }

        .setting-row { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #1f1f1f; }
        .setting-info { display: flex; flex-direction: column; }
        .label { font-weight: 600; font-size: 0.95rem; }
        .email-display { color: #00d4ff; font-family: monospace; }
        .desc { font-size: 0.8rem; color: #64748b; }

        .value-tag { background: #1a1a1a; color: #94a3b8; padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 800; display: inline-block; border: 1px solid #333;}
        .status-tag { font-size: 0.7rem; text-transform: uppercase; font-weight: 700; margin-top: 2px; }
        .status-tag.pending { color: #ffab00; }
        .status-tag.active { color: #00ffa3; }

        .member-list { margin: 15px 0; display: flex; flex-direction: column; gap: 8px; }
        .member-item { display: flex; justify-content: space-between; align-items: center; background: #0a0a0a; padding: 12px; border-radius: 12px; border: 1px solid #111; }

        .input-group { display: flex; gap: 10px; margin-top: 15px; }
        input { flex: 1; background: #111; border: 1px solid #222; border-radius: 12px; padding: 12px; color: white; outline: none; }
        button { background: #00d4ff; color: black; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        button:disabled { opacity: 0.5; cursor: not-allowed; }
        
        .btn-switch { background: transparent; color: #00d4ff; border: 1px solid #00d4ff; padding: 6px 12px; font-size: 0.8rem; }
        .btn-switch:hover { background: #00d4ff22; }
        .btn-remove { background: #ff4d4d22; color: #ff4d4d; border: 1px solid #ff4d4d44; padding: 5px 12px; font-size: 0.8rem; }
        .btn-text { background: transparent; border: none; padding: 5px 10px; cursor: pointer; font-size: 0.8rem; color: #94a3b8; }
        .btn-text:hover { color: white; }
        .btn-cancel { background: transparent; color: white; border: 1px solid #333; }
        
        h4 { font-size: 0.8rem; color: #666; text-transform: uppercase; letter-spacing: 1px; margin: 20px 0 10px; }

        .switch { position: relative; width: 44px; height: 24px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #222; transition: .4s; border-radius: 34px; }
        .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: #00d4ff; }
        input:checked + .slider:before { transform: translateX(20px); }

        .action-footer { margin-top: 40px; text-align: center; }
        .btn-logout { background: transparent; color: #ff4d4d; border: 1px solid #ff4d4d44; padding: 10px 20px; border-radius: 12px; cursor: pointer; }
        .version { font-size: 0.75rem; color: #444; margin-top: 15px; }
      `}</style>
    </div>
  );
}