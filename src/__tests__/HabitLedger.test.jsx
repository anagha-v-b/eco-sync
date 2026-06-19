import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HabitLedger from '../components/HabitLedger';

describe('HabitLedger Component', () => {
  const mockOnLogHabit = vi.fn();

  it('renders correctly and searches habits by search input text', () => {
    render(<HabitLedger onLogHabit={mockOnLogHabit} />);
    
    // Check initial search input
    const searchInput = screen.getByLabelText(/Search carbon saving habits/i);
    expect(searchInput).toBeInTheDocument();

    // Verify list of initial habits exist
    expect(screen.getByText('Plant-Based Lunch')).toBeInTheDocument();
    expect(screen.getByText('Zero-Standby Sweep')).toBeInTheDocument();

    // Perform query filter
    fireEvent.change(searchInput, { target: { value: 'Lunch' } });

    // Verify filtered results
    expect(screen.getByText('Plant-Based Lunch')).toBeInTheDocument();
    expect(screen.queryByText('Zero-Standby Sweep')).not.toBeInTheDocument();
  });

  it('filters habits by category tab clicks', () => {
    render(<HabitLedger onLogHabit={mockOnLogHabit} />);
    
    // Find category tabs
    const transportTab = screen.getByRole('tab', { name: /transport/i });
    expect(transportTab).toBeInTheDocument();
    
    // Initial display includes diet and transport
    expect(screen.getByText('Plant-Based Lunch')).toBeInTheDocument();
    expect(screen.getByText('Walk or Bike Commute')).toBeInTheDocument();

    // Click transport filter
    fireEvent.click(transportTab);
    
    // Verify results
    expect(screen.queryByText('Plant-Based Lunch')).not.toBeInTheDocument();
    expect(screen.getByText('Walk or Bike Commute')).toBeInTheDocument();
    expect(transportTab).toHaveAttribute('aria-selected', 'true');
  });

  it('triggers onLogHabit when clicking log button and updates state', async () => {
    vi.useFakeTimers();
    render(<HabitLedger onLogHabit={mockOnLogHabit} />);
    
    const logButton = screen.getByRole('button', { name: /Log Plant-Based Lunch/i });
    expect(logButton).toBeInTheDocument();

    // Click to log
    fireEvent.click(logButton);

    // Verify callback
    expect(mockOnLogHabit).toHaveBeenCalledTimes(1);
    expect(mockOnLogHabit).toHaveBeenCalledWith(expect.objectContaining({
      id: 'diet_plant_lunch',
      title: 'Plant-Based Lunch'
    }));

    // Check success button class update
    expect(logButton).toHaveClass('success');

    // Timer expires, success status resets
    fireEvent.change(screen.getByLabelText(/Search carbon saving habits/i), { target: { value: '' } });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(logButton).not.toHaveClass('success');
    
    vi.useRealTimers();
  });
});
