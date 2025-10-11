import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import CustomButton from '@/components/CustomButton';
import { ApiError, apiConfig, loginUsuario, registrarUsuario } from '@/src/lib/api';
import { saveToken } from '@/src/lib/auth-storage';

type AuthMode = 'login' | 'register';

type FormState = {
  nome: string;
  email: string;
  senha: string;
};

const { width: screenWidth } = Dimensions.get('window');

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
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/progresso-logo-top.webp')}
              style={styles.logo}
            />
          </View>
          <Image
            source={require('@/assets/images/BEM-VINDO.webp')}
            style={styles.welcomeImage}
          />
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
                placeholderTextColor="#9CA3AF"
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
              placeholderTextColor="#9CA3AF"
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
              placeholderTextColor="#9CA3AF"
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

          <CustomButton
            title={
              isRegister
                ? isSubmitting
                  ? 'Cadastrando...'
                  : 'Cadastrar'
                : isSubmitting
                  ? 'Entrando...'
                  : 'Entrar'
            }
            onPress={handleSubmit}
            disabled={isSubmitting}
          />

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
    backgroundColor: '#FDFDFD',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  subtitle: {
    fontSize: 24,
    color: '#4B4B4B',
    /* BOLD */
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16, // estava 32, reduza bastante
    marginTop: 16,
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
    backgroundColor: '#F9B817',
    shadowColor: '#78481B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6, // para Android
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(249, 184, 23, 0.7)',
  },
  modeButtonTextActive: {
    color: '#FDFDFD',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    color: 'rgba(249, 184, 23, 0.8)',
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderRadius: 100, // bem arredondado
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    color: '#0B1E33', // texto escuro
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB', // cinza claro
  },
  submitButton: {
    marginTop: 12,
    backgroundColor: '#F9B817',
    borderRadius: 16, // deixa igual o visual da imagem
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#78481B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6, // para Android
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FDFDFD',
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
    color: '#4B4B4B',
    marginBottom: 4,
  },
  environmentText: {
    color: '#4B4B4B',
    fontSize: 12,
  },
  environmentHint: {
    marginTop: 4,
    color: 'rgba(249, 184, 23, 0.6)',
    fontSize: 11,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  logo: {
    width: screenWidth * 0.6, // 60% da largura da tela
    aspectRatio: 1, // Mantém proporção 1:1
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 8,
  }, 
  welcomeImage: {
    width: screenWidth * 0.6,
    height: screenWidth * 0.4,
    aspectRatio: 2,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginVertical: 8,
  },
  
});
