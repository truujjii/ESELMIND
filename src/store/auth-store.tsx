import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

/**
 * Auth state. The app is usable signed-out (progress lives offline-first in
 * AsyncStorage); signing in with OAuth links that progress to a cloud account so
 * it survives reinstalls and syncs across devices. See [[progress-store]] for the
 * merge that runs on sign-in.
 *
 * OAuth uses the Expo web-browser flow (works in Expo Go): we get an authorize
 * URL from Supabase, open it in the system browser, then exchange the `code` from
 * the redirect for a session. PKCE is handled by supabase-js (verifier stored in
 * AsyncStorage). Native Apple Sign In would need a dev build; the web flow here
 * does not, but each provider must be enabled in the Supabase dashboard first.
 *
 * Docs: https://supabase.com/docs/guides/auth/native-mobile-deep-linking
 */

// Required so the auth popup can dismiss itself on web.
WebBrowser.maybeCompleteAuthSession();

export type OAuthProvider = 'google' | 'apple';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  /** True until the persisted session has been read on startup. */
  initializing: boolean;
  /** True while an OAuth round-trip is in flight. */
  signingIn: boolean;
  signIn: (provider: OAuthProvider) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// The deep link Supabase redirects back to after the provider approves.
// Must be added to the project's allowed redirect URLs in the dashboard.
const redirectTo = makeRedirectUri();

/** Turn an OAuth redirect URL into a Supabase session (PKCE code or implicit token). */
async function createSessionFromUrl(url: string): Promise<Session | null> {
  const { params, errorCode } = QueryParams.getQueryParams(url);
  if (errorCode) throw new Error(errorCode);

  if (params.code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) throw error;
    return data.session;
  }

  const { access_token, refresh_token } = params;
  if (!access_token) return null;
  const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
  if (error) throw error;
  return data.session;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setInitializing(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Safety net for a redirect that arrives as a deep link (e.g. cold start)
  // rather than through openAuthSessionAsync's return value.
  const url = Linking.useURL();
  useEffect(() => {
    if (url) createSessionFromUrl(url).catch(() => {});
  }, [url]);

  const signIn = useCallback(async (provider: OAuthProvider) => {
    setSigningIn(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error) throw error;
      const result = await WebBrowser.openAuthSessionAsync(data?.url ?? '', redirectTo);
      if (result.type === 'success') await createSessionFromUrl(result.url);
    } finally {
      setSigningIn(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ session, user: session?.user ?? null, initializing, signingIn, signIn, signOut }),
    [session, initializing, signingIn, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an <AuthProvider>');
  }
  return ctx;
}
