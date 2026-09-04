import type { Meta, StoryObj } from '@storybook/react';

import { ExpertReviewCard } from './ExpertReviewCard';

const meta: Meta<typeof ExpertReviewCard> = {
  title: 'domain/ExpertReviewCard',
  component: ExpertReviewCard,
  args: {
    role: 'Nutritionniste',
    initials: 'NU',
    score: 8,
    quote:
      'Un bon équilibre : la cuisson au four limite les graisses ajoutées, et la sauce au yaourt apporte des protéines sans alourdir le plat.',
    scoreTone: 'green',
  },
};
export default meta;

type Story = StoryObj<typeof ExpertReviewCard>;

export const Nutritionist: Story = {};
export const GutHealthExpert: Story = {
  args: {
    role: 'Expert intestinal',
    initials: 'GI',
    score: 7,
    quote: 'Le yaourt grec apporte des probiotiques bienvenus. J’ajouterais une portion de légumes verts pour plus de fibres.',
    scoreTone: 'warm',
  },
};
