import {
  BabySettings,
  CategoryItem,
  Memory,
  TimelineMilestone,
  BlessingItem,
  SystemStatus,
  AICaptionResponse,
} from '../types';

const TOKEN_KEY = 'baby_owner_token';

export function getOwnerToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setOwnerToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getOwnerToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Status
  getStatus: () => request<SystemStatus>('/api/status'),

  // Auth
  login: async (password: string) => {
    const res = await request<{
      token: string;
      ownerName: string;
      ownerEmail: string;
      isDefaultPassword: boolean;
      message: string;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    setOwnerToken(res.token);
    return res;
  },

  verifyAuth: () =>
    request<{
      valid: boolean;
      ownerName: string;
      ownerEmail: string;
      isDefaultPassword: boolean;
    }>('/api/auth/verify'),

  logout: () => {
    setOwnerToken(null);
  },

  updateCredentials: (data: {
    currentPassword?: string;
    newPassword?: string;
    ownerName?: string;
    ownerEmail?: string;
  }) =>
    request<{ success: boolean; message: string }>('/api/auth/update-credentials', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Settings
  getSettings: () => request<BabySettings>('/api/settings'),
  updateSettings: (settings: Partial<BabySettings>) =>
    request<{ success: boolean; settings: BabySettings }>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  // Categories
  getCategories: () => request<CategoryItem[]>('/api/categories'),
  createCategory: (data: { name: string; iconName?: string }) =>
    request<CategoryItem>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCategory: (id: string, data: Partial<CategoryItem>) =>
    request<CategoryItem>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCategory: (id: string) =>
    request<{ success: boolean }>(`/api/categories/${id}`, {
      method: 'DELETE',
    }),

  // Memories
  getMemories: (params?: {
    category?: string;
    search?: string;
    sort?: 'newest' | 'oldest' | 'favorites';
    favorite?: boolean;
  }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.sort) query.set('sort', params.sort);
    if (params?.favorite) query.set('favorite', 'true');
    const qStr = query.toString();
    return request<Memory[]>(`/api/memories${qStr ? `?${qStr}` : ''}`);
  },

  getMemory: (id: string) => request<Memory>(`/api/memories/${id}`),

  createMemory: (data: Partial<Memory>) =>
    request<Memory>('/api/memories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateMemory: (id: string, data: Partial<Memory>) =>
    request<Memory>(`/api/memories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteMemory: (id: string) =>
    request<{ success: boolean; message: string }>(`/api/memories/${id}`, {
      method: 'DELETE',
    }),

  toggleFavorite: (id: string) =>
    request<{ success: boolean; isFavorite: boolean }>(`/api/memories/${id}/toggle-favorite`, {
      method: 'POST',
    }),

  // Timeline
  getTimeline: () => request<TimelineMilestone[]>('/api/timeline'),
  createTimeline: (data: Partial<TimelineMilestone>) =>
    request<TimelineMilestone>('/api/timeline', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateTimeline: (id: string, data: Partial<TimelineMilestone>) =>
    request<TimelineMilestone>(`/api/timeline/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteTimeline: (id: string) =>
    request<{ success: boolean }>(`/api/timeline/${id}`, {
      method: 'DELETE',
    }),

  // Blessings
  getBlessings: () => request<BlessingItem[]>('/api/blessings'),
  createBlessing: (data: Partial<BlessingItem>) =>
    request<BlessingItem>('/api/blessings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateBlessing: (id: string, data: Partial<BlessingItem>) =>
    request<BlessingItem>(`/api/blessings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteBlessing: (id: string) =>
    request<{ success: boolean }>(`/api/blessings/${id}`, {
      method: 'DELETE',
    }),

  // Upload
  uploadImage: (dataUrl: string, filename?: string) =>
    request<{ url: string; filename: string; size: number; mimeType: string }>('/api/upload', {
      method: 'POST',
      body: JSON.stringify({ dataUrl, filename }),
    }),

  // AI Roman Urdu Caption
  generateAICaption: (imageData: string, mimeType?: string, categoryHint?: string, babyName?: string) =>
    request<AICaptionResponse>('/api/ai/generate-caption', {
      method: 'POST',
      body: JSON.stringify({ imageData, mimeType, categoryHint, babyName }),
    }),

  // Backup
  exportBackupUrl: () => {
    const token = getOwnerToken();
    return `/api/backup/export${token ? `?auth=${token}` : ''}`;
  },

  importBackup: (backup: any) =>
    request<{ success: boolean; message: string }>('/api/backup/import', {
      method: 'POST',
      body: JSON.stringify({ backup }),
    }),
};
