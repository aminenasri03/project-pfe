export interface CvAnalysisRequest {
  cvText: string;
  jobDescription: string;
}

export interface CvAnalysisResponse {
  name: string;
  score: number;
  decision: 'ACCEPTED' | 'REJECTED';
  skills: string[];
  justification: string;
}
