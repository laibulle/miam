import type { Meta, StoryObj } from '@storybook/react';

import { ProfileSummaryRow } from './ProfileSummaryRow';

const meta: Meta<typeof ProfileSummaryRow> = {
  title: 'domain/ProfileSummaryRow',
  component: ProfileSummaryRow,
  args: { initials: 'CB', subtitle: 'Omnivore · Réconfort · France', onPress: () => {} },
};
export default meta;

type Story = StoryObj<typeof ProfileSummaryRow>;

export const Default: Story = {};
