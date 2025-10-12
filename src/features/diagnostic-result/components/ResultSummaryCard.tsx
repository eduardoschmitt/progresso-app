import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { DiagnosticResultSummary } from '@/features/diagnostic-result/types';

type Props = {
  summary: DiagnosticResultSummary;
};

export function ResultSummaryCard({ summary }: Props) {
  const accuracyPercentage = Math.round(summary.accuracy * 100);

  return (
    <View style={styles.container} accessibilityRole="summary">
      <Text style={styles.headerTitle}>{summary.feedbackTitle}</Text>
      <Text style={styles.headerMessage}>{summary.feedbackMessage}</Text>

      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Pontuação</Text>
          <Text style={styles.metricValue}>{summary.score}</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Acertos</Text>
          <Text style={styles.metricValue}>
            {summary.correctAnswers} / {summary.totalQuestions}
          </Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Aproveitamento</Text>
          <Text style={styles.metricValue}>{accuracyPercentage}%</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 24,
    gap: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  headerMessage: {
    fontSize: 16,
    lineHeight: 22,
    color: '#E2E8F0',
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  metricItem: {
    flexGrow: 1,
    minWidth: 90,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(248, 250, 252, 0.08)',
  },
  metricLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#94A3B8',
    marginBottom: 8,
    fontWeight: '600',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
});
