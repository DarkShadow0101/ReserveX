/**
 * High-quality event imagery matching ReserveX 3B Dark Obsidian Stage aesthetic
 * Verified HTTP 200 concert, festival laser stadium, and stage spotlight photography
 */

export const HERO_IMAGE =
  "https://images.unsplash.com/photo-1550184783-eb56e9a114f1?auto=format&fit=crop&w=1800&q=85";

export const PROMO_BANNER_IMAGE =
  "https://images.unsplash.com/photo-1550184783-eb56e9a114f1?auto=format&fit=crop&w=1600&q=80";

export const STAGE_HORIZON_IMAGE =
  "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1600&q=80";

export const CATEGORY_HORIZON_IMAGE =
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1600&q=80";

export const SHOWCASE_CROWD_IMAGE =
  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=85";

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

function hashString(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

const CATEGORY_IMAGE_POOLS = {
  comedy: [CURATED_STOCK_IMAGES[4], CURATED_STOCK_IMAGES[5]],
  festivals: [
    CURATED_STOCK_IMAGES[0],
    CURATED_STOCK_IMAGES[2],
    SHOWCASE_CROWD_IMAGE,
    CATEGORY_HORIZON_IMAGE
  ],
  edm: [CURATED_STOCK_IMAGES[2], CURATED_STOCK_IMAGES[0], SHOWCASE_CROWD_IMAGE],
  sports: [CATEGORIES[3].image, SHOWCASE_CROWD_IMAGE],
  workshops: [CURATED_STOCK_IMAGES[3], CATEGORIES[4].image],
  arts: [CATEGORIES[5].image, CURATED_STOCK_IMAGES[5]],
  concerts: [
    CURATED_STOCK_IMAGES[1],
    CURATED_STOCK_IMAGES[6],
    HERO_IMAGE,
    STAGE_HORIZON_IMAGE
  ]
};

/**
 * Selects an atmospheric photography fallback deterministically per event ID/title
 * across curated category pools so cards with similar keywords still display varied visuals.
 */
export function getEventImage(event) {
  if (!event) return CURATED_STOCK_IMAGES[0];
  if (event.image) return event.image;

  const title = (event.title || '').toLowerCase();
  const desc = (event.description || '').toLowerCase();
  const cat = (event.categoryLabel || '').toLowerCase();
  const combined = `${cat} ${title} ${desc}`;
  const key = `${event._id || event.id || ''}:${event.title || ''}:${event.venue || ''}`;
  const seed = hashString(key || '0');

  let pool = CURATED_STOCK_IMAGES;
  if (/\b(comedy|standup|stand-up|laughter|improv)\b/.test(combined)) {
    pool = CATEGORY_IMAGE_POOLS.comedy;
  } else if (/\b(sports?|cricket|football|marathon|league|cup|stadium|match|derby)\b/.test(combined)) {
    pool = CATEGORY_IMAGE_POOLS.sports;
  } else if (/\b(workshops?|summit|conference|hackathon|bootcamp|seminar|talks?|tech)\b/.test(combined)) {
    pool = CATEGORY_IMAGE_POOLS.workshops;
  } else if (/\b(art|arts|exhibition|theatre|theater|gallery|museum|play|drama)\b/.test(combined)) {
    pool = CATEGORY_IMAGE_POOLS.arts;
  } else if (/\b(edm|dj|electronic|techno|rave)\b/.test(combined)) {
    pool = CATEGORY_IMAGE_POOLS.edm;
  } else if (/\b(festival|festivals|sunburn|carnival|solstice|nh7|lollapalooza)\b/.test(combined)) {
    pool = CATEGORY_IMAGE_POOLS.festivals;
  } else if (/\b(sing|arijit|diljit|concerts?|tour|live|orchestra|symphony|band)\b/.test(combined)) {
    pool = CATEGORY_IMAGE_POOLS.concerts;
  }

  return pool[seed % pool.length];
}
