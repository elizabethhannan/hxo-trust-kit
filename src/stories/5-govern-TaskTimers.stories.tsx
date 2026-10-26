import type { Meta, StoryObj } from '@storybook/react';

import { TaskTimers, simulateRun, timeRun } from '../index';

const run1 = timeRun(simulateRun('Drifting', { codeMatcher: 'v2.0' }), Infinity, 'Run 1');
const run2 = timeRun(simulateRun('Drifting', { codeMatcher: 'v2.1' }), Infinity, 'Run 2');
const midRun = timeRun(simulateRun('Drifting', { codeMatcher: 'v2.1' }), 16 * 60, 'Run 2');

const meta = {
  title: "5–7 · Learn and govern/Task timers",
  component: TaskTimers,
  parameters: { docs: { description: { component: "One timer per task (each agent's job) for a test run, compared with a finished earlier run on the same 24 synthetic claims. Here the earlier run used Code matcher v2.0 and this run uses the v2.1 candidate. Times are simulated seconds, so playback speed never changes them." } } },
} satisfies Meta<typeof TaskTimers>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Compared: Story = { name: "Compare=v2.0 then v2.1, State=Finished", args: { current: run2, previous: run1 } };
export const Live: Story = { name: "Compare=v2.0 then v2.1, State=Running", args: { current: midRun, previous: run1, live: true } };
export const First: Story = { name: "Compare=None, State=Finished", args: { current: run1 } };
