/**
 * High-quality event imagery matching ReserveX Continuous Dark Experience
 * Uses verified Unsplash direct photography URLs (HTTP 200) with fallback support
 */

export const HERO_IMAGE = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1600&q=80";

export const PROMO_BANNER_IMAGE = "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1600&q=80";

export const FALLBACK_EVENT_IMAGE = "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80";

export const CATEGORIES = [
  {
    id: 'concerts',
    name: 'Concerts',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'festivals',
    name: 'Festivals',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'comedy',
    name: 'Comedy',
    image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'sports',
    name: 'Sports',
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'workshops',
    name: 'Workshops',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'arts',
    name: 'Arts & Culture',
    image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=600&q=80',
  }
];

export const CURATED_STOCK_IMAGES = [
  // 0: EDM / DJ purple stage lights
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=80",
  // 1: Concert stage silhouette / warm amber glow
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80",
  // 2: Festival crowd & bright stage
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
  // 3: Tech Summit / conference stage
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80",
  // 4: Standup comedy club stage & mic
  "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1000&q=80",
  // 5: Indie rock band
  "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=1000&q=80",
  // 6: Acoustic live performance
  "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1000&q=80",
];

export function getEventImage(event) {
  if (!event) return CURATED_STOCK_IMAGES[0];
  if (event.image) return event.image;

  const title = (event.title || '').toLowerCase();
  const desc = (event.description || '').toLowerCase();
  const cat = (event.categoryLabel || '').toLowerCase();
  const combined = `${cat} ${title} ${desc}`;

  // Specific genres first (before generic "live")
  if (combined.includes('comedy') || combined.includes('standup') || combined.includes('laughter')) {
    return CURATED_STOCK_IMAGES[4];
  }
  if (combined.includes('festival') || combined.includes('sunburn') || combined.includes('carnival') || combined.includes('solstice')) {
    return CURATED_STOCK_IMAGES[2];
  }
  if (combined.includes('edm') || combined.includes('dj') || combined.includes('electronic')) {
    return CURATED_STOCK_IMAGES[0];
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
