import React, { useState, useEffect } from 'react';
import OnboardingWizard from './components/OnboardingWizard';
import AtmosphericOrbitGauge from './components/AtmosphericOrbitGauge';
import HabitLedger from './components/HabitLedger';
import BentoGrid from './components/BentoGrid';
import SidebarLogs from './components/SidebarLogs';
import { RefreshCw, Layers, Compass, Leaf, Award, Flame, Volume2, VolumeX, Sun, Moon } from 'lucide-react';
import soundManager from './data/ecoSoundManager';
import './styles/global.css';
import './styles/components.css';

export default function App() {
  const [profile, setProfile] = useState(null);
  const [logs, setLogs] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [themePreference, setThemePreference] = useState(() => {
    return localStorage.getItem('ecosync_theme') || 'auto';
  });
  const [resetCount, setResetCount] = useState(0);

  // Sync theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('ecosync_theme', themePreference);
  }, [themePreference]);

  // Load profile and logs from localStorage on mount (Defensive QA parsing checks)
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('ecosync_profile');
      const savedLogs = localStorage.getItem('ecosync_logs');
      
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        // Verify profile fields exist to prevent crashes on render
        if (parsedProfile && typeof parsedProfile.baselineDaily === 'number') {
          setProfile(parsedProfile);
        } else {
          localStorage.removeItem('ecosync_profile');
        }
      }
      if (savedLogs) {
        const parsedLogs = JSON.parse(savedLogs);
        if (Array.isArray(parsedLogs)) {
          setLogs(parsedLogs);
        } else {
          setLogs([]);
          localStorage.setItem('ecosync_logs', JSON.stringify([]));
        }
      }
    } catch (e) {
      console.error("Failed to read localStorage configuration, resetting default:", e);
      localStorage.removeItem('ecosync_profile');
      localStorage.removeItem('ecosync_logs');
    } finally {
      setLoading(false);
    }
  }, []);

  // Sound volume is synced synchronously within onClick handlers to bypass browser autoplay policies

  // Sync visual carbon state with Sound Manager
  useEffect(() => {
    if (profile) {
      const totalSavings = logs.reduce((sum, item) => sum + item.impact, 0);
      const state = getCarbonState(totalSavings, profile.baselineDaily, profile.dailyBudget);
      soundManager.setCarbonState(state);
    }
  }, [logs, profile]);

  // IntersectionObserver Scroll Reveal Animation hook with full observer cleanup (Memory leak fix)
  useEffect(() => {
    if (profile && !loading) {
      let observer;
      const timeoutId = setTimeout(() => {
        observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('reveal-active');
            }
          });
        }, { threshold: 0.05, rootMargin: '0px 0px -50px 0px' });

        const revealElements = document.querySelectorAll('.reveal-on-scroll');
        revealElements.forEach(el => observer.observe(el));
      }, 100);

      return () => {
        clearTimeout(timeoutId);
        if (observer) {
          observer.disconnect();
        }
      };
    }
  }, [profile, logs, loading]);

  // Time-of-day calculation (Automatically computes based on system time & user overrides)
  const getTimeOfDay = () => {
    if (themePreference === 'dark') {
      return 'night';
    }
    if (themePreference === 'light') {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 9) return 'dawn';
      if (hour >= 9 && hour < 17) return 'day';
      if (hour >= 17 && hour < 20) return 'dusk';
      return 'day'; // Night falls back to Day for forced light mode
    }

    // Auto / System Mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'night';
    }
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 9) return 'dawn';
    if (hour >= 9 && hour < 17) return 'day';
    if (hour >= 17 && hour < 20) return 'dusk';
    return 'night';
  };

  // State calculations
  const getCarbonState = (savings, baseline, budget) => {
    const balance = Math.max(0, baseline - savings);
    if (savings === 0) return 'high-emission';
    if (balance <= budget) return 'efficient';
    return 'balanced';
  };

  // Save profile when it changes
  const handleOnboardingComplete = (newProfile) => {
    soundManager.playChime();
    setProfile(newProfile);
    localStorage.setItem('ecosync_profile', JSON.stringify(newProfile));
  };

  // Reset profile to do onboarding again
  const handleResetProfile = () => {
    soundManager.playClick();
    let shouldReset = false;
    try {
      shouldReset = window.confirm("Do you want to clear your baseline profile and run the onboarding questions again?");
    } catch (e) {
      console.warn("window.confirm blocked or failed in sandbox, resetting directly:", e);
      shouldReset = true;
    }
    
    if (shouldReset) {
      soundManager.playDelete();
      setProfile(null);
      setLogs([]);
      setResetCount(prev => prev + 1);
      localStorage.removeItem('ecosync_profile');
      localStorage.removeItem('ecosync_logs');
    }
  };

  // Log a carbon saving habit
  const handleLogHabit = (habit) => {
    const newLog = {
      id: Date.now().toString(),
      title: habit.title,
      impact: habit.impact,
      category: habit.category,
      timeString: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    localStorage.setItem('ecosync_logs', JSON.stringify(updatedLogs));

    // Gamification level change triggers LevelUp or Chime audio feedback
    const actionsPerLevel = 5;
    const oldLevel = Math.floor(logs.length / actionsPerLevel) + 1;
    const newLevel = Math.floor(updatedLogs.length / actionsPerLevel) + 1;
    if (newLevel > oldLevel) {
      soundManager.playLevelUp();
    } else {
      soundManager.playChime();
    }
  };

  // Delete a logged action
  const handleDeleteLog = (id) => {
    soundManager.playDelete();
    const updatedLogs = logs.filter(log => log.id !== id);
    setLogs(updatedLogs);
    localStorage.setItem('ecosync_logs', JSON.stringify(updatedLogs));
  };


  if (loading) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'var(--color-accent-dark)' }}>
        <Leaf size={32} style={{ color: 'var(--color-bone)', animation: 'spin 3s linear infinite' }} />
      </div>
    );
  }

  // Calculate carbon balances
  const totalSavings = logs.reduce((sum, item) => sum + item.impact, 0);
  const currentBalance = profile ? Math.max(0, profile.baselineDaily - totalSavings) : 0;

  // Calculate level details
  const actionsPerLevel = 5;
  const currentLevelNumber = Math.floor(logs.length / actionsPerLevel) + 1;
  const nextLevelProgress = (logs.length % actionsPerLevel) / actionsPerLevel * 100;
  const levels = [
    'Eco Seedling', 
    'Sapling Spark', 
    'Meadow Maker', 
    'Canopy Guardian', 
    'Forest Sentinel', 
    'Earth Steward'
  ];
  const levelName = levels[Math.min(currentLevelNumber - 1, levels.length - 1)];

  // Time & State Classes for styling overrides
  const timeOfDay = getTimeOfDay();
  const carbonState = profile 
    ? getCarbonState(totalSavings, profile.baselineDaily, profile.dailyBudget)
    : 'high-emission';
  const themeClass = `theme-${timeOfDay}-${carbonState}`;

  return (
    <div className={`app-container ${themeClass}`}>
      {/* Film Grain Texture Overlay */}
      <div className="noise-overlay" />

      {/* Onboarding Wizard - if no profile exists */}
      {!profile ? (
        <OnboardingWizard key={resetCount} onComplete={handleOnboardingComplete} />
      ) : (
        <>
          {/* Header */}
          <header className="app-header">
            <div className="logo-display">
              <Leaf size={18} style={{ color: 'var(--color-accent)' }} />
              <h1>eco-sync</h1>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => {
                  soundManager.playClick();
                  setThemePreference(prev => prev === 'dark' ? 'light' : 'dark');
                }} 
                className="btn-editorial" 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', padding: 0 }}
                title={themePreference === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {themePreference === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              </button>

              <button 
                onClick={() => { soundManager.playClick(); setSidebarOpen(true); }} 
                className="btn-editorial" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Layers size={12} /> history ({logs.length})
              </button>
              
              <button 
                onClick={handleResetProfile} 
                className="btn-editorial" 
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                title="Reset baseline evaluation"
              >
                <RefreshCw size={12} /> reset
              </button>
            </div>
          </header>


          {/* Full-width Video Hero Section */}
          <section className="theme-burgundy" style={{ position: 'relative', minHeight: '440px', width: '100%', overflow: 'hidden', display: 'flex', alignItems: 'center', padding: '48px 0' }}>
            <video 
              className="bento-video" 
              src="https://vjs.zencdn.net/v/oceans.mp4"
              autoPlay 
              loop 
              muted 
              playsInline
              style={{ filter: 'brightness(0.32)' }}
            />
            <div style={{ position: 'relative', zIndex: 1, padding: '0 5%', width: '100%', display: 'flex', flexWrap: 'wrap', gap: '48px', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* Left Column: Hero Text */}
              <div style={{ flex: '1 1 500px', maxWidth: '720px' }}>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--color-sage-light)', fontWeight: '700' }}>
                  EcoSync advisory & lifestyle ledger
                </span>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.8rem', fontWeight: '800', lineHeight: '1.05', marginTop: '16px', color: 'var(--color-bone)', textTransform: 'uppercase' }}>
                  We work in the intersection of impact & value creation.
                </h2>
                <p style={{ color: 'var(--color-bone)', opacity: 0.85, fontSize: '0.9rem', marginTop: '16px', maxWidth: '580px', fontFamily: 'var(--font-body)', lineHeight: 1.45 }}>
                  Your evaluated daily emission profile starts at <strong>{profile.baselineDaily} kg CO₂e / day</strong>. Log conscious adjustments from your daily habits catalog below to balance your atmospheric impact.
                </p>
              </div>

              {/* Right Column: Gamification Cards (Streak & Carbon Ranking) */}
              <div className="hero-gamification-cards" style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '420px', width: '100%' }}>
                {/* Card 1: Carbon Ranking */}
                <div style={{ 
                  background: 'rgba(25, 27, 22, 0.45)', 
                  backdropFilter: 'blur(12px)', 
                  border: '1px solid rgba(247, 244, 239, 0.12)', 
                  padding: '24px',
                  color: 'var(--color-bone)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(247, 244, 239, 0.6)' }}>carbon ranking</span>
                    <Award size={14} style={{ color: 'var(--color-sage-light)' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.15rem', textTransform: 'uppercase', color: 'var(--color-bone)' }}>{levelName}</span>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(247, 244, 239, 0.6)' }}>Lvl {currentLevelNumber}</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(247, 244, 239, 0.7)', marginBottom: '16px', lineHeight: '1.3' }}>
                    Completed {logs.length} eco habits. Keep logging to level up.
                  </p>
                  <div style={{ height: '2px', background: 'rgba(247, 244, 239, 0.1)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--color-sage-light)', width: `${nextLevelProgress}%`, transition: 'var(--transition-smooth)' }} />
                  </div>
                </div>

                {/* Card 2: Daily Momentum (Streak) */}
                <div style={{ 
                  background: 'rgba(25, 27, 22, 0.45)', 
                  backdropFilter: 'blur(12px)', 
                  border: '1px solid rgba(247, 244, 239, 0.12)', 
                  padding: '24px',
                  color: 'var(--color-bone)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(247, 244, 239, 0.6)' }}>daily momentum</span>
                    <Flame size={14} style={{ color: 'var(--color-sage-light)' }} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.8rem', lineHeight: '1.0', color: 'var(--color-bone)' }}>{logs.length > 0 ? 1 : 0}</span>
                    <span style={{ fontSize: '0.85rem', color: 'rgba(247, 244, 239, 0.7)', textTransform: 'lowercase' }}>day streak</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(247, 244, 239, 0.7)', marginTop: '12px', lineHeight: '1.3' }}>
                    {logs.length > 0 ? "Maintain your momentum to extend your active streak." : "Log your first action today to begin your streak."}
                  </p>
                </div>
              </div>
            </div>

            {/* Sound Toggle Button */}
            <button
              onClick={() => {
                const nextState = !soundEnabled;
                setSoundEnabled(nextState);
                if (nextState) {
                  soundManager.setVolume('medium');
                  soundManager.playClick();
                } else {
                  soundManager.setVolume('muted');
                }
              }}
              className="btn-editorial"
              style={{
                position: 'absolute',
                bottom: '24px',
                right: '5%',
                zIndex: 10,
                background: 'rgba(25, 27, 22, 0.55)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(247, 244, 239, 0.2)',
                color: 'var(--color-bone)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                fontWeight: '700'
              }}
            >
              {soundEnabled ? <Volume2 size={14} style={{ color: 'var(--color-sage-light)' }} /> : <VolumeX size={14} />}
              {soundEnabled ? 'sound: on' : 'sound: off'}
            </button>
          </section>

          {/* Main Dashboard Section */}
          <main className="app-main">
            <div className="dashboard-grid reveal-on-scroll">
              <AtmosphericOrbitGauge 
                currentBalance={currentBalance} 
                dailyBudget={profile.dailyBudget} 
                baseline={profile.baselineDaily}
              />
              <HabitLedger onLogHabit={handleLogHabit} />
            </div>

            {/* Editorial Divider Line */}
            <div className="reveal-on-scroll">
              <span className="editorial-divider" style={{ margin: '40px 0 24px 0' }} />
            </div>

            {/* Full-width Bento Grid Section (Offsets & Analysis Cards side-by-side) */}
            <div className="reveal-on-scroll" style={{ marginTop: '32px', transitionDelay: '100ms' }}>
              <BentoGrid 
                totalSavings={totalSavings} 
                profile={profile} 
                logsCount={logs.length}
              />
            </div>

            {/* Editorial Divider Line */}
            <div className="reveal-on-scroll">
              <span className="editorial-divider" />
            </div>
          </main>

          {/* Sidebar Drawer */}
          <SidebarLogs 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
            logs={logs} 
            onDeleteLog={handleDeleteLog} 
          />

          {/* Editorial Footer */}
          <footer style={{ borderTop: '1px solid var(--color-border-dark)', padding: '40px 5%', fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center', background: 'rgba(19, 20, 20, 0.02)' }}>
            <p style={{ textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
              EcoSync — Inspired by the intersection of knowledge, value creation and capital.
            </p>
            <p>© {new Date().getFullYear()} EcoSync ledger. All rights reserved.</p>
          </footer>
        </>
      )}
    </div>
  );
}
