import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Notification } from '../models/notification.model';

interface NotificationPage {
  content: Notification[];
  totalElements: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly base = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  /** Returns the content array from the paged response */
  getNotifications() {
    return this.http
      .get<NotificationPage>(`${this.base}/notifications?size=20&sort=createdAt,desc`)
      .pipe(map(page => page.content));
  }

  getUnreadCount() {
    return this.http.get<{ count: number }>(`${this.base}/notifications/unread-count`);
  }

  markAsRead(id: number) {
    return this.http.patch<void>(`${this.base}/notifications/${id}/read`, {});
  }
}
