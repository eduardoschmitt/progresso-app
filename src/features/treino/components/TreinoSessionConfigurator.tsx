import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import CustomButton from '@/components/CustomButton';
import type { TreinoCluster, TreinoSessaoTipo } from '@/model/treino';

import type { TreinoOption } from '../constants';

export type TreinoSessionConfiguratorProps = {
  tipo: TreinoSessaoTipo;
  onSelectTipo: (value: TreinoSessaoTipo) => void;
  tipoOptions: TreinoOption<TreinoSessaoTipo>[];
  cluster: TreinoCluster;
  onSelectCluster: (value: TreinoCluster) => void;
  clusterOptions: TreinoOption<TreinoCluster>[];
  totalQuestoes: number;
  onIncrementTotal: () => void;
  onDecrementTotal: () => void;
  totalMin: number;
  totalMax: number;
  onStartSession: () => void;
  isStarting: boolean;
  canStart: boolean;
  errorMessage?: string | null;
  helperMessage?: string | null;
};

export function TreinoSessionConfigurator({
  tipo,
  onSelectTipo,
  tipoOptions,
  cluster,
  onSelectCluster,
  clusterOptions,
  totalQuestoes,
  onIncrementTotal,
  onDecrementTotal,
  totalMin,
  totalMax,
  onStartSession,
  isStarting,
  canStart,
  errorMessage,
  helperMessage,
}: TreinoSessionConfiguratorProps) {
  return (
    <View style={styles.container}>
      <Section title="Tipo de treino">
        <View style={styles.optionList}>
          {tipoOptions.map((option) => {
            const isSelected = option.value === tipo;
            return (
              <Pressable
                key={option.value}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => onSelectTipo(option.value)}
              >
                <View style={styles.optionContent}>
                  {option.imageSource ? (
                    <Image source={option.imageSource} style={styles.optionImage} resizeMode="cover" />
                  ) : null}
                  <View style={styles.optionTextContainer}>
                    <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                      {option.label}
                    </Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </Section>

      <Section title="Cluster">
        <View style={styles.optionList}>
          {clusterOptions.map((option) => {
            const isSelected = option.value === cluster;
            return (
              <Pressable
                key={option.value}
                style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                onPress={() => onSelectCluster(option.value)}
              >
                <View style={styles.optionContent}>
                  {option.imageSource ? (
                    <Image source={option.imageSource} style={styles.optionImage} resizeMode="cover" />
                  ) : null}
                  <View style={styles.optionTextContainer}>
                    <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                      {option.label}
                    </Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </Section>

      <Section title="Total de questões" helper="Escolha entre 1 e 20 questões por sessão.">
        <View style={styles.counterContainer}>
          <Pressable
            onPress={onDecrementTotal}
            style={[styles.counterButton, totalQuestoes === totalMin && styles.counterButtonDisabled]}
            disabled={totalQuestoes === totalMin}
          >
            <Text style={styles.counterButtonText}>-</Text>
          </Pressable>

          <View style={styles.counterValueContainer}>
            <Text style={styles.counterValue}>{totalQuestoes}</Text>
            <Text style={styles.counterValueSuffix}>questões</Text>
          </View>

          <Pressable
            onPress={onIncrementTotal}
            style={[styles.counterButton, totalQuestoes === totalMax && styles.counterButtonDisabled]}
            disabled={totalQuestoes === totalMax}
          >
            <Text style={styles.counterButtonText}>+</Text>
          </Pressable>
        </View>
      </Section>

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      {helperMessage ? <Text style={styles.helperText}>{helperMessage}</Text> : null}

      <CustomButton
        title={isStarting ? 'Iniciando...' : 'Iniciar treino adaptativo'}
        onPress={onStartSession}
        disabled={!canStart || isStarting}
        style={styles.startButton}
        textStyle={styles.startButtonText}
      />
    </View>
  );
}

type SectionProps = {
  title: string;
  helper?: string;
  children: React.ReactNode;
};

function Section({ title, helper, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {helper ? <Text style={styles.sectionHelper}>{helper}</Text> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    shadowColor: '#0F172A0D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  sectionHelper: {
    fontSize: 14,
    color: '#64748B',
  },
  optionList: {
    gap: 12,
  },
  optionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  optionCardSelected: {
    borderColor: '#F9B817',
    backgroundColor: '#FFF4CC',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  optionTextContainer: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  optionTitleSelected: {
    color: '#F9B817',
  },
  optionDescription: {
    fontSize: 14,
    color: '#475569',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
  },
  counterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9B817',
  },
  counterButtonDisabled: {
    backgroundColor: '#FDE68A',
  },
  counterButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  counterValueContainer: {
    alignItems: 'center',
    gap: 4,
  },
  counterValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  counterValueSuffix: {
    fontSize: 14,
    color: '#64748B',
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 12,
  },
  helperText: {
    fontSize: 14,
    color: '#475569',
  },
  startButton: {
    borderRadius: 20,
  },
  startButtonText: {
    fontSize: 15,
  },
});
