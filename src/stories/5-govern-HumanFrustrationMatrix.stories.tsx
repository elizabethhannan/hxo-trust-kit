import type { Meta, StoryObj } from '@storybook/react';

import { HumanFrustrationMatrix } from '../index';

const meta = {
  title: "5\u20137 \u00b7 Learn and govern/Human Frustration Matrix",
  component: HumanFrustrationMatrix,
  parameters: { docs: { description: { component: "Figma: Learn/Human Frustration Matrix" } } },
} satisfies Meta<typeof HumanFrustrationMatrix>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Matrix: Story = { name: "View=Matrix", args: {"view": "Matrix"} };
export const RankedList: Story = { name: "View=Ranked list", args: {"view": "Ranked list"} };
