import type { Meta, StoryObj } from '@storybook/react';

import { PreviewThenApply } from '../index';

const meta = {
  title: "2 \u00b7 Preview before acting/Preview-then-apply",
  component: PreviewThenApply,
  parameters: { docs: { description: { component: "Figma: Act/Preview-then-apply" } } },
} satisfies Meta<typeof PreviewThenApply>;
export default meta;
type Story = StoryObj<typeof meta>;

export const CountdownOn: Story = { name: "State=Countdown, Motion=On", args: {"state": "Countdown", "motion": "On"} };
export const CountdownOff: Story = { name: "State=Countdown, Motion=Off", args: {"state": "Countdown", "motion": "Off"} };
export const AppliedOn: Story = { name: "State=Applied, Motion=On", args: {"state": "Applied", "motion": "On"} };
export const AppliedOff: Story = { name: "State=Applied, Motion=Off", args: {"state": "Applied", "motion": "Off"} };
export const CancelledOn: Story = { name: "State=Cancelled, Motion=On", args: {"state": "Cancelled", "motion": "On"} };
export const CancelledOff: Story = { name: "State=Cancelled, Motion=Off", args: {"state": "Cancelled", "motion": "Off"} };
