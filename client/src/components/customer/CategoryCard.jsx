import React from 'react';
import { Link } from 'react-router-dom';

export default function CategoryCard({ category }) {
  return (
    <Link
      to={`/events?category=${encodeURIComponent(category.id || category.name.toLowerCase())}`}
      className="group relative h-24 sm:h-28 rounded-2xl sm:rounded-3xl overflow-hidden block shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
    >
      <img
        src={category.image}
        alt={category.name}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-slate-950/45 group-hover:bg-slate-950/35 transition-colors" />

      {/* Label centered */}
      <div className="absolute inset-0 flex items-center justify-center p-3 text-center">
        <h3 className="text-white text-sm sm:text-base font-bold tracking-wide drop-shadow-md">
          {category.name}
        </h3>
      </div>
    </Link>
  );
}
