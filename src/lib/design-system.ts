/**
 * Design System - Shared constants for consistent UI
 * All pages should use these values for consistency
 */

// Breakpoints (use consistently across all pages)
export const BREAKPOINTS = {
  mobile: 480,    // Extra small devices (phones)
  tablet: 768,    // Tablets and small laptops
  desktop: 1024,  // Desktops
  wide: 1280,     // Wide screens
} as const

// Media query helpers
export const MEDIA = {
  mobile: `@media (max-width: ${BREAKPOINTS.mobile}px)`,
  tablet: `@media (max-width: ${BREAKPOINTS.tablet}px)`,
  desktop: `@media (max-width: ${BREAKPOINTS.desktop}px)`,
  wide: `@media (max-width: ${BREAKPOINTS.wide}px)`,
} as const

// Colors - Light theme (public pages)
export const COLORS_LIGHT = {
  // Primary
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  primaryLight: '#60a5fa',

  // Secondary
  secondary: '#8b5cf6',
  secondaryDark: '#7c3aed',

  // Success
  success: '#22c55e',
  successDark: '#16a34a',

  // Warning
  warning: '#f59e0b',
  warningDark: '#d97706',

  // Error
  error: '#ef4444',
  errorDark: '#dc2626',
  errorLight: '#fef2f2',

  // Neutral
  white: '#ffffff',
  background: '#f8fafc',
  card: '#ffffff',
  border: '#e2e8f0',
  borderDark: '#cbd5e1',

  // Text
  text: '#1e293b',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
} as const

// Colors - Dark theme (admin pages)
export const COLORS_DARK = {
  // Background
  background: '#0f172a',
  backgroundSecondary: '#1e293b',
  card: '#1e293b',

  // Border
  border: '#334155',
  borderLight: '#475569',

  // Text
  text: '#e2e8f0',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',

  // Use same primary colors
  primary: COLORS_LIGHT.primary,
  success: COLORS_LIGHT.success,
  warning: COLORS_LIGHT.warning,
  error: COLORS_LIGHT.error,
} as const

// Typography
export const TYPOGRAPHY = {
  // Font family
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",

  // Font sizes (rem based for accessibility)
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
  },

  // Font sizes for mobile (smaller)
  fontSizeMobile: {
    xs: '0.7rem',     // 11px
    sm: '0.8rem',     // 13px
    base: '0.875rem', // 14px
    lg: '1rem',       // 16px
    xl: '1.125rem',   // 18px
    '2xl': '1.25rem', // 20px
    '3xl': '1.5rem',  // 24px
  },

  // Font weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const

// Spacing scale (consistent padding/margin)
export const SPACING = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
} as const

// Border radius
export const RADIUS = {
  sm: '6px',
  md: '10px',
  lg: '14px',
  xl: '20px',
  full: '9999px',
} as const

// Shadows
export const SHADOWS = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 25px rgba(0, 0, 0, 0.15)',
  xl: '0 20px 50px rgba(0, 0, 0, 0.25)',
} as const

// Button sizes
export const BUTTON_SIZES = {
  sm: {
    padding: '8px 12px',
    fontSize: TYPOGRAPHY.fontSize.sm,
    minHeight: '36px',
  },
  md: {
    padding: '10px 16px',
    fontSize: TYPOGRAPHY.fontSize.base,
    minHeight: '44px',
  },
  lg: {
    padding: '14px 24px',
    fontSize: TYPOGRAPHY.fontSize.lg,
    minHeight: '52px',
  },
} as const

// Common gradients
export const GRADIENTS = {
  primary: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  success: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
  warning: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  purple: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  dark: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)',
} as const

// Z-index scale
export const Z_INDEX = {
  dropdown: 50,
  sticky: 100,
  modal: 1000,
  toast: 1100,
  tooltip: 1200,
} as const

// Animation durations
export const ANIMATION = {
  fast: '150ms',
  normal: '250ms',
  slow: '350ms',
} as const

// Common responsive styles generator
export const getResponsiveStyles = (baseStyles: string, mobileStyles: string, tabletStyles?: string) => `
  ${baseStyles}

  @media (max-width: ${BREAKPOINTS.tablet}px) {
    ${tabletStyles || ''}
  }

  @media (max-width: ${BREAKPOINTS.mobile}px) {
    ${mobileStyles}
  }
`
