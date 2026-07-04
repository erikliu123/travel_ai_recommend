import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CityModal from '@/components/CityModal';
import type { CityInfo } from '@/data/cities';

// Mock the API module
vi.mock('@/lib/api', () => ({
  api: {
    getCityTrips: vi.fn().mockResolvedValue({ trips: [] }),
    deleteTrip: vi.fn().mockResolvedValue({ success: true }),
  },
}));

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

const defaultProps = {
  city: mockCity,
  onClose: vi.fn(),
  user: null,
  trip: null,
  onTripSuccess: vi.fn(),
  onTripDelete: vi.fn(),
  onLoginClick: vi.fn(),
};

describe('CityModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders city name', () => {
    render(<CityModal {...defaultProps} />);
    expect(screen.getByText('昆明')).toBeInTheDocument();
  });

  it('renders city province', () => {
    render(<CityModal {...defaultProps} />);
    expect(screen.getByText('云南')).toBeInTheDocument();
  });

  it('renders suggested days', () => {
    render(<CityModal {...defaultProps} />);
    expect(screen.getByText(/建议游玩 3 天/)).toBeInTheDocument();
  });

  it('renders best months', () => {
    render(<CityModal {...defaultProps} />);
    expect(screen.getByText(/最佳 3-5月/)).toBeInTheDocument();
  });

  it('renders budget level', () => {
    render(<CityModal {...defaultProps} />);
    expect(screen.getByText('中等消费')).toBeInTheDocument();
  });

  it('renders city description', () => {
    render(<CityModal {...defaultProps} />);
    expect(screen.getByText(/春城昆明四季如春/)).toBeInTheDocument();
  });

  it('renders attractions', () => {
    render(<CityModal {...defaultProps} />);
    expect(screen.getByText('石林风景区')).toBeInTheDocument();
    expect(screen.getByText('滇池')).toBeInTheDocument();
  });

  it('renders pros', () => {
    render(<CityModal {...defaultProps} />);
    expect(screen.getByText('气候宜人')).toBeInTheDocument();
    expect(screen.getByText('航班多')).toBeInTheDocument();
  });

  it('renders cons', () => {
    render(<CityModal {...defaultProps} />);
    expect(screen.getByText('紫外线强')).toBeInTheDocument();
  });

  it('renders transport info', () => {
    render(<CityModal {...defaultProps} />);
    expect(screen.getByText('约3小时')).toBeInTheDocument();
    expect(screen.getByText('约8-10小时')).toBeInTheDocument();
  });

  it('renders login button when user is not logged in', () => {
    render(<CityModal {...defaultProps} />);
    expect(screen.getByText('登录后可以打卡并记录旅行')).toBeInTheDocument();
  });

  it('renders check-in button when user is logged in', () => {
    const user = { id: 1, username: 'testuser', created_at: '2024-01-01' };
    render(<CityModal {...defaultProps} user={user} />);
    expect(screen.getByText('我去过这里，打卡记录')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<CityModal {...defaultProps} onClose={onClose} />);
    // Close button is the X button at top right
    const closeButton = screen.getByRole('button', { name: '' });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(<CityModal {...defaultProps} onClose={onClose} />);
    // The backdrop is the outer div with fixed inset-0
    const backdrop = container.querySelector('.fixed.inset-0')!;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = vi.fn();
    const { container } = render(<CityModal {...defaultProps} onClose={onClose} />);
    // The modal div handles keydown
    const modalDiv = container.querySelector('.fixed.inset-0')!;
    fireEvent.keyDown(modalDiv, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onLoginClick when login button is clicked', () => {
    const onLoginClick = vi.fn();
    render(<CityModal {...defaultProps} onLoginClick={onLoginClick} />);
    fireEvent.click(screen.getByText('登录后可以打卡并记录旅行'));
    expect(onLoginClick).toHaveBeenCalled();
  });

  it('shows visited status when trip exists', () => {
    const trip = {
      id: 1,
      user_id: 1,
      city_id: 'kunming',
      trip_date: '2024-03-15',
      is_visited: 1,
      created_at: '2024-03-15',
      updated_at: '2024-03-15',
    };
    render(<CityModal {...defaultProps} trip={trip} />);
    expect(screen.getByText('已打卡')).toBeInTheDocument();
    expect(screen.getByText(/旅游日期：2024-03-15/)).toBeInTheDocument();
  });

  it('renders city image', () => {
    render(<CityModal {...defaultProps} />);
    const img = screen.getByAltText('昆明风光');
    expect(img).toBeInTheDocument();
  });

  it('returns null when city is null', () => {
    const { container } = render(<CityModal {...defaultProps} city={null} />);
    expect(container.firstChild).toBeNull();
  });
});
