import type { Meta, StoryObj } from '@storybook/react';

import { UndoBar } from '../index';

const meta = {
  title: "3 \u00b7 Humans hold the switch/Undo bar",
  component: UndoBar,
  parameters: { docs: { description: { component: "Figma: Control/Undo bar" } } },
} satisfies Meta<typeof UndoBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Available: Story = { name: "State=Available", args: {"state": "Available"} };
export const Expired: Story = { name: "State=Expired", args: {"state": "Expired"} };
export const Undone: Story = { name: "State=Undone", args: {"state": "Undone"} };
