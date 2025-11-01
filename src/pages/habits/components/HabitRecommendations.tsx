import type { HabitRecommendation } from '@/model/habits';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type HabitRecommendationsProps = {
  recommendations: HabitRecommendation[];
  onAdopt: (recommendation: HabitRecommendation) => void;
};

export function HabitRecommendations({ recommendations, onAdopt }: HabitRecommendationsProps) {
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sugestões personalizadas</Text>
        <Text style={styles.subtitle}>
          Escolha uma recomendação baseada nas habilidades que mais impulsionam seu desenvolvimento.
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {recommendations.map((recommendation) => (
          <View key={recommendation.modeloId} style={styles.card}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{recommendation.categoria}</Text>
            </View>
            <Text style={styles.cardTitle}>{recommendation.metadados?.titulo ?? recommendation.iconeNome}</Text>
            <Text style={styles.cardSubtitle}>{recommendation.habilidadeNome}</Text>
            {recommendation.metadados?.descricao ? (
              <Text style={styles.cardDescription}>{recommendation.metadados.descricao}</Text>
            ) : null}
            {recommendation.metadados?.acao ? (
              <Text style={styles.cardAction}>Dica: {recommendation.metadados.acao}</Text>
            ) : null}
            <TouchableOpacity
              style={styles.cardButton}
              onPress={() => onAdopt(recommendation)}
            >
              <Text style={styles.cardButtonText}>Adicionar hábito</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  scrollContent: {
    gap: 16,
    paddingVertical: 4,
  },
  card: {
    width: 260,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
  },
  badgeText: {
    color: '#1E293B',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#B45309',
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 13,
    color: '#475569',
  },
  cardAction: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '500',
  },
  cardButton: {
    marginTop: 8,
    backgroundColor: '#F9B817',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cardButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
