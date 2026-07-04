import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ScrollToTop from '@/components/ScrollToTop';

describe('ScrollToTop', () => {
  beforeEach(() => {
    vi.stubGlobal('scrollTo', vi.fn());
  });

  it('does not render button when scroll position is low', () => {
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    render(<ScrollToTop />);
    expect(screen.queryByLabelText('返回顶部')).not.toBeInTheDocument();
  });

  it('renders button when scrolled down', () => {
    Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
    render(<ScrollToTop />);
    fireEvent.scroll(window);
    expect(screen.getByLabelText('返回顶部')).toBeInTheDocument();
  });

  it('scrolls to top when button is clicked', () => {
    Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
    render(<ScrollToTop />);
    fireEvent.scroll(window);
    const button = screen.getByLabelText('返回顶部');
    fireEvent.click(button);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('hides button when scrolling back to top', () => {
    Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
    render(<ScrollToTop />);
    fireEvent.scroll(window);
    expect(screen.getByLabelText('返回顶部')).toBeInTheDocument();

    Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
    fireEvent.scroll(window);
    expect(screen.queryByLabelText('返回顶部')).not.toBeInTheDocument();
  });
});
