import type { Habit } from '@/model/habits';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const formatDateTime = (value: string | null) => {
  if (!value) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch (error) {
    console.warn('Failed to format date', error);
    return value;
  }
};

type HabitCardProps = {
  habit: Habit;
  onMark: (habit: Habit) => void;
  onUnmark: (habit: Habit) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
  disabled?: boolean;
};

export function HabitCard({
  habit,
  onMark,
  onUnmark,
  onEdit,
  onDelete,
  disabled,
}: HabitCardProps) {
  const progress = useMemo(() => {
    if (!habit.metaDiaria || habit.metaDiaria <= 0) {
      return 0;
    }
    const ratio = habit.contagemHoje / habit.metaDiaria;
    return Math.max(0, Math.min(1, ratio));
  }, [habit.contagemHoje, habit.metaDiaria]);

  const percentual = Math.round(progress * 100);
  const restante = Math.max(habit.metaDiaria - habit.contagemHoje, 0);
  const ultimaMarcacao = formatDateTime(habit.ultimaMarcacaoEm);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconPlaceholder}>
          <Text style={styles.iconText}>
            {(habit.iconeCodigo ?? habit.nome ?? '?').slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <View style={styles.headerContent}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{habit.nome}</Text>
            <View
              style={[styles.statusPill, habit.ativo ? styles.statusActive : styles.statusInactive]}
            >
              <Text style={habit.ativo ? styles.statusActiveText : styles.statusInactiveText}>
                {habit.ativo ? 'Ativo' : 'Inativo'}
              </Text>
            </View>
          </View>
          {habit.descricao ? <Text style={styles.description}>{habit.descricao}</Text> : null}
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressBarFill, { width: `${percentual}%` }]} />
        </View>
        <View style={styles.progressMeta}>
          <Text style={styles.progressText}>
            {habit.contagemHoje}/{habit.metaDiaria} hoje
          </Text>
          <Text style={styles.progressHint}>
            {percentual >= 100
              ? 'Meta batida!'
              : restante === 1
                ? 'Falta 1 registro'
                : `Faltam ${restante} registros`}
          </Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Streak atual</Text>
          <Text style={styles.metaValue}>{habit.streakAtual} dias</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Recorde</Text>
          <Text style={styles.metaValue}>{habit.streakMax} dias</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Total</Text>
          <Text style={styles.metaValue}>{habit.contagemTotal}</Text>
        </View>
      </View>

      {ultimaMarcacao ? (
        <Text style={styles.lastCheck}>Última marcação em {ultimaMarcacao}</Text>
      ) : null}

      {habit.novasInsignias && habit.novasInsignias.length > 0 ? (
        <View style={styles.badgeHighlight}>
          <Text style={styles.badgeHighlightText}>
            {habit.novasInsignias.length === 1
              ? 'Você conquistou uma nova insígnia!'
              : `Você conquistou ${habit.novasInsignias.length} novas insígnias!`}
          </Text>
        </View>
      ) : null}

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.primaryButton, disabled && styles.buttonDisabled]}
          onPress={() => onMark(habit)}
          disabled={disabled}
        >
          {disabled ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Registrar</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, (disabled || habit.contagemHoje <= 0) && styles.buttonDisabled]}
          onPress={() => onUnmark(habit)}
          disabled={disabled || habit.contagemHoje <= 0}
        >
          <Text style={styles.secondaryButtonText}>Desfazer</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footerActions}>
        <TouchableOpacity onPress={() => onEdit(habit)} disabled={disabled}>
          <Text style={styles.link}>Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(habit)} disabled={disabled}>
          <Text style={[styles.link, styles.deleteLink]}>Remover</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    gap: 16,
  },
  iconPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontWeight: '700',
    color: '#4338CA',
  },
  headerContent: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  description: {
    color: '#475569',
    fontSize: 14,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statusActive: {
    borderColor: 'rgba(34,197,94,0.2)',
    backgroundColor: 'rgba(34,197,94,0.12)',
  },
  statusInactive: {
    borderColor: 'rgba(148,163,184,0.4)',
    backgroundColor: 'rgba(148,163,184,0.16)',
  },
  statusActiveText: {
    color: '#15803D',
    fontWeight: '600',
  },
  statusInactiveText: {
    color: '#475569',
    fontWeight: '600',
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 10,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  progressHint: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metaItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
  },
  metaLabel: {
    color: '#475569',
    fontSize: 12,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  lastCheck: {
    fontSize: 12,
    color: '#334155',
  },
  badgeHighlight: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 12,
  },
  badgeHighlightText: {
    color: '#92400E',
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#CBD5F5',
    backgroundColor: '#F8FAFC',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  footerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 20,
  },
  link: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  deleteLink: {
    color: '#DC2626',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
