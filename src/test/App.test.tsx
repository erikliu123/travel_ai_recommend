import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '@/App';

// Mock the API module
vi.mock('@/lib/api', () => ({
  api: {
    getMe: vi.fn().mockResolvedValue({ user: null }),
    getTrips: vi.fn().mockResolvedValue({ trips: [] }),
    getCityTrips: vi.fn().mockResolvedValue({ trips: [] }),
    logout: vi.fn(),
  },
}));

// Mock the cities data
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
      tags: ['赏花胜地'],
    },
  },
  seasonCities: {
    spring: ['kunming'],
    summer: ['kunming'],
    autumn: ['kunming'],
    winter: ['kunming'],
    mayday: ['kunming'],
    national: ['kunming'],
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

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage
    Storage.prototype.getItem = vi.fn(() => null);
    Storage.prototype.setItem = vi.fn();
    Storage.prototype.removeItem = vi.fn();
  });

  it('renders the app', () => {
    render(<App />);
    expect(screen.getByText('春季旅行推荐')).toBeInTheDocument();
  });

  it('renders season navigation', () => {
    render(<App />);
    expect(screen.getByText('春季')).toBeInTheDocument();
    expect(screen.getByText('夏季')).toBeInTheDocument();
    expect(screen.getByText('秋季')).toBeInTheDocument();
    expect(screen.getByText('冬季')).toBeInTheDocument();
  });

  it('renders AI Guides tab', () => {
    render(<App />);
    expect(screen.getByText('AI攻略')).toBeInTheDocument();
  });

  it('renders footer', () => {
    render(<App />);
    expect(screen.getByText('从杭州出发，探索世界最美的目的地')).toBeInTheDocument();
  });

  it('renders city grid with cities', () => {
    render(<App />);
    expect(screen.getByText('昆明')).toBeInTheDocument();
  });

  it('switches season when clicking season tab', () => {
    render(<App />);
    fireEvent.click(screen.getByText('夏季'));
    // After switching, the banner should show summer content
    expect(screen.getByText('夏季旅行推荐')).toBeInTheDocument();
  });

  it('switches to AI Guides view when clicking AI攻略', () => {
    render(<App />);
    fireEvent.click(screen.getByText('AI攻略'));
    // The AI Guides view should be shown
    expect(screen.queryByText('春季旅行推荐')).not.toBeInTheDocument();
  });

  it('shows login button when user is not logged in', () => {
    render(<App />);
    expect(screen.getByText('登录')).toBeInTheDocument();
  });

  it('renders search filter', () => {
    render(<App />);
    expect(screen.getByPlaceholderText('搜索目的地、省份、景点...')).toBeInTheDocument();
  });

  it('renders scroll to top button when scrolled', () => {
    Object.defineProperty(window, 'scrollY', { value: 500, writable: true });
    render(<App />);
    fireEvent.scroll(window);
    expect(screen.getByLabelText('返回顶部')).toBeInTheDocument();
  });
});
