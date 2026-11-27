import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Music, Sparkles, Mic, Trophy, Wrench, Palette, ArrowRight } from 'lucide-react';
import { FALLBACK_EVENT_IMAGE } from '../../mocks/eventImages';

const CATEGORY_ICONS = {
  concerts: Music,
  festivals: Sparkles,
  comedy: Mic,
  sports: Trophy,
  workshops: Wrench,
  arts: Palette
};

export default function CategoryCard({ category, variant = 'dark-tile' }) {
  const [imgSrc, setImgSrc] = useState(category.image);
  const Icon = CATEGORY_ICONS[category.id] || Sparkles;

  return (
    <Link
      data-photo-overlay="true"
      to={`/events?category=${encodeURIComponent(category.id || category.name.toLowerCase())}`}
      className={`group relative h-44 sm:h-48 rounded-2xl overflow-hidden block border backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#FF4D2D] focus:ring-offset-2 focus:ring-offset-[#06080E] ${
        variant === 'dark-tile'
          ? 'border-white/[0.15] hover:border-[#FF4D2D]/70 bg-[#0B0E16]/55 shadow-card'
          : 'border-white/15 shadow-soft hover:border-[#FF4D2D]/60'
      }`}
    >
      <img
        src={imgSrc}
        alt={category.name}
        onError={() => {
          if (imgSrc !== FALLBACK_EVENT_IMAGE) {
            setImgSrc(FALLBACK_EVENT_IMAGE);
          }
        }}
        className="w-full h-full object-cover contrast-[1.06] saturate-[1.08] transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#060709]/95 via-[#060709]/45 to-black/20 group-hover:from-[#060709]/85 transition-colors duration-300" />

      <div className="absolute inset-0 flex flex-col justify-between p-5">
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 rounded-lg bg-[#090A0E]/85 border border-white/15 flex items-center justify-center text-slate-200 group-hover:bg-[#D9381E] group-hover:border-[#D9381E] group-hover:text-white transition-colors">
            <Icon className="w-4 h-4" />
          </div>
          <span className="w-7 h-7 rounded-full bg-black/50 border border-white/15 flex items-center justify-center text-slate-300 group-hover:text-white group-hover:border-white/35 transition-all">
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>

        <div>
          <h3 className="font-sans text-white text-base sm:text-lg font-bold tracking-tight">
            {category.name}
          </h3>
          {category.subtitle && (
            <p className="mt-0.5 text-xs text-slate-300">
              {category.subtitle}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
