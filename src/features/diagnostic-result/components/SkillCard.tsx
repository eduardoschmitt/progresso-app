import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { DiagnosticSkillViewModel } from '@/features/diagnostic-result/types';

const STATUS_COLORS: Record<DiagnosticSkillViewModel['status']['level'], { background: string; text: string; bar: string }> = {
  excelente: {
    background: '#DCFCE7',
    text: '#166534',
    bar: '#22C55E',
  },
  bom: {
    background: '#DBEAFE',
    text: '#1D4ED8',
    bar: '#3B82F6',
  },
  atencao: {
    background: '#FEE2E2',
    text: '#B91C1C',
    bar: '#EF4444',
  },
};

type Props = {
  skill: DiagnosticSkillViewModel;
};

export function SkillCard({ skill }: Props) {
  const statusColors = STATUS_COLORS[skill.status.level];

  return (
    <View style={styles.card} accessibilityRole="summary">
      <View style={styles.headerRow}>
        <Text style={styles.skillName}>{skill.name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColors.background }]}> 
          <Text style={[styles.statusText, { color: statusColors.text }]}>{skill.status.label}</Text>
        </View>
      </View>

      <Text style={styles.skillMeta}>
        {skill.correctAnswers} acerto(s) em {skill.attempts} tentativa(s)
      </Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[styles.progressFill, { width: `${skill.domainPercentage}%`, backgroundColor: statusColors.bar }]}
            accessibilityRole="progressbar"
            accessibilityValue={{
              min: 0,
              max: 100,
              now: skill.domainPercentage,
            }}
          />
        </View>
        <Text style={styles.percentage}>{skill.domainPercentage}%</Text>
      </View>

      <Text style={styles.statusMessage}>{skill.status.message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  skillName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  skillMeta: {
    fontSize: 14,
    color: '#475569',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  percentage: {
    width: 48,
    textAlign: 'right',
    fontWeight: '700',
    color: '#0F172A',
  },
  statusMessage: {
    fontSize: 13,
    lineHeight: 18,
    color: '#334155',
  },
});
