import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useAuth } from '@/hooks/use-auth';
import type { Habit, HabitIcon, HabitRecommendation } from '@/model/habits';
import {
  createHabit,
  deleteHabit,
  getHabitIcons,
  getHabitRecommendations,
  listHabits,
  markHabit,
  unmarkHabit,
  updateHabit,
} from '@/service/habits/habitService';

import { HabitCard } from './components/HabitCard';
import { HabitFormModal, type HabitFormValues } from './components/HabitFormModal';
import { HabitRecommendations } from './components/HabitRecommendations';

type ToastState = {
  type: 'success' | 'error' | 'info';
  message: string;
};

export default function HabitsPage() {
  const { session, isLoading: isAuthLoading } = useAuth();
  const usuarioId = session?.user?.id ?? null;
  const isAuthenticated = Boolean(session?.token && usuarioId);

  const [habits, setHabits] = useState<Habit[]>([]);
  const [recommendations, setRecommendations] = useState<HabitRecommendation[]>([]);
  const [icons, setIcons] = useState<HabitIcon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [formInitialValues, setFormInitialValues] = useState<Partial<HabitFormValues> | undefined>(
    undefined,
  );
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [pendingHabits, setPendingHabits] = useState<Record<string, boolean>>({});

  const setHabitPending = useCallback((habitId: string, pending: boolean) => {
    setPendingHabits((current) => {
      const next = { ...current };
      if (!pending) {
        delete next[habitId];
      } else {
        next[habitId] = true;
      }
      return next;
    });
  }, []);

  const loadData = useCallback(
    async (opts?: { refreshing?: boolean }) => {
      if (!isAuthenticated || !usuarioId) {
        setHabits([]);
        setRecommendations([]);
        setIcons([]);
        setIsLoading(false);
        setIsRefreshing(false);
        setError(null);
        return;
      }

      if (opts?.refreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        setError(null);
        const [habitList, recommendationList, iconList] = await Promise.all([
          listHabits({ usuarioId }),
          getHabitRecommendations(usuarioId),
          getHabitIcons(),
        ]);
        setHabits(Array.isArray(habitList) ? habitList : []);
        setRecommendations(Array.isArray(recommendationList) ? recommendationList : []);
        setIcons(Array.isArray(iconList) ? iconList : []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Não foi possível carregar seus hábitos.';
        setError(message);
      } finally {
        if (opts?.refreshing) {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [isAuthenticated, usuarioId],
  );

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }
    void loadData();
  }, [isAuthLoading, loadData]);

  const handleRefresh = useCallback(() => {
    void loadData({ refreshing: true });
  }, [loadData]);

  const handleMarkHabit = useCallback(
    async (habit: Habit) => {
      setHabitPending(habit.id, true);
      try {
        const updated = await markHabit(habit.id);
        setHabits((current) => current.map((item) => (item.id === updated.id ? updated : item)));
        setToast({ type: 'success', message: 'Progresso registrado com sucesso.' });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Não foi possível registrar o progresso.';
        setToast({ type: 'error', message });
      } finally {
        setHabitPending(habit.id, false);
      }
    },
    [setHabitPending],
  );

  const handleUnmarkHabit = useCallback(
    async (habit: Habit) => {
      setHabitPending(habit.id, true);
      try {
        const updated = await unmarkHabit(habit.id);
        setHabits((current) => current.map((item) => (item.id === updated.id ? updated : item)));
        setToast({ type: 'info', message: 'Último registro desfeito.' });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Não foi possível desfazer o registro.';
        setToast({ type: 'error', message });
      } finally {
        setHabitPending(habit.id, false);
      }
    },
    [setHabitPending],
  );

  const performDelete = useCallback(
    async (habit: Habit) => {
      setHabitPending(habit.id, true);
      try {
        await deleteHabit(habit.id);
        setHabits((current) => current.filter((item) => item.id !== habit.id));
        setToast({ type: 'success', message: 'Hábito removido.' });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Não foi possível remover o hábito.';
        setToast({ type: 'error', message });
      } finally {
        setHabitPending(habit.id, false);
      }
    },
    [setHabitPending],
  );

  const handleDeleteHabit = useCallback(
    (habit: Habit) => {
      Alert.alert(
        'Remover hábito',
        `Tem certeza de que deseja remover "${habit.nome}"? Essa ação não pode ser desfeita.`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Remover', style: 'destructive', onPress: () => void performDelete(habit) },
        ],
      );
    },
    [performDelete],
  );

  const openCreateModal = useCallback(() => {
    setFormMode('create');
    setEditingHabit(null);
    setFormInitialValues({ nome: '', descricao: '', metaDiaria: 1, ativo: true, iconeCodigo: null });
    setFormError(null);
    setIsModalVisible(true);
  }, []);

  const openEditModal = useCallback((habit: Habit) => {
    setFormMode('edit');
    setEditingHabit(habit);
    setFormInitialValues({
      nome: habit.nome,
      descricao: habit.descricao ?? '',
      metaDiaria: habit.metaDiaria,
      ativo: habit.ativo,
      iconeCodigo: habit.iconeCodigo,
    });
    setFormError(null);
    setIsModalVisible(true);
  }, []);

  const handleSubmitForm = useCallback(
    async (values: HabitFormValues) => {
      if (!usuarioId) {
        setFormError('Usuário não identificado. Faça login novamente.');
        return;
      }

      setIsSubmittingForm(true);
      setFormError(null);

      try {
        if (formMode === 'create') {
          const created = await createHabit({
            usuarioId,
            nome: values.nome,
            descricao: values.descricao,
            metaDiaria: values.metaDiaria,
            iconeCodigo: values.iconeCodigo ?? undefined,
          });
          setHabits((current) => [created, ...current]);
          setToast({ type: 'success', message: 'Hábito criado com sucesso.' });
        } else if (editingHabit) {
          const updated = await updateHabit(editingHabit.id, {
            nome: values.nome,
            descricao: values.descricao,
            metaDiaria: values.metaDiaria,
            ativo: values.ativo,
            iconeCodigo: values.iconeCodigo ?? null,
          });
          setHabits((current) => current.map((item) => (item.id === updated.id ? updated : item)));
          setToast({ type: 'success', message: 'Hábito atualizado.' });
        }

        setIsModalVisible(false);
        setEditingHabit(null);
        setFormInitialValues(undefined);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Não foi possível salvar o hábito.';
        setFormError(message);
      } finally {
        setIsSubmittingForm(false);
      }
    },
    [editingHabit, formMode, usuarioId],
  );

  const handleAdoptRecommendation = useCallback((recommendation: HabitRecommendation) => {
    setFormMode('create');
    setEditingHabit(null);
    setFormInitialValues({
      nome: recommendation.metadados?.titulo ?? recommendation.iconeNome,
      descricao: recommendation.metadados?.descricao ?? '',
      metaDiaria: 1,
      ativo: true,
      iconeCodigo: recommendation.iconeCodigo,
    });
    setFormError(null);
    setIsModalVisible(true);
  }, []);

  const sortedHabits = useMemo(() => {
    return [...habits].sort((a, b) => {
      if (a.ativo !== b.ativo) {
        return a.ativo ? -1 : 1;
      }
      if (a.concluidoHoje !== b.concluidoHoje) {
        return a.concluidoHoje ? 1 : -1;
      }
      return a.nome.localeCompare(b.nome);
    });
  }, [habits]);

  const isEmpty = !isLoading && sortedHabits.length === 0 && !error;
  const showLoginMessage = !isAuthLoading && !isAuthenticated;
  const toastVariantStyle =
    toast?.type === 'success'
      ? styles.toastSuccess
      : toast?.type === 'error'
        ? styles.toastError
        : styles.toastInfo;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Hábitos</Text>
          <Text style={styles.subtitle}>
            Crie rotinas sustentáveis e acompanhe seu progresso diariamente.
          </Text>
          <TouchableOpacity style={styles.createButton} onPress={openCreateModal} disabled={!isAuthenticated}>
            <Text style={styles.createButtonText}>Novo hábito</Text>
          </TouchableOpacity>
        </View>

        {toast ? (
          <TouchableOpacity
            style={[styles.toast, toastVariantStyle]}
            onPress={() => setToast(null)}
          >
            <Text style={styles.toastText}>{toast.message}</Text>
            <Text style={styles.toastDismiss}>Toque para dispensar</Text>
          </TouchableOpacity>
        ) : null}

        {showLoginMessage ? (
          <View style={styles.callout}>
            <Text style={styles.calloutTitle}>Acesse sua conta</Text>
            <Text style={styles.calloutSubtitle}>
              Entre para criar, editar e acompanhar seus hábitos personalizados.
            </Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Não foi possível carregar os hábitos</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => void loadData()}>
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator color="#F9B817" />
            <Text style={styles.loadingText}>Buscando seus hábitos...</Text>
          </View>
        ) : null}

        {!isLoading && !error ? (
          <HabitRecommendations recommendations={recommendations} onAdopt={handleAdoptRecommendation} />
        ) : null}

        {!isLoading && !error ? (
          <View style={styles.list}>
            {sortedHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onMark={handleMarkHabit}
                onUnmark={handleUnmarkHabit}
                onEdit={openEditModal}
                onDelete={handleDeleteHabit}
                disabled={!!pendingHabits[habit.id]}
              />
            ))}
          </View>
        ) : null}

        {isEmpty ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Que tal começar um novo hábito?</Text>
            <Text style={styles.emptySubtitle}>
              Use o botão “Novo hábito” para registrar ações que reforçam sua jornada de sustentabilidade.
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <HabitFormModal
        visible={isModalVisible}
        mode={formMode}
        icons={icons}
        initialValues={formInitialValues}
        submitting={isSubmittingForm}
        errorMessage={formError}
        onClose={() => {
          if (!isSubmittingForm) {
            setIsModalVisible(false);
            setEditingHabit(null);
            setFormInitialValues(undefined);
            setFormError(null);
          }
        }}
        onSubmit={handleSubmitForm}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    gap: 24,
  },
  header: {
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#475569',
  },
  createButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#F9B817',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  toast: {
    padding: 16,
    borderRadius: 16,
    gap: 4,
  },
  toastText: {
    color: '#0F172A',
    fontWeight: '600',
  },
  toastDismiss: {
    color: '#475569',
    fontSize: 12,
  },
  toastSuccess: {
    backgroundColor: '#DCFCE7',
  },
  toastError: {
    backgroundColor: '#FEE2E2',
  },
  toastInfo: {
    backgroundColor: '#FEF9C3',
  },
  callout: {
    backgroundColor: '#FFF4CC',
    borderRadius: 20,
    padding: 20,
    gap: 8,
  },
  calloutTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  calloutSubtitle: {
    fontSize: 14,
    color: '#B45309',
  },
  errorCard: {
    backgroundColor: '#FEE2E2',
    borderRadius: 20,
    padding: 20,
    gap: 10,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#B91C1C',
  },
  errorMessage: {
    color: '#7F1D1D',
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#B91C1C',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#F9B817',
    fontWeight: '600',
  },
  list: {
    gap: 16,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
});
