import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth, type OAuthProvider } from '@/store/auth-store';

/**
 * Login gate. Shown by the root layout whenever there's no session. Email +
 * password is the primary path (a direct Supabase call — no browser redirect, so
 * it's reliable in Expo Go); Google/Apple sit on top via the OAuth flow in
 * [[auth-store]]. Once a session exists the gate disappears and the app mounts.
 */
export function SignInScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { signIn, signInWithEmail, signUpWithEmail, signingIn } = useAuth();

  const [mode, setMode] = useState<'signIn' | 'signUp'>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isSignUp = mode === 'signUp';
  const disabled = busy || signingIn;

  const submit = async () => {
    setError(null);
    setNotice(null);
    const mail = email.trim();
    if (!mail || !password) {
      setError('Introduce tu email y tu contraseña.');
      return;
    }
    if (isSignUp && password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setBusy(true);
    try {
      if (isSignUp) {
        const { needsConfirmation } = await signUpWithEmail(mail, password);
        if (needsConfirmation) {
          setMode('signIn');
          setNotice('Cuenta creada. Te enviamos un correo para confirmarla; ábrelo y luego inicia sesión.');
        }
        // Otherwise the session arrives via onAuthStateChange and the gate opens.
      } else {
        await signInWithEmail(mail, password);
      }
    } catch (e) {
      setError(messageFor(e));
    } finally {
      setBusy(false);
    }
  };

  const oauth = (provider: OAuthProvider) => {
    setError(null);
    setNotice(null);
    signIn(provider).catch((e) => setError(messageFor(e)));
  };

  const toggleMode = () => {
    setMode(isSignUp ? 'signIn' : 'signUp');
    setError(null);
    setNotice(null);
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + Spacing.five, paddingBottom: insets.bottom + Spacing.five },
          ]}>
          <View style={styles.inner}>
            <View style={styles.header}>
              <ThemedText style={styles.logo}>📈</ThemedText>
              <ThemedText type="subtitle" style={styles.brand}>
                ESELMIND
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.tagline}>
                Aprende a operar con lecciones cortas que demuestras con un test.
              </ThemedText>
            </View>

            <Pressable
              disabled={disabled}
              onPress={() => oauth('google')}
              style={({ pressed }) => [
                styles.btn,
                { backgroundColor: theme.accent },
                (pressed || disabled) && styles.pressed,
              ]}>
              {signingIn ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <ThemedText type="smallBold" style={styles.btnTextLight}>
                  Continuar con Google
                </ThemedText>
              )}
            </Pressable>
            <Pressable
              disabled={disabled}
              onPress={() => oauth('apple')}
              style={({ pressed }) => [
                styles.btnOutline,
                { borderColor: theme.backgroundSelected },
                (pressed || disabled) && styles.pressed,
              ]}>
              <ThemedText type="smallBold">Continuar con Apple</ThemedText>
            </Pressable>

            <View style={styles.divider}>
              <View style={[styles.line, { backgroundColor: theme.backgroundSelected }]} />
              <ThemedText type="small" themeColor="textSecondary">
                o con tu email
              </ThemedText>
              <View style={[styles.line, { backgroundColor: theme.backgroundSelected }]} />
            </View>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              editable={!disabled}
              style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Contraseña"
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              secureTextEntry
              textContentType={isSignUp ? 'newPassword' : 'password'}
              editable={!disabled}
              returnKeyType="go"
              onSubmitEditing={submit}
              style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text }]}
            />

            {error ? (
              <ThemedText type="small" themeColor="danger">
                {error}
              </ThemedText>
            ) : null}
            {notice ? (
              <ThemedText type="small" themeColor="success">
                {notice}
              </ThemedText>
            ) : null}

            <Pressable
              disabled={disabled}
              onPress={submit}
              style={({ pressed }) => [
                styles.btn,
                { backgroundColor: theme.accent },
                (pressed || disabled) && styles.pressed,
              ]}>
              {busy ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <ThemedText type="smallBold" style={styles.btnTextLight}>
                  {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
                </ThemedText>
              )}
            </Pressable>

            <Pressable
              disabled={disabled}
              onPress={toggleMode}
              style={({ pressed }) => (pressed ? styles.pressed : undefined)}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.toggle}>
                {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
              </ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

/** Map Supabase auth errors to short Spanish messages. */
function messageFor(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  const m = msg.toLowerCase();
  if (m.includes('invalid login credentials')) return 'Email o contraseña incorrectos.';
  if (m.includes('email not confirmed')) return 'Confirma tu correo antes de iniciar sesión.';
  if (m.includes('already registered') || m.includes('already exists')) {
    return 'Ese email ya tiene una cuenta. Inicia sesión.';
  }
  if (m.includes('invalid email') || m.includes('unable to validate email')) return 'Ese email no es válido.';
  if (m.includes('password')) return 'La contraseña no es válida (mínimo 6 caracteres).';
  if (m.includes('network') || m.includes('fetch')) return 'Sin conexión. Revisa tu internet.';
  return msg || 'Algo salió mal. Inténtalo de nuevo.';
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  inner: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    gap: Spacing.three,
  },
  header: {
    alignItems: 'center',
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  logo: {
    fontSize: 56,
    lineHeight: 64,
  },
  brand: {
    textAlign: 'center',
    letterSpacing: 1,
  },
  tagline: {
    textAlign: 'center',
  },
  btn: {
    height: 50,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTextLight: {
    color: '#ffffff',
  },
  btnOutline: {
    height: 50,
    borderRadius: Spacing.three,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginVertical: Spacing.one,
  },
  line: {
    flex: 1,
    height: 1,
  },
  input: {
    height: 50,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
  },
  toggle: {
    textAlign: 'center',
    textDecorationLine: 'underline',
    paddingVertical: Spacing.two,
  },
  pressed: {
    opacity: 0.6,
  },
});
