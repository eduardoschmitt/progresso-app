import React from 'react';
import { Dimensions, Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function HomePage() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Bem-vindo!</Text>
        <Image
          source={require('@/assets/images/arts/dashboard.webp')}
          style={styles.dashboardImage}
        />
        <Text style={styles.subtitle}>
          Explore seus resultados, conquistas e desafios sustentáveis usando o menu abaixo.
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
    fontSize: 32,
    fontWeight: '700',
    color: '#4B4B4B',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: '#475569',
  },
  dashboardImage: {
    width: screenWidth * 0.6,
    height: screenWidth * 0.4,
    aspectRatio: 2,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginVertical: 8,
  },
});
