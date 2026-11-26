import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FALLBACK_EVENT_IMAGE } from '../../mocks/eventImages';

export default function CategoryCard({ category }) {
  const [imgSrc, setImgSrc] = useState(category.image);

  return (
    <Link
      to={`/events?category=${encodeURIComponent(category.id || category.name.toLowerCase())}`}
      className="group relative h-28 sm:h-32 rounded-2xl overflow-hidden block border border-slate-200/70 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-brand-purple focus:ring-offset-2"
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
      <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/85 via-brand-navy/45 to-black/25 group-hover:from-brand-navy/75 group-hover:via-brand-navy/35 transition-colors duration-300" />

      {/* Category Label */}
      <div className="absolute inset-0 flex items-end justify-start p-4">
        <div className="space-y-0.5">
          <h3 className="text-white text-sm sm:text-base font-semibold tracking-wide drop-shadow-sm group-hover:text-indigo-200 transition-colors">
            {category.name}
          </h3>
          <span className="block h-0.5 w-0 bg-brand-purple group-hover:w-6 transition-all duration-300 rounded-full" />
        </div>
      </div>
    </Link>
  );
}
