import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../../ui/tokens';
import { TimerTrigger } from '../../ui/TimerTrigger/TimerTrigger';
import type { RecipeStep } from '../../../domain/recipe';

export interface StepRowProps {
  index: number;
  step: RecipeStep;
  onStartTimer?: () => void;
}

export function StepRow({ index, step, onStartTimer }: StepRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.badge}>
        <Text style={styles.badgeLabel}>{index}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.abstract}>{step.abstract}</Text>
        <Text style={styles.description}>{step.long_description}</Text>
        {step.timer && step.duration ? (
          <View style={styles.timerRow}>
            <TimerTrigger label={`Lancer ${step.duration} min`} onPress={onStartTimer ?? (() => {})} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: radii.pill,
    backgroundColor: colors.coral.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeLabel: {
    ...typography.bodyMBold,
    color: colors.onColor,
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  abstract: {
    ...typography.bodyLBold,
    color: colors.ink,
  },
  description: {
    ...typography.bodyM,
    color: colors.inkMuted,
  },
  timerRow: {
    marginTop: spacing.xs,
  },
});
