import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AtmosphericOrbitGauge from '../components/AtmosphericOrbitGauge';

describe('AtmosphericOrbitGauge Component', () => {
  const defaultProps = {
    currentBalance: 24.5,
    dailyBudget: 20.0,
    baseline: 30.0
  };

  it('renders emissions balance and goal text correctly in split-card view', () => {
    render(<AtmosphericOrbitGauge {...defaultProps} />);
    // Check balance display
    expect(screen.getByText('24.5')).toBeInTheDocument();
    expect(screen.getByText(/exceeds safe limit/i)).toBeInTheDocument();
    expect(screen.getByText('Goal: 20.0 kg')).toBeInTheDocument();
    expect(screen.getByText('carbon saved today')).toBeInTheDocument();
    
    // Savings calculation: baseline (30.0) - currentBalance (24.5) = 5.5 kg CO2e
    expect(screen.getByText('5.5')).toBeInTheDocument();
  });

  it('renders interactive particles and handles click event to pop them', () => {
    render(<AtmosphericOrbitGauge {...defaultProps} />);
    
    // Finding interactive clean/soot particle buttons
    const particles = screen.queryAllByRole('button', { name: /Exceeds Budget Soot|Clean Air Bubble/i });
    expect(particles.length).toBeGreaterThan(0);

    const initialLength = particles.length;
    const firstParticle = particles[0];

    // Click the particle to remove it
    fireEvent.click(firstParticle);
    
    // Check that we have one less particle in the list
    const remainingParticles = screen.queryAllByRole('button', { name: /Exceeds Budget Soot|Clean Air Bubble/i });
    expect(remainingParticles.length).toBe(initialLength - 1);
  });

  it('opens, focus-traps, and closes the savings explanation modal', async () => {
    render(<AtmosphericOrbitGauge {...defaultProps} />);
    
    const infoTrigger = screen.getByRole('button', { name: /How are 'Savings' calculated/i });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Click trigger to open modal
    fireEvent.click(infoTrigger);

    const modal = screen.getByRole('dialog');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveAttribute('aria-modal', 'true');

    // Close button should be focused
    const closeBtn = screen.getByRole('button', { name: /close info/i });
    expect(document.activeElement).toBe(closeBtn);

    // Press Escape to close modal
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    
    // Trigger should be focused again
    expect(document.activeElement).toBe(infoTrigger);
  });

  it('traps Tab focus inside the Info modal', () => {
    render(<AtmosphericOrbitGauge {...defaultProps} />);
    
    const infoTrigger = screen.getByRole('button', { name: /How are 'Savings' calculated/i });
    fireEvent.click(infoTrigger);

    const closeBtn = screen.getByRole('button', { name: /close info/i });
    
    // There is only one focusable element in this simple modal (close button),
    // pressing Tab or Shift+Tab should cycle focus or keep focus on it.
    fireEvent.keyDown(closeBtn, { key: 'Tab', code: 'Tab' });
    expect(document.activeElement).toBe(closeBtn);

    fireEvent.keyDown(closeBtn, { key: 'Tab', code: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(closeBtn);
  });
});
