export interface User {
  id: number;
  username: string;
  avatar?: string;
  created_at: string;
}

export interface Trip {
  id: number;
  user_id: number;
  city_id: string;
  trip_date: string;
  ai_guide_url?: string;
  feedback?: string;
  top_recommendation?: string;
  is_visited: number;
  created_at: string;
  updated_at: string;
  photo_count?: number;
}

export interface TripPhoto {
  id: number;
  trip_id: number;
  user_id: number;
  photo_type: 'scenery' | 'group';
  photo_url: string;
  caption?: string;
  visibility: 'public' | 'private';
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type PhotoType = 'scenery' | 'group';
