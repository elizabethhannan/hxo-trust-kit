import type { Meta, StoryObj } from '@storybook/react';

import { ActorBadge } from '../index';

const meta = {
  title: "Supporting parts/Actor badge",
  component: ActorBadge,
  parameters: { docs: { description: { component: "Figma: Agent/Actor badge" } } },
} satisfies Meta<typeof ActorBadge>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Agent: Story = { name: "Actor=Agent", args: {"actor": "Agent"} };
export const Human: Story = { name: "Actor=Human", args: {"actor": "Human"} };
export const Security: Story = { name: "Actor=Security", args: {"actor": "Security"} };
