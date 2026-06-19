import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import OnboardingWizard from '../components/OnboardingWizard';

describe('OnboardingWizard Component', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    mockOnComplete.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders Step 1 intro screen and clicks begin baseline', () => {
    render(<OnboardingWizard onComplete={mockOnComplete} />);
    expect(screen.getByText('establish your baseline.')).toBeInTheDocument();
    
    const beginButton = screen.getByRole('button', { name: /begin baseline/i });
    fireEvent.click(beginButton);
    
    // Should progress to diet selection
    expect(screen.getByText('what is your dietary profile?')).toBeInTheDocument();
  });

  it('goes through full onboarding questionnaire and completes calculation', () => {
    render(<OnboardingWizard onComplete={mockOnComplete} />);
    
    // Step 1: Begin
    fireEvent.click(screen.getByRole('button', { name: /begin baseline/i }));
    
    // Step 2: Diet selection (select vegan)
    const veganButton = screen.getByRole('radio', { name: /fully vegan/i });
    fireEvent.click(veganButton);
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Step 3: Transit Commute (commuteDistance slider - value starts at 0, we can drag it or keep 0)
    // Keep it at 0 for simplicity or drag it
    const distanceSlider = screen.getByLabelText(/Daily commute distance in kilometers/i);
    fireEvent.change(distanceSlider, { target: { value: '25' } });
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Step 4: Primary Transit Mode (select electric vehicle)
    const evButton = screen.getByRole('radio', { name: /electric vehicle/i });
    fireEvent.click(evButton);
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Step 5: Flights (increase short-haul flights by 1, long-haul by 1)
    const incShortBtn = screen.getByRole('button', { name: /Increase short-haul flights/i });
    fireEvent.click(incShortBtn);
    const incLongBtn = screen.getByRole('button', { name: /Increase long-haul flights/i });
    fireEvent.click(incLongBtn);
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Step 6: Home heating & scale (select electric and standard)
    const electricHeatBtn = screen.getByRole('radio', { name: /electric/i });
    fireEvent.click(electricHeatBtn);
    const standardScaleBtn = screen.getByRole('radio', { name: /standard/i });
    fireEvent.click(standardScaleBtn);
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Step 7: Consumption style (select minimalist)
    const minimalistBtn = screen.getByRole('radio', { name: /minimalist/i });
    fireEvent.click(minimalistBtn);
    
    const calculateBtn = screen.getByRole('button', { name: /calculate ledger/i });
    fireEvent.click(calculateBtn);

    // Should show calculating ledger screen
    expect(screen.getByText('calculating ledger...')).toBeInTheDocument();

    // Fast-forward animation timers (4500ms calculation duration)
    act(() => {
      vi.advanceTimersByTime(4500);
    });

    // Check if onComplete is triggered with accurate calculation
    expect(mockOnComplete).toHaveBeenCalledTimes(1);
    const profile = mockOnComplete.mock.calls[0][0];
    expect(profile).toBeDefined();
    expect(profile.diet).toBe('vegan');
    expect(profile.commuteDistance).toBe(25);
    expect(profile.commuteVehicle).toBe('electric');
    expect(profile.flightsShort).toBe(1);
    expect(profile.flightsLong).toBe(1);
    expect(profile.housingHeat).toBe('electric_heat');
    expect(profile.houseSize).toBe('medium');
    expect(profile.consumption).toBe('minimalist');
  });

  it('validates navigation buttons are disabled when selections are missing', () => {
    render(<OnboardingWizard onComplete={mockOnComplete} />);
    
    // Step 1: Begin
    fireEvent.click(screen.getByRole('button', { name: /begin baseline/i }));
    
    // Step 2: Diet selection. "continue" should be disabled because no option selected
    const continueBtn = screen.getByRole('button', { name: /continue/i });
    expect(continueBtn).toBeDisabled();

    // Select diet, should be enabled
    fireEvent.click(screen.getByRole('radio', { name: /^vegetarian/i }));
    expect(continueBtn).not.toBeDisabled();
  });
});
