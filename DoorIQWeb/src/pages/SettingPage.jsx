import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient.js';

export default function SettingPage({ onNavigate }) {
  // --- 1. STATE CONFIGURATION ---
  const [irEnabled, setIrEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [userHome, setUserHome] = useState(null); // Stores {role, homes: {name, id}}
  const [members, setMembers] = useState([]);    // List of home members with emails
  const [pendingInvites, setPendingInvites] = useState([]); // Invites for the current user
  
  const [newHomeName, setNewHomeName] = useState('');
  const [inviteUserId, setInviteUserId] = useState('');

  // Fetch all data when the page loads
  useEffect(() => {
    fetchInitialData();
  }, []);

  /**
   * --- 2. DATA LOADING ---
   * Fetches the user's active home and any invites waiting for them.
   */
  async function fetchInitialData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch the home where the user is an 'active' member
      const { data: homeMembership } = await supabase
        .from('home_members')
        .select('id, role, status, homes(id, name)')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (homeMembership) {
        setUserHome(homeMembership);
        // Once we have a home, get the member list (including emails)
        fetchHomeMembers(homeMembership.homes.id);
      } else {
        setUserHome(null);
      }

      // Check for pending invites sent to this specific user
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

  /**
   * --- 3. THE "JOIN" LOGIC ---
   * This is where we bridge home_members and the profiles table to get emails.
   */
  async function fetchHomeMembers(homeId) {
    const { data, error } = await supabase
      .from('home_members')
      .select(`
        id, 
        user_id, 
        role, 
        status
      `) 
      .eq('home_id', homeId);
    
    if (error) {
      console.error("Join query failed. Showing IDs instead:", error);
      // Fallback: If the profiles table join fails, just show raw IDs
      const { data: rawData } = await supabase
        .from('home_members')
        .select('id, user_id, role, status')
        .eq('home_id', homeId);
      setMembers(rawData || []);
    } else {
      setMembers(data || []);
    }
  }

  // --- 4. ACTION HANDLERS ---

  const handleCreateHome = async () => {
    if (!newHomeName) return alert("Please name your home.");
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // A. Create the Home
      const { data: home, error: homeErr } = await supabase
        .from('homes')
        .insert([{ name: newHomeName, created_by: user.id }])
        .select().single();

      if (homeErr) throw homeErr;

      // B. Make the creator the active Owner
      await supabase.from('home_members').insert([{ 
        home_id: home.id, user_id: user.id, role: 'owner', status: 'active' 
      }]);
      
      fetchInitialData();
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  const handleAcceptInvite = async (membershipId) => {
    setLoading(true);
    await supabase.from('home_members').update({ status: 'active' }).eq('id', membershipId);
    fetchInitialData(); 
    setLoading(false);
  };

  const handleInviteMember = async () => {
    if (!inviteUserId) return alert("Provide a User UUID.");
    setLoading(true);
    const { error } = await supabase.from('home_members').insert([{ 
      home_id: userHome.homes.id, user_id: inviteUserId, role: 'member', status: 'pending' 
    }]);

    if (error) alert(error.message);
    else {
      setInviteUserId('');
      fetchHomeMembers(userHome.homes.id);
      alert("Invite Sent!");
    }
    setLoading(false);
  };

  const handleRemoveMember = async (membershipId) => {
    if (!window.confirm("Revoke user access?")) return;
    await supabase.from('home_members').delete().eq('id', membershipId);
    fetchHomeMembers(userHome.homes.id);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
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
          <p>Control access and manage your security ecosystem.</p>
        </header>

        {/* PENDING INVITE AREA */}
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

        {/* HOME & MEMBER MANAGEMENT */}
        <section className="settings-card">
          <div className="card-header">
            <span className="icon">🏠</span>
            <h3>Home & Members</h3>
          </div>

          {!userHome ? (
            /* UI for users without a home */
            <div className="setup-home">
              <p className="desc">No active home found. Start your ecosystem here:</p>
              <div className="input-group">
                <input 
                  type="text" 
                  placeholder="Home Name" 
                  value={newHomeName} 
                  onChange={(e) => setNewHomeName(e.target.value)} 
                />
                <button onClick={handleCreateHome} disabled={loading}>Create</button>
              </div>
            </div>
          ) : (
            /* UI for existing home members */
            <div className="home-details">
              <div className="setting-row">
                <div className="setting-info">
                   <span className="label">Active Home</span>
                   <span className="desc">Location: <b>{userHome.homes.name}</b></span>
                </div>
                <span className="value-tag">{userHome.role.toUpperCase()}</span>
              </div>
              
              {userHome.role === 'owner' && (
                <div className="owner-controls">
                  <h4>Member Access</h4>
                  <div className="member-list">
                    {members.map(m => (
                      <div key={m.id} className="member-item">
                        <div className="setting-info">
                          {/* We check if profiles.email exists from our join query */}
                          <span className="label email-display">
                            {`User ID: ${m.user_id.slice(0, 8)}...`}
                          </span>
                          <span className={`status-tag ${m.status}`}>{m.status}</span>
                        </div>
                        {m.role !== 'owner' && (
                          <button className="btn-remove" onClick={() => handleRemoveMember(m.id)}>Remove</button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="invite-section">
                    <span className="label">Invite by ID</span>
                    <div className="input-group">
                      <input 
                        type="text" 
                        placeholder="Paste User UUID..." 
                        value={inviteUserId} 
                        onChange={(e) => setInviteUserId(e.target.value)} 
                      />
                      <button onClick={handleInviteMember} disabled={loading}>Invite</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* HARDWARE TOGGLES */}
        <section className="settings-card">
          <div className="card-header"><span className="icon">📟</span><h3>Hardware</h3></div>
          <div className="setting-row">
            <div className="setting-info">
              <span className="label">Infrared (IR) Mode</span>
              <span className="desc">Night vision toggle for camera nodes.</span>
            </div>
            <label className="switch">
              <input type="checkbox" checked={irEnabled} onChange={() => setIrEnabled(!irEnabled)} />
              <span className="slider round"></span>
            </label>
          </div>
        </section>

        <div className="action-footer">
          <button onClick={handleSignOut} className="btn-logout">Sign Out</button>
          <p className="version">DoorIQ v1.0.7 | Secure Connection</p>
        </div>
      </div>

      <style jsx>{`
        .settings-wrapper { min-height: 100vh; background: #050505; color: white; font-family: 'Plus Jakarta Sans', sans-serif; padding: 20px 8%; }
        .settings-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .logo { font-size: 1.5rem; font-weight: 800; }
        .logo span { color: #00d4ff; }
        .back-link { background: none; border: none; color: #94a3b8; font-weight: 600; cursor: pointer; }

        .page-title h1 { font-size: 2rem; font-weight: 800; margin: 0; }
        .page-title p { color: #64748b; margin-top: 5px; }

        .settings-card { background: rgba(15, 15, 15, 0.6); border: 1px solid #1f1f1f; border-radius: 20px; padding: 25px; margin-bottom: 20px; }
        .alert-card { border: 1px solid #00d4ff44; background: linear-gradient(145deg, #00d4ff0a, #000); }
        .card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
        .card-header h3 { font-size: 1rem; margin: 0; }

        .setting-row { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #1f1f1f; }
        .setting-info { display: flex; flex-direction: column; }
        .label { font-weight: 600; font-size: 0.95rem; }
        .email-display { color: #00d4ff; font-family: monospace; }
        .desc { font-size: 0.8rem; color: #64748b; }

        .value-tag { background: #00d4ff22; color: #00d4ff; padding: 4px 10px; border-radius: 6px; font-size: 0.7rem; font-weight: 800; }
        .status-tag { font-size: 0.7rem; text-transform: uppercase; font-weight: 700; margin-top: 2px; }
        .status-tag.pending { color: #ffab00; }
        .status-tag.active { color: #00ffa3; }

        .member-list { margin: 15px 0; display: flex; flex-direction: column; gap: 8px; }
        .member-item { display: flex; justify-content: space-between; align-items: center; background: #0a0a0a; padding: 12px; border-radius: 12px; border: 1px solid #111; }

        .input-group { display: flex; gap: 10px; margin-top: 15px; }
        input { flex: 1; background: #111; border: 1px solid #222; border-radius: 12px; padding: 12px; color: white; outline: none; }
        button { background: #00d4ff; color: black; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.2s; }
        .btn-remove { background: #ff4d4d22; color: #ff4d4d; border: 1px solid #ff4d4d44; padding: 5px 12px; font-size: 0.8rem; }
        
        h4 { font-size: 0.8rem; color: #444; text-transform: uppercase; letter-spacing: 1px; margin: 25px 0 10px; }

        .switch { position: relative; width: 44px; height: 24px; }
        .switch input { opacity: 0; width: 0; height: 0; }
        .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #222; transition: .4s; border-radius: 34px; }
        .slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 3px; bottom: 3px; background-color: white; transition: .4s; border-radius: 50%; }
        input:checked + .slider { background-color: #00d4ff; }
        input:checked + .slider:before { transform: translateX(20px); }

        .action-footer { margin-top: 40px; text-align: center; }
        .btn-logout { background: transparent; color: #ff4d4d; border: 1px solid #ff4d4d44; padding: 10px 20px; border-radius: 12px; cursor: pointer; }
      `}</style>
    </div>
  );
}