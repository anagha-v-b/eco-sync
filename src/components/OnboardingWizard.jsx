import React, { useState, useEffect } from 'react';
import { 
  DIET_COEFFICIENTS, 
  TRANSPORT_COEFFICIENTS, 
  HOUSING_COEFFICIENTS, 
  CONSUMPTION_COEFFICIENTS, 
  GLOBAL_DAILY_BUDGET 
} from '../data/lifestyleDatabase';
import { ArrowRight, ArrowLeft, Leaf, Compass } from 'lucide-react';
import soundManager from '../data/ecoSoundManager';

export default function OnboardingWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const totalSteps = 7; // 7 lifestyle questionnaire steps

  // Onboarding Form States
  const [diet, setDiet] = useState('average');
  const [commuteDistance, setCommuteDistance] = useState(20); // km per day
  const [commuteVehicle, setCommuteVehicle] = useState('medium_gas');
  const [housingHeat, setHousingHeat] = useState('gas_heating');
  const [consumption, setConsumption] = useState('average');
  const [flightsShort, setFlightsShort] = useState(1); // annual short haul
  const [flightsLong, setFlightsLong] = useState(0);  // annual long haul
  const [houseSize, setHouseSize] = useState('medium'); // small, medium, large

  // Calculating state & animation
  const [isCalculating, setIsCalculating] = useState(false);
  const [progress, setProgress] = useState(0);

  const calculationMessages = [
    "Analyzing diet preferences...",
    "Computing daily transportation carbon costs...",
    "Evaluating home thermal utility averages...",
    "Benchmarking emissions against 1.5°C targets...",
    "Assembling personalized EcoSync dashboard..."
  ];

  const [message, setMessage] = useState(calculationMessages[0]);
  const [messageOpacity, setMessageOpacity] = useState(1);

  const handleNext = () => {
    soundManager.playClick();
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Trigger calculation flow when clicking continue on Step 7
      setIsCalculating(true);
    }
  };

  useEffect(() => {
    if (!isCalculating) return;

    // 1. Progress line increment
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2.5; // reaches 100% in 4000ms
      });
    }, 100);

    // 2. User friendly message cycle with smooth cross-fades
    let currentMsgIdx = 0;
    const messageInterval = setInterval(() => {
      if (currentMsgIdx < calculationMessages.length - 1) {
        // Fade out message text
        setMessageOpacity(0);
        setTimeout(() => {
          currentMsgIdx++;
          setMessage(calculationMessages[currentMsgIdx]);
          // Fade back in
          setMessageOpacity(1);
        }, 250);
      } else {
        clearInterval(messageInterval);
      }
    }, 850);

    // 3. Complete baseline calculation and redirect
    const redirectTimeout = setTimeout(() => {
      calculateAndFinish();
    }, 4500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
      clearTimeout(redirectTimeout);
    };
  }, [isCalculating]);

  const handleBack = () => {
    soundManager.playClick();
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const calculateAndFinish = () => {
    const dietEmissions = DIET_COEFFICIENTS[diet];
    const transportEmissions = commuteDistance * TRANSPORT_COEFFICIENTS[commuteVehicle];
    let housingBase = HOUSING_COEFFICIENTS[housingHeat];
    if (houseSize === 'small') housingBase *= 0.7;
    if (houseSize === 'large') housingBase *= 1.4;
    const housingEmissions = housingBase;
    const consumptionEmissions = CONSUMPTION_COEFFICIENTS[consumption];
    const annualFlightEmissions = (flightsShort * 180) + (flightsLong * 1100);
    const flightEmissionsDaily = annualFlightEmissions / 365;

    const totalDailyBaseline = Number(
      (dietEmissions + transportEmissions + housingEmissions + consumptionEmissions + flightEmissionsDaily).toFixed(1)
    );

    const profile = {
      diet,
      commuteDistance,
      commuteVehicle,
      housingHeat,
      consumption,
      flightsShort,
      flightsLong,
      houseSize,
      baselineDaily: totalDailyBaseline,
      dailyBudget: GLOBAL_DAILY_BUDGET
    };
    
    onComplete(profile);
  };

  const renderStepContent = () => {
    switch(step) {
      case 1:
        return (
          <div className="wizard-slide">
            <div style={{ display: 'flex', marginBottom: '24px' }}>
              <div style={{ padding: '12px', background: 'rgba(74, 21, 27, 0.05)', border: '1px solid var(--color-border-dark)' }}>
                <Compass size={32} style={{ color: 'var(--color-burgundy)' }} />
              </div>
            </div>
            <h2 className="onboarding-question-title">establish your baseline.</h2>
            <p className="onboarding-description" style={{ maxWidth: '440px', marginBottom: '32px' }}>
              We work in the intersection of climate action and personal habit tracking. Complete a quick lifestyle checklist to evaluate your daily carbon output.
            </p>
            <div>
              <button className="btn-editorial btn-editorial-primary" onClick={handleNext}>
                begin baseline <ArrowRight size={12} style={{ marginLeft: '8px' }} />
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="wizard-slide">
            <h2 className="onboarding-question-title">what is your dietary profile?</h2>
            <p className="onboarding-description">Your diet has a direct impact on land usage and global methane levels.</p>
            <div className="selection-grid">
              <div className={`selection-card ${diet === 'meat_heavy' ? 'selected' : ''}`} onClick={() => { soundManager.playClick(); setDiet('meat_heavy'); }}>
                <h4>meat heavy</h4>
                <p>Eat animal proteins in almost every meal daily.</p>
              </div>
              <div className={`selection-card ${diet === 'average' ? 'selected' : ''}`} onClick={() => { soundManager.playClick(); setDiet('average'); }}>
                <h4>balanced mixed</h4>
                <p>Standard diet, with occasional vegetarian meals.</p>
              </div>
              <div className={`selection-card ${diet === 'vegetarian' ? 'selected' : ''}`} onClick={() => { soundManager.playClick(); setDiet('vegetarian'); }}>
                <h4>vegetarian</h4>
                <p>Exclude meat and fish, but consume eggs and dairy.</p>
              </div>
              <div className={`selection-card ${diet === 'vegan' ? 'selected' : ''}`} onClick={() => { soundManager.playClick(); setDiet('vegan'); }}>
                <h4>fully vegan</h4>
                <p>Strictly plant-based. Zero animal products.</p>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="wizard-slide">
            <h2 className="onboarding-question-title">daily transit commute.</h2>
            <p className="onboarding-description">How many kilometers do you travel (roundtrip) in an average weekday?</p>
            <div className="slider-container">
              <div className="slider-value">{commuteDistance} <span style={{ fontSize: '1rem', color: 'var(--color-sage-light)' }}>km / day</span></div>
              <input 
                type="range" 
                min="0" 
                max="120" 
                value={commuteDistance} 
                onChange={(e) => setCommuteDistance(Number(e.target.value))} 
                className="slider-input"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-sage-light)', opacity: 0.6 }}>
                <span>0 km</span>
                <span>60 km</span>
                <span>120+ km</span>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="wizard-slide">
            <h2 className="onboarding-question-title">primary transit mode?</h2>
            <p className="onboarding-description">Select the vehicle type representing the majority of your daily commute distance.</p>
            <div className="selection-grid">
              <div className={`selection-card ${commuteVehicle === 'large_gas' ? 'selected' : ''}`} onClick={() => { soundManager.playClick(); setCommuteVehicle('large_gas'); }}>
                <h4>large combustion</h4>
                <p>Conventional heavy gasoline or diesel SUV/truck.</p>
              </div>
              <div className={`selection-card ${commuteVehicle === 'medium_gas' ? 'selected' : ''}`} onClick={() => { soundManager.playClick(); setCommuteVehicle('medium_gas'); }}>
                <h4>midsize car</h4>
                <p>Standard fuel-efficient gasoline or hybrid compact.</p>
              </div>
              <div className={`selection-card ${commuteVehicle === 'electric' ? 'selected' : ''}`} onClick={() => { soundManager.playClick(); setCommuteVehicle('electric'); }}>
                <h4>electric vehicle</h4>
                <p>100% battery electric vehicle charged on the grid.</p>
              </div>
              <div className={`selection-card ${commuteVehicle === 'transit' ? 'selected' : ''}`} onClick={() => { soundManager.playClick(); setCommuteVehicle('transit'); }}>
                <h4>public transit</h4>
                <p>Shared grid networks (subways, rails, and buses).</p>
              </div>
              <div className={`selection-card ${commuteVehicle === 'active' ? 'selected' : ''}`} onClick={() => { soundManager.playClick(); setCommuteVehicle('active'); }} style={{ gridColumn: 'span 2' }}>
                <h4>active walk / bike</h4>
                <p>Human-powered active transit with zero carbon footprint.</p>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="wizard-slide">
            <h2 className="onboarding-question-title">annual flights taken.</h2>
            <p className="onboarding-description">Aircraft combustion is the highest intensity emission event for most individuals.</p>
            
            <div className="slider-container" style={{ margin: '20px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-dark)' }}>short-haul flights (&lt; 3 hrs)</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button type="button" className="btn-log-habit" style={{ borderColor: 'var(--color-border-dark)', color: 'var(--color-text-dark)' }} onClick={() => { soundManager.playClick(); setFlightsShort(Math.max(0, flightsShort - 1)); }}>-</button>
                  <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-burgundy)', width: '30px', textAlign: 'center' }}>{flightsShort}</span>
                  <button type="button" className="btn-log-habit" style={{ borderColor: 'var(--color-border-dark)', color: 'var(--color-text-dark)' }} onClick={() => { soundManager.playClick(); setFlightsShort(flightsShort + 1); }}>+</button>
                </div>
              </div>
            </div>

            <div className="slider-container" style={{ margin: '20px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-dark)' }}>long-haul flights (&gt; 3 hrs)</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button type="button" className="btn-log-habit" style={{ borderColor: 'var(--color-border-dark)', color: 'var(--color-text-dark)' }} onClick={() => { soundManager.playClick(); setFlightsLong(Math.max(0, flightsLong - 1)); }}>-</button>
                  <span style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-burgundy)', width: '30px', textAlign: 'center' }}>{flightsLong}</span>
                  <button type="button" className="btn-log-habit" style={{ borderColor: 'var(--color-border-dark)', color: 'var(--color-text-dark)' }} onClick={() => { soundManager.playClick(); setFlightsLong(flightsLong + 1); }}>+</button>
                </div>
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="wizard-slide">
            <h2 className="onboarding-question-title">home heating & scale.</h2>
            <p className="onboarding-description">Utility infrastructure represents a major share of building energy emissions.</p>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Heating Source</label>
              <div className="selection-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className={`selection-card ${housingHeat === 'gas_heating' ? 'selected' : ''}`} onClick={() => { soundManager.playClick(); setHousingHeat('gas_heating'); }} style={{ padding: '12px', textAlign: 'center' }}>
                  <h5 style={{ fontSize: '0.8rem' }}>gas</h5>
                </div>
                <div className={`selection-card ${housingHeat === 'electric_heat' ? 'selected' : ''}`} onClick={() => { soundManager.playClick(); setHousingHeat('electric_heat'); }} style={{ padding: '12px', textAlign: 'center' }}>
                  <h5 style={{ fontSize: '0.8rem' }}>electric</h5>
                </div>
                <div className={`selection-card ${housingHeat === 'renewable' ? 'selected' : ''}`} onClick={() => { soundManager.playClick(); setHousingHeat('renewable'); }} style={{ padding: '12px', textAlign: 'center' }}>
                  <h5 style={{ fontSize: '0.8rem' }}>solar / green</h5>
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', marginBottom: '8px' }}>Home Scale</label>
              <div className="selection-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                <div className={`selection-card ${houseSize === 'small' ? 'selected' : ''}`} onClick={() => { soundManager.playClick(); setHouseSize('small'); }} style={{ padding: '12px', textAlign: 'center' }}>
                  <h5 style={{ fontSize: '0.8rem' }}>apartment</h5>
                </div>
                <div className={`selection-card ${houseSize === 'medium' ? 'selected' : ''}`} onClick={() => { soundManager.playClick(); setHouseSize('medium'); }} style={{ padding: '12px', textAlign: 'center' }}>
                  <h5 style={{ fontSize: '0.8rem' }}>standard</h5>
                </div>
                <div className={`selection-card ${houseSize === 'large' ? 'selected' : ''}`} onClick={() => { soundManager.playClick(); setHouseSize('large'); }} style={{ padding: '12px', textAlign: 'center' }}>
                  <h5 style={{ fontSize: '0.8rem' }}>estate</h5>
                </div>
              </div>
            </div>
          </div>
        );
      case 7:
        return (
          <div className="wizard-slide">
            <h2 className="onboarding-question-title">consumption style.</h2>
            <p className="onboarding-description">Supply chains, logistics, and manufacturing consume high volumes of fossil energy.</p>
            <div className="selection-grid">
              <div className={`selection-card ${consumption === 'high' ? 'selected' : ''}`} onClick={() => { soundManager.playClick(); setConsumption('high'); }}>
                <h4>active buyer</h4>
                <p>Frequently buy new apparel, gadget upgrades, and online goods.</p>
              </div>
              <div className={`selection-card ${consumption === 'average' ? 'selected' : ''}`} onClick={() => { soundManager.playClick(); setConsumption('average'); }}>
                <h4>standard</h4>
                <p>Standard purchases as needed. Occasionally buy vintage.</p>
              </div>
              <div className={`selection-card ${consumption === 'minimalist' ? 'selected' : ''}`} onClick={() => { soundManager.playClick(); setConsumption('minimalist'); }} style={{ gridColumn: 'span 2' }}>
                <h4>minimalist / conscious</h4>
                <p>Actively mended, patch, or buy secondhand to avoid new carbon events.</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isCalculating) {
    return (
      <div className="onboarding-screen">
        <div className="onboarding-split-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ textAlign: 'center', width: '100%', maxWidth: '440px', padding: '48px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
              <Compass 
                size={48} 
                style={{ 
                  color: 'var(--color-burgundy)',
                  animation: 'spin 2s linear infinite'
                }} 
              />
            </div>
            
            <h2 className="onboarding-question-title" style={{ fontSize: '1.4rem', marginBottom: '20px' }}>
              calculating ledger...
            </h2>
            
            <div style={{ height: '2px', background: 'rgba(19, 20, 20, 0.08)', width: '100%', marginBottom: '24px', position: 'relative' }}>
              <div 
                style={{ 
                  position: 'absolute', 
                  left: 0, 
                  top: 0, 
                  height: '100%', 
                  background: 'var(--color-burgundy)', 
                  width: `${progress}%`,
                  transition: 'width 0.1s linear'
                }} 
              />
            </div>
            
            <p style={{ 
              color: 'var(--color-text-muted)', 
              fontSize: '0.85rem', 
              minHeight: '40px',
              transition: 'opacity 0.25s ease',
              opacity: messageOpacity
            }}>
              {message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-screen">
      <div className="onboarding-split-container">
        
        {/* Form Pane */}
        <div className="onboarding-content-pane">
          {step > 1 && (
            <div className="onboarding-progress-bar">
              {Array.from({ length: totalSteps - 1 }).map((_, idx) => (
                <div 
                  key={idx} 
                  className={`progress-dot ${step - 1 > idx ? 'active' : ''}`}
                />
              ))}
            </div>
          )}
          
          {renderStepContent()}

          {step > 1 && step < totalSteps && (
            <div className="onboarding-controls">
              <button className="btn-editorial" style={{ color: 'var(--color-text-dark)', borderColor: 'var(--color-border-dark)' }} onClick={handleBack}>
                <ArrowLeft size={10} style={{ marginRight: '6px' }} /> back
              </button>
              <button className="btn-editorial btn-editorial-primary" onClick={handleNext}>
                continue <ArrowRight size={10} style={{ marginLeft: '6px' }} />
              </button>
            </div>
          )}
          
          {step === totalSteps && (
            <div className="onboarding-controls">
              <button className="btn-editorial" style={{ color: 'var(--color-text-dark)', borderColor: 'var(--color-border-dark)' }} onClick={handleBack}>
                <ArrowLeft size={10} style={{ marginRight: '6px' }} /> back
              </button>
              <button className="btn-editorial btn-editorial-primary" onClick={handleNext}>
                calculate ledger <ArrowRight size={10} style={{ marginLeft: '6px' }} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
