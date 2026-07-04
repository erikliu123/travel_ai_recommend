import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SeasonNav from '@/components/SeasonNav';

const defaultProps = {
  activeSeason: 'spring' as const,
  onSeasonChange: vi.fn(),
  user: null,
  onLogout: vi.fn(),
  onLoginClick: vi.fn(),
  activeView: 'seasons' as const,
  onViewChange: vi.fn(),
};

describe('SeasonNav', () => {
  it('renders all season tabs', () => {
    render(<SeasonNav {...defaultProps} />);
    expect(screen.getByText('春季')).toBeInTheDocument();
    expect(screen.getByText('夏季')).toBeInTheDocument();
    expect(screen.getByText('秋季')).toBeInTheDocument();
    expect(screen.getByText('冬季')).toBeInTheDocument();
  });

  it('renders AI Guides tab', () => {
    render(<SeasonNav {...defaultProps} />);
    expect(screen.getByText('AI攻略')).toBeInTheDocument();
  });

  it('renders login button when user is not logged in', () => {
    render(<SeasonNav {...defaultProps} />);
    expect(screen.getByText('登录')).toBeInTheDocument();
  });

  it('renders user info when logged in', () => {
    const user = { id: 1, username: 'testuser', created_at: '2024-01-01' };
    render(<SeasonNav {...defaultProps} user={user} />);
    expect(screen.getByText('Hi, testuser')).toBeInTheDocument();
  });

  it('calls onLoginClick when login button is clicked', () => {
    const onLoginClick = vi.fn();
    render(<SeasonNav {...defaultProps} onLoginClick={onLoginClick} />);
    fireEvent.click(screen.getByText('登录'));
    expect(onLoginClick).toHaveBeenCalled();
  });

  it('calls onSeasonChange when a season tab is clicked', () => {
    const onSeasonChange = vi.fn();
    const onViewChange = vi.fn();
    render(<SeasonNav {...defaultProps} onSeasonChange={onSeasonChange} onViewChange={onViewChange} />);
    fireEvent.click(screen.getByText('夏季'));
    expect(onSeasonChange).toHaveBeenCalledWith('summer');
    expect(onViewChange).toHaveBeenCalledWith('seasons');
  });

  it('calls onViewChange("guides") when AI攻略 is clicked', () => {
    const onViewChange = vi.fn();
    render(<SeasonNav {...defaultProps} onViewChange={onViewChange} />);
    fireEvent.click(screen.getByText('AI攻略'));
    expect(onViewChange).toHaveBeenCalledWith('guides');
  });

  it('calls onLogout when logout button is clicked', () => {
    const user = { id: 1, username: 'testuser', created_at: '2024-01-01' };
    const onLogout = vi.fn();
    render(<SeasonNav {...defaultProps} user={user} onLogout={onLogout} />);
    const logoutButton = screen.getByTitle('退出登录');
    fireEvent.click(logoutButton);
    expect(onLogout).toHaveBeenCalled();
  });

  it('renders as a nav element', () => {
    const { container } = render(<SeasonNav {...defaultProps} />);
    const nav = container.querySelector('nav');
    expect(nav).toBeInTheDocument();
  });
});
