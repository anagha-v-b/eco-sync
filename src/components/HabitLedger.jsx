import React, { useState } from 'react';
import { HABIT_CATALOG } from '../data/lifestyleDatabase';
import { Plus, Check, Search } from 'lucide-react';
import soundManager from '../data/ecoSoundManager';

export default function HabitLedger({ onLogHabit }) {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [successStates, setSuccessStates] = useState({});

  const categories = ['all', 'diet', 'transport', 'household', 'consumption'];

  const handleLogClick = (habit) => {
    onLogHabit(habit);
    setSuccessStates(prev => ({ ...prev, [habit.id]: true }));
    setTimeout(() => {
      setSuccessStates(prev => ({ ...prev, [habit.id]: false }));
    }, 1000);
  };

  const filteredHabits = HABIT_CATALOG.filter(habit => {
    const matchesCategory = filter === 'all' || habit.category === filter;
    const matchesSearch = habit.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          habit.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-dark)', paddingBottom: '16px' }}>
        <div>
          <h3 className="bento-card-title">daily actions</h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>log carbon saving habits</span>
        </div>
        
        {/* Search bar */}
        <div style={{ position: 'relative', width: '160px' }}>
          <input
            type="text"
            placeholder="search habits..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-editorial"
            style={{ 
              padding: '6px 12px 6px 28px', 
              fontSize: '0.7rem',
              borderRadius: 'var(--radius-xs)'
            }}
          />
          <Search size={10} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
        </div>
      </div>

      {/* Category filter tabs */}
      <div className="habit-filter-tabs">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => { soundManager.playClick(); setFilter(cat); }}
            className={`habit-tab ${filter === cat ? 'active' : ''}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Active catalog list */}
      <div className="habit-list">
        {filteredHabits.length > 0 ? (
          filteredHabits.map(habit => {
            const isSuccess = successStates[habit.id];
            
            return (
              <div key={habit.id} className="habit-item">
                <div className="habit-info">
                  <div className="habit-title-container">
                    <span className="habit-title">{habit.title}</span>
                    <span className={`habit-badge badge-${habit.category}`}>
                      {habit.category}
                    </span>
                  </div>
                  <span className="habit-desc">{habit.description}</span>
                </div>

                <div className="habit-action">
                  <span className="habit-impact-val">
                    -{habit.impact.toFixed(1)} <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', fontWeight: '400' }}>kg</span>
                  </span>
                  <button
                    onClick={() => handleLogClick(habit)}
                    className={`btn-log-habit ${isSuccess ? 'success' : ''}`}
                    aria-label={`Log ${habit.title}`}
                  >
                    {isSuccess ? <Check size={14} /> : <Plus size={14} />}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '40px 0', fontSize: '0.8rem' }}>
            No actions found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
