import type { Meta, StoryObj } from '@storybook/react';

import { CorrectionWithReason } from '../index';

const meta = {
  title: "2 \u00b7 Preview before acting/Correction with reason",
  component: CorrectionWithReason,
  parameters: { docs: { description: { component: "Figma: Act/Correction with reason" } } },
} satisfies Meta<typeof CorrectionWithReason>;
export default meta;
type Story = StoryObj<typeof meta>;

export const EditValue: Story = { name: "Mode=Edit value", args: {"mode": "Edit value"} };
export const PickAlternative: Story = { name: "Mode=Pick alternative", args: {"mode": "Pick alternative"} };
export const RejectWithReason: Story = { name: "Mode=Reject with reason", args: {"mode": "Reject with reason"} };
