import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Application } from '../models/application.model';

interface ApplicationPage {
  content: Application[];
  totalElements: number;
}

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private readonly base = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  /** POST multipart/form-data — cv file is required by backend */
  apply(offerId: number, coverLetter: string | undefined, cv: File) {
    const fd = new FormData();
    fd.append('offerId', String(offerId));
    if (coverLetter) fd.append('coverLetter', coverLetter);
    fd.append('cv', cv, cv.name);
    return this.http.post<Application>(`${this.base}/applications`, fd);
  }

  /** GET /api/applications/me → Page<ApplicationDto> */
  getMyApplications() {
    return this.http
      .get<ApplicationPage>(`${this.base}/applications/me?size=50&sort=submittedAt,desc`)
      .pipe(map(page => page.content));
  }

  getApplicationById(id: number) {
    return this.http.get<Application>(`${this.base}/applications/${id}`);
  }

  /** GET /api/applications/by-offer/{offerId} → Page<ApplicationDto> */
  getApplicationsByOffer(offerId: number) {
    return this.http.get<ApplicationPage>(`${this.base}/applications/by-offer/${offerId}?size=100`);
  }

  /** PATCH /api/applications/{id}/status with JSON body { status } */
  updateStatus(id: number, status: string) {
    return this.http.patch<Application>(`${this.base}/applications/${id}/status`, { status });
  }

  withdraw(id: number) {
    return this.http.delete<void>(`${this.base}/applications/${id}`);
  }

  /** GET /api/applications/{id}/cv → blob (JWT token sent via interceptor) */
  downloadCv(applicationId: number) {
    return this.http.get(`${this.base}/applications/${applicationId}/cv`, {
      responseType: 'blob',
      observe: 'response'
    });
  }
}
