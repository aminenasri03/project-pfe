import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Evaluation, EvaluationRequest } from '../models/evaluation.model';

@Injectable({ providedIn: 'root' })
export class EvaluationService {
  private base = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  create(req: EvaluationRequest) {
    return this.http.post<Evaluation>(`${this.base}/evaluations`, req);
  }

  getByApplication(applicationId: number) {
    return this.http.get<Evaluation[]>(`${this.base}/evaluations/by-application/${applicationId}`);
  }
}
