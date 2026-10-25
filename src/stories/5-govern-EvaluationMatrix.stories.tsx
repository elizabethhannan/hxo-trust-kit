import type { Meta, StoryObj } from '@storybook/react';

import { EvaluationMatrix } from '../index';

const meta = {
  title: "5\u20137 \u00b7 Learn and govern/Evaluation Matrix",
  component: EvaluationMatrix,
  parameters: { docs: { description: { component: "Figma: Govern/Evaluation Matrix" } } },
} satisfies Meta<typeof EvaluationMatrix>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Evaluating: Story = { name: "State=Evaluating", args: {"state": "Evaluating"} };
export const Decided: Story = { name: "State=Decided", args: {"state": "Decided"} };
