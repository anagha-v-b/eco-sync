import React from 'react';
import { ArrowDownUp, Info } from 'lucide-react';

export default function AtmosphericOrbitGauge({ currentBalance, dailyBudget, baseline }) {
  const [viewMode, setViewMode] = React.useState('split'); // Default to split card mode as requested by user
  const [infoOpen, setInfoOpen] = React.useState(false);

  // Calculate carbon savings dynamically
  const carbonSaved = Math.max(0, baseline - currentBalance);
  
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

  if (viewMode === 'split') {
    return (
      <div className="mobile-split-card" style={{ alignSelf: 'stretch' }}>
        {/* Top Panel: Emitted Footprint */}
        <div className="split-panel-top">
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', opacity: 0.8 }}>
            emissions balance
          </span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', margin: '6px 0 2px 0', lineHeight: 1.1 }}>
            {currentBalance.toFixed(1)} <span style={{ fontSize: '1.2rem', fontWeight: 500, opacity: 0.9 }}>kg CO₂e</span>
          </h2>
          <span className="split-status" style={{ fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {isUnderBudget ? '● sustainable level' : '▲ exceeds safe limit'}
          </span>
        </div>

        {/* Swap View Button on the dividing line */}
        <button 
          onClick={() => setViewMode('gauge')} 
          className="split-swap-button"
          title="Swap to Gauge View"
        >
          <ArrowDownUp size={16} />
        </button>

        {/* Bottom Panel: Carbon Saved & Milestones */}
        <div className="split-panel-bottom">
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(247, 244, 239, 0.6)', marginBottom: '4px' }}>
            carbon saved today
          </span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-display)', margin: '0 0 24px 0', lineHeight: 1.1 }}>
            {carbonSaved.toFixed(1)} <span style={{ fontSize: '1.2rem', fontWeight: 500, color: 'rgba(247, 244, 239, 0.6)' }}>kg CO₂e</span>
          </h2>

          {/* Dynamic Achievements Timeline */}
          <div style={{ marginTop: 'auto', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 10px' }}>
              {/* Timeline Track Line */}
              <div style={{ position: 'absolute', top: '5px', left: '20px', right: '20px', height: '2px', background: 'rgba(247, 244, 239, 0.15)', zIndex: 1 }} />
              
              {/* Highlight Progress Line */}
              <div style={{ 
                position: 'absolute', 
                top: '5px', 
                left: '20px', 
                width: `calc(${savingsPercentage}% - ${savingsPercentage > 0 ? (savingsPercentage / 100) * 40 : 0}px)`, 
                height: '2px', 
                background: 'var(--color-accent, #8CD9A5)', 
                zIndex: 2,
                transition: 'width 0.8s ease'
              }} />

              {/* Milestones Dots */}
              {milestones.map((m, idx) => {
                const isReached = carbonSaved >= m.value;
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, width: '40px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: isReached ? 'var(--color-accent, #8CD9A5)' : '#272021',
                      border: isReached ? '2px solid #f7f4ef' : '2px solid rgba(247, 244, 239, 0.2)',
                      boxShadow: isReached ? '0 0 10px var(--color-accent)' : 'none',
                      transition: 'all 0.4s ease'
                    }} />
                    <span style={{ 
                      fontSize: '0.55rem', 
                      textAlign: 'center', 
                      marginTop: '6px', 
                      color: isReached ? '#f7f4ef' : 'rgba(247, 244, 239, 0.45)',
                      fontWeight: isReached ? '700' : '400',
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

          {/* Calculator Info Link */}
          <div style={{ borderTop: '1px solid rgba(247, 244, 239, 0.1)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button 
              onClick={() => setInfoOpen(true)}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--color-sage-light, #A5B5A9)', 
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
            <span style={{ fontSize: '0.65rem', color: 'rgba(247, 244, 239, 0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Goal: {dailyBudget.toFixed(1)} kg
            </span>
          </div>
        </div>

        {/* Info Modal Glass Overlay */}
        {infoOpen && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(19, 20, 20, 0.82)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '32px',
            color: '#f7f4ef',
            textAlign: 'left'
          }}>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--color-accent, #8CD9A5)', marginBottom: '8px', letterSpacing: '0.05em' }}>
              How are savings calculated?
            </h4>
            <p style={{ fontSize: '0.75rem', lineHeight: 1.4, color: 'rgba(247, 244, 239, 0.85)', marginBottom: '16px' }}>
              Carbon savings are computed based on standard EPA greenhouse gas equivalencies. Swapping transit modes, eating plant-based meals, or reducing heating utility outputs subtracts direct coal and gas usage from your baseline footprint profile.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.7rem', color: 'rgba(247, 244, 239, 0.75)', marginBottom: '24px' }}>
              <div>● <strong>1 Phone:</strong> Charging 122 smartphones (~1.0 kg offset)</div>
              <div>● <strong>Bus Swap:</strong> Swapping commute vehicles (~4.0 kg offset)</div>
              <div>● <strong>Pine Tree:</strong> 1 full pine tree day absorption (~6.0 kg offset)</div>
            </div>
            <button 
              onClick={() => setInfoOpen(false)}
              style={{
                background: 'var(--color-accent, #8CD9A5)',
                border: 'none',
                color: 'var(--color-text-dark)',
                padding: '8px 16px',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                fontWeight: '700',
                cursor: 'pointer',
                alignSelf: 'flex-start',
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
      {/* Floating swap button in gauge mode */}
      <button 
        onClick={() => setViewMode('split')} 
        className="split-swap-button"
        style={{
          position: 'absolute',
          right: '20px',
          top: '20px',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-card-bg)',
          border: '1px solid var(--color-border-dark)',
          color: 'var(--color-text-dark)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
          boxShadow: 'var(--shadow-flat)',
          transition: 'all 0.3s ease'
        }}
        title="Swap to Split Card View"
      >
        <ArrowDownUp size={14} />
      </button>

      <h3 className="bento-card-title" style={{ marginBottom: '4px' }}>TODAY'S FOOTPRINT BALANCE</h3>
      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'lowercase', marginBottom: '24px' }}>
        your remaining emissions after actions
      </span>
      
      <div className="gauge-svg-container">
        <svg className="gauge-svg" viewBox="0 0 240 240">
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
