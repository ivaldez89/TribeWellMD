/**
 * Scene Catalog - Central source of truth for all study scene backgrounds
 *
 * CONTENT INTEGRITY RULES:
 * 1. No images containing people/faces/portraits
 * 2. All images must match their category and name
 * 3. All URLs must be valid Unsplash image URLs
 * 4. No duplicate URLs between scenes
 *
 * To add a new scene:
 * 1. Find an appropriate image on Unsplash
 * 2. Copy the photo ID from the URL (e.g., photo-1448375240586-882707db888b)
 * 3. Construct URL: https://images.unsplash.com/{photo-id}?w=1920&q=80
 * 4. Verify the image matches the scene name (no people, correct subject)
 */

export interface StudyBackground {
  id: string;
  name: string;
  emoji: string;
  url: string | null;
  category: SceneCategory;
  isDefault?: boolean;
}

export type SceneCategory =
  | 'medical'
  | 'default'
  | 'custom'
  | 'beach'
  | 'underwater'
  | 'space'
  | 'forest'
  | 'jungle'
  | 'mountains'
  | 'nature'
  | 'desert'
  | 'cozy'
  | 'city'
  | 'world';

/**
 * All study scene backgrounds
 * Organized by category with verified Unsplash image URLs
 */
export const STUDY_BACKGROUNDS: StudyBackground[] = [
  // ==================== MEDICAL/STUDY ====================
  {
    id: 'library',
    name: 'Study Library',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1920&q=80',
    category: 'medical'
  },
  {
    id: 'cozy-study',
    name: 'Cozy Desk',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1920&q=80',
    category: 'medical'
  },
  {
    id: 'coffee-study',
    name: 'Coffee & Books',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920&q=80',
    category: 'medical'
  },

  // ==================== SYSTEM ====================
  {
    id: 'none',
    name: 'None',
    emoji: '',
    url: null,
    category: 'default'
  },
  {
    id: 'custom',
    name: 'Upload',
    emoji: '',
    url: null,
    category: 'custom'
  },

  // ==================== BEACH & OCEAN ====================
  {
    id: 'beach-sunset',
    name: 'Beach Sunset',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80',
    category: 'beach'
  },
  {
    id: 'tropical-beach',
    name: 'Tropical',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1520454974749-611b7248ffdb?w=1920&q=80',
    category: 'beach'
  },
  {
    id: 'ocean-waves',
    name: 'Ocean Waves',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1920&q=80',
    category: 'beach'
  },
  {
    id: 'maldives',
    name: 'Maldives',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1920&q=80',
    category: 'beach'
  },
  {
    id: 'crystal-water',
    name: 'Crystal Water',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=1920&q=80',
    category: 'beach'
  },

  // ==================== UNDERWATER ====================
  {
    id: 'underwater-coral',
    name: 'Coral Reef',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1546026423-cc4642628d2b?w=1920&q=80',
    category: 'underwater'
  },
  {
    id: 'underwater-blue',
    name: 'Deep Blue',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&q=80',
    category: 'underwater'
  },
  {
    id: 'underwater-fish',
    name: 'Ocean Life',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=1920&q=80',
    category: 'underwater'
  },
  {
    id: 'jellyfish',
    name: 'Jellyfish',
    emoji: '',
    // Glowing jellyfish underwater - verified no people
    url: 'https://images.unsplash.com/photo-1545671913-b89ac1b4ac10?w=1920&q=80',
    category: 'underwater'
  },

  // ==================== SPACE & COSMOS ====================
  {
    id: 'galaxy',
    name: 'Galaxy',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1920&q=80',
    category: 'space'
  },
  {
    id: 'aurora',
    name: 'Aurora',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=1920&q=80',
    category: 'space'
  },
  {
    id: 'milky-way',
    name: 'Milky Way',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80',
    category: 'space'
  },
  {
    id: 'nebula',
    name: 'Nebula',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=1920&q=80',
    category: 'space'
  },
  {
    id: 'earth-space',
    name: 'Earth View',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80',
    category: 'space'
  },
  {
    id: 'moon-surface',
    name: 'Moon',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1446941611757-91d2c3bd3d45?w=1920&q=80',
    category: 'space'
  },
  {
    id: 'saturn-rings',
    name: 'Saturn',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=1920&q=80',
    category: 'space'
  },
  {
    id: 'starfield',
    name: 'Starfield',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=1920&q=80',
    category: 'space'
  },

  // ==================== FORESTS ====================
  // Misty Forest is FIRST and DEFAULT for all study pages
  {
    id: 'misty-forest',
    name: 'Misty Forest',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=1920&q=80',
    category: 'forest',
    isDefault: true
  },
  {
    id: 'forest',
    name: 'Forest',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&q=80',
    category: 'forest'
  },
  // REMOVED: Autumn Forest - image contained a person
  {
    id: 'spring-forest',
    name: 'Spring Woods',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1476231682828-37e571bc172f?w=1920&q=80',
    category: 'forest'
  },
  {
    id: 'snow-forest',
    name: 'Snowy Forest',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1517299321609-52687d1bc55a?w=1920&q=80',
    category: 'forest'
  },
  // REMOVED: Bamboo - image did not show bamboo forest
  // REMOVED: Redwood - image did not show towering redwoods

  // ==================== JUNGLE & TROPICAL ====================
  {
    id: 'jungle',
    name: 'Jungle',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=1920&q=80',
    category: 'jungle'
  },
  {
    id: 'rainforest',
    name: 'Rainforest',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1536147116438-62679a5e01f2?w=1920&q=80',
    category: 'jungle'
  },
  {
    id: 'amazon',
    name: 'Amazon',
    emoji: '',
    // Amazon rainforest, dense jungle canopy - verified jungle scene
    url: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1920&q=80',
    category: 'jungle'
  },
  {
    id: 'tropical-plants',
    name: 'Tropical Leaves',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1920&q=80',
    category: 'jungle'
  },

  // ==================== MOUNTAINS ====================
  {
    id: 'mountains',
    name: 'Mountains',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80',
    category: 'mountains'
  },
  {
    id: 'alps',
    name: 'Alpine',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80',
    category: 'mountains'
  },
  {
    id: 'mountain-lake',
    name: 'Mountain Lake',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1920&q=80',
    category: 'mountains'
  },
  {
    id: 'snowy-peaks',
    name: 'Snowy Peaks',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1920&q=80',
    category: 'mountains'
  },
  {
    id: 'mountain-sunset',
    name: 'Mountain Sunset',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80',
    category: 'mountains'
  },

  // ==================== NATURE ====================
  {
    id: 'waterfall',
    name: 'Waterfall',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1920&q=80',
    category: 'nature'
  },
  {
    id: 'japanese-garden',
    name: 'Zen Garden',
    emoji: '',
    // Japanese zen garden with raked sand/gravel and stones - verified
    url: 'https://images.unsplash.com/photo-1503149779833-1de50ebe5f8a?w=1920&q=80',
    category: 'nature'
  },
  {
    id: 'lavender-field',
    name: 'Lavender',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=1920&q=80',
    category: 'nature'
  },
  {
    id: 'sunflower-field',
    name: 'Sunflowers',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1470509037663-253afd7f0f51?w=1920&q=80',
    category: 'nature'
  },
  {
    id: 'cherry-blossom',
    name: 'Cherry Blossom',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1920&q=80',
    category: 'nature'
  },
  {
    id: 'northern-lights',
    name: 'Northern Lights',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&q=80',
    category: 'nature'
  },
  {
    id: 'meadow',
    name: 'Meadow',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1473773508845-188df298d2d1?w=1920&q=80',
    category: 'nature'
  },

  // ==================== DESERT & SAVANNA ====================
  {
    id: 'desert-dunes',
    name: 'Desert Dunes',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1920&q=80',
    category: 'desert'
  },
  {
    id: 'sahara',
    name: 'Sahara',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?w=1920&q=80',
    category: 'desert'
  },
  {
    id: 'savanna',
    name: 'Savanna',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1920&q=80',
    category: 'desert'
  },
  {
    id: 'desert-sunset',
    name: 'Desert Sunset',
    emoji: '',
    // Desert sunset with warm sky and dunes - verified no city
    url: 'https://images.unsplash.com/photo-1509316554395-3cdba4ebae52?w=1920&q=80',
    category: 'desert'
  },

  // ==================== COZY ====================
  {
    id: 'rainy-window',
    name: 'Rainy Day',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=1920&q=80',
    category: 'cozy'
  },
  {
    id: 'fireplace',
    name: 'Fireplace',
    emoji: '',
    // Warm crackling fireplace with logs - verified real fireplace, no people
    url: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=1920&q=80',
    category: 'cozy'
  },
  {
    id: 'snowy-cabin',
    name: 'Snow Cabin',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1548777123-e216912df7d8?w=1920&q=80',
    category: 'cozy'
  },
  {
    id: 'cozy-rain',
    name: 'Cozy Rain',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1428592953211-077101b2021b?w=1920&q=80',
    category: 'cozy'
  },
  {
    id: 'candle-light',
    name: 'Candlelight',
    emoji: '',
    // Multiple lit candles in warm setting - verified no people/faces
    url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=1920&q=80',
    category: 'cozy'
  },

  // ==================== CITY ====================
  {
    id: 'night-city',
    name: 'City Night',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=1920&q=80',
    category: 'city'
  },
  {
    id: 'tokyo',
    name: 'Tokyo',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1920&q=80',
    category: 'city'
  },
  {
    id: 'new-york',
    name: 'New York',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1920&q=80',
    category: 'city'
  },
  {
    id: 'paris',
    name: 'Paris',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&q=80',
    category: 'city'
  },

  // ==================== WORLD LANDMARKS ====================
  {
    id: 'great-wall',
    name: 'Great Wall',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1920&q=80',
    category: 'world'
  },
  {
    id: 'machu-picchu',
    name: 'Machu Picchu',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1920&q=80',
    category: 'world'
  },
  {
    id: 'santorini',
    name: 'Santorini',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1920&q=80',
    category: 'world'
  },
  {
    id: 'iceland',
    name: 'Iceland',
    emoji: '',
    url: 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=1920&q=80',
    category: 'world'
  },
  {
    id: 'norway-fjord',
    name: 'Norway Fjord',
    emoji: '',
    // Norwegian fjord landscape - verified scenic fjord
    url: 'https://images.unsplash.com/photo-1520769945061-0a448c463865?w=1920&q=80',
    category: 'world'
  }
];

/**
 * Category display order and labels
 */
export const CATEGORY_ORDER: SceneCategory[] = [
  'medical', 'beach', 'underwater', 'space', 'forest',
  'jungle', 'mountains', 'nature', 'desert', 'cozy', 'city', 'world'
];

export const CATEGORY_LABELS: Record<SceneCategory, string> = {
  medical: 'Study Scenes',
  default: 'None',
  custom: 'Custom',
  beach: 'Beach & Ocean',
  underwater: 'Underwater',
  space: 'Space & Cosmos',
  forest: 'Forests',
  jungle: 'Jungle & Tropical',
  mountains: 'Mountains',
  nature: 'Nature',
  desert: 'Desert & Savanna',
  cozy: 'Cozy',
  city: 'Cities',
  world: 'World Landmarks'
};

/**
 * Get background URL by ID
 */
export function getBackgroundUrl(backgroundId: string, customUrl?: string | null): string | null {
  if (backgroundId === 'custom' && customUrl) {
    return customUrl;
  }
  const bg = STUDY_BACKGROUNDS.find(b => b.id === backgroundId);
  return bg?.url || null;
}

/**
 * DEV-ONLY: Validate scene catalog integrity
 * Logs warnings for potential issues
 */
export function validateSceneCatalog(): { valid: boolean; issues: string[] } {
  if (process.env.NODE_ENV !== 'development') {
    return { valid: true, issues: [] };
  }

  const issues: string[] = [];
  const seenUrls = new Set<string>();
  const seenIds = new Set<string>();

  // Blocked keywords that shouldn't appear in scene image URLs
  const blockedKeywords = ['portrait', 'person', 'face', 'selfie', 'man', 'woman', 'people'];

  for (const scene of STUDY_BACKGROUNDS) {
    // Check for duplicate IDs
    if (seenIds.has(scene.id)) {
      issues.push(`Duplicate scene ID: ${scene.id}`);
    }
    seenIds.add(scene.id);

    // Check for duplicate URLs (except null)
    if (scene.url) {
      if (seenUrls.has(scene.url)) {
        issues.push(`Duplicate URL for scene "${scene.name}" (${scene.id})`);
      }
      seenUrls.add(scene.url);

      // Check for blocked keywords in URL
      const lowerUrl = scene.url.toLowerCase();
      for (const keyword of blockedKeywords) {
        if (lowerUrl.includes(keyword)) {
          issues.push(`Scene "${scene.name}" URL may contain people (keyword: ${keyword})`);
        }
      }
    }

    // Check for empty name
    if (!scene.name || scene.name.trim() === '') {
      issues.push(`Scene ${scene.id} has empty name`);
    }

    // Check category is valid
    if (!CATEGORY_ORDER.includes(scene.category) && scene.category !== 'default' && scene.category !== 'custom') {
      issues.push(`Scene "${scene.name}" has invalid category: ${scene.category}`);
    }
  }

  if (issues.length > 0) {
    console.warn('Scene Catalog Validation Issues:');
    issues.forEach(issue => console.warn(`  - ${issue}`));
  }

  return { valid: issues.length === 0, issues };
}
