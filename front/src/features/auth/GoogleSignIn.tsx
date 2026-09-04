import { StyleSheet, Text } from 'react-native';

import { colors, typography } from '../../components/ui/tokens';

// Native sign-in needs a Nitro development build and platform OAuth configuration.
// No guest fallback while native authentication is unavailable.
export function GoogleSignIn() {
  return <Text style={styles.message}>La connexion Google n'est pas encore disponible sur cette plateforme.</Text>;
}

const styles = StyleSheet.create({
  message: { ...typography.caption, color: colors.inkMuted, textAlign: 'center' },
});
