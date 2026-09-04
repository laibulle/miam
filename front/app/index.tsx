import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button/Button';
import { ScreenContainer } from '@/components/ui/ScreenContainer/ScreenContainer';
import { MiamMascot } from '@/components/ui/icons/icons';
import { colors, radii, spacing, typography } from '@/components/ui/tokens';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ScreenContainer variant="center" gap={spacing.xxl}>
      <View style={styles.illustration}>
        <View style={styles.circleLarge} />
        <View style={styles.circleSmall} />
        <View style={styles.circleAccent} />
        <MiamMascot size={96} />
      </View>

      <View style={styles.copy}>
        <Text style={styles.eyebrow}>BIENVENUE SUR MIAM</Text>
        <Text style={styles.headline}>Manger devient un petit plaisir simple.</Text>
        <Text style={styles.body}>
          Miam apprend tes goûts, ton rythme et la saison pour te proposer des recettes qui te ressemblent.
        </Text>
      </View>

      <View style={styles.dots}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      <View style={styles.actions}>
        <Button variant="primary" fullWidth label="Commencer" onPress={() => router.push('/profile')} />
        <Button variant="ghost" label="J'ai déjà un compte" onPress={() => router.push('/home')} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  illustration: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleLarge: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.sage.tint,
    left: 10,
  },
  circleSmall: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.gold.tint,
    right: 20,
    top: 8,
  },
  circleAccent: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.coral.DEFAULT,
    left: 30,
    bottom: 30,
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
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.coral.DEFAULT,
  },
  actions: {
    gap: spacing.md,
    alignItems: 'stretch',
  },
});
