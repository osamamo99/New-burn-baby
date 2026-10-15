import React from 'react';
import { Heart, Moon, Shield, Lock, Sparkles } from 'lucide-react';
import { BabySettings } from '../types';

interface FooterProps {
  settings: BabySettings;
  isOwnerAuthenticated: boolean;
  onOpenOwnerPortal: () => void;
  onOpenOwnerLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  isOwnerAuthenticated,
  onOpenOwnerPortal,
  onOpenOwnerLogin,
}) => {
  return (
    <footer className="relative bg-white/90 border-t border-rose-100 pt-16 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-rose-100/80">
          
          {/* Brand & Family Message */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-200 to-rose-200 flex items-center justify-center text-amber-700 shadow-sm border border-amber-300">
                <Moon className="w-5 h-5 fill-amber-400 text-amber-600" />
              </div>
              <span className="font-hand text-3xl font-bold text-rose-950">
                Hamari Duniya
              </span>
            </div>

            <p className="text-slate-600 text-sm leading-relaxed max-w-md font-serif italic">
              "Allah Ta'ala ne hamari zindagi ko is nanhi si jaan se roshan farmaya. Yeh website hamare bache ki anmol yaadon aur khushiyon ka ek mehfooz digital album hai."
            </p>

            <div className="text-xs text-rose-800 font-medium">
              Mohabbat Se Banaya Gaya • {settings.parentsNames || 'Walidain'} Ki Taraf Se ❤️
            </div>
          </div>

          {/* Quick Nav */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Sections
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 font-medium">
              <li>
                <a href="#gallery-section" className="hover:text-rose-600 transition-colors">
                  Tasveeron Ka Album (Gallery)
                </a>
              </li>
              <li>
                <a href="#timeline-section" className="hover:text-rose-600 transition-colors">
                  Khoobsurat Safar (Timeline)
                </a>
              </li>
              <li>
                <a href="#blessings-section" className="hover:text-rose-600 transition-colors">
                  Babarkat Duayein (Blessings)
                </a>
              </li>
              <li>
                <a href="#baby-info-section" className="hover:text-rose-600 transition-colors">
                  Baby Ki Umar & Milestones
                </a>
              </li>
            </ul>
          </div>

          {/* Privacy & Owner Portal */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Hifazat Aur Intizam
            </h4>

            <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-100 text-[11px] text-slate-600 leading-normal">
              <div className="flex items-center gap-1.5 font-semibold text-rose-900 mb-1">
                <Shield className="w-3.5 h-3.5 text-rose-500" />
                <span>Privacy Notice</span>
              </div>
              Is website par sirf walidain ki manzoor shuda aur publish ki gayi yaadein dunya ke samne pesh ki jati hain. Private drafts mehfooz rehte hain.
            </div>

            <div className="pt-1">
              {isOwnerAuthenticated ? (
                <button
                  onClick={onOpenOwnerPortal}
                  className="w-full py-2.5 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Owner Dashboard Kholein</span>
                </button>
              ) : (
                <button
                  onClick={onOpenOwnerLogin}
                  className="w-full py-2 px-3 rounded-xl bg-white hover:bg-rose-50 text-slate-700 border border-rose-200 text-xs font-medium flex items-center justify-center gap-2 transition-all"
                >
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  <span>Owner Login (Dashboard)</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex items-center gap-1">
            <span>© {new Date().getFullYear()} Hamari Duniya • {settings.babyName} Memories.</span>
          </div>
          <div className="flex items-center gap-2 text-rose-600/80">
            <span>Har lamha barkat aur khushiyon se bhara ho</span>
            <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-500" />
          </div>
        </div>

      </div>
    </footer>
  );
};
