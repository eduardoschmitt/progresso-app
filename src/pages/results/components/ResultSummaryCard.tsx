import { StyleSheet, Text, View } from 'react-native';

import type { DiagnosticQuizResultSummary } from '@/model/quizResult';

type ResultSummaryCardProps = {
  summary: DiagnosticQuizResultSummary;
};

export function ResultSummaryCard({ summary }: ResultSummaryCardProps) {
  const accuracyPercentage = Math.round(summary.accuracy * 100);

  return (
    <View style={styles.container} accessibilityRole="summary">
      <Text style={styles.heading}>Seu desempenho</Text>
      <View style={styles.scoreRow}>
        <View>
          <Text style={styles.scoreLabel}>Pontuação final</Text>
          <Text style={styles.scoreValue}>{summary.score}</Text>
        </View>
        <View style={styles.scoreGroup}>
          <Text style={styles.metricLabel}>Questões respondidas</Text>
          <Text style={styles.metricValue}>{summary.totalQuestions}</Text>
        </View>
        <View style={styles.scoreGroup}>
          <Text style={styles.metricLabel}>Acertos</Text>
          <Text style={styles.metricValue}>{summary.totalCorrect}</Text>
        </View>
      </View>

      <View style={styles.accuracyRow}>
        <View style={styles.accuracyBadge}>
          <Text style={styles.accuracyLabel}>Aproveitamento</Text>
          <Text style={styles.accuracyValue}>{accuracyPercentage}%</Text>
        </View>
        <Text style={styles.feedback}>{summary.feedback}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#14532d',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
  },
  scoreLabel: {
    fontSize: 14,
    color: '#047857',
    fontWeight: '600',
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#065f46',
  },
  scoreGroup: {
    flex: 1,
    alignItems: 'flex-end',
  },
  metricLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    color: '#047857',
    letterSpacing: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065f46',
  },
  accuracyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accuracyBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  accuracyLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#d1fae5',
    textTransform: 'uppercase',
  },
  accuracyValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ecfdf5',
  },
  feedback: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#064e3b',
  },
});
