import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import type { TreinoQuestaoPayload, TreinoRespostaPayload } from '@/model/treino';
import { resolveIconUrl } from '@/utils/iconUrl';

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

      {questao.habilidadeAlvo ? (
        <View style={styles.skillCard}>
          <Text style={styles.skillTitle}>{questao.habilidadeAlvo.nome}</Text>
          <Text style={styles.skillCode}>{questao.habilidadeAlvo.codigo}</Text>
          <Text style={styles.skillDomain}>
            Domínio atual estimado: {questao.habilidadeAlvo.dominio.toFixed(3)}
          </Text>
        </View>
      ) : null}

      <View style={styles.optionsList}>
        {questao.opcoes.map((opcao) => {
          const label = opcao.rotulo ?? '';
          const isSelecionada = opcaoSelecionadaId === opcao.id;
          const isRespostaEnviada = Boolean(respostaRegistrada);
          const isCorreta = isRespostaEnviada && isSelecionada && respostaRegistrada?.correta === true;
          const isIncorreta = isRespostaEnviada && isSelecionada && respostaRegistrada?.correta === false;
          const iconUri = resolveIconUrl(opcao.iconeUrl);
          const fallbackInitial = label.trim().charAt(0).toUpperCase() || '?';

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
              <View style={styles.optionButtonContent}>
                {iconUri ? (
                  <Image source={{ uri: iconUri }} style={styles.optionButtonIcon} contentFit="contain" />
                ) : (
                  <View style={styles.optionButtonIconFallback}>
                    <Text style={styles.optionButtonIconFallbackText}>{fallbackInitial}</Text>
                  </View>
                )}
                <Text
                  style={[styles.optionButtonText, isSelecionada && styles.optionButtonTextSelected]}
                  numberOfLines={2}
                >
                  {label}
                </Text>
              </View>
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
    backgroundColor: '#FFF7D6',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  skillTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F9B817',
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
  optionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    overflow: 'hidden',
  },
  optionButtonIconFallback: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionButtonIconFallbackText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  optionButtonSelected: {
    borderColor: '#F9B817',
    backgroundColor: '#FFF4CC',
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
    flex: 1,
  },
  optionButtonTextSelected: {
    fontWeight: '600',
    color: '#F9B817',
  },
});
