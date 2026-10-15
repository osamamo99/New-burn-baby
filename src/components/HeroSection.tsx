import React from 'react';
import { Sparkles, Heart, ChevronDown, Calendar, Users } from 'lucide-react';
import { BabySettings } from '../types';

interface HeroSectionProps {
  settings: BabySettings;
  onExploreGallery: () => void;
  onExploreStory: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  settings,
  onExploreGallery,
  onExploreStory,
}) => {
  const displayImage = settings.heroImageUrl || '/sample-art/hero-baby.svg';

  return (
    <section className="relative overflow-hidden pt-8 pb-20 md:pt-16 md:pb-28">
      {/* Delicate floating background elements */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Soft background glow circles */}
        <div className="absolute top-10 left-1/4 w-80 h-80 rounded-full bg-rose-200/35 blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute top-1/2 right-10 w-64 h-64 rounded-full bg-purple-200/30 blur-3xl" />

        {/* Floating tiny stars & decorative clouds */}
        <div className="absolute top-12 left-10 text-amber-400 text-2xl animate-float-gentle opacity-70">
          ✨
        </div>
        <div className="absolute top-28 right-16 text-rose-300 text-3xl animate-float-reverse opacity-70">
          🧸
        </div>
        <div className="absolute bottom-20 left-16 text-pink-400 text-2xl animate-sparkle opacity-60">
          💖
        </div>
        <div className="absolute bottom-32 right-24 text-amber-300 text-2xl animate-float-gentle opacity-80">
          ⭐
        </div>
        <div className="absolute top-1/3 left-6 text-sky-300 text-xl animate-float-reverse opacity-50">
          ☁️
        </div>
        <div className="absolute top-2/3 right-8 text-purple-300 text-xl animate-sparkle opacity-60">
          🦋
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            
            {/* Top Pill / Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-rose-200/80 shadow-sm backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-800">
                Bismillah-ir-Rahman-ir-Rahim
              </span>
            </div>

            {/* Main Welcome Heading */}
            <div className="space-y-3">
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.15]">
                {settings.welcomeTitle || 'Hamari Duniya Mein Khush Aamdeed!'}
              </h1>
              
              <div className="font-script text-4xl sm:text-6xl text-rose-600 font-normal drop-shadow-sm">
                {settings.babyName || 'Pyare Baby'}
              </div>
            </div>

            {/* Parents & Birth Date tags */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs sm:text-sm font-medium text-slate-600">
              {settings.parentsNames && (
                <div className="flex items-center gap-1.5 bg-rose-50/90 px-3 py-1.5 rounded-xl border border-rose-100 text-rose-900">
                  <Users className="w-4 h-4 text-rose-500" />
                  <span>Walidain: {settings.parentsNames}</span>
                </div>
              )}
              {settings.birthDate && (
                <div className="flex items-center gap-1.5 bg-amber-50/90 px-3 py-1.5 rounded-xl border border-amber-100 text-amber-900">
                  <Calendar className="w-4 h-4 text-amber-600" />
                  <span>
                    Tareekh-e-Pedaish:{' '}
                    {new Date(settings.birthDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Roman Urdu Welcome Paragraph */}
            <div className="relative p-5 sm:p-6 rounded-3xl bg-white/70 backdrop-blur-md border border-rose-100/80 shadow-md">
              <div className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-semibold tracking-wider uppercase">
                Khushi Ka Paighaam
              </div>
              <p className="text-slate-700 leading-relaxed text-sm sm:text-base italic font-serif">
                "{settings.welcomeMessage ||
                  'Alhamdulillah! Hamari zindagi mein ek nanhi si jaan ki amad hui hai. Is choti si muskurahat ne hamari duniya ko khushiyon, mohabbat aur umeed ke naye rangon se bhar diya hai. Allah hamare pyare baby ko sehat, khushiyan, lambi zindagi aur hamesha apni hifazat mein rakhe. Ameen.'}"
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onExploreGallery}
                className="px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 group"
              >
                <span>Hamari Yaadein Dekhein</span>
                <Heart className="w-4 h-4 text-white fill-white group-hover:scale-125 transition-transform" />
              </button>

              <button
                onClick={onExploreStory}
                className="px-6 sm:px-7 py-3.5 rounded-2xl bg-white hover:bg-rose-50 text-slate-800 font-semibold text-sm sm:text-base border border-rose-200 shadow-sm hover:shadow transition-all flex items-center gap-2"
              >
                <span>Baby Ki Kahani</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </button>
            </div>

          </div>

          {/* Right Column: Hero Baby Photo Frame with Golden Rim */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group">
              
              {/* Outer Golden Glow Circle */}
              <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-amber-300 via-rose-300 to-amber-400 opacity-60 blur-xl group-hover:opacity-80 transition duration-700 animate-pulse" />

              {/* Golden Frame Container */}
              <div className="relative w-72 h-72 sm:w-88 sm:h-88 md:w-96 md:h-96 rounded-full p-3.5 bg-gradient-to-br from-amber-200 via-amber-400 to-yellow-600 shadow-2xl flex items-center justify-center border-4 border-white/80">
                
                {/* Secondary inner beaded ring */}
                <div className="w-full h-full rounded-full p-2.5 bg-white/95 border-2 border-dashed border-amber-400/70 overflow-hidden flex items-center justify-center relative shadow-inner">
                  
                  {/* Photo or Tasteful Illustration */}
                  <img
                    src={displayImage}
                    alt={settings.babyName || 'Baby'}
                    className="w-full h-full object-cover rounded-full transition-transform duration-700 group-hover:scale-105"
                    loading="eager"
                  />

                  {/* Corner Badge if Illustrated Placeholder */}
                  {!settings.heroImageUrl && (
                    <div className="absolute bottom-5 inset-x-0 mx-auto w-fit px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-amber-300 text-[11px] font-semibold text-amber-900 shadow-sm flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Artistic Illustration</span>
                    </div>
                  )}
                </div>

                {/* Floating Little Heart on Golden Frame Edge */}
                <div className="absolute -top-1 right-6 w-9 h-9 rounded-full bg-gradient-to-tr from-rose-500 to-pink-400 text-white flex items-center justify-center shadow-md animate-bounce">
                  <Heart className="w-4 h-4 fill-white" />
                </div>

                {/* Floating Moon charm */}
                <div className="absolute -bottom-2 left-8 w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shadow-md border border-amber-300 text-lg">
                  🌙
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Scroll down indicator */}
        <div className="mt-14 text-center">
          <button
            onClick={onExploreGallery}
            className="inline-flex flex-col items-center text-xs font-medium text-slate-500 hover:text-rose-600 transition-colors group"
          >
            <span className="font-serif">Neche Dekhein</span>
            <ChevronDown className="w-4 h-4 animate-bounce text-rose-400 group-hover:text-rose-600" />
          </button>
        </div>
      </div>
    </section>
  );
};
