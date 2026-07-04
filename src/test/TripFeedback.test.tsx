import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TripFeedback from '@/components/TripFeedback';

// Mock the API module
vi.mock('@/lib/api', () => ({
  api: {
    updateTrip: vi.fn(),
    addPhoto: vi.fn(),
    deletePhoto: vi.fn(),
  },
}));

import { api } from '@/lib/api';

const mockTrip = {
  id: 1,
  user_id: 1,
  city_id: 'kunming',
  trip_date: '2024-03-15',
  is_visited: 1,
  created_at: '2024-03-15',
  updated_at: '2024-03-15',
};

const mockOnUpdate = vi.fn();
const mockOnClose = vi.fn();

const defaultProps = {
  trip: mockTrip,
  cityName: '昆明',
  onUpdate: mockOnUpdate,
  onClose: mockOnClose,
};

describe('TripFeedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders feedback form', () => {
    render(<TripFeedback {...defaultProps} />);
    expect(screen.getByText(/昆明 - 旅游反馈/)).toBeInTheDocument();
    expect(screen.getByText('分享你的旅行体验')).toBeInTheDocument();
  });

  it('renders top recommendation input', () => {
    render(<TripFeedback {...defaultProps} />);
    expect(screen.getByText('最推荐什么？')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/例如：瘦西湖/)).toBeInTheDocument();
  });

  it('renders feedback textarea', () => {
    render(<TripFeedback {...defaultProps} />);
    expect(screen.getByText('旅游心得/反馈')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/分享你的旅行体验/)).toBeInTheDocument();
  });

  it('renders save feedback button', () => {
    render(<TripFeedback {...defaultProps} />);
    expect(screen.getByText('保存反馈')).toBeInTheDocument();
  });

  it('renders photo upload section', () => {
    render(<TripFeedback {...defaultProps} />);
    expect(screen.getByText('上传照片')).toBeInTheDocument();
    expect(screen.getByText('经典风景')).toBeInTheDocument();
    expect(screen.getByText(/合照/)).toBeInTheDocument();
  });

  it('renders photo type selector buttons', () => {
    render(<TripFeedback {...defaultProps} />);
    expect(screen.getByText('经典风景')).toBeInTheDocument();
    expect(screen.getByText(/合照（仅自己可见）/)).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<TripFeedback {...defaultProps} />);
    const closeButtons = screen.getAllByRole('button');
    fireEvent.click(closeButtons[0]);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop is clicked', () => {
    const { container } = render(<TripFeedback {...defaultProps} />);
    const backdrop = container.querySelector('.fixed.inset-0')!;
    fireEvent.click(backdrop);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls api.updateTrip when saving feedback', async () => {
    const updatedTrip = { ...mockTrip, feedback: '很棒的旅行', top_recommendation: '石林' };
    vi.mocked(api.updateTrip).mockResolvedValue({ trip: updatedTrip });

    render(<TripFeedback {...defaultProps} />);
    
    const recommendationInput = screen.getByPlaceholderText(/例如：瘦西湖/);
    await userEvent.type(recommendationInput, '石林');
    
    const feedbackTextarea = screen.getByPlaceholderText(/分享你的旅行体验/);
    await userEvent.type(feedbackTextarea, '很棒的旅行');
    
    fireEvent.click(screen.getByText('保存反馈'));

    await waitFor(() => {
      expect(api.updateTrip).toHaveBeenCalledWith('kunming', {
        feedback: '很棒的旅行',
        top_recommendation: '石林',
      });
      expect(mockOnUpdate).toHaveBeenCalledWith(updatedTrip);
    });
  });

  it('shows error message on save failure', async () => {
    vi.mocked(api.updateTrip).mockRejectedValue(new Error('保存失败'));

    render(<TripFeedback {...defaultProps} />);
    
    fireEvent.click(screen.getByText('保存反馈'));

    await waitFor(() => {
      expect(screen.getByText('保存失败')).toBeInTheDocument();
    });
  });

  it('shows loading state during save', async () => {
    vi.mocked(api.updateTrip).mockImplementation(() => new Promise(() => {}));

    render(<TripFeedback {...defaultProps} />);
    
    fireEvent.click(screen.getByText('保存反馈'));

    await waitFor(() => {
      expect(screen.getByText('保存中...')).toBeInTheDocument();
    });
  });

  it('switches photo type when clicking buttons', () => {
    render(<TripFeedback {...defaultProps} />);
    
    const groupButton = screen.getByText(/合照（仅自己可见）/);
    fireEvent.click(groupButton);
    
    // The button should now be active (have different styling)
    expect(groupButton.closest('button')).toHaveClass('bg-foreground');
  });

  it('renders caption input', () => {
    render(<TripFeedback {...defaultProps} />);
    expect(screen.getByPlaceholderText('照片描述（可选）')).toBeInTheDocument();
  });

  it('prefills feedback from existing trip', () => {
    const tripWithFeedback = { ...mockTrip, feedback: '之前写的反馈', top_recommendation: '滇池' };
    render(<TripFeedback {...defaultProps} trip={tripWithFeedback} />);
    
    const recommendationInput = screen.getByPlaceholderText(/例如：瘦西湖/) as HTMLInputElement;
    const feedbackTextarea = screen.getByPlaceholderText(/分享你的旅行体验/) as HTMLTextAreaElement;
    
    expect(recommendationInput.value).toBe('滇池');
    expect(feedbackTextarea.value).toBe('之前写的反馈');
  });
});
