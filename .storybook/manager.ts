import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming/create';

addons.setConfig({
  theme: create({ base: 'light', brandTitle: 'HXO Trust and Control Kit', brandImage: 'hxo-kit-logo.svg', brandUrl: 'https://www.figma.com/design/Cb0QDEILY9cggEp101ZTg0/HXO-Trust-and-Control-Kit' }),
});
