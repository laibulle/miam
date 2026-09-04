import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radii, spacing, typography } from '../../ui/tokens';
import { Button } from '../../ui/Button/Button';

export interface ComposerCardProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  submitLabel?: string;
  helperText?: string;
  disabled?: boolean;
}

export function ComposerCard({
  value,
  onChangeText,
  onSubmit,
  submitLabel = 'Trouver ma recette',
  helperText = 'Quelques secondes suffisent ✨',
  disabled,
}: ComposerCardProps) {
  return (
    <View style={styles.card}>
      <TextInput
        accessibilityLabel="Décris l'envie du moment"
        style={styles.input}
        multiline
        placeholder="Un plat healthy avec des frites et une sauce…"
        placeholderTextColor={colors.borderFaint}
        value={value}
        onChangeText={onChangeText}
      />
      <View style={styles.divider} />
      <Button variant="primary" fullWidth label={submitLabel} onPress={onSubmit} disabled={disabled} />
      {helperText ? <Text style={styles.helper}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xxl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  input: {
    ...typography.bodyL,
    color: colors.ink,
    minHeight: 48,
  },
  divider: {
    height: 1,
    backgroundColor: colors.hairline,
  },
  helper: {
    ...typography.caption,
    color: colors.inkMuted,
    textAlign: 'center',
  },
});
