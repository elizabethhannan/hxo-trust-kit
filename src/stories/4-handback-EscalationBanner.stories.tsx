import type { Meta, StoryObj } from '@storybook/react';

import { EscalationBanner } from '../index';

const meta = {
  title: "4 \u00b7 Hand back with context/Escalation banner",
  component: EscalationBanner,
  parameters: { docs: { description: { component: "Figma: Handback/Escalation banner" } } },
} satisfies Meta<typeof EscalationBanner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Info: Story = { name: "Level=Info", args: {"level": "Info"} };
export const Warning: Story = { name: "Level=Warning", args: {"level": "Warning"} };
export const Critical: Story = { name: "Level=Critical", args: {"level": "Critical"} };
