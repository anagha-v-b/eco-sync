import React from 'react';
import { X, Trash2, CalendarRange } from 'lucide-react';

export default function SidebarLogs({ isOpen, onClose, logs, onDeleteLog }) {
  const containerRef = React.useRef(null);
  const closeButtonRef = React.useRef(null);
  React.useEffect(() => {
    if (isOpen) {
      // Focus close button on open
      closeButtonRef.current?.focus();

      // Escape listener
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      // Focus trap
      const handleFocusTrap = (e) => {
        if (!containerRef.current) return;
        const focusableElements = containerRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
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
  }, [isOpen, onClose]);

  return (
    <>
      {/* Dimmed backdrop background wrapping the sliding sidebar container */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`} 
        onClick={onClose}
      >
        <div 
          ref={containerRef}
          className="sidebar-container" 
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Ledger history"
        >
          <div className="sidebar-header">
            <div>
              <h3 style={{ fontSize: '1.1rem', textTransform: 'uppercase' }}>ledger history</h3>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>today's logs ledger</span>
            </div>
            <button 
              ref={closeButtonRef}
              className="sidebar-close" 
              onClick={onClose} 
              aria-label="Close sidebar"
            >
              <X size={18} aria-hidden="true" />
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
                        <Trash2 size={13} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="sidebar-empty-state">
                <CalendarRange size={40} style={{ color: 'var(--color-text-muted)', opacity: 0.6 }} aria-hidden="true" />
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
