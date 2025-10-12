import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function ProfilePage() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Perfil</Text>
        <Text style={styles.subtitle}>
          Personalize suas preferências e acompanhe seus dados pessoais.
        </Text>
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
});
