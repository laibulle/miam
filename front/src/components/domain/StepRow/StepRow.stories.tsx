import type { Meta, StoryObj } from '@storybook/react';

import { StepRow } from './StepRow';

const meta: Meta<typeof StepRow> = {
  title: 'domain/StepRow',
  component: StepRow,
  args: {
    index: 1,
    step: {
      abstract: 'Préparer les pommes de terre',
      long_description: 'Laver et couper en bâtonnets réguliers d’environ 1 cm, sans les éplucher pour plus de croustillant.',
      duration: null,
      timer: false,
      wait_for_end: true,
    },
  },
};
export default meta;

type Story = StoryObj<typeof StepRow>;

export const Simple: Story = {};

export const WithTimer: Story = {
  args: {
    index: 2,
    step: {
      abstract: 'Faire tremper',
      long_description: 'Plonger les bâtonnets dans un grand bol d’eau froide pour éliminer l’excès d’amidon.',
      duration: 1800,
      timer: true,
      wait_for_end: true,
    },
  },
};
