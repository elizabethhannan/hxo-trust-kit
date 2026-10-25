import type { Meta, StoryObj } from '@storybook/react';

import { UnderstoodCard } from '../index';

const meta = {
  title: "1 \u00b7 Show the reasoning/Understood card",
  component: UnderstoodCard,
  parameters: { docs: { description: { component: "Figma: Explain/Understood card" } } },
} satisfies Meta<typeof UnderstoodCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const TextConfident: Story = { name: "Input=Text, Certainty=Confident", args: {"input": "Text", "certainty": "Confident"} };
export const TextUnsure: Story = { name: "Input=Text, Certainty=Unsure", args: {"input": "Text", "certainty": "Unsure"} };
export const TextAmbiguous: Story = { name: "Input=Text, Certainty=Ambiguous", args: {"input": "Text", "certainty": "Ambiguous"} };
export const VoiceConfident: Story = { name: "Input=Voice, Certainty=Confident", args: {"input": "Voice", "certainty": "Confident"} };
export const VoiceUnsure: Story = { name: "Input=Voice, Certainty=Unsure", args: {"input": "Voice", "certainty": "Unsure"} };
export const VoiceAmbiguous: Story = { name: "Input=Voice, Certainty=Ambiguous", args: {"input": "Voice", "certainty": "Ambiguous"} };
export const PointingConfident: Story = { name: "Input=Pointing, Certainty=Confident", args: {"input": "Pointing", "certainty": "Confident"} };
export const PointingUnsure: Story = { name: "Input=Pointing, Certainty=Unsure", args: {"input": "Pointing", "certainty": "Unsure"} };
export const PointingAmbiguous: Story = { name: "Input=Pointing, Certainty=Ambiguous", args: {"input": "Pointing", "certainty": "Ambiguous"} };
export const VoiceNeedsAPoint: Story = { name: "Input=Voice, Certainty=Needs a point", args: {"input": "Voice", "certainty": "Needs a point"} };
