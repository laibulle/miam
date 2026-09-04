import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing } from '../tokens';

const MAX_CONTENT_WIDTH = 480;
const WIDE_BREAKPOINT = 720;

export interface ScreenContainerProps {
  children: ReactNode;
  /** Pinned above the scrollable content but still inside the centered column (e.g. a floating timer bar). */
  topSlot?: ReactNode;
  /** 'scroll' (default) for long-form screens, 'center' for the vertically-centered welcome screen. */
  variant?: 'scroll' | 'center';
  gap?: number;
}

/**
 * Miam's screens were designed as fixed-width mobile frames in Penpot. On a
 * wide (desktop/tablet-web) viewport we keep that same mobile composition
 * intact but just center it in the viewport — same canvas background as the
 * rest of the page, no card/shadow/backdrop framing it, so it reads as
 * centered content rather than a boxed-in mobile widget.
 */
export function ScreenContainer({ children, topSlot, variant = 'scroll', gap = spacing.lg }: ScreenContainerProps) {
  const { width } = useWindowDimensions();
  const isWide = width >= WIDE_BREAKPOINT;

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
      <View style={[styles.backdrop, isWide && styles.backdropWide]}>
        <View style={[styles.column, isWide && styles.columnWide]}>
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
  },
  backdropWide: {
    alignItems: 'center',
  },
  column: {
    flex: 1,
    width: '100%',
  },
  columnWide: {
    flex: undefined,
    width: MAX_CONTENT_WIDTH,
    maxWidth: '100%',
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
