import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { TreinoQuestaoPayload, TreinoRespostaPayload } from '@/model/treino';

type TreinoQuestionCardProps = {
  questao: TreinoQuestaoPayload;
  onSelecionarOpcao: (opcaoId: string) => void;
  opcaoSelecionadaId: string | null;
  respostaRegistrada: TreinoRespostaPayload | null;
  isEnviandoResposta: boolean;
};

export function TreinoQuestionCard({
  questao,
  onSelecionarOpcao,
  opcaoSelecionadaId,
  respostaRegistrada,
  isEnviandoResposta,
}: TreinoQuestionCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{questao.enunciado}</Text>
      {questao.descricao ? <Text style={styles.description}>{questao.descricao}</Text> : null}

      <View style={styles.metaContainer}>
        <Text style={styles.metaText}>Dificuldade sugerida: nível {questao.dificuldadeAlvo}</Text>
        <Text style={styles.metaText}>Dificuldade real: nível {questao.dificuldade}</Text>
      </View>

      <View style={styles.skillCard}>
        <Text style={styles.skillTitle}>{questao.habilidadeAlvo.nome}</Text>
        <Text style={styles.skillCode}>{questao.habilidadeAlvo.codigo}</Text>
        <Text style={styles.skillDomain}>
          Domínio atual estimado: {questao.habilidadeAlvo.dominio.toFixed(3)}
        </Text>
      </View>

      <View style={styles.optionsList}>
        {questao.opcoes.map((opcao) => {
          const isSelecionada = opcaoSelecionadaId === opcao.id;
          const isRespostaEnviada = Boolean(respostaRegistrada);
          const isCorreta = isRespostaEnviada && isSelecionada && respostaRegistrada?.correta === true;
          const isIncorreta = isRespostaEnviada && isSelecionada && respostaRegistrada?.correta === false;

          return (
            <Pressable
              key={opcao.id}
              onPress={() => onSelecionarOpcao(opcao.id)}
              style={[
                styles.optionButton,
                isSelecionada && styles.optionButtonSelected,
                isCorreta && styles.optionButtonCorrect,
                isIncorreta && styles.optionButtonIncorrect,
                (isEnviandoResposta || isRespostaEnviada) && styles.optionButtonDisabled,
              ]}
              disabled={isEnviandoResposta || isRespostaEnviada}
            >
              <Text style={[styles.optionButtonText, isSelecionada && styles.optionButtonTextSelected]}>
                {opcao.descricao}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: '#CBD5F5',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  description: {
    fontSize: 15,
    lineHeight: 21,
    color: '#475569',
  },
  metaContainer: {
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#334155',
  },
  skillCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  skillTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  skillCode: {
    fontSize: 13,
    color: '#475569',
  },
  skillDomain: {
    fontSize: 13,
    color: '#0F172A',
  },
  optionsList: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  optionButtonSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  optionButtonCorrect: {
    borderColor: '#16A34A',
    backgroundColor: '#DCFCE7',
  },
  optionButtonIncorrect: {
    borderColor: '#DC2626',
    backgroundColor: '#FEE2E2',
  },
  optionButtonDisabled: {
    opacity: 0.7,
  },
  optionButtonText: {
    fontSize: 15,
    color: '#0F172A',
  },
  optionButtonTextSelected: {
    fontWeight: '600',
    color: '#1D4ED8',
  },
});
