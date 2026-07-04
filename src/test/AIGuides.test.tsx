import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AIGuides from '@/components/AIGuides';

describe('AIGuides', () => {
  it('renders the page title', () => {
    render(<AIGuides />);
    expect(screen.getByText('2026 AI 旅游详细攻略')).toBeInTheDocument();
  });

  it('renders the page description', () => {
    render(<AIGuides />);
    expect(screen.getByText(/由 AI 生成的详细旅游行程规划/)).toBeInTheDocument();
  });

  it('renders all guide cards', () => {
    render(<AIGuides />);
    expect(screen.getByText('扬州')).toBeInTheDocument();
    expect(screen.getByText('大连')).toBeInTheDocument();
    expect(screen.getByText('昆明+大理')).toBeInTheDocument();
    expect(screen.getByText('威海')).toBeInTheDocument();
  });

  it('renders guide titles', () => {
    render(<AIGuides />);
    expect(screen.getByText('扬州二日游行程规划')).toBeInTheDocument();
    expect(screen.getByText('大连清明旅游攻略')).toBeInTheDocument();
    expect(screen.getByText('云南旅游规划')).toBeInTheDocument();
    expect(screen.getByText('威海旅游行程规划')).toBeInTheDocument();
  });

  it('renders guide descriptions', () => {
    render(<AIGuides />);
    expect(screen.getByText(/瘦西湖、个园、何园、东关街/)).toBeInTheDocument();
    expect(screen.getByText(/星海广场、老虎滩、金石滩/)).toBeInTheDocument();
  });

  it('renders guide links with correct target', () => {
    render(<AIGuides />);
    const links = screen.getAllByRole('link');
    const guideLinks = links.filter(link => link.getAttribute('target') === '_blank');
    expect(guideLinks.length).toBeGreaterThanOrEqual(4);
  });

  it('renders "查看完整攻略" text for each guide', () => {
    render(<AIGuides />);
    const viewLinks = screen.getAllByText('查看完整攻略');
    expect(viewLinks.length).toBe(4);
  });

  it('renders usage tips section', () => {
    render(<AIGuides />);
    expect(screen.getByText('使用提示')).toBeInTheDocument();
    expect(screen.getByText(/点击攻略卡片可跳转到详细的 AI 旅游规划页面/)).toBeInTheDocument();
    expect(screen.getByText(/攻略包含每日行程安排、景点推荐、交通指南等内容/)).toBeInTheDocument();
  });

  it('renders guide icons', () => {
    render(<AIGuides />);
    expect(screen.getByText('🌸')).toBeInTheDocument();
    expect(screen.getByText('🌊')).toBeInTheDocument();
    expect(screen.getByText('🏔️')).toBeInTheDocument();
    expect(screen.getByText('🏖️')).toBeInTheDocument();
  });
});
