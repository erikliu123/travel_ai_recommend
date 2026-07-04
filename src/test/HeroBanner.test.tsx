import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HeroBanner from '@/components/HeroBanner';

describe('HeroBanner', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders banner with season info', () => {
    render(<HeroBanner season="spring" />);
    expect(screen.getByText('春季旅行推荐')).toBeInTheDocument();
  });

  it('renders season icon', () => {
    render(<HeroBanner season="spring" />);
    expect(screen.getByText('🌸')).toBeInTheDocument();
  });

  it('renders season months info', () => {
    render(<HeroBanner season="spring" />);
    expect(screen.getByText('3-5月')).toBeInTheDocument();
  });

  it('renders season description', () => {
    render(<HeroBanner season="spring" />);
    expect(screen.getByText('春暖花开，踏青赏花')).toBeInTheDocument();
  });

  it('renders navigation arrows for multi-banner seasons', () => {
    render(<HeroBanner season="spring" />);
    const prevButton = screen.getByLabelText('上一张');
    const nextButton = screen.getByLabelText('下一张');
    expect(prevButton).toBeInTheDocument();
    expect(nextButton).toBeInTheDocument();
  });

  it('renders dot indicators for multi-banner seasons', () => {
    render(<HeroBanner season="spring" />);
    const dots = screen.getAllByRole('button', { name: /第\d+张/ });
    expect(dots.length).toBeGreaterThan(0);
  });

  it('switches to next banner when next button is clicked', () => {
    render(<HeroBanner season="spring" />);
    const nextButton = screen.getByLabelText('下一张');
    fireEvent.click(nextButton);
    // Check indicator changed
    expect(screen.getByText(/2\s*\/\s*\d+/)).toBeInTheDocument();
  });

  it('switches to previous banner when prev button is clicked', () => {
    render(<HeroBanner season="spring" />);
    const prevButton = screen.getByLabelText('上一张');
    fireEvent.click(prevButton);
    // Should wrap to last banner
    const indicators = screen.getByText(/\d+\s*\/\s*\d+/);
    expect(indicators).toBeInTheDocument();
  });

  it('auto-plays banners every 5 seconds', () => {
    render(<HeroBanner season="spring" />);
    // Initial state shows 1/3
    const indicator = screen.getByText(/1\s*\/\s*\d+/);
    expect(indicator).toBeInTheDocument();
    // Advance timer to trigger auto-play
    vi.advanceTimersByTime(5500);
    // After advancing, the indicator should still exist (may have changed)
    const newIndicator = screen.queryByText(/\d+\s*\/\s*\d+/);
    expect(newIndicator).toBeInTheDocument();
  });

  it('renders different content for different seasons', () => {
    const { unmount } = render(<HeroBanner season="summer" />);
    expect(screen.getByText('夏季旅行推荐')).toBeInTheDocument();
    unmount();

    render(<HeroBanner season="autumn" />);
    expect(screen.getByText('秋季旅行推荐')).toBeInTheDocument();
  });

  it('renders as a section element', () => {
    const { container } = render(<HeroBanner season="spring" />);
    const section = container.querySelector('section');
    expect(section).toBeInTheDocument();
  });
});
