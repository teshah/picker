import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Mock fetch for list15.txt
beforeEach(() => {
  global.fetch = vi.fn((url) => {
    if (url.includes('list15.txt')) {
      return Promise.resolve({
        text: () => Promise.resolve(
          [
            'Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy', 'Karl', 'Liam', 'Mallory', 'Niaj', 'Olivia'
          ].join('\n')
        )
      });
    }
    // fallback for other files
    return Promise.resolve({ text: () => Promise.resolve('') });
  }) as any;
});

afterEach(() => {
  vi.resetAllMocks();
});

describe('App', () => {
  it('renders the 15 button and loads 15 names when clicked', async () => {
    render(<App />);
    // Find the '15' button (will be added in implementation)
    const btn = await screen.findByRole('button', { name: /15/i });
    fireEvent.click(btn);
    // Wait for names to load
    await waitFor(() => {
      expect(screen.getByText('Participants (15)')).toBeInTheDocument();
    });
    // Check that all 15 names are rendered
    const names = [
      'Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy', 'Karl', 'Liam', 'Mallory', 'Niaj', 'Olivia'
    ];
    names.forEach(name => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });
}); 