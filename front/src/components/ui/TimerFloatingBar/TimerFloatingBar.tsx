import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../tokens';
import { CloseIcon, FlameIcon, PauseIcon, PlayIcon } from '../icons/icons';

export interface TimerFloatingBarProps {
  title: string;
  remainingLabel: string;
  isPaused: boolean;
  onTogglePause: () => void;
  onDismiss: () => void;
}

export function TimerFloatingBar({ title, remainingLabel, isPaused, onTogglePause, onDismiss }: TimerFloatingBarProps) {
  return (
    <View style={styles.bar}>
      <FlameIcon size={22} color={colors.onColor} />
      <View style={styles.textColumn}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.timer}>{remainingLabel}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isPaused ? 'Reprendre le minuteur' : 'Mettre en pause le minuteur'}
        onPress={onTogglePause}
        style={styles.control}
      >
        {isPaused ? <PlayIcon size={16} color={colors.onColor} /> : <PauseIcon size={16} color={colors.onColor} />}
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel="Fermer le minuteur" onPress={onDismiss} style={styles.control}>
        <CloseIcon size={14} color={colors.onColor} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.coral.DEFAULT,
    borderRadius: radii.xxxl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    shadowColor: colors.ink,
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  textColumn: {
    flex: 1,
  },
  title: {
    ...typography.caption,
    color: colors.onColor,
    opacity: 0.85,
  },
  timer: {
    ...typography.timer,
    color: colors.onColor,
  },
  control: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});
