import type { Meta, StoryObj } from '@storybook/react';

import { StatusPill } from '../index';

const meta = {
  title: "Supporting parts/Pill",
  component: StatusPill,
  parameters: { docs: { description: { component: "Figma: Status/Pill" } } },
} satisfies Meta<typeof StatusPill>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = { name: "Tone=Neutral", args: {"tone": "Neutral"} };
export const Agent: Story = { name: "Tone=Agent", args: {"tone": "Agent"} };
export const Info: Story = { name: "Tone=Info", args: {"tone": "Info"} };
export const Success: Story = { name: "Tone=Success", args: {"tone": "Success"} };
export const Warning: Story = { name: "Tone=Warning", args: {"tone": "Warning"} };
export const Critical: Story = { name: "Tone=Critical", args: {"tone": "Critical"} };
