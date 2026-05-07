export type Decision = 'HIRE' | 'REJECT' | 'HOLD';

export interface Evaluation {
  id: number;
  applicationId: number;
  evaluatorId: number;
  evaluatorName: string;
  score: number | null;
  comments: string | null;
  decision: Decision | null;
  createdAt: string;
}

export interface EvaluationRequest {
  applicationId: number;
  score?: number;
  comments?: string;
  decision?: Decision;
}
