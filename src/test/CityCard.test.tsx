import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CityCard from '@/components/CityCard';
import type { CityInfo } from '@/data/cities';

const mockCity: CityInfo = {
  id: 'kunming',
  name: '昆明',
  province: '云南',
  description: '春城昆明四季如春，是赏花和休闲的理想目的地。',
  attractions: [
    { name: '石林风景区', description: '世界自然遗产' },
    { name: '滇池', description: '云南最大的淡水湖' },
  ],
  pros: ['气候宜人', '航班多'],
  cons: ['紫外线强'],
  transport: { flight: '约3小时', train: '约8-10小时' },
  image: '/images/cities/city-kunming.webp',
  bestMonths: '3-5月',
  suggestedDays: 3,
  budgetLevel: 2,
  tags: ['赏花胜地', '四季如春'],
};

describe('CityCard', () => {
  it('renders city name', () => {
    render(<CityCard city={mockCity} onClick={vi.fn()} index={0} />);
    expect(screen.getByText('昆明')).toBeInTheDocument();
  });

  it('renders city province', () => {
    render(<CityCard city={mockCity} onClick={vi.fn()} index={0} />);
    expect(screen.getByText('云南')).toBeInTheDocument();
  });

  it('renders suggested days', () => {
    render(<CityCard city={mockCity} onClick={vi.fn()} index={0} />);
    expect(screen.getByText('3天')).toBeInTheDocument();
  });

  it('renders budget level', () => {
    render(<CityCard city={mockCity} onClick={vi.fn()} index={0} />);
    expect(screen.getByText('中等消费')).toBeInTheDocument();
  });

  it('renders city description', () => {
    render(<CityCard city={mockCity} onClick={vi.fn()} index={0} />);
    expect(screen.getByText(/春城昆明四季如春/)).toBeInTheDocument();
  });

  it('renders tags', () => {
    render(<CityCard city={mockCity} onClick={vi.fn()} index={0} />);
    expect(screen.getByText('赏花胜地')).toBeInTheDocument();
    expect(screen.getByText('四季如春')).toBeInTheDocument();
  });

  it('renders transport info', () => {
    render(<CityCard city={mockCity} onClick={vi.fn()} index={0} />);
    expect(screen.getByText('约3小时')).toBeInTheDocument();
    expect(screen.getByText('约8-10小时')).toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const onClick = vi.fn();
    render(<CityCard city={mockCity} onClick={onClick} index={0} />);
    const card = screen.getByLabelText('查看昆明旅游攻略');
    fireEvent.click(card);
    expect(onClick).toHaveBeenCalledWith(mockCity);
  });

  it('calls onClick when Enter key is pressed', () => {
    const onClick = vi.fn();
    render(<CityCard city={mockCity} onClick={onClick} index={0} />);
    const card = screen.getByLabelText('查看昆明旅游攻略');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledWith(mockCity);
  });

  it('shows visited badge when isVisited is true', () => {
    render(<CityCard city={mockCity} onClick={vi.fn()} index={0} isVisited={true} />);
    expect(screen.getByText('已打卡')).toBeInTheDocument();
  });

  it('does not show visited badge when isVisited is false', () => {
    render(<CityCard city={mockCity} onClick={vi.fn()} index={0} isVisited={false} />);
    expect(screen.queryByText('已打卡')).not.toBeInTheDocument();
  });

  it('renders city image', () => {
    render(<CityCard city={mockCity} onClick={vi.fn()} index={0} />);
    const img = screen.getByAltText('昆明风光');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/images/cities/city-kunming.webp');
  });

  it('renders fallback gradient when no image', () => {
    const cityWithoutImage = { ...mockCity, image: '' };
    const { container } = render(<CityCard city={cityWithoutImage} onClick={vi.fn()} index={0} />);
    const gradient = container.querySelector('.bg-gradient-to-br');
    expect(gradient).toBeInTheDocument();
  });
});
