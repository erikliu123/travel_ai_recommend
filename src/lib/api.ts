import type { User, Trip, TripPhoto, AuthResponse } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Handle relative URLs (proxied through Nginx)
    const url = API_BASE.startsWith('http')
      ? `${API_BASE}${endpoint}`
      : `${window.location.origin}${API_BASE}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || '请求失败');
    }

    return data;
  }

  // Auth
  async login(username: string, password: string): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.token = data.token;
    localStorage.setItem('auth_token', data.token);
    return data;
  }

  async register(username: string, password: string): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.token = data.token;
    localStorage.setItem('auth_token', data.token);
    return data;
  }

  async getMe(): Promise<{ user: User }> {
    return this.request('/auth/me');
  }

  logout() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  getToken(): string | null {
    return this.token;
  }

  // Trips
  async getTrips(): Promise<{ trips: Trip[] }> {
    return this.request('/trips');
  }

  async checkIn(cityId: string, tripDate: string, aiGuideUrl?: string): Promise<{ trip: Trip }> {
    return this.request('/trips', {
      method: 'POST',
      body: JSON.stringify({ city_id: cityId, trip_date: tripDate, ai_guide_url: aiGuideUrl }),
    });
  }

  async getTrip(cityId: string): Promise<{ trip: Trip | null; photos: TripPhoto[] }> {
    return this.request(`/trips/${cityId}`);
  }

  async updateTrip(cityId: string, updates: { feedback?: string; top_recommendation?: string; ai_guide_url?: string }): Promise<{ trip: Trip }> {
    return this.request(`/trips/${cityId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTrip(cityId: string): Promise<{ success: boolean }> {
    return this.request(`/trips/${cityId}`, {
      method: 'DELETE',
    });
  }

  // Photos
  async addPhoto(tripId: number, photoType: 'scenery' | 'group', photoUrl: string, caption?: string, visibility?: string): Promise<{ photo: TripPhoto }> {
    return this.request('/photos', {
      method: 'POST',
      body: JSON.stringify({ trip_id: tripId, photo_type: photoType, photo_url: photoUrl, caption, visibility }),
    });
  }

  async getPhotos(tripId: number): Promise<{ photos: TripPhoto[] }> {
    return this.request(`/trips/${tripId}/photos`);
  }

  async deletePhoto(photoId: number): Promise<{ success: boolean }> {
    return this.request(`/photos/${photoId}`, {
      method: 'DELETE',
    });
  }

  // Public
  async getCityStats(cityId: string): Promise<{ stats: { visit_count: number; unique_visitors: number } }> {
    return this.request(`/cities/${cityId}/stats`);
  }

  async getCityTrips(cityId: string): Promise<{ trips: (Trip & { username: string; avatar: string | null; photos: TripPhoto[] })[] }> {
    return this.request(`/cities/${cityId}/trips`);
  }
}

export const api = new ApiClient();
