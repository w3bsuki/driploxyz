import { writable } from 'svelte/store';
import { themeConfig, type ThemeConfig } from '../once-ui-config';

function createThemeStore() {
  const { subscribe, set, update } = writable<ThemeConfig>(themeConfig);

  return {
    subscribe,
    set,
    update,
    setTheme: (theme: ThemeConfig['theme']) => update((n) => ({ ...n, theme })),
    setBrand: (brand: ThemeConfig['brand']) => update((n) => ({ ...n, brand })),
    setAccent: (accent: ThemeConfig['accent']) => update((n) => ({ ...n, accent })),
    setNeutral: (neutral: ThemeConfig['neutral']) => update((n) => ({ ...n, neutral })),
    reset: () => set(themeConfig),
  };
}

export const theme = createThemeStore();
