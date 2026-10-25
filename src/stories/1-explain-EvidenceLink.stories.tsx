import type { Meta, StoryObj } from '@storybook/react';

import { EvidenceLink } from '../index';

const meta = {
  title: "1 \u00b7 Show the reasoning/Evidence link",
  component: EvidenceLink,
  parameters: { docs: { description: { component: "Figma: Explain/Evidence link" } } },
} satisfies Meta<typeof EvidenceLink>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { name: "State=Default", args: {"state": "Default"} };
export const Highlighted: Story = { name: "State=Highlighted", args: {"state": "Highlighted"} };
export const Unreadable: Story = { name: "State=Unreadable", args: {"state": "Unreadable"} };
