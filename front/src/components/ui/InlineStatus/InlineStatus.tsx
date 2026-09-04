import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../tokens';
import { Button } from '../Button/Button';
import { AlertIcon } from '../icons/icons';

export interface InlineStatusProps {
  tone: 'loading' | 'error';
  message: string;
  onRetry?: () => void;
}

export function InlineStatus({ tone, message, onRetry }: InlineStatusProps) {
  return (
    <View style={[styles.base, tone === 'error' && styles.errorBase]}>
      {tone === 'loading' ? (
        <ActivityIndicator color={colors.coral.DEFAULT} />
      ) : (
        <View style={styles.errorIconBadge}>
          <AlertIcon size={16} color={colors.onColor} />
        </View>
      )}
      <Text style={styles.message}>{message}</Text>
      {tone === 'error' && onRetry ? <Button variant="secondary" label="Réessayer" onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.xxl,
    backgroundColor: colors.surface,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  errorBase: {
    backgroundColor: colors.coral.tint,
  },
  errorIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.coral.strong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    ...typography.bodyM,
    color: colors.ink,
    textAlign: 'center',
  },
});
