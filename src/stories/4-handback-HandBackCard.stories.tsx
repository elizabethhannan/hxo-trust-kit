import type { Meta, StoryObj } from '@storybook/react';

import { HandBackCard } from '../index';

const meta = {
  title: "4 \u00b7 Hand back with context/Hand-back card",
  component: HandBackCard,
  parameters: { docs: { description: { component: "Figma: Handback/Hand-back card" } } },
} satisfies Meta<typeof HandBackCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const RoutineWaiting: Story = { name: "Urgency=Routine, State=Waiting", args: {"urgency": "Routine", "state": "Waiting"} };
export const RoutineResolved: Story = { name: "Urgency=Routine, State=Resolved", args: {"urgency": "Routine", "state": "Resolved"} };
export const UrgentWaiting: Story = { name: "Urgency=Urgent, State=Waiting", args: {"urgency": "Urgent", "state": "Waiting"} };
export const UrgentResolved: Story = { name: "Urgency=Urgent, State=Resolved", args: {"urgency": "Urgent", "state": "Resolved"} };
