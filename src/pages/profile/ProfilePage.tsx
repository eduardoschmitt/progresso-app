import React, { useCallback } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import CustomButton from '@/components/CustomButton';
import { useAuthContext } from '@/context/AuthContext';

export default function ProfilePage() {
  const { clearSession } = useAuthContext();

  const handleDisconnect = useCallback(async () => {
    try {
      await clearSession();
    } catch (error) {
      console.error('Failed to clear session', error);
      Alert.alert(
        'Erro ao desconectar',
        'Não foi possível sair da conta. Tente novamente em instantes.',
      );
    }
  }, [clearSession]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Perfil</Text>
        <Text style={styles.subtitle}>
          Personalize suas preferências e acompanhe seus dados pessoais.
        </Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Conexão com a conta</Text>
          <Text style={styles.cardDescription}>
            Desconecte-se do aplicativo caso esteja usando um dispositivo
            compartilhado.
          </Text>
          <CustomButton
            title="Desconectar"
            onPress={handleDisconnect}
            style={styles.logoutButton}
            textStyle={styles.logoutButtonText}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    marginTop: 24,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardDescription: {
    fontSize: 16,
    lineHeight: 22,
    color: '#475569',
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    shadowColor: 'transparent',
  },
  logoutButtonText: {
    color: '#B91C1C',
  },
});
