/**
 * Layout & motion tokens (not color). Colors live in `constants/theme.ts` / `useTheme().theme`.
 */
export const tokens = {
  space: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },
  hitSlop: { top: 10, bottom: 10, left: 10, right: 10 },
} as const;

export type Tokens = typeof tokens;
