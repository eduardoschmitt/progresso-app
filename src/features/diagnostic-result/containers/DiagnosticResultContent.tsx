import React, { useCallback } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import CustomButton from '@/components/CustomButton';
import { ResultSummaryCard } from '@/features/diagnostic-result/components/ResultSummaryCard';
import { SkillCategorySection } from '@/features/diagnostic-result/components/SkillCategorySection';
import { useDiagnosticResultViewModel } from '@/features/diagnostic-result/hooks/useDiagnosticResultViewModel';

export function DiagnosticResultContent() {
  const router = useRouter();
  const { viewModel, clearResult } = useDiagnosticResultViewModel();

  const navigateToDashboard = useCallback(() => {
    clearResult();
    router.replace('/(tabs)');
  }, [clearResult, router]);

  if (!viewModel) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.container, styles.centerContent]}>
          <Text style={styles.emptyTitle}>Resultado não disponível</Text>
          <Text style={styles.emptyMessage}>
            Não encontramos os dados do diagnóstico. Finalize um novo quiz para visualizar seus resultados.
          </Text>
          <CustomButton title="Ir para o dashboard" onPress={navigateToDashboard} style={styles.button} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Diagnóstico concluído</Text>
            <Text style={styles.subtitle}>
              Confira seu desempenho e os pontos de atenção para acelerar sua jornada sustentável.
            </Text>
          </View>

          <ResultSummaryCard summary={viewModel.summary} />

          <View style={styles.sectionList}>
            {viewModel.categories.map((category) => (
              <SkillCategorySection key={category.key} category={category} />
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerMessage}>
              Continue explorando o aplicativo para receber conteúdos e desafios alinhados às suas necessidades.
            </Text>
            <CustomButton
              title="Ir para o dashboard"
              onPress={navigateToDashboard}
              style={styles.button}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 24,
  },
  header: {
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#475569',
  },
  sectionList: {
    gap: 28,
  },
  footer: {
    gap: 16,
    marginTop: 12,
  },
  footerMessage: {
    fontSize: 14,
    lineHeight: 20,
    color: '#475569',
  },
  button: {
    alignSelf: 'stretch',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: '#0F172A',
  },
  emptyMessage: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    color: '#475569',
  },
});
