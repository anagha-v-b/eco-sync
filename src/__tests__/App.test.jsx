import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import App from '../App';

describe('App Component Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const completeOnboardingFlow = () => {
    // Step 1
    fireEvent.click(screen.getByRole('button', { name: /begin baseline/i }));
    
    // Step 2 (diet)
    fireEvent.click(screen.getByRole('radio', { name: /fully vegan/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Step 3 (commute)
    const commuteSlider = screen.getByLabelText(/Daily commute distance in kilometers/i);
    fireEvent.change(commuteSlider, { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Step 4 (vehicle)
    fireEvent.click(screen.getByRole('radio', { name: /electric vehicle/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Step 5 (flights)
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Step 6 (housing)
    fireEvent.click(screen.getByRole('radio', { name: /solar/i }));
    fireEvent.click(screen.getByRole('radio', { name: /standard/i }));
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Step 7 (consumption)
    fireEvent.click(screen.getByRole('radio', { name: /minimalist/i }));
    fireEvent.click(screen.getByRole('button', { name: /calculate ledger/i }));

    // Advance 4.5 seconds for calculation animation
    act(() => {
      vi.advanceTimersByTime(4500);
    });
  };

  it('initially renders the onboarding wizard, completes it, and renders dashboard', () => {
    render(<App />);
    
    // Initial render should show onboarding
    expect(screen.getByText('establish your baseline.')).toBeInTheDocument();

    completeOnboardingFlow();

    // After onboarding completes, it should show the dashboard
    expect(screen.getByRole('heading', { name: 'eco-sync' })).toBeInTheDocument();
    
    // Baseline footprint should be rendered: vegan (2.9) + 10km EV (10 * 0.08 = 0.8) + solar housing (1.5) + minimalist consumption (3.2) = 8.4 kg CO2e
    expect(screen.getByText('8.4')).toBeInTheDocument(); // start point/baseline display
  });

  it('allows logging habits, updating emissions, history list, and resetting profile', () => {
    // Setup pre-calculated profile in localStorage to skip wizard step
    const mockProfile = {
      diet: 'vegan',
      commuteDistance: 10,
      commuteVehicle: 'electric',
      housingHeat: 'renewable',
      houseSize: 'medium',
      consumption: 'minimalist',
      flightsShort: 0,
      flightsLong: 0,
      baselineDaily: 8.4,
      dailyBudget: 20.0
    };
    localStorage.setItem('ecosync_profile', JSON.stringify(mockProfile));

    render(<App />);

    // Should load straight to dashboard
    expect(screen.getByRole('heading', { name: 'eco-sync' })).toBeInTheDocument();

    // Check baseline is 8.4
    expect(screen.getByText('8.4')).toBeInTheDocument();
    
    // Log a habit: "Plant-Based Lunch" (saves 1.8kg)
    const logBtn = screen.getByRole('button', { name: /Log Plant-Based Lunch/i });
    fireEvent.click(logBtn);

    // Balance should update: 8.4 baseline - 1.8 savings = 6.6 kg CO2e
    expect(screen.getByText('6.6')).toBeInTheDocument();
    expect(screen.getAllByText('1.8').length).toBeGreaterThan(0); // Saved counter should show 1.8

    // Open History drawer
    const historyTriggerBtn = screen.getByRole('button', { name: /Open ledger history/i });
    fireEvent.click(historyTriggerBtn);

    // Verify log is in history list
    expect(screen.getByRole('dialog', { name: /Ledger history/i })).toBeInTheDocument();
    expect(screen.getByText('logged entries (1)')).toBeInTheDocument();

    // Delete the log in history
    const deleteBtn = screen.getByRole('button', { name: /Delete log Plant-Based Lunch/i });
    fireEvent.click(deleteBtn);
    // Saved should return to 0.0, balance back to 8.4
    expect(screen.getByText('8.4')).toBeInTheDocument();
    expect(screen.getAllByText('0.0').length).toBeGreaterThan(0);

    // Close sidebar
    const closeSidebarBtn = screen.getByRole('button', { name: /Close sidebar/i });
    fireEvent.click(closeSidebarBtn);

    // History trigger should regain focus
    expect(document.activeElement).toBe(historyTriggerBtn);

    // Mock window.confirm for Reset Profile
    window.confirm = vi.fn(() => true);

    // Click Reset baseline profile button
    const resetBtn = screen.getByRole('button', { name: /Reset baseline evaluation/i });
    fireEvent.click(resetBtn);

    // Should be returned to onboarding wizard baseline setup
    expect(screen.getByText('establish your baseline.')).toBeInTheDocument();
  });

  it('allows theme preference toggling', () => {
    const mockProfile = {
      diet: 'vegan',
      commuteDistance: 0,
      commuteVehicle: 'active',
      housingHeat: 'renewable',
      houseSize: 'small',
      consumption: 'minimalist',
      flightsShort: 0,
      flightsLong: 0,
      baselineDaily: 8.0,
      dailyBudget: 20.0
    };
    localStorage.setItem('ecosync_profile', JSON.stringify(mockProfile));

    render(<App />);

    const themeToggleBtn = screen.getByRole('button', { name: /Switch to/i });
    
    // Toggle theme
    fireEvent.click(themeToggleBtn);
    expect(localStorage.getItem('ecosync_theme')).not.toBe('auto');
  });
});
