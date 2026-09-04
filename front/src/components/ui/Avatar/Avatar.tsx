import { StyleSheet, Text, View } from 'react-native';

import { colors, typography } from '../tokens';

export interface AvatarProps {
  initials: string;
  size?: number;
}

export function Avatar({ initials, size = 44 }: AvatarProps) {
  return (
    <View style={[styles.base, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={styles.label}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.coral.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.bodyMBold,
    color: colors.coral.strong,
  },
});
