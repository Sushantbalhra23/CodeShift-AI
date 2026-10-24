import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

describe('CodeShift AI Developer Tool App', () => {
  it('renders the brand and sidebar navigation links', () => {
    render(<App />);
    expect(screen.getAllByText('CodeShift AI')[0]).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Translate Workspace')).toBeInTheDocument();
    expect(screen.getByText('Prompt Experiments')).toBeInTheDocument();
    expect(screen.getByText('Benchmark Results')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders dashboard hero and architectural workflow pipeline', () => {
    render(<App />);
    expect(screen.getByText(/Cross-Language Translation & Evaluation Studio/i)).toBeInTheDocument();
    expect(screen.getByText('CodeShift AI Execution Pipeline')).toBeInTheDocument();
  });

  it('renders prompt strategy taxonomy cards', () => {
    render(<App />);
    expect(screen.getByText('Zero-Shot Direct Translation')).toBeInTheDocument();
    expect(screen.getByText('Few-Shot In-Context Learning')).toBeInTheDocument();
    expect(screen.getByText('Chain-of-Thought (CoT)')).toBeInTheDocument();
    expect(screen.getByText('Role-Prompted Expert Transpiler')).toBeInTheDocument();
    expect(screen.getByText('Closed-Loop Iterative Self-Repair')).toBeInTheDocument();
  });

  it('navigates to Translate Workspace and renders editors and buttons', () => {
    render(<App />);
    const translateNavLink = screen.getByText('Translate Workspace');
    fireEvent.click(translateNavLink);

    expect(screen.getByRole('button', { name: /^Translate$/i })).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
    expect(screen.getByText(/Load Sample:/i)).toBeInTheDocument();
    expect(screen.getByText('Translation Studio')).toBeInTheDocument();
    expect(screen.getByText('Paradigm Explanation')).toBeInTheDocument();
    expect(screen.getByText('Generated Tests')).toBeInTheDocument();
    expect(screen.getByText('Verification & Self-Repair')).toBeInTheDocument();
  });

  it('navigates to Prompt Experiments page and displays parameter tuning', () => {
    render(<App />);
    const expNavLink = screen.getByText('Prompt Experiments');
    fireEvent.click(expNavLink);

    expect(screen.getByText('Prompt Engineering Experimentation Studio')).toBeInTheDocument();
    expect(screen.getByText('Inference Hyperparameters')).toBeInTheDocument();
    expect(screen.getByText('Temperature')).toBeInTheDocument();
  });

  it('navigates to Benchmark Results page and displays telemetry tables', () => {
    render(<App />);
    const benchNavLink = screen.getByText('Benchmark Results');
    fireEvent.click(benchNavLink);

    expect(screen.getByText('Empirical Translation Benchmarks & Telemetry')).toBeInTheDocument();
    expect(screen.getByText('Export CSV')).toBeInTheDocument();
    expect(screen.getByText('Export JSON')).toBeInTheDocument();
  });

  it('navigates to Settings page and displays gateway configuration', () => {
    render(<App />);
    const settingsNavLink = screen.getByText('Settings');
    fireEvent.click(settingsNavLink);

    expect(screen.getByText('Platform Configuration & Environment Settings')).toBeInTheDocument();
    expect(screen.getByText('FastAPI Gateway Endpoint')).toBeInTheDocument();
    expect(screen.getByText('LLM Provider Configuration')).toBeInTheDocument();
    expect(screen.getByText('Save Preferences')).toBeInTheDocument();
  });
});
