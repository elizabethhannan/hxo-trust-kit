import type { Meta, StoryObj } from '@storybook/react';

import { ApprovalCard } from '../index';

const meta = {
  title: "2 \u00b7 Preview before acting/Approval card",
  component: ApprovalCard,
  parameters: { docs: { description: { component: "Figma: Act/Approval card" } } },
} satisfies Meta<typeof ApprovalCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const StandardWaiting: Story = { name: "Kind=Standard, State=Waiting", args: {"kind": "Standard", "state": "Waiting"} };
export const StandardApproved: Story = { name: "Kind=Standard, State=Approved", args: {"kind": "Standard", "state": "Approved"} };
export const StandardDeclined: Story = { name: "Kind=Standard, State=Declined", args: {"kind": "Standard", "state": "Declined"} };
export const DestructiveWaiting: Story = { name: "Kind=Destructive, State=Waiting", args: {"kind": "Destructive", "state": "Waiting"} };
export const DestructiveApproved: Story = { name: "Kind=Destructive, State=Approved", args: {"kind": "Destructive", "state": "Approved"} };
export const DestructiveDeclined: Story = { name: "Kind=Destructive, State=Declined", args: {"kind": "Destructive", "state": "Declined"} };
