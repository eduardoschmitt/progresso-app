import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import CustomButton from '@/components/CustomButton';
import type { TreinoRespostaPayload, TreinoSessaoStatus } from '@/model/treino';

type TreinoFeedbackCardProps = {
  resposta: TreinoRespostaPayload;
  statusSessao: TreinoSessaoStatus | null;
  podeAvancar: boolean;
  onAvancar: () => void;
  isAvancando: boolean;
};

export function TreinoFeedbackCard({
  resposta,
  statusSessao,
  podeAvancar,
  onAvancar,
  isAvancando,
}: TreinoFeedbackCardProps) {
  const titulo = resposta.correta ? 'Resposta correta!' : 'Resposta incorreta.';
  const tituloStyle = resposta.correta ? styles.feedbackTitleSuccess : styles.feedbackTitleError;

  const formatarData = (dataISO: string) => {
    const data = new Date(dataISO);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };  

  return (
    <View style={styles.container}>
      <Text style={[styles.feedbackTitle, tituloStyle]}>{titulo}</Text>
      <Text style={styles.feedbackMessage}>{resposta.feedback}</Text>
      {resposta.microdica ? <Text style={styles.feedbackHint}>{resposta.microdica}</Text> : null}

      <View style={styles.skillDeltaList}>
        {resposta.habilidades.map((habilidade) => (
          <View key={habilidade.habilidadeId} style={styles.skillDeltaItem}>
            <Text style={styles.skillDeltaTitle}>{habilidade.nome}</Text>
            <Text style={styles.skillDeltaText}>
              Domínio: {habilidade.dominioAntes.toFixed(3)} → {habilidade.dominioDepois.toFixed(3)} ({
                habilidade.delta > 0 ? '+' : ''
              }
              {habilidade.delta.toFixed(3)})
            </Text>
          </View>
        ))}
      </View>

      {resposta.proximaRevisaoEm ? (
        <Text style={styles.nextReviewText}>
          Próxima revisão recomendada em: {formatarData(resposta.proximaRevisaoEm)}
        </Text>
      ) : null}

      <CustomButton
        title={statusSessao === 'concluida' ? 'Finalizar sessão' : 'Avançar para a próxima'}
        onPress={onAvancar}
        disabled={!podeAvancar || isAvancando}
        style={styles.nextButton}
        textStyle={styles.nextButtonText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  feedbackTitleSuccess: {
    color: '#16A34A',
  },
  feedbackTitleError: {
    color: '#DC2626',
  },
  feedbackMessage: {
    fontSize: 15,
    color: '#0F172A',
  },
  feedbackHint: {
    fontSize: 14,
    color: '#F9B817',
  },
  skillDeltaList: {
    gap: 12,
  },
  skillDeltaItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  skillDeltaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  skillDeltaText: {
    fontSize: 13,
    color: '#334155',
  },
  nextReviewText: {
    fontSize: 13,
    color: '#475569',
  },
  nextButton: {
    marginTop: 8,
    backgroundColor: '#F9B817',
  },
  nextButtonText: {
    color: '#FFFFFF',
  },
});
