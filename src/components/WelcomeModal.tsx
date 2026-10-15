import React, { useState, useEffect } from 'react';
import { Sparkles, Moon, Heart, Volume2, X } from 'lucide-react';
import { lullabyPlayer } from '../utils/lullabyAudio';

interface WelcomeModalProps {
  babyName: string;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ babyName }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show only on first visit in session
    const hasSeen = sessionStorage.getItem('seen_baby_welcome');
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = (withMusic: boolean) => {
    if (withMusic) {
      lullabyPlayer.play();
    }
    sessionStorage.setItem('seen_baby_welcome', 'true');
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative max-w-lg w-full rounded-3xl bg-white p-7 sm:p-9 shadow-2xl border-2 border-rose-200 text-center space-y-6 animate-in zoom-in-95 duration-300">
        
        {/* Close Button */}
        <button
          onClick={() => handleClose(false)}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-rose-50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Animated Moon and Stars Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-tr from-rose-200 via-amber-100 to-pink-200 flex items-center justify-center shadow-lg border-2 border-amber-300 animate-float-gentle">
          <Moon className="w-10 h-10 text-amber-500 fill-amber-300" />
          <Sparkles className="w-5 h-5 text-rose-500 absolute -top-1 -right-1 animate-sparkle" />
          <Heart className="w-4 h-4 text-pink-500 fill-pink-500 absolute -bottom-1 -left-1" />
        </div>

        {/* Welcome Text */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Khush Aamdeed!
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-slate-900">
            Aap Hamari Duniya Mein Khush Aamdeed Hain! ✨
          </h3>
          <p className="font-script text-3xl text-rose-600">
            {babyName || 'Pyare Baby'} Ki Yaadgaar Duniya
          </p>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto font-serif italic pt-1">
            "Alhamdulillah! Is nanhi si jaan ki muskurahat ne hamari duniya ko khushiyon se bhar diya hai."
          </p>
        </div>

        {/* Buttons: Enter with or without music */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => handleClose(true)}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-semibold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Volume2 className="w-4 h-4" />
            <span>Lori Sunein Aur Dekhein</span>
          </button>

          <button
            onClick={() => handleClose(false)}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs sm:text-sm transition-all"
          >
            Baghair Lori Dekhein
          </button>
        </div>

      </div>
    </div>
  );
};
