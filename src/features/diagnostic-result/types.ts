import type { DiagnosticConclusionPayload, DiagnosticConclusionSkill } from '@/model/diagnostic';

export type DiagnosticResultSummary = {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  feedbackTitle: string;
  feedbackMessage: string;
};

export type SkillStatusLevel = 'excelente' | 'bom' | 'atencao';

export type SkillStatus = {
  level: SkillStatusLevel;
  label: string;
  message: string;
};

export type DiagnosticSkillViewModel = {
  id: string;
  code: string;
  name: string;
  categoryKey: string;
  categoryTitle: string;
  attempts: number;
  correctAnswers: number;
  domain: number;
  domainPercentage: number;
  status: SkillStatus;
};

export type DiagnosticSkillCategory = {
  key: string;
  title: string;
  skills: DiagnosticSkillViewModel[];
};

export type DiagnosticResultViewModel = {
  summary: DiagnosticResultSummary;
  categories: DiagnosticSkillCategory[];
};

export type DiagnosticConclusionResult = DiagnosticConclusionPayload;
export type DiagnosticConclusionResultSkill = DiagnosticConclusionSkill;
