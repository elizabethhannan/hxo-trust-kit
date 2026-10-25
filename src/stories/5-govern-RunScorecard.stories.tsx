import type { Meta, StoryObj } from '@storybook/react';

import { RunScorecard } from '../index';

const meta = {
  title: "5\u20137 \u00b7 Learn and govern/Run scorecard",
  component: RunScorecard,
  parameters: { docs: { description: { component: "Human-in-the-loop audit review after a test run. Scores how the agents worked together (internal) and the HXO experience they created for the person waiting on a result (external), ranks the agents, names what was hard, and asks a person to sign off. Scored only from the run's telemetry events. Runs shown are simulated test runs on synthetic claims." } } },
} satisfies Meta<typeof RunScorecard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const CleanCard: Story = { name: "Run=Clean run, View=Card", args: { run: "Clean run", view: "Card" } };
export const PausedCard: Story = { name: "Run=Paused mid-run, View=Card", args: { run: "Paused mid-run", view: "Card" } };
export const DriftingCard: Story = { name: "Run=Drifting, View=Card", args: { run: "Drifting", view: "Card" } };
export const CleanReport: Story = { name: "Run=Clean run, View=Report", args: { run: "Clean run", view: "Report" } };
export const PausedReport: Story = { name: "Run=Paused mid-run, View=Report", args: { run: "Paused mid-run", view: "Report" } };
export const DriftingReport: Story = { name: "Run=Drifting, View=Report", args: { run: "Drifting", view: "Report" } };
export const SignedOff: Story = { name: "Run=Paused mid-run, Review=Signed off", args: { run: "Paused mid-run", view: "Card", review: "Signed off" } };
