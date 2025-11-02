import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import type { DiagnosticResultSummary } from '@/features/diagnostic-result/types';

type Props = {
  summary: DiagnosticResultSummary;
};

const celebrationIllustration = require('../../../../assets/images/parabens.png');

export function ResultSummaryCard({ summary }: Props) {
  return (
    <View style={styles.container} accessibilityRole="summary">
      <Text style={styles.title}>Diagnóstico concluído!</Text>
      <Text style={styles.headerMessage}>{summary.feedbackMessage}</Text>

      <View style={styles.celebrationContainer}>
        <Image
          source={celebrationIllustration}
          style={styles.celebrationImage}
          contentFit="contain"
          accessibilityRole="image"
          accessibilityLabel="Parabéns"
          accessibilityIgnoresInvertColors
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 24,
    gap: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
  },
  headerMessage: {
    fontSize: 16,
    lineHeight: 22,
    color: '#0F172A',
    textAlign: 'center',
  },
  celebrationContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  celebrationImage: {
    width: 260,
    height: 180,
  },
});
