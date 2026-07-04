import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from '@/components/Footer';

describe('Footer', () => {
  it('renders footer text', () => {
    render(<Footer />);
    expect(screen.getByText('从杭州出发，探索世界最美的目的地')).toBeInTheDocument();
  });

  it('renders disclaimer text', () => {
    render(<Footer />);
    expect(screen.getByText('交通时间仅供参考，请以实际查询结果为准')).toBeInTheDocument();
  });

  it('renders as a footer element', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
  });
});
