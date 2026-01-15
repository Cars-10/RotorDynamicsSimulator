import { render, screen } from '@testing-library/react';
import App from './App';
import { describe, it, expect } from 'vitest';

describe('App', () => {
  it('renders the main title', () => {
    render(<App />);
    expect(screen.getByText(/Hydrogen Cooled Generator/i)).toBeInTheDocument();
    expect(screen.getByText(/RotorDynamics/i)).toBeInTheDocument();
  });
});
