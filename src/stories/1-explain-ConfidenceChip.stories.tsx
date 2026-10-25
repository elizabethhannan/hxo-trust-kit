import type { Meta, StoryObj } from '@storybook/react';

import { ConfidenceChip } from '../index';

const meta = {
  title: "1 \u00b7 Show the reasoning/Confidence chip",
  component: ConfidenceChip,
  parameters: { docs: { description: { component: "Figma: Explain/Confidence chip" } } },
} satisfies Meta<typeof ConfidenceChip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const HighDefault: Story = { name: "Level=High, State=Default", args: {"level": "High", "state": "Default"} };
export const HighTrackRecord: Story = { name: "Level=High, State=Track record", args: {"level": "High", "state": "Track record"} };
export const MediumDefault: Story = { name: "Level=Medium, State=Default", args: {"level": "Medium", "state": "Default"} };
export const MediumTrackRecord: Story = { name: "Level=Medium, State=Track record", args: {"level": "Medium", "state": "Track record"} };
export const LowDefault: Story = { name: "Level=Low, State=Default", args: {"level": "Low", "state": "Default"} };
export const LowTrackRecord: Story = { name: "Level=Low, State=Track record", args: {"level": "Low", "state": "Track record"} };
export const AbstainDefault: Story = { name: "Level=Abstain, State=Default", args: {"level": "Abstain", "state": "Default"} };
export const AbstainTrackRecord: Story = { name: "Level=Abstain, State=Track record", args: {"level": "Abstain", "state": "Track record"} };
