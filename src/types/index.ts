export type BabyTheme = 'pink' | 'blue' | 'lavender' | 'cream' | 'mint';

export interface BabySettings {
  babyName: string;
  birthDate: string; // YYYY-MM-DD
  birthTime?: string;
  birthWeight?: string;
  birthLength?: string;
  parentsNames: string;
  welcomeTitle: string;
  welcomeMessage: string;
  theme: BabyTheme;
  heroImageUrl?: string;
  heroImagePlaceholderType: 'bear' | 'cradle' | 'stars' | 'clouds';
  showAge: boolean;
  showBirthDetails: boolean;
  showBlessings: boolean;
  showTimeline: boolean;
  showCountdown: boolean;
  allowVisitorDownloads: boolean;
  ambientMusicEnabled: boolean;
  ambientTrack?: 'soft-lullaby' | 'starlight-music-box' | 'peaceful-sleep' | 'harp-dreams';
  updatedAt: string;
}

export interface Memory {
  id: string;
  title: string;
  caption: string;
  alternativeCaptions?: { style: string; text: string }[];
  imageUrl: string;
  thumbnailUrl?: string;
  category: string;
  tags: string[];
  memoryDate: string;
  uploadDate: string;
  status: 'published' | 'draft';
  isFavorite: boolean;
  orderIndex: number;
  ownerNotes?: string;
  visualDetailsObserved?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  iconName?: string;
  orderIndex: number;
}

export interface TimelineMilestone {
  id: string;
  title: string;
  description: string;
  date: string;
  milestoneLabel?: string;
  photoUrl?: string;
  orderIndex: number;
}

export interface BlessingItem {
  id: string;
  text: string;
  translationOrNote?: string;
  author?: string;
  orderIndex: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  ownerEmail?: string;
  ownerName?: string;
}

export interface SystemStatus {
  hasGeminiKey: boolean;
  totalMemories: number;
  publishedCount: number;
  draftCount: number;
  ownerConfigured: boolean;
  isDefaultPassword?: boolean;
  serverTime: string;
}

export interface AICaptionResponse {
  title: string;
  caption: string;
  alternativeCaptions: { style: string; text: string }[];
  cuteAlternative?: string;
  poeticAlternative?: string;
  duaAlternative?: string;
  suggestedCategory: string;
  suggestedTags: string[];
  visualDetailsObserved?: string;
  modelUsed?: string;
}
