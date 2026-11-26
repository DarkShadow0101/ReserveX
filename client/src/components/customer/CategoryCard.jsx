import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { FALLBACK_EVENT_IMAGE } from '../../mocks/eventImages';

export default function CategoryCard({ category, featured = false }) {
  const [imgSrc, setImgSrc] = useState(category.image);

  return (
    <Link
      to={`/events?category=${encodeURIComponent(category.id || category.name.toLowerCase())}`}
      className={`group relative rounded-2xl overflow-hidden block border border-slate-200/70 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2 ${
        featured ? 'h-44 sm:h-52' : 'h-32 sm:h-36'
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
      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/90 via-brand-navy/40 to-black/20 group-hover:from-brand-navy/80 transition-colors duration-300" />

      {/* Category Label & Arrow */}
      <div className="absolute inset-0 flex items-end justify-between p-4 sm:p-5">
        <div className="space-y-1">
          <h3
            className={`text-white font-semibold tracking-wide drop-shadow-sm group-hover:text-indigo-200 transition-colors ${
              featured ? 'text-lg sm:text-xl font-serif' : 'text-sm sm:text-base'
            }`}
          >
            {category.name}
          </h3>
          <span className="block h-0.5 w-0 bg-brand-purple group-hover:w-8 transition-all duration-300 rounded-full" />
        </div>

        <span className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white opacity-80 group-hover:opacity-100 group-hover:bg-brand-purple group-hover:border-brand-purple transition-all">
          <ArrowUpRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}
