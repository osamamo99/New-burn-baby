import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Filter,
  Heart,
  Calendar,
  Tag,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Pause,
  Share2,
  Download,
  Sparkles,
  Maximize2,
  Check,
} from 'lucide-react';
import { CategoryItem, Memory } from '../types';

interface GallerySectionProps {
  memories: Memory[];
  categories: CategoryItem[];
  allowDownloads: boolean;
  babyName: string;
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  memories,
  categories,
  allowDownloads,
  babyName,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'favorites'>('newest');
  const [onlyFavorites, setOnlyFavorites] = useState<boolean>(false);

  // Lightbox Modal state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isSlideshowRunning, setIsSlideshowRunning] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [selectedAltIndex, setSelectedAltIndex] = useState<number>(0);

  // Touch swipe handling
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Filter and sort memories
  const filteredMemories = useMemo(() => {
    let list = [...memories];

    if (selectedCategory !== 'all') {
      list = list.filter((m) => m.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (onlyFavorites) {
      list = list.filter((m) => m.isFavorite);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.caption.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'oldest') {
      list.sort((a, b) => new Date(a.memoryDate).getTime() - new Date(b.memoryDate).getTime());
    } else if (sortBy === 'favorites') {
      list.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
    } else {
      list.sort((a, b) => new Date(b.memoryDate).getTime() - new Date(a.memoryDate).getTime());
    }

    return list;
  }, [memories, selectedCategory, onlyFavorites, searchQuery, sortBy]);

  // Featured memory: "Aaj Ki Pyari Yaad" (Memory of the day)
  const memoryOfTheDay = useMemo(() => {
    if (memories.length === 0) return null;
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    return memories[dayOfYear % memories.length];
  }, [memories]);

  // Slideshow timer
  useEffect(() => {
    if (!isSlideshowRunning || lightboxIndex === null || filteredMemories.length === 0) return;
    const timer = setInterval(() => {
      setLightboxIndex((prev) => (prev !== null ? (prev + 1) % filteredMemories.length : 0));
      setZoomLevel(1);
      setSelectedAltIndex(0);
    }, 4000);
    return () => clearInterval(timer);
  }, [isSlideshowRunning, lightboxIndex, filteredMemories.length]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredMemories.length]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setZoomLevel(1);
    setSelectedAltIndex(0);
    setIsSlideshowRunning(false);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    setZoomLevel(1);
    setIsSlideshowRunning(false);
  };

  const nextImage = () => {
    if (lightboxIndex === null || filteredMemories.length === 0) return;
    setLightboxIndex((lightboxIndex + 1) % filteredMemories.length);
    setZoomLevel(1);
    setSelectedAltIndex(0);
  };

  const prevImage = () => {
    if (lightboxIndex === null || filteredMemories.length === 0) return;
    setLightboxIndex((lightboxIndex - 1 + filteredMemories.length) % filteredMemories.length);
    setZoomLevel(1);
    setSelectedAltIndex(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextImage();
      else prevImage();
    }
  };

  const handleShare = async (memory: Memory) => {
    const shareUrl = `${window.location.origin}#memory-${memory.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: memory.title,
          text: `${memory.title} - ${babyName} Ki Yaad`,
          url: shareUrl,
        });
        return;
      } catch {
        // fallback
      }
    }
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const currentMemory = lightboxIndex !== null ? filteredMemories[lightboxIndex] : null;

  return (
    <section id="gallery-section" className="py-16 sm:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>Digital Memory Book</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900">
            Hamare Baby Ki Pyari Yaadein
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Har tasveer ke peeche ek anmol kahani, mohabbat aur Roman Urdu mein khoobsurat ehsaas.
          </p>
        </div>

        {/* Featured Card: "Aaj Ki Pyari Yaad" (Memory of the Day) */}
        {memoryOfTheDay && (
          <div className="mb-14 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-50 via-white to-amber-50 border-2 border-rose-200/80 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 px-5 py-1.5 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-semibold rounded-bl-2xl shadow-sm flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Aaj Ki Pyari Yaad (Memory of the Day)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mt-2">
              <div className="md:col-span-5 relative group cursor-pointer" onClick={() => openLightbox(memories.indexOf(memoryOfTheDay))}>
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-md border-2 border-white">
                  <img
                    src={memoryOfTheDay.imageUrl}
                    alt={memoryOfTheDay.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity flex items-center justify-center text-white font-medium text-sm gap-1.5">
                  <Maximize2 className="w-4 h-4" />
                  <span>Bari Tasveer Dekhein</span>
                </div>
              </div>

              <div className="md:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-800 bg-amber-100/80 px-3 py-1 rounded-full">
                  <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                  <span>{memoryOfTheDay.category}</span>
                </div>

                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
                  {memoryOfTheDay.title}
                </h3>

                <p className="text-slate-700 leading-relaxed font-serif text-base sm:text-lg italic bg-white/70 p-4 rounded-2xl border border-rose-100/80">
                  "{memoryOfTheDay.caption}"
                </p>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-rose-400" />
                    <span>
                      Tareekh:{' '}
                      {new Date(memoryOfTheDay.memoryDate).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <button
                    onClick={() => openLightbox(memories.indexOf(memoryOfTheDay))}
                    className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs shadow-sm transition-all"
                  >
                    Mukammal Tafseelat ✨
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="glass-panel rounded-3xl p-4 sm:p-6 mb-10 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tasveer, caption ya tag talash karein..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/90 border border-rose-100 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-300"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort & Favorites Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOnlyFavorites(!onlyFavorites)}
                className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                  onlyFavorites
                    ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                    : 'bg-white/80 text-slate-700 border-rose-100 hover:bg-rose-50'
                }`}
                title="Sirf Pasandida Yaadein"
              >
                <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-white' : 'text-rose-500'}`} />
                <span>Favorites</span>
              </button>

              <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-2xl border border-rose-100 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
                >
                  <option value="newest">Taza Tareen (Newest)</option>
                  <option value="oldest">Pehle Din Se (Oldest)</option>
                  <option value="favorites">Pasandida (Favorites)</option>
                </select>
              </div>
            </div>

          </div>

          {/* Categories Pill Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === 'all'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-white/70 text-slate-600 hover:bg-rose-50 border border-rose-100/70'
              }`}
            >
              Tamam Yaadein ({memories.length})
            </button>

            {categories.map((cat) => {
              const count = memories.filter((m) => m.category.toLowerCase() === cat.name.toLowerCase()).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedCategory.toLowerCase() === cat.name.toLowerCase()
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-white/70 text-slate-600 hover:bg-rose-50 border border-rose-100/70'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Gallery Grid */}
        {filteredMemories.length === 0 ? (
          <div className="text-center py-16 bg-white/60 rounded-3xl border border-rose-100">
            <div className="text-4xl mb-3">🧸 📷</div>
            <h4 className="font-serif text-xl font-bold text-slate-800">
              Koi Yaad Nahi Mili
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1">
              {searchQuery
                ? 'Aap ki talash ke mutabiq koi tasveer dastiyab nahi hai.'
                : 'Is category mein filhal koi tasveer publish nahi hui.'}
            </p>
            {(searchQuery || selectedCategory !== 'all' || onlyFavorites) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setOnlyFavorites(false);
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-rose-500 text-white text-xs font-medium"
              >
                Filters Khatam Karein
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredMemories.map((mem, idx) => (
              <div
                key={mem.id}
                id={`memory-${mem.id}`}
                onClick={() => openLightbox(idx)}
                className="group relative rounded-3xl bg-white/90 border border-rose-100/90 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer flex flex-col justify-between"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-rose-50">
                  <img
                    src={mem.thumbnailUrl || mem.imageUrl}
                    alt={mem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 opacity-60 group-hover:opacity-40 transition-opacity" />

                  {/* Category badge */}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[11px] font-semibold text-rose-900 border border-rose-100 shadow-sm">
                    {mem.category}
                  </div>

                  {/* Favorite heart */}
                  {mem.isFavorite && (
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-rose-500 shadow-sm">
                      <Heart className="w-4 h-4 fill-rose-500" />
                    </div>
                  )}

                  {/* Quick view button on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="px-3.5 py-1.5 rounded-full bg-white/95 text-slate-800 text-xs font-semibold shadow-lg backdrop-blur-md flex items-center gap-1.5">
                      <Maximize2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Bari Tasveer</span>
                    </span>
                  </div>
                </div>

                {/* Card Info */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-rose-600 transition-colors">
                      {mem.title}
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 mt-1.5 italic font-serif leading-relaxed">
                      "{mem.caption}"
                    </p>
                  </div>

                  {/* Footer Meta */}
                  <div className="pt-3 border-t border-rose-50 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-rose-400" />
                      <span>
                        {new Date(mem.memoryDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>

                    {mem.tags && mem.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-amber-400" />
                        <span className="line-clamp-1">#{mem.tags[0]}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* FULL-SCREEN LIGHTBOX MODAL */}
      {currentMemory && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Top Bar Controls */}
          <div className="flex items-center justify-between text-white z-10 px-2 py-1">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium">
                {lightboxIndex + 1} / {filteredMemories.length}
              </span>
              <span className="text-xs text-white/80 hidden sm:inline">
                {currentMemory.category}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Slideshow button */}
              <button
                onClick={() => setIsSlideshowRunning(!isSlideshowRunning)}
                className={`p-2 rounded-full transition-colors ${
                  isSlideshowRunning ? 'bg-rose-500 text-white' : 'bg-white/10 hover:bg-white/20'
                }`}
                title={isSlideshowRunning ? 'Slideshow Rokein' : 'Slideshow Chalayein'}
              >
                {isSlideshowRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              {/* Zoom Controls */}
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.3, 2.5))}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.3, 1))}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              {/* Share */}
              <button
                onClick={() => handleShare(currentMemory)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white relative"
                title="Share Karein"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                {copiedLink && (
                  <span className="absolute -bottom-7 right-0 text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded shadow whitespace-nowrap">
                    Link Copied!
                  </span>
                )}
              </button>

              {/* Optional Download */}
              {allowDownloads && (
                <a
                  href={currentMemory.imageUrl}
                  download={`${currentMemory.title}.jpg`}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
                  title="Tasveer Download Karein"
                >
                  <Download className="w-4 h-4" />
                </a>
              )}

              {/* Close */}
              <button
                onClick={closeLightbox}
                className="p-2 rounded-full bg-rose-500/80 hover:bg-rose-600 text-white ml-2"
                title="Band Karein (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Viewer Area */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden my-2">
            {/* Prev button */}
            <button
              onClick={prevImage}
              className="absolute left-2 sm:left-4 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all"
              title="Pichli Tasveer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Next button */}
            <button
              onClick={nextImage}
              className="absolute right-2 sm:right-4 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition-all"
              title="Agli Tasveer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Image itself */}
            <div
              className="max-w-4xl max-h-[68vh] transition-transform duration-200 cursor-grab active:cursor-grabbing flex items-center justify-center"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <img
                src={currentMemory.imageUrl}
                alt={currentMemory.title}
                className="max-h-[68vh] max-w-full object-contain rounded-2xl shadow-2xl"
              />
            </div>
          </div>

          {/* Bottom Caption & Details Card */}
          <div className="max-w-3xl mx-auto w-full bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-2xl text-slate-800 z-10 border border-rose-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-100 pb-2 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg sm:text-xl font-bold text-slate-900">
                  {currentMemory.title}
                </span>
                {currentMemory.isFavorite && (
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                )}
              </div>

              <div className="text-xs text-slate-500 flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-rose-400" />
                  {new Date(currentMemory.memoryDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-medium">
                  {currentMemory.category}
                </span>
              </div>
            </div>

            {/* Caption Text (Primary or chosen Alternative) */}
            <p className="font-serif text-sm sm:text-base italic text-slate-700 leading-relaxed">
              "{selectedAltIndex === 0
                ? currentMemory.caption
                : currentMemory.alternativeCaptions?.[selectedAltIndex - 1]?.text || currentMemory.caption}"
            </p>

            {/* Alternative Captions Style Selector if present */}
            {currentMemory.alternativeCaptions && currentMemory.alternativeCaptions.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-rose-100/70">
                <span className="text-[11px] font-semibold text-slate-400 mr-1">
                  Urdu Caption Styles:
                </span>
                <button
                  onClick={() => setSelectedAltIndex(0)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedAltIndex === 0
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-rose-50 text-slate-600 hover:bg-rose-100'
                  }`}
                >
                  Asal Caption
                </button>
                {currentMemory.alternativeCaptions.map((alt, aIdx) => (
                  <button
                    key={aIdx}
                    onClick={() => setSelectedAltIndex(aIdx + 1)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      selectedAltIndex === aIdx + 1
                        ? 'bg-rose-500 text-white shadow-xs'
                        : 'bg-rose-50 text-slate-600 hover:bg-rose-100'
                    }`}
                  >
                    {alt.style}
                  </button>
                ))}
              </div>
            )}

            {/* Tags footer */}
            {currentMemory.tags && currentMemory.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 mt-2">
                {currentMemory.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </section>
  );
};
