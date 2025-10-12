import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { DiagnosticSkillCategory } from '@/features/diagnostic-result/types';
import { SkillCard } from './SkillCard';

type Props = {
  category: DiagnosticSkillCategory;
};

export function SkillCategorySection({ category }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{category.title}</Text>
      <View style={styles.skillsGrid}>
        {category.skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  skillsGrid: {
    gap: 12,
  },
});
