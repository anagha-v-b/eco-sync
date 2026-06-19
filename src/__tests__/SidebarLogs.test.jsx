import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SidebarLogs from '../components/SidebarLogs';

describe('SidebarLogs Component', () => {
  const mockOnClose = vi.fn();
  const mockOnDeleteLog = vi.fn();

  const sampleLogs = [
    { id: '1', title: 'Plant-Based Lunch', impact: 1.8, category: 'diet', timeString: '12:30 PM' },
    { id: '2', title: 'Zero-Standby Sweep', impact: 0.4, category: 'household', timeString: '09:00 PM' }
  ];

  it('renders clear/empty state when there are no logs', () => {
    render(<SidebarLogs isOpen={true} onClose={mockOnClose} logs={[]} onDeleteLog={mockOnDeleteLog} />);
    
    expect(screen.getByText('ledger is clear')).toBeInTheDocument();
    expect(screen.getByText(/No carbon entries logged today/i)).toBeInTheDocument();
  });

  it('renders active logs list and triggers delete callback', () => {
    render(<SidebarLogs isOpen={true} onClose={mockOnClose} logs={sampleLogs} onDeleteLog={mockOnDeleteLog} />);
    
    expect(screen.getByText('Plant-Based Lunch')).toBeInTheDocument();
    expect(screen.getByText('Zero-Standby Sweep')).toBeInTheDocument();
    expect(screen.getByText('logged entries (2)')).toBeInTheDocument();

    const deleteBtns = screen.queryAllByRole('button', { name: /Delete log/i });
    expect(deleteBtns.length).toBe(2);

    // Delete first item
    fireEvent.click(deleteBtns[0]);
    expect(mockOnDeleteLog).toHaveBeenCalledTimes(1);
    expect(mockOnDeleteLog).toHaveBeenCalledWith('1');
  });

  it('handles Escape key to trigger onClose drawer close', () => {
    render(<SidebarLogs isOpen={true} onClose={mockOnClose} logs={sampleLogs} onDeleteLog={mockOnDeleteLog} />);
    
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('traps Tab focus inside the open sidebar logs drawer', () => {
    render(<SidebarLogs isOpen={true} onClose={mockOnClose} logs={sampleLogs} onDeleteLog={mockOnDeleteLog} />);
    
    // Elements: Close button, Delete btn 1, Delete btn 2
    const closeBtn = screen.getByRole('button', { name: /Close sidebar/i });
    const deleteBtns = screen.queryAllByRole('button', { name: /Delete log/i });
    
    expect(document.activeElement).toBe(closeBtn);

    // Focus last element
    deleteBtns[1].focus();
    expect(document.activeElement).toBe(deleteBtns[1]);

    // Press Tab on last element, should wrap to close button
    fireEvent.keyDown(deleteBtns[1], { key: 'Tab', code: 'Tab' });
    expect(document.activeElement).toBe(closeBtn);

    // Press Shift+Tab on first element, should wrap to last delete button
    fireEvent.keyDown(closeBtn, { key: 'Tab', code: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(deleteBtns[1]);
  });
});
