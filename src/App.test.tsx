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
    const names = [
      'Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Frank', 'Grace', 'Heidi', 'Ivan', 'Judy', 'Karl', 'Liam', 'Mallory', 'Niaj', 'Olivia'
    ];
    for (const name of names) {
      await waitFor(() => {
        expect(screen.getByText(name)).toBeInTheDocument();
      });
    }
  });

  it('pickRandomName selects names randomly from unselected list', () => {
    // Simulate the core logic of pickRandomName
    const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];
    let selectedHistory: string[] = [];
    const pickRandomName = () => {
      const unselectedNames = names.filter((n) => !selectedHistory.includes(n));
      if (unselectedNames.length === 0) return null;
      const finalIndex = Math.floor(Math.random() * unselectedNames.length);
      const finalName = unselectedNames[finalIndex];
      selectedHistory = [...selectedHistory, finalName];
      return finalName;
    };
    // Run the picker 1000 times, resetting history each time
    const counts: Record<string, number> = {};
    for (let i = 0; i < 1000; i++) {
      selectedHistory = [];
      const picked = pickRandomName();
      counts[picked!] = (counts[picked!] || 0) + 1;
    }
    // All names should be picked at least once
    expect(Object.keys(counts).sort()).toEqual(names.sort());
    // No name should be picked more than 2x the average
    const avg = 1000 / names.length;
    Object.values(counts).forEach(count => {
      expect(count).toBeGreaterThan(avg / 2);
      expect(count).toBeLessThan(avg * 2);
    });
  });
}); 