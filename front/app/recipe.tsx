import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button/Button';
import { IconButton } from '@/components/ui/IconButton/IconButton';
import { BackIcon } from '@/components/ui/icons/icons';
import { InlineStatus } from '@/components/ui/InlineStatus/InlineStatus';
import { ScreenContainer } from '@/components/ui/ScreenContainer/ScreenContainer';
import { TimerFloatingBar } from '@/components/ui/TimerFloatingBar/TimerFloatingBar';
import { colors, spacing, typography } from '@/components/ui/tokens';
import { ExpertReviewCard } from '@/components/domain/ExpertReviewCard/ExpertReviewCard';
import { IngredientRow } from '@/components/domain/IngredientRow/IngredientRow';
import { NutritionPanel } from '@/components/domain/NutritionPanel/NutritionPanel';
import { RecipeMetaRow } from '@/components/domain/RecipeMetaRow/RecipeMetaRow';
import { StepRow } from '@/components/domain/StepRow/StepRow';
import { formatCountdown } from '@/domain/time';
import { useCountdown } from '@/features/timer/useCountdown';
import { useRecipeGenerationStore } from '@/features/generation/useRecipeGenerationStore';

export default function RecipeScreen() {
  const router = useRouter();
  const result = useRecipeGenerationStore((state) => state.result);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const countdown = useCountdown();

  if (!result) {
    return (
      <ScreenContainer variant="center">
        <InlineStatus tone="error" message="Aucune recette à afficher pour le moment." />
        <Button variant="secondary" label="Retour à l'accueil" onPress={() => router.replace('/home')} />
      </ScreenContainer>
    );
  }

  const { recipe } = result;

  const handleStartTimer = (stepIndex: number, durationSeconds: number) => {
    setActiveStepIndex(stepIndex);
    countdown.start(durationSeconds);
  };

  const handleDismissTimer = () => {
    countdown.dismiss();
    setActiveStepIndex(null);
  };

  const timerBar =
    countdown.status === 'running' || countdown.status === 'paused' ? (
      <TimerFloatingBar
        title={`Cuisson en cours · Étape ${activeStepIndex ?? ''}`}
        remainingLabel={formatCountdown(countdown.remainingSeconds)}
        isPaused={countdown.status === 'paused'}
        onTogglePause={countdown.togglePause}
        onDismiss={handleDismissTimer}
      />
    ) : null;

  return (
    <ScreenContainer topSlot={timerBar}>
      <View style={styles.header}>
        <IconButton icon={<BackIcon />} accessibilityLabel="Retour" onPress={() => router.back()} />
      </View>

      <Text style={styles.eyebrow}>SUGGESTION DE MIAM</Text>
      <Text style={styles.title}>{recipe.name}</Text>
      <Text style={styles.description}>{recipe.description}</Text>

      <RecipeMetaRow
        preparationMinutes={recipe.preparation_duration_minutes}
        cookingMinutes={recipe.cooking_duration_minutes}
        servings={recipe.servings}
      />

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Ingrédients</Text>
          <Text style={styles.sectionHint}>Pour {recipe.servings} personnes</Text>
        </View>
        {recipe.ingredients.map((ingredient) => (
          <IngredientRow key={ingredient.name} ingredient={ingredient} />
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Étapes</Text>
        {recipe.steps.map((step, index) => (
          <StepRow
            key={step.abstract}
            index={index + 1}
            step={step}
            onStartTimer={
              step.timer && step.duration ? () => handleStartTimer(index + 1, step.duration as number) : undefined
            }
          />
        ))}
      </View>

      {recipe.tips.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Astuces du chef</Text>
          {recipe.tips.map((tip) => (
            <Text key={tip} style={styles.tip}>
              • {tip}
            </Text>
          ))}
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Avis des experts</Text>
        <ExpertReviewCard
          role="Nutritionniste"
          initials="NU"
          score={result.nutritionist_score}
          quote={result.nutritionist_quote}
          scoreTone="green"
        />
        <ExpertReviewCard
          role="Expert intestinal"
          initials="GI"
          score={result.glut_health_expert_score}
          quote={result.glut_health_expert_quote}
          scoreTone="warm"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Valeurs nutritionnelles</Text>
        <NutritionPanel facts={result.food_facts} />
      </View>

      <Text style={styles.disclaimer}>Miam peut se tromper. Vérifie les informations importantes avant de te lancer.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
  },
  eyebrow: {
    ...typography.label,
    color: colors.coral.strong,
  },
  title: {
    ...typography.displayL,
    color: colors.ink,
  },
  description: {
    ...typography.bodyL,
    color: colors.inkMuted,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  sectionTitle: {
    ...typography.displayM,
    color: colors.ink,
  },
  sectionHint: {
    ...typography.bodyM,
    color: colors.inkMuted,
  },
  tip: {
    ...typography.bodyM,
    color: colors.inkMuted,
  },
  disclaimer: {
    ...typography.caption,
    color: colors.inkMuted,
    textAlign: 'center',
  },
});
