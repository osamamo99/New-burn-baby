import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  Moon,
  Camera,
  Compass,
  Lock,
  Menu,
  X,
  Eye,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { BabyTheme } from '../types';

interface NavbarProps {
  babyName: string;
  currentTheme: BabyTheme;
  onThemeChange: (theme: BabyTheme) => void;
  isReducedMotion: boolean;
  onToggleReducedMotion: () => void;
  isOwnerAuthenticated: boolean;
  onOpenOwnerPortal: () => void;
  onOpenOwnerLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  babyName,
  currentTheme,
  onThemeChange,
  isReducedMotion,
  onToggleReducedMotion,
  isOwnerAuthenticated,
  onOpenOwnerPortal,
  onOpenOwnerLogin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const themeOptions: Array<{ id: BabyTheme; label: string; color: string }> = [
    { id: 'cream', label: 'Champagne Gold & Cream', color: 'bg-amber-100 border-amber-300' },
    { id: 'pink', label: 'Soft Baby Pink', color: 'bg-rose-100 border-rose-300' },
    { id: 'blue', label: 'Pastel Sky Blue', color: 'bg-sky-100 border-sky-300' },
    { id: 'lavender', label: 'Dreamy Lavender', color: 'bg-purple-100 border-purple-300' },
    { id: 'mint', label: 'Fresh Mint Green', color: 'bg-emerald-100 border-emerald-300' },
  ];

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 border-b border-rose-100/70 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand / Logo */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-rose-200 via-amber-100 to-pink-200 flex items-center justify-center shadow-inner border border-amber-200/60 group-hover:scale-105 transition-transform">
            <Moon className="w-5 h-5 text-amber-500 fill-amber-300" />
            <Sparkles className="w-3 h-3 text-rose-500 absolute -top-1 -right-1 animate-sparkle" />
          </div>
          <div>
            <span className="font-hand text-2xl font-bold tracking-tight text-rose-950 block leading-none">
              Hamari Duniya
            </span>
            <span className="text-[11px] font-sans text-rose-600/90 font-medium tracking-wide">
              {babyName || 'Pyare Baby'} Ki Yaadein ✨
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hover:text-rose-600 transition-colors"
          >
            Shuruat
          </button>
          <button
            onClick={() => scrollToSection('gallery-section')}
            className="hover:text-rose-600 transition-colors flex items-center gap-1.5"
          >
            <Camera className="w-4 h-4 text-rose-400" />
            Yaadein
          </button>
          <button
            onClick={() => scrollToSection('timeline-section')}
            className="hover:text-rose-600 transition-colors flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4 text-amber-400" />
            Safar (Timeline)
          </button>
          <button
            onClick={() => scrollToSection('blessings-section')}
            className="hover:text-rose-600 transition-colors flex items-center gap-1.5"
          >
            <Heart className="w-4 h-4 text-pink-400" />
            Duayein
          </button>
          <button
            onClick={() => scrollToSection('baby-info-section')}
            className="hover:text-rose-600 transition-colors"
          >
            Baby Info
          </button>
        </nav>

        {/* Action Controls & Owner Button */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Theme Switcher Button */}
          <div className="relative">
            <button
              onClick={() => setThemeDropdownOpen(!themeDropdownOpen)}
              className="p-2 rounded-xl bg-rose-50/80 hover:bg-rose-100 text-slate-700 text-xs font-medium flex items-center gap-1.5 border border-rose-200/60 transition-all"
              title="Theme Tabdeel Karein"
            >
              <Sliders className="w-3.5 h-3.5 text-rose-500" />
              <span className="capitalize text-xs">{currentTheme}</span>
            </button>

            {themeDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white p-2 shadow-xl border border-rose-100 z-50 animate-in fade-in zoom-in-95">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Rang Chunien (Theme)
                </p>
                {themeOptions.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onThemeChange(t.id);
                      setThemeDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl text-left transition-all ${
                      currentTheme === t.id
                        ? 'bg-rose-50 text-rose-900 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full border ${t.color}`} />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reduced Motion Toggle */}
          <button
            onClick={onToggleReducedMotion}
            className={`p-2 rounded-xl border text-xs font-medium transition-all ${
              isReducedMotion
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-rose-50/80 border-rose-200/60 text-slate-600 hover:bg-rose-100'
            }`}
            title={isReducedMotion ? 'Normal Animations' : 'Reduce Motion (Kam Animations)'}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>

          {/* Owner Dashboard or Login Button */}
          {isOwnerAuthenticated ? (
            <button
              onClick={onOpenOwnerPortal}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-all transform active:scale-95"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Owner Panel</span>
            </button>
          ) : (
            <button
              onClick={onOpenOwnerLogin}
              className="px-3 py-2 rounded-xl bg-white hover:bg-rose-50 text-slate-700 border border-rose-200 text-xs font-medium flex items-center gap-1.5 transition-all"
              title="Sirf Owner ke liye (Private Login)"
            >
              <Lock className="w-3.5 h-3.5 text-rose-500" />
              <span>Owner Login</span>
            </button>
          )}
        </div>

        {/* Mobile menu hamburger */}
        <div className="flex md:hidden items-center gap-2">
          {isOwnerAuthenticated ? (
            <button
              onClick={onOpenOwnerPortal}
              className="p-2 rounded-lg bg-rose-500 text-white text-xs"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onOpenOwnerLogin}
              className="p-2 rounded-lg bg-rose-50 text-rose-700 text-xs border border-rose-200"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 hover:bg-rose-50"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-b border-rose-100 px-6 py-5 space-y-4 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-3 font-medium text-slate-700 text-sm">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-left py-2 hover:text-rose-600"
            >
              Shuruat
            </button>
            <button
              onClick={() => scrollToSection('gallery-section')}
              className="text-left py-2 hover:text-rose-600 flex items-center gap-2"
            >
              <Camera className="w-4 h-4 text-rose-400" />
              Hamari Yaadein (Photos)
            </button>
            <button
              onClick={() => scrollToSection('timeline-section')}
              className="text-left py-2 hover:text-rose-600 flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-amber-400" />
              Safar (Milestones)
            </button>
            <button
              onClick={() => scrollToSection('blessings-section')}
              className="text-left py-2 hover:text-rose-600 flex items-center gap-2"
            >
              <Heart className="w-4 h-4 text-pink-400" />
              Duayein (Prayers)
            </button>
            <button
              onClick={() => scrollToSection('baby-info-section')}
              className="text-left py-2 hover:text-rose-600"
            >
              Baby Ki Umar & Tafseelat
            </button>
          </div>

          {/* Theme selector in mobile drawer */}
          <div className="pt-3 border-t border-rose-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Website Ka Theme
            </p>
            <div className="flex flex-wrap gap-2">
              {themeOptions.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onThemeChange(t.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-1.5 text-xs rounded-lg border flex items-center gap-1.5 ${
                    currentTheme === t.id
                      ? 'bg-rose-100 border-rose-400 font-semibold text-rose-900'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${t.color}`} />
                  {t.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
