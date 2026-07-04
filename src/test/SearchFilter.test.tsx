import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchFilter from '@/components/SearchFilter';

const defaultProps = {
  searchQuery: '',
  onSearchChange: vi.fn(),
  activeTag: null,
  onTagChange: vi.fn(),
  availableTags: ['赏花胜地', '古村镇', '海滨度假'],
  totalResults: 15,
  filteredCount: 15,
};

describe('SearchFilter', () => {
  it('renders search input', () => {
    render(<SearchFilter {...defaultProps} />);
    expect(screen.getByPlaceholderText('搜索目的地、省份、景点...')).toBeInTheDocument();
  });

  it('renders all available tags', () => {
    render(<SearchFilter {...defaultProps} />);
    expect(screen.getByText('赏花胜地')).toBeInTheDocument();
    expect(screen.getByText('古村镇')).toBeInTheDocument();
    expect(screen.getByText('海滨度假')).toBeInTheDocument();
  });

  it('renders "全部" tag button', () => {
    render(<SearchFilter {...defaultProps} />);
    expect(screen.getByText('全部')).toBeInTheDocument();
  });

  it('calls onSearchChange when typing in search input', async () => {
    const onSearchChange = vi.fn();
    render(<SearchFilter {...defaultProps} onSearchChange={onSearchChange} />);
    const input = screen.getByPlaceholderText('搜索目的地、省份、景点...');
    await userEvent.type(input, '昆');
    expect(onSearchChange).toHaveBeenCalledWith('昆');
  });

  it('calls onTagChange when clicking a tag', () => {
    const onTagChange = vi.fn();
    render(<SearchFilter {...defaultProps} onTagChange={onTagChange} />);
    fireEvent.click(screen.getByText('赏花胜地'));
    expect(onTagChange).toHaveBeenCalledWith('赏花胜地');
  });

  it('calls onTagChange(null) when clicking "全部"', () => {
    const onTagChange = vi.fn();
    render(<SearchFilter {...defaultProps} onTagChange={onTagChange} activeTag="赏花胜地" />);
    fireEvent.click(screen.getByText('全部'));
    expect(onTagChange).toHaveBeenCalledWith(null);
  });

  it('shows clear button when search query is active', () => {
    render(<SearchFilter {...defaultProps} searchQuery="昆明" filteredCount={2} />);
    expect(screen.getByText('清除筛选')).toBeInTheDocument();
  });

  it('shows filtered count when filtering is active', () => {
    render(<SearchFilter {...defaultProps} searchQuery="昆明" filteredCount={2} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows clear button when tag is active', () => {
    render(<SearchFilter {...defaultProps} activeTag="赏花胜地" filteredCount={5} />);
    expect(screen.getByText('清除筛选')).toBeInTheDocument();
  });

  it('shows X button in search input when query is not empty', () => {
    render(<SearchFilter {...defaultProps} searchQuery="昆明" />);
    const clearButton = screen.getByRole('button', { name: '' });
    expect(clearButton).toBeInTheDocument();
  });

  it('calls onSearchChange("") when clicking X in search input', () => {
    const onSearchChange = vi.fn();
    render(<SearchFilter {...defaultProps} searchQuery="昆明" onSearchChange={onSearchChange} />);
    // The X button is inside the search input div, find it by its parent container
    const input = screen.getByPlaceholderText('搜索目的地、省份、景点...');
    const inputContainer = input.parentElement!;
    const xButton = inputContainer.querySelector('button')!;
    fireEvent.click(xButton);
    expect(onSearchChange).toHaveBeenCalledWith('');
  });
});
