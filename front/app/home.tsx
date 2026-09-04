import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { IconButton } from '@/components/ui/IconButton/IconButton';
import { MiamMascot, SettingsIcon } from '@/components/ui/icons/icons';
import { InlineStatus } from '@/components/ui/InlineStatus/InlineStatus';
import { ScreenContainer } from '@/components/ui/ScreenContainer/ScreenContainer';
import { colors, typography } from '@/components/ui/tokens';
import { ComposerCard } from '@/components/domain/ComposerCard/ComposerCard';
import { seasonForMonth, seasonLabels } from '@/domain/generation';
import { useProfileStore } from '@/features/profile/useProfileStore';
import { useRecipeGenerationStore } from '@/features/generation/useRecipeGenerationStore';

const monthNames = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];

export default function HomeScreen() {
  const router = useRouter();
  const profile = useProfileStore();
  const generation = useRecipeGenerationStore();
  const [now] = useState(() => new Date());

  const month = now.getMonth() + 1;
  const seasonLabel = seasonLabels[seasonForMonth(month)];
  const monthLabel = monthNames[now.getMonth()];

  const handleSubmit = async () => {
    await generation.generate(profile);
    if (useRecipeGenerationStore.getState().status === 'success') {
      router.push('/recipe');
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.wordmarkRow}>
          <MiamMascot size={26} />
          <Text style={styles.wordmark}>Miam</Text>
        </View>
        <IconButton
          icon={<SettingsIcon size={24} />}
          variant="plain"
          accessibilityLabel="Réglages"
          onPress={() => router.push('/profile')}
        />
      </View>

      <Text style={styles.season}>
        {seasonLabel.toUpperCase()} · MI-{monthLabel.toUpperCase()}
      </Text>

      <Text style={styles.headline}>Qu'est-ce qui te ferait plaisir aujourd'hui ?</Text>

      <ComposerCard
        value={generation.promptText}
        onChangeText={generation.setPromptText}
        onSubmit={handleSubmit}
        disabled={generation.status === 'loading'}
        helperText={generation.status === 'loading' ? 'Miam réfléchit…' : 'Quelques secondes suffisent ✨'}
      />

      {generation.status === 'loading' ? <InlineStatus tone="loading" message="Miam prépare ta suggestion…" /> : null}
      {generation.status === 'error' ? (
        <InlineStatus
          tone="error"
          message={generation.errorMessage ?? "Miam n'a pas pu générer de recette."}
          onRetry={handleSubmit}
        />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wordmark: {
    ...typography.wordmark,
    color: colors.ink,
  },
  season: {
    ...typography.label,
    color: colors.sage.strong,
  },
  headline: {
    ...typography.displayL,
    color: colors.ink,
  },
});
