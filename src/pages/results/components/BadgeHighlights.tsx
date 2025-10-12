import { Image, StyleSheet, Text, View } from 'react-native';

import type { DiagnosticQuizBadge } from '@/model/quizResult';

type BadgeHighlightsProps = {
  badges: DiagnosticQuizBadge[];
};

export function BadgeHighlights({ badges }: BadgeHighlightsProps) {
  if (!badges.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Nenhuma nova insígnia desta vez</Text>
        <Text style={styles.emptyDescription}>
          Continue participando dos desafios para desbloquear conquistas especiais.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Novas insígnias conquistadas</Text>
      <View style={styles.badgeList}>
        {badges.map((badge) => (
          <View key={badge.id} style={styles.badgeCard}>
            {badge.iconUrl ? (
              <Image source={{ uri: badge.iconUrl }} style={styles.badgeIcon} accessibilityIgnoresInvertColors />
            ) : (
              <View style={styles.badgePlaceholder} />
            )}
            <View style={styles.badgeContent}>
              <Text style={styles.badgeTitle}>{badge.title}</Text>
              {badge.description ? <Text style={styles.badgeDescription}>{badge.description}</Text> : null}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#312e81',
  },
  badgeList: {
    gap: 12,
  },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  badgePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#a5b4fc',
  },
  badgeContent: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e1b4b',
  },
  badgeDescription: {
    marginTop: 4,
    color: '#4338ca',
  },
  emptyContainer: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  emptyDescription: {
    color: '#475569',
  },
});
