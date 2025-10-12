import { StyleSheet, Text, View } from 'react-native';

import type { DiagnosticQuizSkillCategoryGroup } from '@/model/quizResult';

import { SkillCard } from './SkillCard';

type SkillCategorySectionProps = {
  category: DiagnosticQuizSkillCategoryGroup;
};

export function SkillCategorySection({ category }: SkillCategorySectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{category.title}</Text>
      <View style={styles.list}>
        {category.skills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  list: {
    gap: 12,
  },
});
