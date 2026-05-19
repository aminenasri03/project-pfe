import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CvAnalysisResponse } from '../models/cv-analysis.model';

@Injectable({ providedIn: 'root' })
export class CvAnalysisService {
  private readonly base = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  analyze(cvFile: File, jobDescription: string) {
    const fd = new FormData();
    fd.append('cv', cvFile, cvFile.name);
    fd.append('jobDescription', jobDescription);
    return this.http.post<CvAnalysisResponse>(`${this.base}/cv/analyze`, fd);
  }

  analyzeApplication(applicationId: number) {
    return this.http.post<CvAnalysisResponse>(`${this.base}/cv/analyze-application/${applicationId}`, {});
  }
}
