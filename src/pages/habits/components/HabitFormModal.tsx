import type { HabitIcon } from '@/model/habits';
import React, { useEffect, useMemo, useState } from 'react';
import { Image } from 'expo-image';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export type HabitFormValues = {
  nome: string;
  descricao: string;
  metaDiaria: number;
  ativo: boolean;
  iconeCodigo: string | null;
};

type HabitFormModalProps = {
  visible: boolean;
  mode: 'create' | 'edit';
  icons: HabitIcon[];
  initialValues?: Partial<HabitFormValues>;
  submitting?: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (values: HabitFormValues) => void;
};

const defaultValues: HabitFormValues = {
  nome: '',
  descricao: '',
  metaDiaria: 1,
  ativo: true,
  iconeCodigo: null,
};

export function HabitFormModal({
  visible,
  mode,
  icons,
  initialValues,
  submitting,
  errorMessage,
  onClose,
  onSubmit,
}: HabitFormModalProps) {
  const [nome, setNome] = useState(defaultValues.nome);
  const [descricao, setDescricao] = useState(defaultValues.descricao);
  const [metaDiaria, setMetaDiaria] = useState(String(defaultValues.metaDiaria));
  const [ativo, setAtivo] = useState(defaultValues.ativo);
  const [iconeCodigo, setIconeCodigo] = useState<string | null>(defaultValues.iconeCodigo);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setNome(initialValues?.nome ?? defaultValues.nome);
    setDescricao(initialValues?.descricao ?? defaultValues.descricao);
    setMetaDiaria(String(initialValues?.metaDiaria ?? defaultValues.metaDiaria));
    setAtivo(initialValues?.ativo ?? defaultValues.ativo);
    setIconeCodigo(initialValues?.iconeCodigo ?? defaultValues.iconeCodigo);
    setLocalError(null);
  }, [visible, initialValues]);

  const selectedIcon = useMemo(
    () => icons.find((icon) => icon.codigo === iconeCodigo) ?? null,
    [icons, iconeCodigo],
  );

  const handleSubmit = () => {
    const trimmedName = nome.trim();
    if (!trimmedName) {
      setLocalError('Informe um nome para o hábito.');
      return;
    }

    const parsedMeta = Number(metaDiaria);

    if (!Number.isFinite(parsedMeta) || parsedMeta <= 0) {
      setLocalError('Defina uma meta diária maior que zero.');
      return;
    }

    setLocalError(null);

    onSubmit({
      nome: trimmedName,
      descricao: descricao.trim(),
      metaDiaria: Math.round(parsedMeta),
      ativo,
      iconeCodigo: iconeCodigo ?? null,
    });
  };

  const helperText = useMemo(() => {
    if (localError) {
      return localError;
    }

    if (errorMessage) {
      return errorMessage;
    }

    if (mode === 'create') {
      return 'Defina um hábito simples e mensurável para acompanhá-lo todos os dias.';
    }

    return 'Atualize as informações do hábito e mantenha sua rotina organizada.';
  }, [errorMessage, localError, mode]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.overlay}
      >
        <View style={styles.backdrop}>
          <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        </View>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Text style={styles.title}>{mode === 'create' ? 'Novo hábito' : 'Editar hábito'}</Text>
              <Text style={styles.subtitle}>{helperText}</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex.: Tomar 2L de água"
                value={nome}
                onChangeText={setNome}
                autoCapitalize="sentences"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Descrição</Text>
              <TextInput
                style={[styles.input, styles.multiline]}
                placeholder="Como você vai registrar esse hábito?"
                value={descricao}
                onChangeText={setDescricao}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.fieldGroup, styles.rowItem]}>
                <Text style={styles.label}>Meta diária</Text>
                <TextInput
                  style={styles.input}
                  value={metaDiaria}
                  onChangeText={setMetaDiaria}
                  keyboardType="number-pad"
                />
              </View>
              <View style={[styles.fieldGroup, styles.rowItem]}>
                <Text style={styles.label}>Ativo</Text>
                <View style={styles.switchRow}>
                  <Switch value={ativo} onValueChange={setAtivo} />
                  <Text style={styles.switchLabel}>{ativo ? 'Sim' : 'Não'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Ícone</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.iconList}
              >
                {icons.map((icon) => {
                  const isSelected = icon.codigo === iconeCodigo;
                  const iconUri = icon.iconeUrl ?? null;
                  const fallback = icon.nome.slice(0, 2).toUpperCase();
                  return (
                    <TouchableOpacity
                      key={icon.codigo}
                      style={[styles.iconOption, isSelected && styles.iconOptionSelected]}
                      onPress={() => setIconeCodigo(isSelected ? null : icon.codigo)}
                    >
                      <View style={styles.iconImageWrapper}>
                        {iconUri ? (
                          <Image
                            source={{ uri: iconUri }}
                            style={styles.iconImage}
                            contentFit="contain"
                          />
                        ) : (
                          <View style={styles.iconFallback}>
                            <Text style={styles.iconFallbackText}>{fallback}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.iconOptionText, isSelected && styles.iconOptionTextSelected]}>
                        {icon.nome}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <View style={styles.iconDetails}>
                {selectedIcon?.iconeUrl ? (
                  <View style={styles.iconPreview}>
                    <Image
                      source={{ uri: selectedIcon.iconeUrl }}
                      style={styles.iconPreviewImage}
                      contentFit="contain"
                    />
                  </View>
                ) : null}
                <Text style={styles.iconDescription}>
                  {selectedIcon
                    ? selectedIcon.descricao
                    : 'Selecione um ícone que represente seu hábito.'}
                </Text>
              </View>
            </View>

            {helperText && (localError || errorMessage) ? (
              <Text style={styles.error}>{helperText}</Text>
            ) : null}

            <View style={styles.actions}>
              <TouchableOpacity style={styles.secondaryButton} onPress={onClose} disabled={submitting}>
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                <Text style={styles.primaryButtonText}>
                  {mode === 'create' ? 'Criar hábito' : 'Salvar alterações'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 20,
  },
  header: {
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  input: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#CBD5F5',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  multiline: {
    minHeight: 96,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  rowItem: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchLabel: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  iconList: {
    gap: 12,
    paddingVertical: 4,
  },
  iconOption: {
    width: 96,
    padding: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#CBD5F5',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    gap: 8,
  },
  iconOptionSelected: {
    borderColor: '#F9B817',
    backgroundColor: 'rgba(249, 184, 23, 0.16)',
  },
  iconImageWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconImage: {
    width: '100%',
    height: '100%',
  },
  iconFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E2E8F0',
  },
  iconFallbackText: {
    fontWeight: '700',
    color: '#1E293B',
  },
  iconOptionText: {
    color: '#1E293B',
    fontWeight: '600',
    textAlign: 'center',
  },
  iconOptionTextSelected: {
    color: '#B45309',
  },
  iconDetails: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconPreview: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconPreviewImage: {
    width: '100%',
    height: '100%',
  },
  iconDescription: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: '#F9B817',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#1E293B',
    fontWeight: '600',
  },
  error: {
    color: '#DC2626',
    fontWeight: '600',
  },
});
