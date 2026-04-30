import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  previewHead: (head) => `${head}
<script>
  // Block window.location.href navigation inside Storybook preview
  (function() {
    try {
      var origDescriptor = Object.getOwnPropertyDescriptor(Location.prototype, 'href');
      if (origDescriptor && origDescriptor.set) {
        Object.defineProperty(Location.prototype, 'href', {
          get: origDescriptor.get,
          set: function(url) {
            console.log('[Storybook] Blocked navigation to:', url);
          },
          configurable: true,
        });
      }
    } catch(e) {}
  })();
</script>`,
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding"
  ],
  "framework": "@storybook/nextjs-vite",
  "staticDirs": [
    "..\\public"
  ]
};
export default config;