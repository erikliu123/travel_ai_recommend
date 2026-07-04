import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthModal from '@/components/AuthModal';

// Mock the API module
vi.mock('@/lib/api', () => ({
  api: {
    login: vi.fn(),
    register: vi.fn(),
  },
}));

import { api } from '@/lib/api';

const mockOnClose = vi.fn();
const mockOnLogin = vi.fn();

const defaultProps = {
  onClose: mockOnClose,
  onLogin: mockOnLogin,
};

describe('AuthModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form by default', () => {
    render(<AuthModal {...defaultProps} />);
    expect(screen.getByRole('heading', { name: '登录' })).toBeInTheDocument();
    expect(screen.getByText('登录后可以记录旅游打卡和上传照片')).toBeInTheDocument();
  });

  it('renders username and password inputs', () => {
    render(<AuthModal {...defaultProps} />);
    expect(screen.getByPlaceholderText('请输入用户名')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('请输入密码')).toBeInTheDocument();
  });

  it('renders login button', () => {
    render(<AuthModal {...defaultProps} />);
    expect(screen.getByRole('button', { name: '登录' })).toBeInTheDocument();
  });

  it('renders QQ login button', () => {
    render(<AuthModal {...defaultProps} />);
    expect(screen.getByText('QQ 登录')).toBeInTheDocument();
  });

  it('switches to register form when clicking register link', () => {
    render(<AuthModal {...defaultProps} />);
    fireEvent.click(screen.getByText('立即注册'));
    expect(screen.getByText('创建账号开始你的旅游记录')).toBeInTheDocument();
  });

  it('shows switch text after switching to register', () => {
    render(<AuthModal {...defaultProps} />);
    fireEvent.click(screen.getByText('立即注册'));
    expect(screen.getByText('已有账号？')).toBeInTheDocument();
    expect(screen.getByText('去登录')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<AuthModal {...defaultProps} />);
    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons[0]; // First button is the X close button
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop is clicked', () => {
    const { container } = render(<AuthModal {...defaultProps} />);
    const backdrop = container.querySelector('.fixed.inset-0')!;
    fireEvent.click(backdrop);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('disables submit button when fields are empty', () => {
    render(<AuthModal {...defaultProps} />);
    const submitButton = screen.getByRole('button', { name: '登录' });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when fields are filled', async () => {
    render(<AuthModal {...defaultProps} />);
    const usernameInput = screen.getByPlaceholderText('请输入用户名');
    const passwordInput = screen.getByPlaceholderText('请输入密码');
    
    await userEvent.type(usernameInput, 'testuser');
    await userEvent.type(passwordInput, 'password123');
    
    const submitButton = screen.getByRole('button', { name: '登录' });
    expect(submitButton).not.toBeDisabled();
  });

  it('calls api.login and onLogin on successful login', async () => {
    const mockUser = { id: 1, username: 'testuser', created_at: '2024-01-01' };
    vi.mocked(api.login).mockResolvedValue({ user: mockUser, token: 'test-token' });

    render(<AuthModal {...defaultProps} />);
    
    await userEvent.type(screen.getByPlaceholderText('请输入用户名'), 'testuser');
    await userEvent.type(screen.getByPlaceholderText('请输入密码'), 'password123');
    fireEvent.click(screen.getByRole('button', { name: '登录' }));

    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith('testuser', 'password123');
      expect(mockOnLogin).toHaveBeenCalledWith(mockUser);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('shows error message on login failure', async () => {
    vi.mocked(api.login).mockRejectedValue(new Error('用户名或密码错误'));

    render(<AuthModal {...defaultProps} />);
    
    await userEvent.type(screen.getByPlaceholderText('请输入用户名'), 'testuser');
    await userEvent.type(screen.getByPlaceholderText('请输入密码'), 'wrongpass');
    fireEvent.click(screen.getByRole('button', { name: '登录' }));

    await waitFor(() => {
      expect(screen.getByText('用户名或密码错误')).toBeInTheDocument();
    });
  });

  it('calls api.register when in register mode', async () => {
    const mockUser = { id: 2, username: 'newuser', created_at: '2024-01-01' };
    vi.mocked(api.register).mockResolvedValue({ user: mockUser, token: 'test-token' });

    render(<AuthModal {...defaultProps} />);
    fireEvent.click(screen.getByText('立即注册'));
    
    await userEvent.type(screen.getByPlaceholderText('请输入用户名'), 'newuser');
    await userEvent.type(screen.getByPlaceholderText('至少6个字符'), 'password123');
    fireEvent.click(screen.getByRole('button', { name: '注册' }));

    await waitFor(() => {
      expect(api.register).toHaveBeenCalledWith('newuser', 'password123');
    });
  });

  it('shows loading state during login', async () => {
    vi.mocked(api.login).mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<AuthModal {...defaultProps} />);
    
    await userEvent.type(screen.getByPlaceholderText('请输入用户名'), 'testuser');
    await userEvent.type(screen.getByPlaceholderText('请输入密码'), 'password123');
    fireEvent.click(screen.getByRole('button', { name: '登录' }));

    await waitFor(() => {
      expect(screen.getByText('处理中...')).toBeInTheDocument();
    });
  });
});
