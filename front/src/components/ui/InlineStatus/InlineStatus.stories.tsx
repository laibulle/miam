import type { Meta, StoryObj } from '@storybook/react';

import { InlineStatus } from './InlineStatus';

const meta: Meta<typeof InlineStatus> = {
  title: 'ui/InlineStatus',
  component: InlineStatus,
};
export default meta;

type Story = StoryObj<typeof InlineStatus>;

export const Loading: Story = { args: { tone: 'loading', message: 'Quelques secondes suffisent ✨' } };
export const Error: Story = {
  args: {
    tone: 'error',
    message: "Miam n'a pas réussi à générer de recette. Réessaie dans un instant.",
    onRetry: () => {},
  },
};
