import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { colors } from '../tokens';

export interface IconButtonProps {
  icon: ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  size?: number;
  variant?: 'soft' | 'plain';
  /** Badge background color — defaults to plain white, but a signature tint (e.g. `colors.gold.tint`) reads friendlier. */
  tint?: string;
}

export function IconButton({ icon, onPress, accessibilityLabel, size = 44, tint = colors.surface, variant = 'soft' }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'soft' && styles.soft,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: variant === 'plain' ? 'transparent' : tint },
        pressed && styles.pressed,
      ]}
    >
      {icon}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  soft: {
    shadowColor: colors.ink,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
