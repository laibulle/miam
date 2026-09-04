import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../../ui/tokens';
import { Avatar } from '../../ui/Avatar/Avatar';

export interface ProfileSummaryRowProps {
  initials: string;
  subtitle: string;
  onPress: () => void;
}

export function ProfileSummaryRow({ initials, subtitle, onPress }: ProfileSummaryRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Ton profil"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Avatar initials={initials} />
      <View style={styles.textColumn}>
        <Text style={styles.title}>Ton profil</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.85,
  },
  textColumn: {
    flex: 1,
  },
  title: {
    ...typography.bodyLBold,
    color: colors.ink,
  },
  subtitle: {
    ...typography.bodyM,
    color: colors.inkMuted,
  },
  chevron: {
    ...typography.displayM,
    color: colors.inkMuted,
  },
});
