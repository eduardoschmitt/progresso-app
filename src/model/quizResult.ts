import type { DiagnosticConclusionPayload, DiagnosticConclusionSkill } from './diagnostic';

export type DiagnosticQuizResultPayload = DiagnosticConclusionPayload;

export type DiagnosticQuizResultSkill = DiagnosticConclusionSkill;

export type DomainStatus = 'excellent' | 'good' | 'developing' | 'attention';

export type DiagnosticQuizSkillViewModel = {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  attempts: number;
  hits: number;
  domain: number;
  domainPercentage: number;
  status: DomainStatus;
  statusLabel: string;
  statusColor: string;
};

export type DiagnosticQuizSkillCategoryGroup = {
  category: string;
  title: string;
  skills: DiagnosticQuizSkillViewModel[];
};

export type DiagnosticQuizBadge = {
  id: string;
  title: string;
  description?: string;
  iconUrl?: string;
};

export type DiagnosticQuizResultSummary = {
  score: number;
  totalQuestions: number;
  totalCorrect: number;
  accuracy: number;
  feedback: string;
};

export type DiagnosticQuizResultViewModel = {
  summary: DiagnosticQuizResultSummary;
  categories: DiagnosticQuizSkillCategoryGroup[];
  badges: DiagnosticQuizBadge[];
};
