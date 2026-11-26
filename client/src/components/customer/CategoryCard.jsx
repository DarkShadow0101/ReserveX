import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Music, Sparkles, Mic, Trophy, Wrench, Palette } from 'lucide-react';
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
      to={`/events?category=${encodeURIComponent(category.id || category.name.toLowerCase())}`}
      className={`group relative h-32 sm:h-36 rounded-2xl overflow-hidden block border transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 focus:ring-offset-brand-navy ${
        variant === 'dark-tile'
          ? 'border-white/15 hover:border-indigo-400/60 bg-[#10162B] shadow-[0_12px_30px_rgba(0,0,0,0.4)]'
          : 'border-slate-200/70 shadow-soft hover:shadow-card'
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
        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#080C18]/95 via-[#0B0F19]/45 to-black/25 group-hover:from-[#080C18]/85 transition-colors duration-300" />
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 100%, rgba(91, 76, 242, 0.28), transparent 70%)'
        }}
      />

      {/* Icon Badge + Category Label */}
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        <div className="w-7 h-7 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-indigo-200 mb-2 group-hover:bg-brand-purple group-hover:border-brand-purple group-hover:text-white transition-colors">
          <Icon className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-white text-sm sm:text-base font-semibold tracking-wide drop-shadow-sm">
          {category.name}
        </h3>
      </div>
    </Link>
  );
}
