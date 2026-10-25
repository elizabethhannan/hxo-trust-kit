import type { Meta, StoryObj } from '@storybook/react';

import { AgentDisagreementBanner } from '../index';

const meta = {
  title: "4 \u00b7 Hand back with context/Agent disagreement banner",
  component: AgentDisagreementBanner,
  parameters: { docs: { description: { component: "Figma: Handback/Agent disagreement banner" } } },
} satisfies Meta<typeof AgentDisagreementBanner>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Waiting: Story = { name: "State=Waiting", args: {"state": "Waiting"} };
export const Resolved: Story = { name: "State=Resolved", args: {"state": "Resolved"} };
