import { StyleSheet, View } from 'react-native';

import CustomButton from '@/components/CustomButton';

type ResultActionsProps = {
  onReviewPress: () => void;
  onRestartPress: () => void;
};

export function ResultActions({ onReviewPress, onRestartPress }: ResultActionsProps) {
  return (
    <View style={styles.container} accessibilityRole="toolbar">
      <CustomButton title="Rever perguntas" onPress={onReviewPress} style={styles.primaryButton} />
      <CustomButton title="Iniciar novo quiz" onPress={onRestartPress} style={styles.secondaryButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingVertical: 16,
  },
  primaryButton: {
    backgroundColor: '#047857',
  },
  secondaryButton: {
    backgroundColor: '#1d4ed8',
  },
});
