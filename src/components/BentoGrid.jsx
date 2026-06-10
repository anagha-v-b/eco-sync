import React from 'react';
import { Info, Sparkles, Smartphone, TreePine } from 'lucide-react';

export default function BentoGrid({ totalSavings, profile, logsCount }) {
  // Equivalency calculations
  const smartphoneEquivalent = Math.round(totalSavings * 122);
  const treesEquivalent = Number((totalSavings * 0.16).toFixed(2));

  // Level progress
  const actionsPerLevel = 5;
  const currentLevelNumber = Math.floor(logsCount / actionsPerLevel) + 1;
  const nextLevelProgress = (logsCount % actionsPerLevel) / actionsPerLevel * 100;
  
  const levels = [
    'Eco Seedling', 
    'Sapling Spark', 
    'Meadow Maker', 
    'Canopy Guardian', 
    'Forest Sentinel', 
    'Earth Steward'
  ];
  const levelName = levels[Math.min(currentLevelNumber - 1, levels.length - 1)];

  // Dynamic recommendation based on profile setup
  const getRecommendation = () => {
    if (!profile) return {
      title: "complete baseline calculations",
      text: "Run the calculator profile to evaluate your daily carbon ledger and unlock target guidelines."
    };

    const isMeatHeavy = profile.diet === 'meat_heavy' || profile.diet === 'average';
    const isHighCommuter = profile.commuteDistance > 15 && (profile.commuteVehicle === 'large_gas' || profile.commuteVehicle === 'medium_gas');
    const isHighConsumer = profile.consumption === 'high';

    if (isHighCommuter) {
      return {
        title: "commute reduction path",
        text: `Since you commute ${profile.commuteDistance}km daily in a combustion vehicle, swapping to public transit just 2 days a week avoids over 180kg CO₂ annually.`
      };
    }
    if (isMeatHeavy) {
      return {
        title: "culinary transition tip",
        text: "Your dietary profile represents your highest baseline impact. Swapping beef for vegetables twice a week reduces your food footprint by 15%."
      };
    }
    if (isHighConsumer) {
      return {
        title: "conscious shopping choice",
        text: "Manufacturing new consumer items has high supply chain footprints. Before shopping, consider vintage or repair to extend item lifecycle."
      };
    }

    return {
      title: "standby power drainage",
      text: "Unplugging household appliances on standby (microwaves, monitors, power blocks) reduces baseline grid emissions by ~0.4 kg CO₂ per night."
    };
  };

  const recommendation = getRecommendation();

  return (
    <div className="bento-row">
      {/* 1. Daily Savings Equivalence Widget */}
      <div className="bento-card bento-card-large">
        <div className="bento-card-header">
          <h4 className="bento-card-title">daily carbon saved</h4>
          <Sparkles size={14} style={{ color: 'var(--color-burgundy)' }} />
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'center' }}>
          <div>
            <div className="bento-big-num" style={{ color: 'var(--color-burgundy)' }}>
              {totalSavings.toFixed(1)} <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', textTransform: 'lowercase' }}>kg CO₂e</span>
            </div>
            <p className="bento-description">Total offsets generated from today's habit ledger.</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minWidth: '180px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ color: 'var(--color-burgundy)' }}>
                <Smartphone size={16} />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                equivalent to charging <strong style={{ color: 'var(--color-text-dark)' }}>{smartphoneEquivalent}</strong> smartphones
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ color: 'var(--color-burgundy)' }}>
                <TreePine size={16} />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                equal to absorption by <strong style={{ color: 'var(--color-text-dark)' }}>{treesEquivalent}</strong> full pine tree days
              </span>
            </div>
          </div>
        </div>
      </div>


      {/* 3. Editorial Personalized Insights Card */}
      <div className="bento-card bento-card-large" style={{ borderLeft: '3px solid var(--color-burgundy)' }}>
        <div className="bento-card-header">
          <h4 className="bento-card-title">personalized analysis</h4>
          <Info size={14} style={{ color: 'var(--color-burgundy)' }} />
        </div>
        <div className="insight-text" style={{ marginTop: '0px' }}>
          <h5 style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', marginBottom: '8px', textTransform: 'uppercase', color: 'var(--color-burgundy)' }}>
            {recommendation.title}
          </h5>
          <p style={{ lineHeight: 1.4, fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            {recommendation.text}
          </p>
        </div>
      </div>
    </div>
  );
}
