import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-a11y', '@storybook/addon-themes'],
  framework: { name: '@storybook/react-vite', options: {} },
  staticDirs: ['../public'],
  core: { disableTelemetry: true },
  docs: { autodocs: false },
  async viteFinal(cfg) {
    return { ...cfg, base: './' };
  },
};
export default config;
