import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { TreinoConclusaoPayload } from '@/model/treino';

type TreinoConclusionCardProps = {
  conclusao: TreinoConclusaoPayload;
  erroConclusao?: string | null;
};

export function TreinoConclusionCard({ conclusao, erroConclusao }: TreinoConclusionCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sessão concluída</Text>
      <Text style={styles.text}>Total planejado: {conclusao.totalQuestoesPlanejado} questões</Text>
      <Text style={styles.text}>Respondidas: {conclusao.totalRespondidas}</Text>
      <Text style={styles.text}>Corretas: {conclusao.totalCorretas}</Text>
      <Text style={styles.text}>Pontuação: {Math.round(conclusao.pontuacao)}%</Text>
      <Text style={styles.text}>
        Concluído em: {new Date(conclusao.concluidoEm).toLocaleString('pt-BR', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        })}
      </Text>

      {conclusao.novasInsignias.length > 0 ? (
        <View style={styles.badgeList}>
          <Text style={styles.badgeTitle}>Novas insignias:</Text>
          {conclusao.novasInsignias.map((badge, index) => {
            const nomeInsignia =
              badge && typeof badge['nome'] === 'string'
                ? (badge['nome'] as string)
                : `Conquista #${index + 1}`;
            return (
              <Text key={index} style={styles.badgeItem}>
                {nomeInsignia}
              </Text>
            );
          })}
        </View>
      ) : (
        <Text style={styles.badgeEmpty}>Nenhuma nova insignia desta vez.</Text>
      )}

      {erroConclusao ? <Text style={styles.errorText}>{erroConclusao}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F9B817',
  },
  text: {
    fontSize: 14,
    color: '#0F172A',
  },
  badgeList: {
    marginTop: 12,
    gap: 6,
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F9B817',
  },
  badgeItem: {
    fontSize: 13,
    color: '#0F172A',
  },
  badgeEmpty: {
    marginTop: 12,
    fontSize: 13,
    color: '#475569',
  },
  errorText: {
    marginTop: 8,
    color: '#B91C1C',
    fontSize: 14,
  },
});
