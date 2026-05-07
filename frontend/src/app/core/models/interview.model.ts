export type InterviewMode = 'ON_SITE' | 'VIDEO' | 'PHONE';
export type InterviewStatus = 'SCHEDULED' | 'DONE' | 'CANCELLED' | 'NO_SHOW';

export interface Interview {
  id: number;
  applicationId: number;
  scheduledAt: string;
  location?: string;
  mode?: InterviewMode;
  notes?: string;
  status: InterviewStatus;
  createdAt: string;
}

export interface InterviewCreateRequest {
  applicationId: number;
  scheduledAt: string;
  location?: string;
  mode?: InterviewMode;
  notes?: string;
}
