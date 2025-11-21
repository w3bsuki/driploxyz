import type { Preview } from '@storybook/svelte-vite';
// @ts-expect-error - CSS imports are handled by Vite
import '../src/styles/tokens-v4/foundations.css';
// @ts-expect-error - CSS imports are handled by Vite
import '../src/styles/tokens-v4/semantic.css';
// @ts-expect-error - CSS imports are handled by Vite
import '../src/styles/tokens-v4/components.css';
// @ts-expect-error - CSS imports are handled by Vite
import '../src/styles/tokens-v4/dark-theme.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff'
        },
        {
          name: 'dark',
          value: '#0a0a0a'
        },
        {
          name: 'surface',
          value: '#f9fafb'
        }
      ]
    },
    // Accessibility addon configuration
    a11y: {
      config: {
        rules: [
          {
            // Disable color-contrast check (we use OKLCH)
            id: 'color-contrast',
            enabled: false
          }
        ]
      }
    },
    // Viewport addon configuration
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile (375px)',
          styles: {
            width: '375px',
            height: '667px'
          }
        },
        tablet: {
          name: 'Tablet (768px)',
          styles: {
            width: '768px',
            height: '1024px'
          }
        },
        desktop: {
          name: 'Desktop (1280px)',
          styles: {
            width: '1280px',
            height: '800px'
          }
        },
        wide: {
          name: 'Wide (1920px)',
          styles: {
            width: '1920px',
            height: '1080px'
          }
        }
      }
    }
  }
};

export default preview;