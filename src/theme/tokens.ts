export const Colors = {
  // Midnight Slate Canvas
  bgPrimary: '#0B1215',
  bgSecondary: '#111C21',
  bgElevated: '#17252B',
  bgGlass: 'rgba(14, 24, 29, 0.88)',
  bgGlassLight: 'rgba(23, 37, 43, 0.78)',

  // Aurora Mint & Tactical Accents (100% original, distinct from purple/blue clones)
  accentPrimary: '#00D2B4',
  accentPrimaryDim: 'rgba(0, 210, 180, 0.16)',
  accentSecondary: '#38BDF8',
  accentAmber: '#FFB020',
  accentAmberDim: 'rgba(255, 176, 32, 0.16)',
  accentCrimson: '#FF4D6A',
  accentCrimsonDim: 'rgba(255, 77, 106, 0.18)',
  accentEmerald: '#22C55E',

  // Typography
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#071013',

  // Borders & Dividers
  borderSubtle: 'rgba(148, 163, 184, 0.14)',
  borderAccent: 'rgba(0, 210, 180, 0.35)',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
} as const;

export const Radii = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
} as const;

/**
 * Custom dark tactical map style for Google Maps on Android/iOS.
 * Gives KinOrbit a signature obsidian-teal cartography look.
 */
export const KINORBIT_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0d171c' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b8794' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0b1215' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#1b2e37' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#0f1c22' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#132229' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#0f2625' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#1a2c35' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#213a46' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0d171c' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#16262e' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#070e12' }],
  },
];
