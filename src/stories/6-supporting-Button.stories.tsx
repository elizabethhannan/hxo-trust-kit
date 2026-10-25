import type { Meta, StoryObj } from '@storybook/react';

import { Button } from '../index';

const meta = {
  title: "Supporting parts/Button",
  component: Button,
  parameters: { docs: { description: { component: "Figma: Control/Button" } } },
  args: { children: 'Approve' },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;

export const PrimaryDefault: Story = { name: "Style=Primary, State=Default", args: {"variant": "Primary", "state": "Default"} };
export const PrimaryFocus: Story = { name: "Style=Primary, State=Focus", args: {"variant": "Primary", "state": "Focus"} };
export const PrimaryDisabled: Story = { name: "Style=Primary, State=Disabled", args: {"variant": "Primary", "state": "Disabled"} };
export const SecondaryDefault: Story = { name: "Style=Secondary, State=Default", args: {"variant": "Secondary", "state": "Default"} };
export const SecondaryFocus: Story = { name: "Style=Secondary, State=Focus", args: {"variant": "Secondary", "state": "Focus"} };
export const SecondaryDisabled: Story = { name: "Style=Secondary, State=Disabled", args: {"variant": "Secondary", "state": "Disabled"} };
export const GhostDefault: Story = { name: "Style=Ghost, State=Default", args: {"variant": "Ghost", "state": "Default"} };
export const GhostFocus: Story = { name: "Style=Ghost, State=Focus", args: {"variant": "Ghost", "state": "Focus"} };
export const GhostDisabled: Story = { name: "Style=Ghost, State=Disabled", args: {"variant": "Ghost", "state": "Disabled"} };
export const DestructiveDefault: Story = { name: "Style=Destructive, State=Default", args: {"variant": "Destructive", "state": "Default"} };
export const DestructiveFocus: Story = { name: "Style=Destructive, State=Focus", args: {"variant": "Destructive", "state": "Focus"} };
export const DestructiveDisabled: Story = { name: "Style=Destructive, State=Disabled", args: {"variant": "Destructive", "state": "Disabled"} };
export const AgentDefault: Story = { name: "Style=Agent, State=Default", args: {"variant": "Agent", "state": "Default"} };
export const AgentFocus: Story = { name: "Style=Agent, State=Focus", args: {"variant": "Agent", "state": "Focus"} };
export const AgentDisabled: Story = { name: "Style=Agent, State=Disabled", args: {"variant": "Agent", "state": "Disabled"} };
