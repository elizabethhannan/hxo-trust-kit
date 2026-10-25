import type { Meta, StoryObj } from '@storybook/react';

import { AgentTraceRow } from '../index';

const meta = {
  title: "1 \u00b7 Show the reasoning/Agent trace row",
  component: AgentTraceRow,
  parameters: { docs: { description: { component: "Figma: Explain/Agent trace row" } } },
} satisfies Meta<typeof AgentTraceRow>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = { name: "Expanded=False", args: {"expanded": false} };
export const Expanded: Story = { name: "Expanded=True", args: {"expanded": true} };
