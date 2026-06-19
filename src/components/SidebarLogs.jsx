import React from 'react';
import { X, Trash2, CalendarRange } from 'lucide-react';

export default function SidebarLogs({ isOpen, onClose, logs, onDeleteLog }) {
  return (
    <>
      {/* Dimmed backdrop background wrapping the sliding sidebar container */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`} 
        onClick={onClose}
      >
        <div className="sidebar-container" onClick={(e) => e.stopPropagation()}>
          <div className="sidebar-header">
            <div>
              <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase' }}>ledger history</h3>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>today's logs ledger</span>
            </div>
            <button className="sidebar-close" onClick={onClose} aria-label="Close sidebar">
              <X size={18} />
            </button>
          </div>

          <div className="sidebar-content">
            {logs && logs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border-dark)', paddingBottom: '8px', marginBottom: '8px' }}>
                  logged entries ({logs.length})
                </div>
                
                {logs.map((log) => (
                  <div key={log.id} className="ledger-item">
                    <div className="ledger-item-info">
                      <span className="ledger-item-title">{log.title}</span>
                      <span className="ledger-item-time">{log.timeString}</span>
                    </div>
                    
                    <div className="ledger-item-action">
                      <span className="ledger-item-impact">
                        -{log.impact.toFixed(1)} kg
                      </span>
                      <button 
                        onClick={() => onDeleteLog(log.id)}
                        className="btn-delete-log"
                        aria-label={`Delete log ${log.title}`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="sidebar-empty-state">
                <CalendarRange size={40} style={{ color: 'var(--color-text-muted)', opacity: 0.6 }} />
                <div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px', textTransform: 'uppercase' }}>ledger is clear</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', maxWidth: '220px', margin: '0 auto', lineOffset: 1.3 }}>
                    No carbon entries logged today. Select items from the catalog list to record actions.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
