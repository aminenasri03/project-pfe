export type ApplicationStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface Application {
  id: number;
  offerId: number;
  offerTitle: string;
  candidateId: number;
  candidateFullName: string;
  candidateEmail: string;
  coverLetter?: string;
  cvFileName?: string;
  matchingScore?: number;
  status: ApplicationStatus;
  submittedAt: string;
  updatedAt: string;
}
