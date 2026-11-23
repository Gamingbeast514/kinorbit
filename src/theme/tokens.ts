export interface ThemeColors {
  mode: 'dark' | 'light';
  bgPrimary: string;
  bgSecondary: string;
  bgElevated: string;
  bgGlass: string;
  accentPrimary: string;
  accentPrimaryDim: string;
  accentMint: string;
  accentMintDim: string;
  accentViolet: string;
  accentVioletDim: string;
  accentAmber: string;
  accentAmberDim: string;
  accentCrimson: string;
  accentCrimsonDim: string;
  accentSecondary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  borderSubtle: string;
  borderAccent: string;
}

export const DARK_THEME: ThemeColors = {
  mode: 'dark',
  bgPrimary: '#0E1638',
  bgSecondary: '#15204D',
  bgElevated: '#1C2A63',
  bgGlass: 'rgba(18, 28, 68, 0.94)',

  // Reference Dark Theme: Navy + Tangerine Orange + Mint + Violet
  accentPrimary: '#FF9F2E',
  accentPrimaryDim: 'rgba(255, 159, 46, 0.18)',
  accentMint: '#27D38B',
  accentMintDim: 'rgba(39, 211, 139, 0.18)',
  accentViolet: '#8B75FF',
  accentVioletDim: 'rgba(139, 117, 255, 0.2)',
  accentAmber: '#FF9F2E',
  accentAmberDim: 'rgba(255, 159, 46, 0.18)',
  accentCrimson: '#FF5A5F',
  accentCrimsonDim: 'rgba(255, 90, 95, 0.2)',
  accentSecondary: '#38BDF8',

  textPrimary: '#FFFFFF',
  textSecondary: '#A8B5E0',
  textMuted: '#6D7CB0',
  textInverse: '#FFFFFF',

  borderSubtle: 'rgba(168, 181, 224, 0.16)',
  borderAccent: 'rgba(255, 159, 46, 0.45)',
};

export const LIGHT_THEME: ThemeColors = {
  mode: 'light',
  bgPrimary: '#F5F7FB',
  bgSecondary: '#FFFFFF',
  bgElevated: '#EBF0FA',
  bgGlass: 'rgba(255, 255, 255, 0.95)',

  // Reference Light Theme: White + Emerald Mint + Violet + Coral Red
  accentPrimary: '#27D38B',
  accentPrimaryDim: 'rgba(39, 211, 139, 0.16)',
  accentMint: '#27D38B',
  accentMintDim: 'rgba(39, 211, 139, 0.16)',
  accentViolet: '#8B75FF',
  accentVioletDim: 'rgba(139, 117, 255, 0.18)',
  accentAmber: '#FF9F2E',
  accentAmberDim: 'rgba(255, 159, 46, 0.16)',
  accentCrimson: '#FF5A5F',
  accentCrimsonDim: 'rgba(255, 90, 95, 0.16)',
  accentSecondary: '#8B75FF',

  textPrimary: '#0E1638',
  textSecondary: '#4B5A82',
  textMuted: '#8B98BC',
  textInverse: '#FFFFFF',

  borderSubtle: 'rgba(14, 22, 56, 0.1)',
  borderAccent: 'rgba(39, 211, 139, 0.45)',
};

export const Colors = DARK_THEME;

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

export const KINORBIT_DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#101942' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#7b8cc4' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0e1638' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#1f2e6b' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#121d4a' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#13284f' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1b2963' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#24367d' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a102b' }] },
];

export const KINORBIT_LIGHT_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#f3f6fb' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#58678f' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#c7f0d8' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#fff3c4' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#d7ebff' }] },
];

export const KINORBIT_MAP_STYLE = KINORBIT_DARK_MAP_STYLE;
