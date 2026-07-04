import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TripCheckIn from '@/components/TripCheckIn';

// Mock the API module
vi.mock('@/lib/api', () => ({
  api: {
    checkIn: vi.fn(),
  },
}));

import { api } from '@/lib/api';

const mockOnSuccess = vi.fn();
const mockOnClose = vi.fn();

const defaultProps = {
  cityId: 'kunming',
  cityName: '昆明',
  existingTrip: null,
  onSuccess: mockOnSuccess,
  onClose: mockOnClose,
};

describe('TripCheckIn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders check-in form', () => {
    render(<TripCheckIn {...defaultProps} />);
    expect(screen.getByText('打卡')).toBeInTheDocument();
    expect(screen.getByText(/记录你在 昆明 的旅行/)).toBeInTheDocument();
  });

  it('renders date input', () => {
    render(<TripCheckIn {...defaultProps} />);
    expect(screen.getByText('旅游日期')).toBeInTheDocument();
  });

  it('renders AI guide URL input', () => {
    render(<TripCheckIn {...defaultProps} />);
    expect(screen.getByText(/AI 攻略链接/)).toBeInTheDocument();
  });

  it('renders submit and cancel buttons', () => {
    render(<TripCheckIn {...defaultProps} />);
    expect(screen.getByText('确认打卡')).toBeInTheDocument();
    expect(screen.getByText('取消')).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<TripCheckIn {...defaultProps} />);
    fireEvent.click(screen.getByText('取消'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when close button is clicked', () => {
    render(<TripCheckIn {...defaultProps} />);
    const closeButtons = screen.getAllByRole('button');
    fireEvent.click(closeButtons[0]);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls api.checkIn on successful submission', async () => {
    const mockTrip = {
      id: 1,
      user_id: 1,
      city_id: 'kunming',
      trip_date: '2024-03-15',
      is_visited: 1,
      created_at: '2024-03-15',
      updated_at: '2024-03-15',
    };
    vi.mocked(api.checkIn).mockResolvedValue({ trip: mockTrip });

    render(<TripCheckIn {...defaultProps} />);
    
    const dateInput = screen.getByText('旅游日期').parentElement!.querySelector('input')!;
    fireEvent.change(dateInput, { target: { value: '2024-03-15' } });
    
    fireEvent.click(screen.getByText('确认打卡'));

    await waitFor(() => {
      expect(api.checkIn).toHaveBeenCalledWith('kunming', '2024-03-15', undefined);
      expect(mockOnSuccess).toHaveBeenCalledWith(mockTrip);
    });
  });

  it('shows error message on check-in failure', async () => {
    vi.mocked(api.checkIn).mockRejectedValue(new Error('打卡失败，请重试'));

    render(<TripCheckIn {...defaultProps} />);
    
    const dateInput = screen.getByText('旅游日期').parentElement!.querySelector('input')!;
    fireEvent.change(dateInput, { target: { value: '2024-03-15' } });
    
    fireEvent.click(screen.getByText('确认打卡'));

    await waitFor(() => {
      expect(screen.getByText('打卡失败，请重试')).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    vi.mocked(api.checkIn).mockImplementation(() => new Promise(() => {}));

    render(<TripCheckIn {...defaultProps} />);
    
    const dateInput = screen.getByText('旅游日期').parentElement!.querySelector('input')!;
    fireEvent.change(dateInput, { target: { value: '2024-03-15' } });
    
    fireEvent.click(screen.getByText('确认打卡'));

    await waitFor(() => {
      expect(screen.getByText('处理中...')).toBeInTheDocument();
    });
  });

  it('shows "更新打卡记录" when existingTrip is provided', () => {
    const existingTrip = {
      id: 1,
      user_id: 1,
      city_id: 'kunming',
      trip_date: '2024-03-15',
      is_visited: 1,
      created_at: '2024-03-15',
      updated_at: '2024-03-15',
    };
    render(<TripCheckIn {...defaultProps} existingTrip={existingTrip} />);
    expect(screen.getByText('更新打卡记录')).toBeInTheDocument();
    expect(screen.getByText('更新')).toBeInTheDocument();
  });

  it('prefills date from existingTrip', () => {
    const existingTrip = {
      id: 1,
      user_id: 1,
      city_id: 'kunming',
      trip_date: '2024-03-15',
      is_visited: 1,
      created_at: '2024-03-15',
      updated_at: '2024-03-15',
    };
    render(<TripCheckIn {...defaultProps} existingTrip={existingTrip} />);
    const dateInput = screen.getByText('旅游日期').parentElement!.querySelector('input')! as HTMLInputElement;
    expect(dateInput.value).toBe('2024-03-15');
  });

  it('shows preview link when AI guide URL is entered', async () => {
    render(<TripCheckIn {...defaultProps} />);
    
    const urlInput = screen.getByText(/AI 攻略链接/).parentElement!.querySelector('input')!;
    await userEvent.type(urlInput, 'https://example.com/guide');
    
    expect(screen.getByText('预览链接')).toBeInTheDocument();
  });
});
