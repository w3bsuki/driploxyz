export const themeConfig = {
  theme: 'dark', // 'dark' | 'light'
  brand: 'blue', // 'blue' | 'indigo' | 'violet' | 'magenta' | 'pink' | 'red' | 'orange' | 'yellow' | 'moss' | 'green' | 'emerald' | 'aqua' | 'cyan'
  accent: 'indigo', // same as brand
  neutral: 'gray', // 'slate' | 'gray' | 'sand'
  solid: 'contrast', // 'color' | 'contrast'
  solidStyle: 'flat', // 'flat' | 'plastic'
  border: 'playful', // 'rounded' | 'playful' | 'conservative'
  surface: 'translucent', // 'filled' | 'translucent'
  transition: 'all', // 'all' | 'micro' | 'macro'
  scaling: '100', // '90' | '95' | '100' | '105' | '110'
} as const;

export type ThemeConfig = typeof themeConfig;
export type ThemeName = ThemeConfig['theme'];
export type BrandName = ThemeConfig['brand'];
export type AccentName = ThemeConfig['accent'];
export type NeutralName = ThemeConfig['neutral'];
