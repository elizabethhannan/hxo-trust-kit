import type { Meta, StoryObj } from '@storybook/react';
import { ClaimsCoderReview, TeamChatHandBack } from '../patterns';

const meta = {
  title: 'Patterns',
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Figma: Patterns page (frames 16:62 and 22:231). Screens composed from kit components.' } } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const ClaimsCoderReviewStory: Story = { name: 'Claims Coder review', render: () => <div style={{ padding: 32, background: 'var(--bg)' }}><ClaimsCoderReview /></div> };
export const TeamChatHandBackStory: Story = { name: 'Team-chat hand-back', render: () => <div style={{ padding: 32, background: 'var(--bg)' }}><TeamChatHandBack /></div> };
