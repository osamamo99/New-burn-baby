import React from 'react';
import { Calendar, Compass, Sparkles, Star, Heart } from 'lucide-react';
import { TimelineMilestone } from '../types';

interface TimelineSectionProps {
  timeline: TimelineMilestone[];
  babyName: string;
}

export const TimelineSection: React.FC<TimelineSectionProps> = ({ timeline, babyName }) => {
  return (
    <section id="timeline-section" className="py-16 sm:py-24 relative overflow-hidden">
      {/* Background soft blurs */}
      <div className="absolute top-1/3 left-10 w-72 h-72 rounded-full bg-amber-100/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-rose-100/40 blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold uppercase tracking-wider mb-3">
            <Compass className="w-3.5 h-3.5 text-amber-600" />
            <span>Khoobsurat Safar</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-slate-900">
            {babyName} Ka Khoobsurat Safar
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Pehle qadam se le kar har anmol manzil tak ka yaadgar safarnama.
          </p>
        </div>

        {/* Timeline Path Container */}
        <div className="relative">
          {/* Vertical Golden Spine Line */}
          <div className="absolute left-4 sm:left-1/2 top-4 bottom-4 -translate-x-1/2 w-0.5 bg-gradient-to-b from-amber-200 via-rose-300 to-amber-200" />

          {/* Timeline Nodes */}
          <div className="space-y-12 sm:space-y-16">
            {timeline.map((item, idx) => {
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={item.id}
                  className={`relative flex flex-col sm:flex-row items-start sm:items-center ${
                    isEven ? 'sm:flex-row-reverse' : ''
                  } group`}
                >
                  {/* Central Node Badge on the spine */}
                  <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 z-10 w-9 h-9 rounded-full bg-gradient-to-tr from-amber-400 to-rose-400 p-0.5 shadow-md flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
                      {idx === 0 ? (
                        <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                      ) : (
                        <Heart className="w-4 h-4 fill-rose-400 text-rose-500" />
                      )}
                    </div>
                  </div>

                  {/* Content Card (Left or Right on desktop, offset on mobile) */}
                  <div
                    className={`w-full sm:w-[calc(50%-2.5rem)] ml-12 sm:ml-0 ${
                      isEven ? 'sm:pr-4' : 'sm:pl-4'
                    }`}
                  >
                    <div className="glass-panel rounded-3xl p-6 sm:p-7 border-rose-100/90 shadow-sm hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                      
                      {/* Milestone badge & Date */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        {item.milestoneLabel && (
                          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-rose-100 to-amber-100 text-rose-900 text-xs font-semibold border border-rose-200/60 shadow-xs flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span>{item.milestoneLabel}</span>
                          </span>
                        )}

                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-amber-500" />
                          <span>
                            {new Date(item.date).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Photo if attached */}
                      {item.photoUrl && (
                        <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-4 shadow-sm border border-rose-100 bg-rose-50">
                          <img
                            src={item.photoUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                      )}

                      {/* Title & Description */}
                      <h3 className="font-serif text-xl font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
                        {item.title}
                      </h3>

                      <p className="text-slate-600 font-serif italic text-sm sm:text-base leading-relaxed mt-2">
                        "{item.description}"
                      </p>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
