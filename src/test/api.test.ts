import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
vi.stubGlobal('localStorage', localStorageMock);

// Mock import.meta.env
vi.stubGlobal('import', { meta: { env: { VITE_API_URL: 'http://localhost:3001' } } });

// Import after mocks
import { api } from '@/lib/api';

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Authentication', () => {
    it('login sets token in localStorage', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: { id: 1, username: 'test' }, token: 'test-token' }),
      });

      await api.login('test', 'password');

      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'test-token');
    });

    it('login returns user and token', async () => {
      const mockResponse = { user: { id: 1, username: 'test' }, token: 'test-token' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await api.login('test', 'password');

      expect(result).toEqual(mockResponse);
    });

    it('login throws error on failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Invalid credentials' }),
      });

      await expect(api.login('test', 'wrong')).rejects.toThrow('Invalid credentials');
    });

    it('register sets token in localStorage', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: { id: 2, username: 'new' }, token: 'new-token' }),
      });

      await api.register('new', 'password');

      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'new-token');
    });

    it('logout clears token from localStorage', () => {
      localStorageMock.setItem('auth_token', 'test-token');
      api.logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
    });

    it('getMe returns user data', async () => {
      const mockUser = { id: 1, username: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ user: mockUser }),
      });

      const result = await api.getMe();

      expect(result).toEqual({ user: mockUser });
    });
  });

  describe('Trips', () => {
    it('getTrips returns trips array', async () => {
      const mockTrips = [{ id: 1, city_id: 'kunming' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ trips: mockTrips }),
      });

      const result = await api.getTrips();

      expect(result).toEqual({ trips: mockTrips });
    });

    it('checkIn creates a new trip', async () => {
      const mockTrip = { id: 1, city_id: 'kunming', trip_date: '2024-03-15' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ trip: mockTrip }),
      });

      const result = await api.checkIn('kunming', '2024-03-15');

      expect(result).toEqual({ trip: mockTrip });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/trips'),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('getTrip returns trip and photos', async () => {
      const mockTrip = { id: 1, city_id: 'kunming' };
      const mockPhotos = [{ id: 1, trip_id: 1 }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ trip: mockTrip, photos: mockPhotos }),
      });

      const result = await api.getTrip('kunming');

      expect(result).toEqual({ trip: mockTrip, photos: mockPhotos });
    });

    it('updateTrip updates trip data', async () => {
      const mockTrip = { id: 1, feedback: 'updated' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ trip: mockTrip }),
      });

      const result = await api.updateTrip('kunming', { feedback: 'updated' });

      expect(result).toEqual({ trip: mockTrip });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/trips/kunming'),
        expect.objectContaining({ method: 'PUT' })
      );
    });

    it('deleteTrip removes a trip', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await api.deleteTrip('kunming');

      expect(result).toEqual({ success: true });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/trips/kunming'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('Photos', () => {
    it('addPhoto uploads a photo', async () => {
      const mockPhoto = { id: 1, photo_url: 'data:image/png;base64,...' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ photo: mockPhoto }),
      });

      const result = await api.addPhoto(1, 'scenery', 'data:image/png;base64,...', 'caption');

      expect(result).toEqual({ photo: mockPhoto });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/photos'),
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('getPhotos returns photos array', async () => {
      const mockPhotos = [{ id: 1, trip_id: 1 }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ photos: mockPhotos }),
      });

      const result = await api.getPhotos(1);

      expect(result).toEqual({ photos: mockPhotos });
    });

    it('deletePhoto removes a photo', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      const result = await api.deletePhoto(1);

      expect(result).toEqual({ success: true });
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/photos/1'),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('Public endpoints', () => {
    it('getCityStats returns city statistics', async () => {
      const mockStats = { visit_count: 100, unique_visitors: 50 };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ stats: mockStats }),
      });

      const result = await api.getCityStats('kunming');

      expect(result).toEqual({ stats: mockStats });
    });

    it('getCityTrips returns public trips', async () => {
      const mockTrips = [{ id: 1, city_id: 'kunming', username: 'user1' }];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ trips: mockTrips }),
      });

      const result = await api.getCityTrips('kunming');

      expect(result).toEqual({ trips: mockTrips });
    });
  });

  describe('Error handling', () => {
    it('throws error with message from response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Custom error message' }),
      });

      await expect(api.getMe()).rejects.toThrow('Custom error message');
    });

    it('throws default error when no message provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({}),
      });

      await expect(api.getMe()).rejects.toThrow('请求失败');
    });
  });
});
