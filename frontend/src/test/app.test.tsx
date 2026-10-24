import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('CodeShift AI Frontend App', () => {
  it('renders the application branding and navbar', () => {
    render(<App />);
    expect(screen.getByText('CodeShift AI')).toBeInTheDocument();
    expect(screen.getByText('Translation Studio')).toBeInTheDocument();
    expect(screen.getByText('Strategy Benchmark')).toBeInTheDocument();
    expect(screen.getByText('Paradigm Explainer')).toBeInTheDocument();
  });

  it('renders the initial prompt strategies', () => {
    render(<App />);
    expect(screen.getByText('Zero-Shot Direct')).toBeInTheDocument();
    expect(screen.getByText('Few-Shot In-Context')).toBeInTheDocument();
    expect(screen.getByText('Chain-of-Thought (CoT)')).toBeInTheDocument();
    expect(screen.getByText('Role-Prompted Expert')).toBeInTheDocument();
  });
});
