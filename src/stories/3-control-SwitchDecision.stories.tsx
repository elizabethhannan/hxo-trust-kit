import type { Meta, StoryObj } from '@storybook/react';

import { SwitchDecision } from '../index';

const meta = {
  title: "3 \u00b7 Humans hold the switch/Switch decision",
  component: SwitchDecision,
  parameters: { docs: { description: { component: "Figma: Control/Switch decision" } } },
} satisfies Meta<typeof SwitchDecision>;
export default meta;
type Story = StoryObj<typeof meta>;

export const TurnOffChoosing: Story = { name: "Action=Turn off, State=Choosing", args: {"action": "Turn off", "state": "Choosing"} };
export const TurnOffLogged: Story = { name: "Action=Turn off, State=Logged", args: {"action": "Turn off", "state": "Logged"} };
export const TurnOnChoosing: Story = { name: "Action=Turn on, State=Choosing", args: {"action": "Turn on", "state": "Choosing"} };
export const TurnOnLogged: Story = { name: "Action=Turn on, State=Logged", args: {"action": "Turn on", "state": "Logged"} };
