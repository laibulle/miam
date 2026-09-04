import { StyleSheet, Text, View } from 'react-native';

import { ScreenContainer } from '@/components/ui/ScreenContainer/ScreenContainer';
import { MiamCompanions } from '@/components/ui/icons/icons';
import { colors, spacing, typography } from '@/components/ui/tokens';
import { GoogleSignIn } from '@/features/auth/GoogleSignIn';

export default function WelcomeScreen() {
  return (
    <ScreenContainer variant="center" gap={spacing.xxl}>
      <View style={styles.illustration}>
        <MiamCompanions size={260} />
      </View>

      <View style={styles.copy}>
        <Text style={styles.eyebrow}>BIENVENUE SUR MIAM</Text>
        <Text style={styles.headline}>Manger devient un petit plaisir simple.</Text>
        <Text style={styles.body}>
          Miam apprend tes goûts, ton rythme et la saison pour te proposer des recettes qui te ressemblent.
        </Text>
      </View>

      <View style={styles.actions}>
        <Text style={styles.body}>Connecte-toi ou crée ton compte pour commencer.</Text>
        <GoogleSignIn />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  illustration: {
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    gap: spacing.md,
  },
  eyebrow: {
    ...typography.label,
    color: colors.coral.strong,
  },
  headline: {
    ...typography.displayXl,
    color: colors.ink,
  },
  body: {
    ...typography.bodyL,
    color: colors.inkMuted,
  },
  actions: {
    gap: spacing.md,
    alignItems: 'stretch',
  },
});
