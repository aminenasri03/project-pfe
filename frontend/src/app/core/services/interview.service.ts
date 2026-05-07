import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Interview, InterviewCreateRequest } from '../models/interview.model';

@Injectable({ providedIn: 'root' })
export class InterviewService {
  private readonly base = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  scheduleInterview(req: InterviewCreateRequest) {
    return this.http.post<Interview>(`${this.base}/interviews`, req);
  }

  getInterviewsByApplication(applicationId: number) {
    return this.http.get<Interview[]>(`${this.base}/interviews/by-application/${applicationId}`);
  }

  /** PATCH /api/interviews/{id}/status?status=COMPLETED|CANCELLED */
  updateStatus(id: number, status: string) {
    return this.http.patch<Interview>(`${this.base}/interviews/${id}/status`, null, {
      params: { status }
    });
  }

  /** DELETE /api/interviews/{id} */
  cancel(id: number) {
    return this.http.delete<void>(`${this.base}/interviews/${id}`);
  }
}
