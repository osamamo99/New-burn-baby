import React, { useState } from 'react';
import { Moon, Sparkles, Heart, CheckCircle2 } from 'lucide-react';
import { BlessingItem } from '../types';

interface BlessingsSectionProps {
  blessings: BlessingItem[];
  babyName: string;
}

export const BlessingsSection: React.FC<BlessingsSectionProps> = ({ blessings, babyName }) => {
  const [ameenCount, setAmeenCount] = useState<Record<string, number>>({});
  const [justAmeened, setJustAmeened] = useState<string | null>(null);

  const handleSayAmeen = (id: string) => {
    setAmeenCount((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
    setJustAmeened(id);
    setTimeout(() => setJustAmeened(null), 2000);
  };

  return (
    <section id="blessings-section" className="py-20 sm:py-28 relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white">
      
      {/* Heavenly Stars & Moon Backdrop */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Soft radial glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-indigo-500/15 blur-[120px]" />
        
        {/* Floating Stars */}
        <div className="absolute top-12 left-1/4 text-amber-300 text-xl animate-sparkle">⭐</div>
        <div className="absolute top-24 right-1/4 text-yellow-200 text-lg animate-float-gentle">✨</div>
        <div className="absolute top-1/2 left-10 text-pink-300 text-xl animate-sparkle">🌟</div>
        <div className="absolute bottom-20 right-16 text-amber-200 text-2xl animate-float-reverse">🌙</div>
        <div className="absolute bottom-32 left-20 text-indigo-300 text-lg animate-sparkle">✨</div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Header with Glowing Moon */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 shadow-2xl mb-4 animate-soft-glow border-2 border-white/60">
            <Moon className="w-8 h-8 fill-slate-950" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-2 border border-white/10 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Babarkat Duayein</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white">
            {babyName} Ke Liye Pyari Si Duayein
          </h2>

          <p className="text-indigo-200 text-sm sm:text-base mt-3 font-serif">
            "Dua ek aisi roshni hai jo zindagi ke har andhere ko noor mein badal deti hai."
          </p>
        </div>

        {/* Blessings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {blessings.map((b) => {
            const count = ameenCount[b.id] || 0;
            const isJustSaid = justAmeened === b.id;

            return (
              <div
                key={b.id}
                className="relative rounded-3xl bg-white/[0.08] backdrop-blur-lg border border-white/15 p-7 shadow-xl hover:border-amber-300/40 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-amber-300 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{b.author || 'Walidain Ki Dua'}</span>
                    </span>
                    <Heart className="w-4 h-4 text-rose-400/70 group-hover:text-rose-400 group-hover:scale-110 transition-transform" />
                  </div>

                  <p className="font-serif text-lg sm:text-xl font-normal text-white/95 leading-relaxed italic">
                    "{b.text}"
                  </p>

                  {b.translationOrNote && (
                    <p className="text-xs text-indigo-200/80 mt-3 pt-3 border-t border-white/10">
                      {b.translationOrNote}
                    </p>
                  )}
                </div>

                {/* Ameen Button & Counter */}
                <div className="pt-6 mt-4 flex items-center justify-between border-t border-white/10">
                  <span className="text-xs text-indigo-300">
                    {count > 0 ? `${count} logon ne Ameen kaha` : 'Aap bhi Ameen kahein'}
                  </span>

                  <button
                    onClick={() => handleSayAmeen(b.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all transform active:scale-95 shadow-sm ${
                      isJustSaid
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-300 hover:to-rose-300 text-slate-950 font-bold'
                    }`}
                  >
                    {isJustSaid ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Ameen Summa Ameen!</span>
                      </>
                    ) : (
                      <>
                        <span>Ameen Kahein</span>
                        <span>🤲</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Bottom Dua Banner */}
        <div className="mt-14 text-center p-6 rounded-3xl bg-white/[0.05] border border-white/10 backdrop-blur-md max-w-2xl mx-auto">
          <p className="font-serif italic text-sm sm:text-base text-amber-200">
            "Aye Allah! Is bache ko walidain ke liye ankhon ki thandak, deen-o-dunya ki barkat aur naik bano. Ameen."
          </p>
        </div>

      </div>
    </section>
  );
};
