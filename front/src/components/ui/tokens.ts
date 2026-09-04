import { Fredoka_600SemiBold, Fredoka_700Bold } from '@expo-google-fonts/fredoka';
import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';

/**
 * Design tokens extracted from the Penpot file "Miam — Warm Wellbeing"
 * (colors, fonts and corner radii read directly off the shipped shapes).
 * Penpot remains the source of truth — update this file when the design
 * system there changes.
 */

export const colors = {
  canvas: '#FBF2E6',
  surface: '#FFFFFF',
  surfaceSunken: '#F4E8D8',
  ink: '#3A2B22',
  inkMuted: '#8A7A67',
  onColor: '#FFFDF8',
  hairline: '#EEDFC6',
  border: '#E3CFAD',
  borderFaint: '#BBA98F',
  coral: {
    tint: '#FFE0D2',
    DEFAULT: '#FF6A48',
    strong: '#E1522F',
  },
  sage: {
    tint: '#E1F0E3',
    strong: '#457D5D',
  },
  gold: {
    tint: '#FCEAC0',
    DEFAULT: '#F2AD3A',
    strong: '#D68F1E',
  },
} as const;

export const radii = {
  xs: 3,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  huge: 28,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

export const fontFamilies = {
  display: 'Fredoka_600SemiBold',
  displayBold: 'Fredoka_700Bold',
  body: 'Nunito_400Regular',
  bodySemiBold: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_700Bold',
  mono: 'JetBrainsMono_700Bold',
} as const;

export const typography = {
  displayXl: { fontFamily: fontFamilies.display, fontSize: 34, lineHeight: 40 },
  displayL: { fontFamily: fontFamilies.display, fontSize: 26, lineHeight: 32 },
  displayM: { fontFamily: fontFamilies.display, fontSize: 20, lineHeight: 26 },
  wordmark: { fontFamily: fontFamilies.displayBold, fontSize: 20, lineHeight: 24 },
  numeral: { fontFamily: fontFamilies.display, fontSize: 22, lineHeight: 26 },
  label: { fontFamily: fontFamilies.bodyBold, fontSize: 13, lineHeight: 16, letterSpacing: 0.4 },
  button: { fontFamily: fontFamilies.bodyBold, fontSize: 16, lineHeight: 20 },
  bodyLBold: { fontFamily: fontFamilies.bodyBold, fontSize: 16, lineHeight: 24 },
  bodyMBold: { fontFamily: fontFamilies.bodyBold, fontSize: 14, lineHeight: 20 },
  bodyL: { fontFamily: fontFamilies.body, fontSize: 16, lineHeight: 24 },
  bodyM: { fontFamily: fontFamilies.body, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fontFamilies.bodySemiBold, fontSize: 12, lineHeight: 16 },
  timerLg: { fontFamily: fontFamilies.mono, fontSize: 30, lineHeight: 34 },
  timer: { fontFamily: fontFamilies.mono, fontSize: 22, lineHeight: 26, letterSpacing: 0.5 },
  timerSm: { fontFamily: fontFamilies.mono, fontSize: 13, lineHeight: 16 },
} as const;

export const fontsToLoad = {
  Fredoka_600SemiBold,
  Fredoka_700Bold,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  JetBrainsMono_700Bold,
};
