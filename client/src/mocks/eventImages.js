/**
 * High-quality event imagery matching ReserveX Design 1
 * Uses stable, reliable Unsplash direct photography URLs with WebP compression
 */

export const HERO_IMAGE = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1920&q=80";

export const CATEGORIES = [
  {
    id: 'concerts',
    name: 'Concerts',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
    count: '120+ Events'
  },
  {
    id: 'festivals',
    name: 'Festivals',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    count: '45+ Events'
  },
  {
    id: 'comedy',
    name: 'Comedy',
    image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=600&q=80',
    count: '60+ Events'
  },
  {
    id: 'sports',
    name: 'Sports',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=600&q=80',
    count: '30+ Events'
  },
  {
    id: 'workshops',
    name: 'Workshops',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80',
    count: '80+ Events'
  },
  {
    id: 'arts',
    name: 'Arts & Culture',
    image: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=600&q=80',
    count: '55+ Events'
  }
];

export const CURATED_STOCK_IMAGES = [
  // EDM / DJ stage
  "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80",
  // Live Singer on stage
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80",
  // Festival Ferris wheel & crowd
  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=800&q=80",
  // Tech Summit / stage
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80",
  // Standup comedy club
  "https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=800&q=80",
  // Indie rock band
  "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80",
  // Acoustic live performance
  "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=800&q=80",
];

export function getEventImage(event) {
  if (!event) return CURATED_STOCK_IMAGES[0];

  const title = (event.title || '').toLowerCase();
  const desc = (event.description || '').toLowerCase();
  const combined = `${title} ${desc}`;

  if (combined.includes('edm') || combined.includes('dj') || combined.includes('electronic')) {
    return CURATED_STOCK_IMAGES[0]; // EDM
  }
  if (combined.includes('sing') || combined.includes('arijit') || combined.includes('concert') || combined.includes('live')) {
    return CURATED_STOCK_IMAGES[1]; // Singer on stage
  }
  if (combined.includes('festival') || combined.includes('sunburn') || combined.includes('carnival')) {
    return CURATED_STOCK_IMAGES[2]; // Festival
  }
  if (combined.includes('tech') || combined.includes('summit') || combined.includes('conference') || combined.includes('hackathon')) {
    return CURATED_STOCK_IMAGES[3]; // Tech Summit
  }
  if (combined.includes('comedy') || combined.includes('standup') || combined.includes('laughter')) {
    return CURATED_STOCK_IMAGES[4]; // Comedy
  }

  // Consistent deterministic fallback based on event._id or title length
  const key = event._id || event.id || event.title || '0';
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % CURATED_STOCK_IMAGES.length;
  return CURATED_STOCK_IMAGES[index];
}
