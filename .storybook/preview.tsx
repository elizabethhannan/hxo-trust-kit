import type { Preview } from '@storybook/react';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import '../src/tokens/tokens.css';
import '../src/kit.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    backgrounds: { disable: true },
    controls: { expanded: true },
    a11y: { config: { rules: [] } },
    options: {
      storySort: {
        order: ['1 · Show the reasoning', '2 · Preview before acting', '3 · Humans hold the switch', '4 · Hand back with context', '5–7 · Learn and govern', 'Supporting parts', 'Patterns'],
      },
    },
  },
  decorators: [
    withThemeByDataAttribute({ themes: { light: 'light', dark: 'dark' }, defaultTheme: 'light', attributeName: 'data-theme', parentSelector: 'html' }),
  ],
};
export default preview;
