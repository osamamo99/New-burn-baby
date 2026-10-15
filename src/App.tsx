import React, { useState, useEffect, useCallback } from 'react';
import {
  BabySettings,
  CategoryItem,
  Memory,
  TimelineMilestone,
  BlessingItem,
  SystemStatus,
  BabyTheme,
} from './types';
import { api, getOwnerToken, setOwnerToken } from './services/api';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { BabyAgeCounter } from './components/BabyAgeCounter';
import { GallerySection } from './components/GallerySection';
import { TimelineSection } from './components/TimelineSection';
import { BlessingsSection } from './components/BlessingsSection';
import { Footer } from './components/Footer';
import { MusicPlayerFloating } from './components/MusicPlayerFloating';
import { WelcomeModal } from './components/WelcomeModal';
import { OwnerLoginModal } from './components/OwnerLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { Sparkles, Moon } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<BabySettings | null>(null);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [timeline, setTimeline] = useState<TimelineMilestone[]>([]);
  const [blessings, setBlessings] = useState<BlessingItem[]>([]);
  const [status, setStatus] = useState<SystemStatus | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Owner Auth state
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState<boolean>(false);
  const [ownerLoginModalOpen, setOwnerLoginModalOpen] = useState<boolean>(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState<boolean>(false);

  // Theme & Motion
  const [theme, setTheme] = useState<BabyTheme>('cream');
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(false);

  // Fetch initial data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check owner auth if token exists
      const token = getOwnerToken();
      if (token) {
        try {
          const authRes = await api.verifyAuth();
          setIsOwnerAuthenticated(authRes.valid);
        } catch {
          setIsOwnerAuthenticated(false);
          setOwnerToken(null);
        }
      } else {
        setIsOwnerAuthenticated(false);
      }

      // Parallel fetch of settings, categories, memories, timeline, blessings, status
      const [
        fetchedSettings,
        fetchedCategories,
        fetchedMemories,
        fetchedTimeline,
        fetchedBlessings,
        fetchedStatus,
      ] = await Promise.all([
        api.getSettings(),
        api.getCategories(),
        api.getMemories(),
        api.getTimeline(),
        api.getBlessings(),
        api.getStatus().catch(() => null),
      ]);

      setSettings(fetchedSettings);
      setCategories(fetchedCategories);
      setMemories(fetchedMemories);
      setTimeline(fetchedTimeline);
      setBlessings(fetchedBlessings);
      setStatus(fetchedStatus);

      if (fetchedSettings.theme) {
        setTheme(fetchedSettings.theme);
      }
    } catch (err: any) {
      console.error('Failed to load baby memories data:', err);
      setError('Data load karte waqt masla aya. Barah-e-karam dobara koshish karein.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Sync theme with body data-theme attribute
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  // Sync reduced motion
  const handleToggleReducedMotion = () => {
    setIsReducedMotion((prev) => {
      const next = !prev;
      if (next) {
        document.body.classList.add('reduced-motion');
      } else {
        document.body.classList.remove('reduced-motion');
      }
      return next;
    });
  };

  const handleThemeChange = (newTheme: BabyTheme) => {
    setTheme(newTheme);
    // If owner is logged in, optionally save preference
    if (isOwnerAuthenticated && settings) {
      api.updateSettings({ theme: newTheme }).catch(console.error);
    }
  };

  const handleOwnerLogout = () => {
    api.logout();
    setIsOwnerAuthenticated(false);
    setAdminDashboardOpen(false);
    loadData();
  };

  const scrollToGallery = () => {
    document.getElementById('gallery-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToStory = () => {
    document.getElementById('timeline-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Loading Screen
  if (loading && !settings) {
    return (
      <div className="min-h-screen bg-rose-50/60 flex flex-col items-center justify-center p-6 text-center">
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-amber-200 via-rose-200 to-pink-200 flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
          <Moon className="w-10 h-10 text-amber-500 fill-amber-300" />
          <Sparkles className="w-5 h-5 text-rose-500 absolute -top-1 -right-1 animate-spin" />
        </div>
        <h2 className="font-hand text-3xl font-bold text-rose-950 mt-6">
          Hamari Duniya
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 font-serif italic max-w-xs">
          "Alhamdulillah! Pyare baby ki yaadein load ho rahi hain..."
        </p>
      </div>
    );
  }

  // Error Screen
  if (error && !settings) {
    return (
      <div className="min-h-screen bg-rose-50/60 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 rounded-3xl bg-white shadow-xl border border-rose-200 space-y-4">
          <div className="text-4xl">🧸 ⚠️</div>
          <h2 className="font-serif text-2xl font-bold text-slate-900">
            Rabta Nahi Ho Saka
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">{error}</p>
          <button
            onClick={() => loadData()}
            className="px-6 py-2.5 rounded-2xl bg-rose-500 text-white font-semibold text-xs shadow hover:bg-rose-600 transition-all"
          >
            Dobara Koshish Karein (Retry)
          </button>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="min-h-screen flex flex-col selection:bg-rose-200 selection:text-rose-900 transition-colors">
      
      {/* Top Navbar */}
      <Navbar
        babyName={settings.babyName}
        currentTheme={theme}
        onThemeChange={handleThemeChange}
        isReducedMotion={isReducedMotion}
        onToggleReducedMotion={handleToggleReducedMotion}
        isOwnerAuthenticated={isOwnerAuthenticated}
        onOpenOwnerPortal={() => setAdminDashboardOpen(true)}
        onOpenOwnerLogin={() => setOwnerLoginModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* Hero Section */}
        <HeroSection
          settings={settings}
          onExploreGallery={scrollToGallery}
          onExploreStory={scrollToStory}
        />

        {/* Baby Age & Milestones */}
        <BabyAgeCounter settings={settings} />

        {/* Photo Gallery with Filter, Search, Lightbox & Roman Urdu Captions */}
        <GallerySection
          memories={memories}
          categories={categories}
          allowDownloads={settings.allowVisitorDownloads}
          babyName={settings.babyName}
        />

        {/* Timeline Safar Section */}
        {settings.showTimeline && timeline.length > 0 && (
          <TimelineSection timeline={timeline} babyName={settings.babyName} />
        )}

        {/* Special Blessings Section */}
        {settings.showBlessings && blessings.length > 0 && (
          <BlessingsSection blessings={blessings} babyName={settings.babyName} />
        )}

      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        isOwnerAuthenticated={isOwnerAuthenticated}
        onOpenOwnerPortal={() => setAdminDashboardOpen(true)}
        onOpenOwnerLogin={() => setOwnerLoginModalOpen(true)}
      />

      {/* Ambient Nursery Lullaby Synthesizer Floating Widget */}
      {settings.ambientMusicEnabled && <MusicPlayerFloating />}

      {/* First-Visit Baby Welcome Animation Modal */}
      <WelcomeModal babyName={settings.babyName} />

      {/* Owner Login Modal (Private Access) */}
      <OwnerLoginModal
        isOpen={ownerLoginModalOpen}
        onClose={() => setOwnerLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsOwnerAuthenticated(true);
          setAdminDashboardOpen(true);
          loadData();
        }}
      />

      {/* Owner Private Dashboard */}
      <AdminDashboard
        isOpen={adminDashboardOpen}
        onClose={() => setAdminDashboardOpen(false)}
        settings={settings}
        categories={categories}
        memories={memories}
        timeline={timeline}
        blessings={blessings}
        status={status}
        onRefreshAll={loadData}
        onLogout={handleOwnerLogout}
      />

    </div>
  );
}
