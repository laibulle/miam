import type { Meta, StoryObj } from '@storybook/react';
import { Text, View } from 'react-native';

import { colors, typography } from '../tokens';
import {
  AlertIcon,
  BackIcon,
  ClockIcon,
  CloseIcon,
  FlameIcon,
  HeartIcon,
  MiamMascot,
  MiamCompanions,
  PauseIcon,
  PlateIcon,
  PlayIcon,
  SettingsIcon,
} from './icons';

const icons = [
  { name: 'MiamMascot', Component: MiamMascot },
  { name: 'BackIcon', Component: BackIcon },
  { name: 'CloseIcon', Component: CloseIcon },
  { name: 'SettingsIcon', Component: SettingsIcon },
  { name: 'HeartIcon', Component: HeartIcon },
  { name: 'PauseIcon', Component: PauseIcon },
  { name: 'PlayIcon', Component: PlayIcon },
  { name: 'ClockIcon', Component: ClockIcon },
  { name: 'FlameIcon', Component: FlameIcon },
  { name: 'PlateIcon', Component: PlateIcon },
  { name: 'AlertIcon', Component: AlertIcon },
];

const meta: Meta = {
  title: 'ui/Icons',
};
export default meta;

type Story = StoryObj;

export const Gallery: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20, backgroundColor: colors.canvas, padding: 16 }}>
      {icons.map(({ name, Component }) => (
        <View key={name} style={{ alignItems: 'center', gap: 8, width: 80 }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Component size={22} />
          </View>
          <Text style={{ ...typography.caption, color: colors.inkMuted, textAlign: 'center' }}>{name}</Text>
        </View>
      ))}
    </View>
  ),
};

export const MascotSizes: Story = {
  render: () => (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 16, backgroundColor: colors.canvas, padding: 16 }}>
      <MiamMascot size={72} />
      <MiamMascot size={44} />
      <MiamMascot size={22} />
    </View>
  ),
};

export const Companions: Story = {
  render: () => (
    <View style={{ alignItems: 'center', backgroundColor: colors.canvas, padding: 24 }}>
      <MiamCompanions />
    </View>
  ),
};
