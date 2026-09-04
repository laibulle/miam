import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../../ui/tokens';
import { Avatar } from '../../ui/Avatar/Avatar';
import { Badge, type BadgeTone } from '../../ui/Badge/Badge';

export interface ExpertReviewCardProps {
  role: string;
  initials: string;
  score: number;
  quote: string;
  scoreTone?: BadgeTone;
}

export function ExpertReviewCard({ role, initials, score, quote, scoreTone = 'green' }: ExpertReviewCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Avatar initials={initials} size={36} />
        <View style={styles.headerText}>
          <Text style={styles.role}>{role}</Text>
        </View>
        <Badge tone={scoreTone} value={`${score}/10`} />
      </View>
      <Text style={styles.quote}>{quote}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceSunken,
    borderRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  role: {
    ...typography.bodyMBold,
    color: colors.ink,
  },
  quote: {
    ...typography.bodyM,
    color: colors.inkMuted,
  },
});
