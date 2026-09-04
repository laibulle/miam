import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '../tokens';

const MAX_CONTENT_WIDTH = 800;

export interface ScreenContainerProps {
  children: ReactNode;
  /** Pinned above the scrollable content but still inside the centered column (e.g. a floating timer bar). */
  topSlot?: ReactNode;
  /** 'scroll' (default) for long-form screens, 'center' for the vertically-centered welcome screen. */
  variant?: 'scroll' | 'center';
  gap?: number;
}

/** Fluid on mobile, with a wider centered reading column on desktop. */
export function ScreenContainer({ children, topSlot, variant = 'scroll', gap = spacing.lg }: ScreenContainerProps) {
  const content =
    variant === 'center' ? (
      <View style={[styles.inner, styles.innerCentered, { gap }]}>{children}</View>
    ) : (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.inner, { gap }]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.backdrop}>
        <View style={styles.column}>
          {topSlot ? <View style={styles.topSlot}>{topSlot}</View> : null}
          {content}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  backdrop: {
    flex: 1,
    alignItems: 'center',
  },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
  },
  topSlot: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.md,
  },
  scrollView: {
    flex: 1,
  },
  inner: {
    padding: spacing.xxl,
  },
  innerCentered: {
    flex: 1,
    justifyContent: 'center',
  },
});
