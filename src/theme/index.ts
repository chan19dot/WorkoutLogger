export const colors = {
  // Deep Cyberpunk Backgrounds
  background: '#0B0B15',
  surface: '#151525',
  surfaceLight: '#1F1F35',

  // High Frequency Neon Colors
  primary: '#00F5FF',      // Electric Cyan
  primaryLight: '#B2FEFF',
  secondary: '#FF007F',    // Cyber Hot Pink
  accent: '#ADFF2F',       // Green Yellow (Electric Lime)
  accentBold: '#7CFC00',

  // Text with higher contrast
  text: '#FFFFFF',
  textDark: '#0B0B15',
  textDim: '#8E8E9E',

  // States
  success: '#00FF9F',      // Neon Mint
  error: '#FF3131',        // Radioactive Red
  border: '#2A2A40',
};

export const typography = {
  h1: { fontSize: 34, fontWeight: '900' as const, color: colors.text, letterSpacing: -0.5 },
  h2: { fontSize: 26, fontWeight: '800' as const, color: colors.text, letterSpacing: -0.5 },
  h3: { fontSize: 20, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 16, fontWeight: '500' as const, color: colors.text },
  bodyBold: { fontSize: 16, fontWeight: '700' as const, color: colors.text },
  bodyDim: { fontSize: 16, fontWeight: '500' as const, color: colors.textDim },
  small: { fontSize: 14, fontWeight: '500' as const, color: colors.textDim },
  smallBold: { fontSize: 14, fontWeight: '700' as const, color: colors.text },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  neon: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  pinkGlow: {
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  limeGlow: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  }
};
