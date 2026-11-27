/**
 * High-quality event imagery matching ReserveX 3B Dark Obsidian Stage aesthetic
 * Verified HTTP 200 concert, festival laser stadium, and stage spotlight photography
 */

export const HERO_IMAGE =
  "https://images.unsplash.com/photo-1550184783-eb56e9a114f1?auto=format&fit=crop&w=1800&q=85";

export const PROMO_BANNER_IMAGE =
  "https://images.unsplash.com/photo-1550184783-eb56e9a114f1?auto=format&fit=crop&w=1600&q=80";

export const FALLBACK_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80";

export const CATEGORIES = [
  {
    id: 'concerts',
    name: 'Concerts',
    subtitle: 'Arena tours & live sets',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'festivals',
    name: 'Festivals',
    subtitle: 'Multi-stage music & EDM',
    image: 'https://images.unsplash.com/photo-1760966362386-e1012dbc3657?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'comedy',
    name: 'Comedy',
    subtitle: 'Stand-up & club nights',
    image: 'https://images.unsplash.com/photo-1551043692-fc37bc4676b1?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'sports',
    name: 'Sports',
    subtitle: 'Stadium fixtures & leagues',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'workshops',
    name: 'Workshops',
    subtitle: 'Talks, studios & sessions',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 'arts',
    name: 'Arts & Culture',
    subtitle: 'Exhibitions & stage theatre',
    image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=900&q=85',
  }
];

export const CURATED_STOCK_IMAGES = [
  // 0: Vivid festival DJ laser rig & stage smoke
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=85",
  // 1: Arena concert fanning white-gold spotlight beams & crowd silhouettes
  "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=85",
  // 2: Neon magenta-coral laser concert stage
  "https://images.unsplash.com/photo-1760966362386-e1012dbc3657?auto=format&fit=crop&w=1200&q=85",
  // 3: Tech Summit / conference stage
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=85",
  // 4: Standup comedy retro stage spotlight microphone
  "https://images.unsplash.com/photo-1507676385008-e7fb562d11f8?auto=format&fit=crop&w=1200&q=85",
  // 5: Warm tungsten spotlight dark mic alternative
  "https://images.unsplash.com/photo-1551043692-fc37bc4676b1?auto=format&fit=crop&w=1200&q=85",
  // 6: Acoustic live performance
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=85",
];

export function getEventImage(event) {
  if (!event) return CURATED_STOCK_IMAGES[0];
  if (event.image) return event.image;

  const title = (event.title || '').toLowerCase();
  const desc = (event.description || '').toLowerCase();
  const cat = (event.categoryLabel || '').toLowerCase();
  const combined = `${cat} ${title} ${desc}`;

  if (combined.includes('comedy') || combined.includes('standup') || combined.includes('laughter')) {
    return CURATED_STOCK_IMAGES[4];
  }
  if (combined.includes('festival') || combined.includes('sunburn') || combined.includes('carnival') || combined.includes('solstice')) {
    return CURATED_STOCK_IMAGES[0];
  }
  if (combined.includes('edm') || combined.includes('dj') || combined.includes('electronic')) {
    return CURATED_STOCK_IMAGES[2];
  }
  if (combined.includes('tech') || combined.includes('summit') || combined.includes('conference') || combined.includes('hackathon')) {
    return CURATED_STOCK_IMAGES[3];
  }
  if (combined.includes('sing') || combined.includes('arijit') || combined.includes('diljit') || combined.includes('concert') || combined.includes('tour') || combined.includes('live')) {
    return CURATED_STOCK_IMAGES[1];
  }

  const key = event._id || event.id || event.title || '0';
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % CURATED_STOCK_IMAGES.length;
  return CURATED_STOCK_IMAGES[index];
}
