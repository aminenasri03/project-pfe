import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { JobOffer, JobOfferFilter, OfferStatus, Page } from '../models/offer.model';

@Injectable({ providedIn: 'root' })
export class OfferService {
  private readonly base = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getOffers(filter: JobOfferFilter = {}) {
    let params = new HttpParams();
    if (filter.status) params = params.set('status', filter.status);
    if (filter.department) params = params.set('department', filter.department);
    if (filter.keyword) params = params.set('keyword', filter.keyword);
    params = params.set('page', filter.page ?? 0);
    params = params.set('size', filter.size ?? 10);
    return this.http.get<Page<JobOffer>>(`${this.base}/offers`, { params });
  }

  getOffer(id: number) {
    return this.http.get<JobOffer>(`${this.base}/offers/${id}`);
  }

  createOffer(offer: Partial<JobOffer>) {
    return this.http.post<JobOffer>(`${this.base}/offers`, offer);
  }

  updateOffer(id: number, offer: Partial<JobOffer>) {
    return this.http.put<JobOffer>(`${this.base}/offers/${id}`, offer);
  }

  deleteOffer(id: number) {
    return this.http.delete<void>(`${this.base}/offers/${id}`);
  }

  /** Publish or close by re-sending full offer with new status */
  setOfferStatus(offer: JobOffer, status: OfferStatus) {
    return this.http.put<JobOffer>(`${this.base}/offers/${offer.id}`, {
      title: offer.title,
      description: offer.description,
      department: offer.department,
      location: offer.location,
      contractType: offer.contractType,
      requiredSkills: offer.requiredSkills,
      status,
      closesAt: offer.closesAt
    });
  }

  getMyOffers() {
    return this.http
      .get<Page<JobOffer>>(`${this.base}/offers?size=100&sort=createdAt,desc`)
      .pipe(map(page => page.content));
  }
}
