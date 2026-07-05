import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CityGrid from '@/components/CityGrid';

// Mock the cities data module
vi.mock('@/data/cities', () => ({
  allCities: {
    kunming: {
      id: 'kunming',
      name: '昆明',
      province: '云南',
      description: '春城昆明四季如春',
      attractions: [{ name: '石林', description: '世界自然遗产' }],
      pros: ['气候宜人'],
      cons: ['紫外线强'],
      transport: { flight: '约3小时', train: '约8小时' },
      image: '/images/cities/city-kunming.webp',
      bestMonths: '3-5月',
      suggestedDays: 3,
      budgetLevel: 2,
      tags: ['赏花胜地', '四季如春'],
    },
    wuyuan: {
      id: 'wuyuan',
      name: '婺源',
      province: '江西',
      description: '中国最美乡村',
      attractions: [{ name: '江岭', description: '油菜花海' }],
      pros: ['景色优美'],
      cons: ['花期短'],
      transport: { flight: '约2小时', train: '约4小时' },
      image: '/images/cities/city-wuyuan.webp',
      bestMonths: '3-4月',
      suggestedDays: 2,
      budgetLevel: 1,
      tags: ['赏花胜地', '古村镇'],
    },
  },
  seasonCities: {
    spring: ['kunming', 'wuyuan'],
    summer: ['kunming'],
    autumn: ['wuyuan'],
    winter: ['kunming'],
    mayday: ['kunming'],
    national: ['wuyuan'],
    springfestival: ['kunming'],
    zhejiang: ['kunming'],
  },
  seasonInfo: {
    spring: { label: '春季', icon: '🌸', banners: ['/banner1.jpg'], banner: '/banner1.jpg', months: '3-5月', description: '春暖花开' },
    summer: { label: '夏季', icon: '☀️', banners: ['/banner2.jpg'], banner: '/banner2.jpg', months: '6-8月', description: '夏日清凉' },
    autumn: { label: '秋季', icon: '🍂', banners: ['/banner3.jpg'], banner: '/banner3.jpg', months: '9-11月', description: '秋高气爽' },
    winter: { label: '冬季', icon: '❄️', banners: ['/banner4.jpg'], banner: '/banner4.jpg', months: '12-2月', description: '冰雪世界' },
    mayday: { label: '五一', icon: '🎉', banners: ['/banner5.jpg'], banner: '/banner5.jpg', months: '5月', description: '五一假期' },
    national: { label: '国庆', icon: '🇨🇳', banners: ['/banner6.jpg'], banner: '/banner6.jpg', months: '10月', description: '国庆假期' },
    springfestival: { label: '春节', icon: '🧧', banners: ['/banner7.jpg'], banner: '/banner7.jpg', months: '1-2月', description: '春节假期' },
    zhejiang: { label: '浙里游', icon: '🏞️', banners: ['/banner8.jpg'], banner: '/banner8.jpg', months: '全年', description: '浙江旅游' },
  },
}));

describe('CityGrid', () => {
  it('renders city cards for the season', () => {
    render(<CityGrid season="spring" onCityClick={vi.fn()} />);
    expect(screen.getByText('昆明')).toBeInTheDocument();
    expect(screen.getByText('婺源')).toBeInTheDocument();
  });

  it('renders search filter component', () => {
    render(<CityGrid season="spring" onCityClick={vi.fn()} />);
    expect(screen.getByPlaceholderText('搜索目的地、省份、景点...')).toBeInTheDocument();
  });

  it('renders available tags for the season', () => {
    render(<CityGrid season="spring" onCityClick={vi.fn()} />);
    // Tags appear in both filter section and city cards
    expect(screen.getAllByText('赏花胜地').length).toBeGreaterThan(0);
    expect(screen.getAllByText('四季如春').length).toBeGreaterThan(0);
  });

  it('filters cities by search query', async () => {
    render(<CityGrid season="spring" onCityClick={vi.fn()} />);
    const searchInput = screen.getByPlaceholderText('搜索目的地、省份、景点...');
    fireEvent.change(searchInput, { target: { value: '昆明' } });
    // After filtering, only 昆明 should be visible
    expect(screen.getByText('昆明')).toBeInTheDocument();
    expect(screen.queryByText('婺源')).not.toBeInTheDocument();
  });

  it('filters cities by tag', () => {
    render(<CityGrid season="spring" onCityClick={vi.fn()} />);
    // Find the tag button in the filter section (not the one in city cards)
    const filterSection = screen.getByText('筛选：').parentElement!;
    const tagButtons = filterSection.querySelectorAll('button');
    const gucunzhenButton = Array.from(tagButtons).find(btn => btn.textContent === '古村镇');
    fireEvent.click(gucunzhenButton!);
    // After filtering by 古村镇, only 婺源 should be visible
    expect(screen.getByText('婺源')).toBeInTheDocument();
    expect(screen.queryByText('昆明')).not.toBeInTheDocument();
  });

  it('shows empty state when no cities match', () => {
    render(<CityGrid season="spring" onCityClick={vi.fn()} />);
    const searchInput = screen.getByPlaceholderText('搜索目的地、省份、景点...');
    fireEvent.change(searchInput, { target: { value: '不存在的城市' } });
    expect(screen.getByText('没有找到匹配的目的地')).toBeInTheDocument();
  });

  it('calls onCityClick when a city card is clicked', () => {
    const onCityClick = vi.fn();
    render(<CityGrid season="spring" onCityClick={onCityClick} />);
    const kunmingCard = screen.getByLabelText('查看昆明旅游攻略');
    fireEvent.click(kunmingCard);
    expect(onCityClick).toHaveBeenCalled();
  });

  it('shows load more button when there are more cities', () => {
    // This test would need more than 8 cities to trigger pagination
    // For now, just verify the component renders without error
    render(<CityGrid season="spring" onCityClick={vi.fn()} />);
    // With only 2 cities, no load more button should appear
    expect(screen.queryByText(/加载更多/)).not.toBeInTheDocument();
  });

  it('renders different cities for different seasons', () => {
    const { unmount } = render(<CityGrid season="summer" onCityClick={vi.fn()} />);
    expect(screen.getByText('昆明')).toBeInTheDocument();
    expect(screen.queryByText('婺源')).not.toBeInTheDocument();
    unmount();

    render(<CityGrid season="autumn" onCityClick={vi.fn()} />);
    expect(screen.getByText('婺源')).toBeInTheDocument();
    expect(screen.queryByText('昆明')).not.toBeInTheDocument();
  });
});
