import { useEffect } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DiagnosticQuizFlow } from '@/components/diagnostic-quiz/diagnostic-quiz-flow';
import { useDiagnosticQuiz } from '@/src/contexts/diagnostic-quiz-context';

export default function HomeScreen() {
  const { status, initialize, completionMessage } = useDiagnosticQuiz();

  useEffect(() => {
    if (status === 'idle') {
      void initialize();
    }
  }, [initialize, status]);

  if (status === 'idle' || status === 'loading' || status === 'error' || status === 'in_progress') {
    return <DiagnosticQuizFlow />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {completionMessage ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Diagnóstico completo 🎉</Text>
            <Text style={styles.cardMessage}>{completionMessage}</Text>
          </View>
        ) : null}

        <Text style={styles.heading}>Bem-vindo à sua jornada!</Text>
        <Text style={styles.paragraph}>
          Agora que o diagnóstico inicial foi concluído, vamos acompanhar seus próximos passos. Em breve
          você verá recomendações personalizadas aqui conforme os próximos módulos forem liberados.
        </Text>
        <Text style={styles.paragraph}>
          Enquanto isso, explore as demais abas e mantenha suas metas atualizadas para aproveitarmos ao
          máximo o seu progresso.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 24,
    gap: 24,
  },
  card: {
    backgroundColor: '#ecfdf5',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#047857',
  },
  cardMessage: {
    fontSize: 16,
    color: '#065f46',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 22,
    color: '#334155',
  },
});
