import { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDiagnosticQuizResult } from '@/hooks/use-diagnostic-quiz-result';
import type { DiagnosticQuizResultPayload } from '@/model/quizResult';

import { BadgeHighlights } from './components/BadgeHighlights';
import { ResultActions } from './components/ResultActions';
import { ResultSummaryCard } from './components/ResultSummaryCard';
import { SkillCategorySection } from './components/SkillCategorySection';

type ResultParams = {
  result?: string | string[];
};

const isValidResultPayload = (payload: unknown): payload is DiagnosticQuizResultPayload => {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const candidate = payload as Record<string, unknown>;

  return (
    typeof candidate.pontuacao === 'number' &&
    typeof candidate.totalQuestoes === 'number' &&
    typeof candidate.totalCorretas === 'number' &&
    Array.isArray(candidate.habilidades) &&
    Array.isArray(candidate.novasInsignias)
  );
};

const extractResultParam = (value: string | string[] | undefined): string | null => {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
};

export default function DiagnosticQuizResultPage() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const params = useLocalSearchParams<ResultParams>();

  const [payload, setPayload] = useState<DiagnosticQuizResultPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  const serializedResult = useMemo(() => extractResultParam(params.result), [params.result]);

  useEffect(() => {
    if (!serializedResult) {
      setPayload(null);
      setError('Nenhum resultado disponível no momento.');
      return;
    }

    try {
      const parsed = JSON.parse(serializedResult);

      if (isValidResultPayload(parsed)) {
        setPayload(parsed);
        setError(null);
      } else {
        setPayload(null);
        setError('Não foi possível interpretar os dados do resultado.');
      }
    } catch (parseError) {
      console.error('Failed to parse diagnostic quiz result payload', parseError);
      setPayload(null);
      setError('Não foi possível interpretar os dados recebidos.');
    }
  }, [serializedResult]);

  const { result } = useDiagnosticQuizResult(payload);

  const handleReviewPress = () => {
    router.back();
  };

  const handleRestartPress = () => {
    router.replace('/(tabs)/index');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>Resultado do diagnóstico</Text>
        {error && !result ? <Text style={styles.errorText}>{error}</Text> : null}
        {result ? (
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.mainContent}>
              <ResultSummaryCard summary={result.summary} />

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Habilidades avaliadas</Text>
                <View style={styles.sectionContent}>
                  {result.categories.map((category) => (
                    <SkillCategorySection key={category.category} category={category} />
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Conquistas</Text>
                <BadgeHighlights badges={result.badges} />
              </View>
            </View>
          </ScrollView>
        ) : null}
      </View>
      <ResultActions onReviewPress={handleReviewPress} onRestartPress={handleRestartPress} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 16,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 16,
    marginBottom: 16,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  mainContent: {
    gap: 24,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionContent: {
    gap: 20,
  },
});
