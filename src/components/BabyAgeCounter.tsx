import React, { useMemo } from 'react';
import { Calendar, Clock, Gift, Heart, Sparkles, Scale, Ruler } from 'lucide-react';
import confetti from 'canvas-confetti';
import { BabySettings } from '../types';

interface BabyAgeCounterProps {
  settings: BabySettings;
}

export const BabyAgeCounter: React.FC<BabyAgeCounterProps> = ({ settings }) => {
  if (!settings.showAge || !settings.birthDate) {
    return null;
  }

  // Calculate accurate age (years, months, days) and countdown
  const { age, totalDays, countdownDays, nextBirthdayDate, isBirthdayToday } = useMemo(() => {
    const birth = new Date(settings.birthDate + 'T00:00:00');
    const today = new Date();

    // Check if birth is valid
    if (isNaN(birth.getTime())) {
      return {
        age: { years: 0, months: 0, days: 0 },
        totalDays: 0,
        countdownDays: 0,
        nextBirthdayDate: '',
        isBirthdayToday: false,
      };
    }

    // Days since birth
    const diffTime = today.getTime() - birth.getTime();
    const totalDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

    // Years, Months, Days calculation
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    if (days < 0) {
      // borrow days from previous month
      months -= 1;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    // Next birthday calculation
    let nextBday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    const isBirthdayToday =
      today.getMonth() === birth.getMonth() && today.getDate() === birth.getDate();

    if (nextBday < today && !isBirthdayToday) {
      nextBday.setFullYear(today.getFullYear() + 1);
    }

    const countdownDiff = nextBday.getTime() - today.getTime();
    const countdownDays = Math.max(0, Math.ceil(countdownDiff / (1000 * 60 * 60 * 24)));

    const nextBirthdayDate = nextBday.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    return {
      age: { years: Math.max(0, years), months: Math.max(0, months), days: Math.max(0, days) },
      totalDays,
      countdownDays,
      nextBirthdayDate,
      isBirthdayToday,
    };
  }, [settings.birthDate]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#fbbf24', '#38bdf8', '#c084fc', '#f472b6'],
      });
    } catch {
      // fallback
    }
  };

  return (
    <section id="baby-info-section" className="py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Nanhe Lamhaat Aur Umar</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
            {settings.babyName} Ki Pyari Umar
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Har beeta lamha hamare liye ek anmol tohfa aur khushi ka silsila hai.
          </p>
        </div>

        {/* Birthday banner if today is birthday */}
        {isBirthdayToday && (
          <div className="mb-10 p-6 rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white shadow-xl text-center relative overflow-hidden">
            <div className="text-3xl mb-2">🎉 🎂 🎈</div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold">
              Aaj {settings.babyName} Ki Salgirah (Birthday) Hai!
            </h3>
            <p className="text-white/90 text-sm mt-1 max-w-md mx-auto">
              Mubarak ho! Allah hamare pyare bache ko lambi, sehat-mand aur khush-haal zindagi ata farmaye. Ameen!
            </p>
            <button
              onClick={triggerConfetti}
              className="mt-4 px-5 py-2.5 bg-white text-rose-600 font-semibold text-xs rounded-full shadow hover:bg-rose-50 transition-all active:scale-95"
            >
              Khushiyan Manayein (Confetti) 🎊
            </button>
          </div>
        )}

        {/* Age Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-10">
          
          {/* Years / Saal */}
          <div className="glass-panel rounded-3xl p-6 text-center border-rose-100/90 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-slate-800">
              {age.years}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-rose-900 mt-1">
              Saal (Years)
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Khoobsurat safar</div>
          </div>

          {/* Months / Mahine */}
          <div className="glass-panel rounded-3xl p-6 text-center border-amber-100/90 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 mx-auto rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-slate-800">
              {age.months}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-amber-900 mt-1">
              Mahine (Months)
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Khushiyon bhare</div>
          </div>

          {/* Days / Din */}
          <div className="glass-panel rounded-3xl p-6 text-center border-sky-100/90 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 mx-auto rounded-full bg-sky-100 text-sky-600 flex items-center justify-center mb-3">
              <Heart className="w-5 h-5 text-sky-500 fill-sky-200" />
            </div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-slate-800">
              {age.days}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-sky-900 mt-1">
              Din (Days)
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Masoom muskurahatein</div>
          </div>

          {/* Total Days Since Birth */}
          <div className="glass-panel rounded-3xl p-6 text-center border-purple-100/90 shadow-sm hover:shadow-md transition-all">
            <div className="w-10 h-10 mx-auto rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5 text-purple-500" />
            </div>
            <div className="font-serif text-3xl sm:text-4xl font-bold text-purple-950">
              {totalDays}
            </div>
            <div className="text-xs sm:text-sm font-semibold text-purple-900 mt-1">
              Kul Din (Total Days)
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Hamari zindagi mein</div>
          </div>

        </div>

        {/* Detailed Birth Stats & Countdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Birth Details Card */}
          {settings.showBirthDetails && (
            <div className="glass-panel rounded-3xl p-6 sm:p-7 border-rose-100 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                <span>Pedaish Ki Khaas Tafseelat</span>
                <span className="text-xs font-normal bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                  Mubarak Din
                </span>
              </h3>

              <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-3.5 rounded-2xl bg-white/80 border border-rose-100">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                    <Calendar className="w-3.5 h-3.5 text-rose-500" />
                    <span>Tareekh</span>
                  </div>
                  <div className="font-semibold text-slate-800">
                    {new Date(settings.birthDate).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 border border-rose-100">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Waqt (Time)</span>
                  </div>
                  <div className="font-semibold text-slate-800">
                    {settings.birthTime || 'Subah 06:45 AM'}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 border border-rose-100">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                    <Scale className="w-3.5 h-3.5 text-sky-500" />
                    <span>Wazan (Weight)</span>
                  </div>
                  <div className="font-semibold text-slate-800">
                    {settings.birthWeight || '3.4 Kilograms'}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 border border-rose-100">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                    <Ruler className="w-3.5 h-3.5 text-purple-500" />
                    <span>Qad (Length)</span>
                  </div>
                  <div className="font-semibold text-slate-800">
                    {settings.birthLength || '51 Centimeters'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Birthday Countdown Card */}
          {settings.showCountdown && (
            <div className="glass-panel rounded-3xl p-6 sm:p-7 border-amber-100 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <Gift className="w-5 h-5 text-amber-500" />
                  <span>Agli Birthday Ka Countdown</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-5">
                  Hamari jaan ki agli saalgirah {nextBirthdayDate} ko aayegi.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-rose-50 border border-amber-200/80 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider font-semibold text-amber-800">
                    Baqi Din
                  </div>
                  <div className="font-serif text-3xl sm:text-4xl font-extrabold text-amber-900">
                    {countdownDays} Din
                  </div>
                </div>

                <button
                  onClick={triggerConfetti}
                  className="px-4 py-2 bg-gradient-to-r from-amber-400 to-rose-400 text-white rounded-xl text-xs font-semibold shadow hover:shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Jashan Ki Dua</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
