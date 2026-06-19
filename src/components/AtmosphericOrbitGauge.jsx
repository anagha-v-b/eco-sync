import React from 'react';
import { Info } from 'lucide-react';
import soundManager from '../data/ecoSoundManager';

export default function AtmosphericOrbitGauge({ currentBalance, dailyBudget, baseline }) {
  const [viewMode, setViewMode] = React.useState('split'); // Default to split card mode as requested by user
  const [infoOpen, setInfoOpen] = React.useState(false);

  const infoButtonRef = React.useRef(null);
  const closeButtonRef = React.useRef(null);
  const modalRef = React.useRef(null);
  React.useEffect(() => {
    if (infoOpen) {
      // Focus close button on open
      closeButtonRef.current?.focus();

      // Esc key handler
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setInfoOpen(false);
          infoButtonRef.current?.focus();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      // Focus trapping
      const handleFocusTrap = (e) => {
        if (!modalRef.current) return;
        const focusableElements = modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusableElements.length === 0) return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };
      window.addEventListener('keydown', handleFocusTrap);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keydown', handleFocusTrap);
      };
    }
  }, [infoOpen]);

  // Calculate carbon savings dynamically
  const carbonSaved = Math.max(0, baseline - currentBalance);
  
  // Dynamic color for the atmosphere dome based on carbon savings
  const getDomeColor = () => {
    if (carbonSaved < 1.0) return 'var(--brand--brown-bright)'; // Terracotta Red (0 to 1 kg saved)
    if (carbonSaved < 4.0) return '#ea8e6b'; // Warm Sunset Orange (1 to 4 kg saved)
    if (carbonSaved < 8.0) return 'var(--brand--yellow)'; // Ochre Yellow (4 to 8 kg saved)
    return 'var(--brand--sage)'; // Organic Sage Green (8+ kg saved)
  };
  const domeColor = getDomeColor();
  
  // Milestones matching standard savings benchmarks
  const milestones = [
    { value: 1.0, label: '1 Phone' },
    { value: 4.0, label: 'Bus Swap' },
    { value: 8.0, label: 'Pine Tree' },
    { value: 12.0, label: 'Eco Hero' }
  ];
  
  const maxMilestoneValue = 12.0;
  const savingsPercentage = Math.min((carbonSaved / maxMilestoneValue) * 100, 100);

  // SVG Ring Calculations
  const radius = 105;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate percentage of baseline or budget
  const percentageOfBaseline = baseline > 0 ? (currentBalance / baseline) : 0;
  const percentage = Math.min(Math.max(percentageOfBaseline, 0), 1);
  const strokeDashoffset = circumference - (percentage * circumference);
  
  // Determine color based on relation to global budget
  const isUnderBudget = currentBalance <= dailyBudget;
  
  // If under budget, paint it in the Footprint Firm dusty blue!
  // If over, paint it in deep burgundy.
  const strokeColor = isUnderBudget ? 'var(--color-dusty-blue)' : 'var(--color-burgundy)';
  
  const percentageSaved = baseline > 0 
    ? Math.max(0, Math.round(((baseline - currentBalance) / baseline) * 100))
    : 0;

  const [particles, setParticles] = React.useState([]);

  // Handle particle animation loop
  React.useEffect(() => {
    let animationFrameId;

    // Helper to spawn a new particle
    const spawnParticle = () => {
      const id = Math.random();
      const x = Math.random() * 100; // 0% to 100%
      
      // Soot particles fall from the top (y = -10), clean particles rise from the bottom (y = 110)
      const y = isUnderBudget ? 110 : -10;
      const size = Math.random() * 5 + 3; // 3px to 8px
      const speedY = isUnderBudget 
        ? -(Math.random() * 0.4 + 0.2) // float up
        : (Math.random() * 0.4 + 0.2); // fall down
      const speedX = (Math.random() * 0.2 - 0.1); // slight drift
      const opacity = Math.random() * 0.5 + 0.3; // 0.3 to 0.8
      const type = isUnderBudget ? 'clean' : 'soot';

      return { id, x, y, size, opacity, speedY, speedX, type };
    };

    // Initialize initial particles scattered in vertical space
    let initialParticles = [];
    for (let i = 0; i < 15; i++) {
      const p = spawnParticle();
      p.y = Math.random() * 100; // scatter them
      initialParticles.push(p);
    }
    setParticles(initialParticles);

    // Animation frame tick
    const tick = () => {
      setParticles(prev => {
        // Update positions
        let updated = prev.map(p => ({
          ...p,
          x: (p.x + p.speedX + 100) % 100, // wrap around horizontally
          y: p.y + p.speedY
        }));

        // Filter out particles that went offscreen
        updated = updated.filter(p => {
          if (p.speedY < 0 && p.y < -15) return false; // Clean went off top
          if (p.speedY > 0 && p.y > 115) return false; // Soot went off bottom
          return true;
        });

        // Replenish missing particles (cap at 15)
        while (updated.length < 15) {
          updated.push(spawnParticle());
        }

        return updated;
      });

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isUnderBudget]);

  const handleParticleClick = (e, id) => {
    e.stopPropagation();
    soundManager.playClick();
    setParticles(prev => prev.filter(p => p.id !== id));
  };

  if (viewMode === 'split') {
    return (
      <div className="gauge-card" style={{ alignSelf: 'stretch', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '24px', padding: '32px', position: 'relative' }}>
        
        {/* Atmospheric Shield Dome Background */}
        <div className="atmosphere-shield-container" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '220px',
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 1,
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)',
          maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)'
        }}>
          <svg style={{ width: '100%', height: '100%', display: 'block' }} viewBox="0 0 400 220" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={domeColor} stopOpacity="0.22" />
                <stop offset="50%" stopColor={domeColor} stopOpacity="0.06" />
                <stop offset="100%" stopColor={domeColor} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path 
              className="atmosphere-dome-path-1" 
              d="M 0,0 L 400,0 L 400,60 Q 200,160 0,60 Z" 
              fill="url(#shieldGrad)" 
            />
            <path 
              className="atmosphere-dome-path-2" 
              d="M 0,0 L 400,0 L 400,70 Q 200,140 0,70 Z" 
              fill="url(#shieldGrad)" 
              style={{ opacity: 0.5 }}
            />
          </svg>

          {/* Floating interactive particles */}
          {particles.map(p => (
            <button
              key={p.id}
              onClick={(e) => handleParticleClick(e, p.id)}
              style={{
                position: 'absolute',
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                borderRadius: '50%',
                backgroundColor: p.type === 'soot' ? 'var(--brand--brown-bright)' : 'var(--color-accent-light)',
                opacity: p.opacity,
                cursor: 'pointer',
                pointerEvents: 'auto', // Enable clicking
                transform: 'translate(-50%, -50%)',
                boxShadow: p.type === 'soot' 
                  ? 'none' 
                  : '0 0 6px var(--color-accent-light)',
                transition: 'background-color 0.8s ease',
                border: 'none',
                padding: 0
              }}
              aria-label={p.type === 'soot' ? 'Exceeds Budget Soot - Click to Clean!' : 'Clean Air Bubble - Click to Pop!'}
              title={p.type === 'soot' ? 'Exceeds Budget Soot - Click to Clean!' : 'Clean Air Bubble - Click to Pop!'}
            />
          ))}
        </div>

        {/* Header Section */}
        <div style={{ width: '100%', textAlign: 'left', position: 'relative', zIndex: 2 }}>
          <h3 className="bento-card-title" style={{ marginBottom: '4px' }}>Emissions Ledger</h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'lowercase' }}>
            Today's balance & personal carbon tracking
          </span>
        </div>

        {/* Main Stats Block: Balance with Savings overlay inset */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          borderTop: '1px solid var(--color-border-dark)',
          borderBottom: '1px solid var(--color-border-dark)',
          padding: '24px 0',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Left: Emissions Balance */}
          <div style={{ flex: '1 1 200px' }}>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-muted)' }}>
              emissions balance
            </span>
            <h2 style={{ fontSize: '2.8rem', fontWeight: 800, fontFamily: 'var(--font-display)', margin: '4px 0', lineHeight: 1.0, color: 'var(--color-text-dark)' }}>
              {currentBalance.toFixed(1)} <span style={{ fontSize: '1.2rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>kg CO₂e</span>
            </h2>
            <span className="split-status" style={{ 
              fontSize: '0.62rem', 
              fontWeight: '800', 
              textTransform: 'uppercase', 
              letterSpacing: '0.08em', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              color: isUnderBudget ? 'var(--color-accent)' : 'var(--brand--brown-bright)'
            }}>
              {isUnderBudget ? '● sustainable level' : '▲ exceeds safe limit'}
            </span>
          </div>

          {/* Right: Nested Inset for Carbon Saved */}
          <div className="savings-inset-box" style={{
            background: 'var(--color-bg-light)',
            border: '1px solid var(--color-border-dark)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flex: '1 1 240px'
          }}>
            <div>
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', display: 'block', marginBottom: '2px' }}>
                carbon saved today
              </span>
              <h4 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-display)', margin: 0, lineHeight: 1.1, color: 'var(--color-accent)' }}>
                {carbonSaved.toFixed(1)} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>kg CO₂e</span>
              </h4>
            </div>
            <div style={{
              background: 'var(--color-accent-glow)',
              color: 'var(--color-accent)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: '700'
            }}>
              🌱
            </div>
          </div>
        </div>

        {/* Milestone Progress Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', marginTop: '32px', position: 'relative', zIndex: 2 }}>
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)' }}>
            daily milestones
          </span>
          
          {/* Thicker Pill-shaped Progress Timeline */}
          <div className="progress-timeline-container" style={{ position: 'relative', width: '100%' }}>
            {/* Background Track (Thick pill) */}
            <div style={{ 
              position: 'absolute', 
              top: '28px', 
              left: '30px', 
              right: '30px', 
              height: '8px', 
              background: 'var(--color-track-bg)', 
              borderRadius: '4px',
              zIndex: 1 
            }} />
            
            {/* Fill Track (Thick pill) */}
            <div style={{ 
              position: 'absolute', 
              top: '28px', 
              left: '30px', 
              width: `calc(${savingsPercentage}% - ${savingsPercentage > 0 ? (savingsPercentage / 100) * 60 : 0}px)`, 
              height: '8px', 
              background: 'var(--color-accent)', 
              borderRadius: '4px',
              zIndex: 2,
              transition: 'width 0.8s cubic-bezier(0.25, 1, 0.5, 1)',
              boxShadow: '0 0 8px var(--color-accent-glow)'
            }} />

            {/* Milestones Dots */}
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 3, padding: '24px 0 0 0' }}>
              {milestones.map((m, idx) => {
                const isReached = carbonSaved >= m.value;
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px' }}>
                    {/* Node Dot */}
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      backgroundColor: isReached ? 'var(--color-accent)' : 'var(--color-bg-light)',
                      border: isReached ? '2px solid var(--color-bg-light)' : '2px solid var(--color-border-dark)',
                      boxShadow: isReached ? '0 0 6px var(--color-accent)' : 'none',
                      transition: 'all 0.4s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {isReached && <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--color-bone)' }} />}
                    </div>
                    
                    {/* Label */}
                    <span style={{ 
                      fontSize: '0.6rem', 
                      textAlign: 'center', 
                      marginTop: '10px', 
                      color: isReached ? 'var(--color-text-dark)' : 'var(--color-text-muted)',
                      fontWeight: isReached ? '700' : '500',
                      lineHeight: 1.2,
                      whiteSpace: 'nowrap'
                    }}>
                      {m.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Info & Target */}
        <div style={{ borderTop: '1px solid var(--color-border-dark)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', width: '100%', position: 'relative', zIndex: 2 }}>
          <button 
            ref={infoButtonRef}
            onClick={() => setInfoOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={infoOpen}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--color-accent)', 
              fontSize: '0.7rem', 
              textDecoration: 'underline', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: 0
            }}
          >
            <Info size={11} /> How are 'Savings' calculated?
          </button>
          <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>
            Goal: {dailyBudget.toFixed(1)} kg
          </span>
        </div>

        {/* Info Modal Glass Overlay (updated colors for sand theme) */}
        {infoOpen && (
          <div 
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="savings-modal-title"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(24, 1, 2, 0.95)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderRadius: 'var(--radius-lg)',
              zIndex: 20,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '32px',
              color: 'var(--color-bone)',
              textAlign: 'left'
            }}
          >
            <h4 id="savings-modal-title" style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--color-accent)', marginBottom: '8px', letterSpacing: '0.05em' }}>
              How are savings calculated?
            </h4>
            <p style={{ fontSize: '0.75rem', lineHeight: 1.4, color: 'rgba(248, 240, 227, 0.85)', marginBottom: '16px' }}>
              Carbon savings are computed based on standard EPA greenhouse gas equivalencies. Swapping transit modes, eating plant-based meals, or reducing heating utility outputs subtracts direct coal and gas usage from your baseline footprint profile.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.7rem', color: 'rgba(248, 240, 227, 0.75)', marginBottom: '24px' }}>
              <div>● <strong>1 Phone:</strong> Charging 122 smartphones (~1.0 kg offset)</div>
              <div>● <strong>Bus Swap:</strong> Swapping commute vehicles (~4.0 kg offset)</div>
              <div>● <strong>Pine Tree:</strong> 1 full pine tree day absorption (~6.0 kg offset)</div>
            </div>
            <button 
              ref={closeButtonRef}
              onClick={() => {
                setInfoOpen(false);
                setTimeout(() => {
                  infoButtonRef.current?.focus();
                }, 0);
              }}
              style={{
                background: 'var(--color-accent)',
                border: 'none',
                color: 'var(--color-bone)',
                padding: '8px 16px',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                fontWeight: '700',
                cursor: 'pointer',
                alignSelf: 'flex-start',
                borderRadius: 'var(--radius-sm)',
                transition: 'all 0.2s ease'
              }}
            >
              close info
            </button>
          </div>
        )}
      </div>
    );
  }

  // Original circular gauge mode
  return (
    <div className="gauge-card" style={{ border: '1px solid var(--color-border-dark)' }}>

      {/* Header Section */}
      <div style={{ width: '100%', textAlign: 'left', marginBottom: '24px' }}>
        <h3 className="bento-card-title" style={{ marginBottom: '4px' }}>TODAY'S FOOTPRINT BALANCE</h3>
        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'lowercase' }}>
          your remaining emissions after actions
        </span>
      </div>
      
      <div className="gauge-svg-container">
        <svg className="gauge-svg" viewBox="0 0 240 240" aria-hidden="true">
          {/* Outer circle track */}
          <circle 
            cx="120" 
            cy="120" 
            r={radius} 
            className="gauge-bg-ring" 
            stroke="var(--color-track-bg)"
            strokeWidth="1"
          />
          
          {/* Dotted Global Target Budget Ring */}
          <circle 
            cx="120" 
            cy="120" 
            r={radius} 
            className="gauge-budget-ring"
            style={{
              transformOrigin: '50% 50%',
              transform: 'rotate(-90deg)'
            }}
          />
          
          {/* Dynamic Emission Ring */}
          <circle 
            cx="120" 
            cy="120" 
            r={radius} 
            className="gauge-fill-ring"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{
              transformOrigin: '50% 50%',
            }}
          />

          {/* Solid Orbital Point */}
          {currentBalance > 0 && (
            <circle
              cx={120 + radius * Math.cos((percentage * 2 * Math.PI) - Math.PI / 2)}
              cy={120 + radius * Math.sin((percentage * 2 * Math.PI) - Math.PI / 2)}
              r="4"
              fill={strokeColor}
              style={{
                transition: 'cx 0.8s cubic-bezier(0.25, 1, 0.5, 1), cy 0.8s cubic-bezier(0.25, 1, 0.5, 1)'
              }}
            />
          )}
        </svg>
        
        {/* Central Dashboard Data Text */}
        <div className="gauge-label">
          <div className="gauge-label-value" style={{ color: strokeColor }}>
            {currentBalance.toFixed(1)}
          </div>
          <div className="gauge-label-unit" style={{ color: 'var(--color-text-dark)' }}>kg CO₂e</div>
          <span style={{ 
            fontSize: '0.6rem', 
            color: strokeColor,
            fontWeight: '800',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginTop: '4px',
            display: 'inline-block'
          }}>
            {isUnderBudget ? 'sustainable level' : 'exceeds safe limit'}
          </span>
        </div>
      </div>
      
      {/* Footer statistics */}
      <div className="gauge-footer">
        <div className="gauge-stat-box">
          <div className="gauge-stat-val" style={{ color: 'var(--color-text-dark)' }}>
            {baseline.toFixed(1)}
          </div>
          <div className="gauge-stat-lbl">start point</div>
        </div>
        <div className="gauge-stat-box" style={{ borderLeft: '1px solid var(--color-border-dark)', borderRight: '1px solid var(--color-border-dark)', padding: '0 24px' }}>
          <div className="gauge-stat-val" style={{ color: 'var(--color-burgundy)' }}>
            {dailyBudget.toFixed(1)}
          </div>
          <div className="gauge-stat-lbl">climate goal</div>
        </div>
        <div className="gauge-stat-box">
          <div className="gauge-stat-val" style={{ color: 'var(--color-dusty-blue)' }}>
            {percentageSaved}%
          </div>
          <div className="gauge-stat-lbl">reduced</div>
        </div>
      </div>
    </div>
  );
}
