import type { Meta, StoryObj } from '@storybook/react';

import { AgentAuditor } from '../index';

const meta = {
  title: "5\u20137 \u00b7 Learn and govern/Agent Auditor",
  component: AgentAuditor,
  parameters: { docs: { description: { component: "Figma: Govern/Agent Auditor" } } },
} satisfies Meta<typeof AgentAuditor>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Healthy: Story = { name: "Status=Healthy", args: {"status": "Healthy"} };
export const Drifting: Story = { name: "Status=Drifting", args: {"status": "Drifting"} };
export const PausedByAuditor: Story = { name: "Status=Paused by auditor", args: {"status": "Paused by auditor"} };
