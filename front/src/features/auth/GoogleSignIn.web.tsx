import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { mountGoogleSignIn } from '../../adapters/googleIdentity.web';
import { getGoogleSignInConfig } from '../../adapters/googleSession';
import { Button } from '../../components/ui/Button/Button';
import { colors, spacing, typography } from '../../components/ui/tokens';
import { useAuthStore } from './useAuthStore';

export function GoogleSignIn() {
  const host = useRef<View>(null);
  const signIn = useAuthStore((state) => state.signIn);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<'loading' | 'ready' | 'verifying' | 'error'>('loading');
  const [message, setMessage] = useState<string | null>(null);
  const config = getGoogleSignInConfig();
  const clientId = config?.clientId;

  useEffect(() => {
    if (!clientId || !host.current) return;
    const controller = new AbortController();
    let submitting = false;
    setStatus('loading');
    setMessage(null);
    const fail = (text: string) => {
      if (controller.signal.aborted) return;
      setMessage(text);
      setStatus('error');
    };
    void mountGoogleSignIn(
      host.current as unknown as HTMLElement,
      clientId,
      async (credential) => {
        if (submitting || controller.signal.aborted) return;
        submitting = true;
        setStatus('verifying');
        setMessage(null);
        try {
          await signIn(credential, controller.signal);
        } catch {
          fail('La connexion a échoué. Vérifie ta connexion et réessaie.');
        } finally {
          submitting = false;
        }
      },
      fail,
      controller.signal,
    ).then(() => {
      if (!controller.signal.aborted) setStatus('ready');
    }).catch(() => fail('Impossible de charger la connexion Google. Réessaie dans un instant.'));
    return () => controller.abort();
  }, [clientId, attempt, signIn]);

  if (!config) {
    return (
      <View style={styles.container}>
        <Button variant="secondary" label="Continuer avec Google" disabled onPress={() => {}} />
        <Text style={styles.caption}>Connexion Google indisponible pour le moment.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View
        ref={host}
        style={[styles.buttonHost, (status === 'verifying' || status === 'error') && styles.hidden]}
      />
      {status === 'loading' || status === 'verifying' ? (
        <Text accessibilityLiveRegion="polite" style={styles.caption}>
          {status === 'loading' ? 'Chargement de Google…' : 'Connexion à Miam…'}
        </Text>
      ) : null}
      {message ? (
        <View style={styles.container}>
          <Text accessibilityRole="alert" style={styles.caption}>{message}</Text>
          <Button variant="secondary" label="Réessayer Google" onPress={() => setAttempt(value => value + 1)} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: spacing.sm },
  buttonHost: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  hidden: { display: 'none' },
  caption: { ...typography.caption, color: colors.inkMuted, textAlign: 'center' },
});
