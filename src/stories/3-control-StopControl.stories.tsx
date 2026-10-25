import type { Meta, StoryObj } from '@storybook/react';

import { StopControl } from '../index';

const meta = {
  title: "3 \u00b7 Humans hold the switch/Stop control",
  component: StopControl,
  parameters: { docs: { description: { component: "Figma: Control/Stop control" } } },
} satisfies Meta<typeof StopControl>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = { name: "State=Idle", args: {"state": "Idle"} };
export const Stopping: Story = { name: "State=Stopping", args: {"state": "Stopping"} };
export const Stopped: Story = { name: "State=Stopped", args: {"state": "Stopped"} };
