import { StyleSheet, Text, View } from 'react-native';

import type { DiagnosticQuizSkillViewModel } from '@/model/quizResult';

type SkillCardProps = {
  skill: DiagnosticQuizSkillViewModel;
};

export function SkillCard({ skill }: SkillCardProps) {
  return (
    <View style={styles.container} accessibilityRole="summary">
      <View style={styles.headerRow}>
        <Text style={styles.skillName}>{skill.name}</Text>
        <View
          style={[styles.statusPill, { borderColor: skill.statusColor, backgroundColor: `${skill.statusColor}1A` }]}
          accessibilityRole="text"
        >
          <Text style={[styles.statusText, { color: skill.statusColor }]}>{skill.statusLabel}</Text>
        </View>
      </View>

      <View style={styles.progressRow}>
        <View
          style={styles.progressTrack}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: skill.domainPercentage }}
        >
          <View style={[styles.progressFill, { width: `${skill.domainPercentage}%`, backgroundColor: skill.statusColor }]} />
        </View>
        <Text style={styles.progressValue}>{skill.domainPercentage}%</Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>
          Tentativas: <Text style={styles.metaValue}>{skill.attempts}</Text>
        </Text>
        <Text style={styles.metaText}>
          Acertos: <Text style={styles.metaValue}>{skill.hits}</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff7ed',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#fed7aa',
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
    fontWeight: '600',
    color: '#7c2d12',
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 12,
    borderRadius: 8,
    backgroundColor: '#ffedd5',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 8,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7c2d12',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 13,
    color: '#7c2d12',
  },
  metaValue: {
    fontWeight: '700',
  },
});
