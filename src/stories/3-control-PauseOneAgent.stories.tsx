import type { Meta, StoryObj } from '@storybook/react';

import { PauseOneAgent } from '../index';

const meta = {
  title: "3 \u00b7 Humans hold the switch/Pause one agent",
  component: PauseOneAgent,
  parameters: { docs: { description: { component: "Figma: Control/Pause one agent" } } },
} satisfies Meta<typeof PauseOneAgent>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Running: Story = { name: "State=Running", args: {"state": "Running"} };
export const Paused: Story = { name: "State=Paused", args: {"state": "Paused"} };
export const Resumed: Story = { name: "State=Resumed", args: {"state": "Resumed"} };
