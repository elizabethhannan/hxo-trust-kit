import type { Meta, StoryObj } from '@storybook/react';

import { PauseOneAgent, RunScorecard } from '../index';

const meta = {
  title: "3 \u00b7 Humans hold the switch/Pause one agent",
  component: PauseOneAgent,
  parameters: { docs: { description: { component: "Figma: Control/Pause one agent. The last story shows the pause inside a test run of the agent team, followed by the Run scorecard that audits it. For a live run you can pause yourself, see Patterns › Agent team test run." } } },
} satisfies Meta<typeof PauseOneAgent>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Running: Story = { name: "State=Running", args: {"state": "Running"} };
export const Paused: Story = { name: "State=Paused", args: {"state": "Paused"} };
export const Resumed: Story = { name: "State=Resumed", args: {"state": "Resumed"} };

/** The same pause inside a test run of the agent team, then the human-in-the-loop audit review of that run. */
export const InATestRun: Story = {
  name: "In a test run: paused, then scored",
  args: { state: "Paused", pausedBy: "K. Patel", at: "09:24" },
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PauseOneAgent {...args} />
      <RunScorecard run="Paused mid-run" view="Card" />
    </div>
  ),
};
