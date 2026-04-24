import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import SettingsPage from './pages/SettingPage'; 
import './index.css';

export default function App() {
  const [session, setSession] = useState(null);
  const [currentPage, setCurrentPage] = useState('home'); 
  const [authView, setAuthView] = useState('login'); 
  const [showLanding, setShowLanding] = useState(true);
//test 
  useEffect(() => {
    // Check session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      // If user is already logged in, skip the landing page entirely
      if (session) setShowLanding(false);
    });

    // Sync auth changes (Login, Logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setShowLanding(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 1. PUBLIC LANDING VIEW (The "About DoorIQ" introduction)
  if (showLanding && !session) {
  return (
    <LandingPage 
      onLogin={() => {
        setAuthView('login');
        setShowLanding(false);
      }}
      onGetStarted={() => {
        setAuthView('register');
        setShowLanding(false);
      }} 
    />
  );
}

  // 2. AUTH VIEW (Login or Register screens)
  if (!session) {
    return (
      <div className="app-container">
        {authView === 'login' ? (
          <LoginPage 
            onNavigateToRegister={() => setAuthView('register')} 
            onBackToLanding={() => setShowLanding(true)} 
          />
        ) : (
          <RegisterPage 
            onNavigateToLogin={() => setAuthView('login')} 
            onBackToLanding={() => setShowLanding(true)}
          />
        )}
      </div>
    );
  }

  // 3. PRIVATE VIEW (The actual IoT Dashboard)
  return (
    <div className="app-container">
      {currentPage === 'home' ? (
        <Dashboard onNavigate={() => setCurrentPage('settings')} />
      ) : (
        <SettingsPage onNavigate={() => setCurrentPage('home')} />
      )}
    </div>
  );
}