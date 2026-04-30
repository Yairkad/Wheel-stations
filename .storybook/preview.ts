import type { Preview } from '@storybook/nextjs-vite'
import '../src/app/globals.css'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: { test: 'todo' },
    viewport: {
      defaultViewport: 'mobile390',
      viewports: {
        mobile390: {
          name: 'Mobile 390px',
          styles: { width: '390px', height: '844px' },
          type: 'mobile',
        },
        mobile360: {
          name: 'Galaxy S25 360px',
          styles: { width: '360px', height: '800px' },
          type: 'mobile',
        },
        tablet: {
          name: 'Tablet 768px',
          styles: { width: '768px', height: '1024px' },
          type: 'tablet',
        },
        desktop: {
          name: 'Desktop 1440px',
          styles: { width: '1440px', height: '900px' },
          type: 'desktop',
        },
      },
    },
  },
};

export default preview;