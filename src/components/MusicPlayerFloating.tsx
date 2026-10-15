import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Music, Disc } from 'lucide-react';
import { lullabyPlayer } from '../utils/lullabyAudio';

export const MusicPlayerFloating: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.5);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [track, setTrack] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = lullabyPlayer.subscribe((playing) => {
      setIsPlaying(playing);
    });
    return unsubscribe;
  }, []);

  const handleTogglePlay = () => {
    lullabyPlayer.toggle();
  };

  const handleToggleMute = () => {
    const muted = lullabyPlayer.toggleMute();
    setIsMuted(muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    lullabyPlayer.setVolume(val);
  };

  const handleTrackChange = (idx: number) => {
    setTrack(idx);
    lullabyPlayer.setTrack(idx);
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Control Popover */}
      {isOpen && (
        <div className="mb-3 w-72 rounded-2xl bg-white/95 p-4 shadow-2xl backdrop-blur-md border border-rose-100 transition-all text-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between pb-2 border-b border-rose-100">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-semibold text-rose-900 tracking-wide uppercase">
                Baby Lullaby Music Box
              </span>
            </div>
            <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-medium">
              Pure Chimes
            </span>
          </div>

          <p className="text-xs text-slate-500 my-2">
            Naram aur pur-sukoon lori chimes jo baby ke sukoon ke liye banaye gaye hain.
          </p>

          {/* Track selector */}
          <div className="grid grid-cols-2 gap-1.5 my-2.5">
            <button
              onClick={() => handleTrackChange(0)}
              className={`px-2.5 py-1.5 text-xs rounded-xl font-medium transition-all ${
                track === 0
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              🌙 Brahms' Lullaby
            </button>
            <button
              onClick={() => handleTrackChange(1)}
              className={`px-2.5 py-1.5 text-xs rounded-xl font-medium transition-all ${
                track === 1
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              ⭐ Twinkle Star
            </button>
          </div>

          {/* Volume slider */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleToggleMute}
              className="p-1.5 text-slate-500 hover:text-rose-600 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full accent-rose-500 h-1.5 bg-rose-100 rounded-lg cursor-pointer"
            />
            <span className="text-[11px] text-slate-400 font-mono w-7 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <div className="flex items-center gap-2 bg-white/90 p-1.5 rounded-full shadow-lg border border-rose-200/80 backdrop-blur-md">
        <button
          onClick={handleTogglePlay}
          className={`relative p-3 rounded-full text-white transition-all transform active:scale-95 shadow-md ${
            isPlaying
              ? 'bg-gradient-to-r from-rose-500 to-pink-500 ring-4 ring-rose-200/70'
              : 'bg-gradient-to-r from-slate-600 to-slate-700 hover:from-rose-500 hover:to-pink-500'
          }`}
          title={isPlaying ? 'Lori Band Karein (Pause)' : 'Lori Chalayein (Play)'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 translate-x-0.5" />}
          {isPlaying && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
            </span>
          )}
        </button>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-rose-700 hover:bg-rose-50 rounded-full transition-colors flex items-center gap-1.5 text-xs font-medium pr-3"
          title="Lori Settings"
        >
          <Disc className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          <span className="hidden sm:inline font-sans text-xs">
            {isPlaying ? 'Lori Chal Rahi Hai' : 'Lullaby'}
          </span>
        </button>
      </div>
    </div>
  );
};
