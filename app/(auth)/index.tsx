import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { ApiError, apiConfig, loginUsuario, registrarUsuario } from '@/src/lib/api';
import { saveToken } from '@/src/lib/auth-storage';

type AuthMode = 'login' | 'register';

type FormState = {
  nome: string;
  email: string;
  senha: string;
};

export default function AuthScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [form, setForm] = useState<FormState>({ nome: '', email: '', senha: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetMessages = () => {
    setFeedback(null);
    setErrorMessage(null);
  };

  const handleSubmit = async () => {
    resetMessages();
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        await registrarUsuario({
          nome: form.nome.trim(),
          email: form.email.trim(),
          senha: form.senha,
        });

        setFeedback('Cadastro realizado! Faça login para continuar.');
        setMode('login');
        setForm((prev) => ({ ...prev, senha: '' }));
        return;
      }

      const loginResponse = await loginUsuario({
        email: form.email.trim(),
        senha: form.senha,
      });

      await saveToken(loginResponse.token);

      setFeedback(`Bem-vindo, ${loginResponse.nome}!`);

      router.replace('(tabs)');
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
        return;
      }

      console.error(error);
      setErrorMessage('Não foi possível completar a ação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    resetMessages();
    setMode(newMode);
  };

  const isRegister = mode === 'register';

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Progresso</Text>
          <Text style={styles.subtitle}>
            {isRegister
              ? 'Crie sua conta para acompanhar o progresso das suas metas.'
              : 'Entre com seus dados para continuar acompanhando seu progresso.'}
          </Text>

          <View style={styles.modeSwitchContainer}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{ selected: isRegister }}
              onPress={() => switchMode('register')}
              style={[styles.modeButton, isRegister && styles.modeButtonActive]}
            >
              <Text style={[styles.modeButtonText, isRegister && styles.modeButtonTextActive]}>Cadastrar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{ selected: !isRegister }}
              onPress={() => switchMode('login')}
              style={[styles.modeButton, !isRegister && styles.modeButtonActive]}
            >
              <Text style={[styles.modeButtonText, !isRegister && styles.modeButtonTextActive]}>Entrar</Text>
            </TouchableOpacity>
          </View>

          {isRegister && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nome completo</Text>
              <TextInput
                value={form.nome}
                onChangeText={(value) => handleChange('nome', value)}
                placeholder="Seu nome"
                autoCapitalize="words"
                autoComplete="name"
                style={styles.input}
                editable={!isSubmitting}
                returnKeyType="next"
              />
            </View>
          )}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              value={form.email}
              onChangeText={(value) => handleChange('email', value)}
              placeholder="voce@exemplo.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              style={styles.input}
              editable={!isSubmitting}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              value={form.senha}
              onChangeText={(value) => handleChange('senha', value)}
              placeholder="••••••"
              secureTextEntry
              autoComplete="password"
              style={styles.input}
              editable={!isSubmitting}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </View>

          {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
          {feedback && !errorMessage && <Text style={styles.feedbackText}>{feedback}</Text>}

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isRegister
                ? isSubmitting
                  ? 'Cadastrando...'
                  : 'Cadastrar'
                : isSubmitting
                  ? 'Entrando...'
                  : 'Entrar'}
            </Text>
          </TouchableOpacity>

          <View style={styles.environmentBox}>
            <Text style={styles.environmentTitle}>Ambiente</Text>
            <Text style={styles.environmentText}>{apiConfig.baseUrl}</Text>
            {apiConfig.isUsingFallback && (
              <Text style={styles.environmentHint}>
                Usando fallback padrão {Platform.OS === 'android' ? '10.0.2.2' : 'localhost'} em modo
                desenvolvimento.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#0B1E33',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'center',
    marginBottom: 32,
  },
  modeSwitchContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 6,
    marginBottom: 28,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  modeButtonTextActive: {
    color: '#0B1E33',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: '#FFFFFF',
    fontSize: 16,
  },
  submitButton: {
    marginTop: 12,
    backgroundColor: '#38BDF8',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#0B1E33',
    fontWeight: '700',
    fontSize: 16,
  },
  errorText: {
    color: '#F87171',
    marginBottom: 8,
    textAlign: 'center',
  },
  feedbackText: {
    color: '#4ADE80',
    marginBottom: 8,
    textAlign: 'center',
  },
  environmentBox: {
    marginTop: 32,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  environmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 4,
  },
  environmentText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  environmentHint: {
    marginTop: 4,
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
  },
});
