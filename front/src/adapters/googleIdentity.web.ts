import { z } from 'zod';

const credentialSchema = z.object({ credential: z.string().min(1).max(16384) });
const SCRIPT_URL = 'https://accounts.google.com/gsi/client';

interface GoogleIdentity {
  initialize(options: {
    client_id: string;
    callback: (response: unknown) => void;
    auto_select: boolean;
    ux_mode: 'popup';
  }): void;
  renderButton(host: HTMLElement, options: {
    type: 'standard'; theme: 'outline'; size: 'large'; text: 'continue_with';
    shape: 'pill'; locale: 'fr';
  }): void;
}

type GoogleWindow = Window & { google?: { accounts?: { id?: GoogleIdentity } } };
let scriptPromise: Promise<GoogleIdentity> | undefined;

function loadGoogleIdentity(): Promise<GoogleIdentity> {
  const existing = (window as GoogleWindow).google?.accounts?.id;
  if (existing) return Promise.resolve(existing);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<GoogleIdentity>((resolve, reject) => {
    const script = document.createElement('script');
    const finish = (sdk?: GoogleIdentity) => {
      clearTimeout(timeout);
      script.onload = null;
      script.onerror = null;
      if (sdk) resolve(sdk);
      else {
        script.remove();
        reject(new Error('Impossible de charger la connexion Google. Réessaie dans un instant.'));
      }
    };
    const timeout = setTimeout(() => finish(), 10000);
    script.src = SCRIPT_URL;
    script.async = true;
    script.onload = () => finish((window as GoogleWindow).google?.accounts?.id);
    script.onerror = () => finish();
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    scriptPromise = undefined;
    throw error;
  });
  return scriptPromise;
}

/** Only called after a web View has mounted; never during Expo's static export. */
export async function mountGoogleSignIn(
  host: HTMLElement,
  clientId: string,
  onCredential: (credential: string) => void,
  onError: (message: string) => void,
  signal: AbortSignal,
): Promise<void> {
  const sdk = await loadGoogleIdentity();
  if (signal.aborted) return;
  sdk.initialize({
    client_id: clientId,
    auto_select: false,
    ux_mode: 'popup',
    callback: (response) => {
      if (signal.aborted) return;
      const parsed = credentialSchema.safeParse(response);
      if (!parsed.success) {
        onError('La réponse de Google est invalide. Réessaie.');
        return;
      }
      onCredential(parsed.data.credential);
    },
  });
  sdk.renderButton(host, {
    type: 'standard', theme: 'outline', size: 'large', text: 'continue_with',
    shape: 'pill', locale: 'fr',
  });
  signal.addEventListener('abort', () => host.replaceChildren(), { once: true });
}
