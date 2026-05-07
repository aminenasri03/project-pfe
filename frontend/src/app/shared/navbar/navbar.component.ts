import { Component, OnInit, effect, inject, DOCUMENT } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Notification } from '../../core/models/notification.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  notifications: Notification[] = [];
  unreadCount = 0;

  private document = inject(DOCUMENT);

  constructor(
    public auth: AuthService,
    private notifService: NotificationService
  ) {
    effect(() => {
      const role = this.auth.role();
      const body = this.document.body;
      body.classList.remove('theme-admin', 'theme-recruiter', 'theme-candidate');
      if (role === 'ADMIN') body.classList.add('theme-admin');
      else if (role === 'RECRUITER') body.classList.add('theme-recruiter');
      else if (role) body.classList.add('theme-candidate');
    });
  }

  ngOnInit() {
    if (this.auth.isAuthenticated()) {
      this.loadNotifications();
    }
  }

  loadNotifications() {
    this.notifService.getNotifications().subscribe({
      next: (notifs) => {
        this.notifications = notifs.slice(0, 5);
        this.unreadCount = notifs.filter(n => !n.read).length;
      },
      error: () => {}
    });
  }

  markRead(id: number) {
    this.notifService.markAsRead(id).subscribe(() => this.loadNotifications());
  }

  logout() {
    this.auth.logout();
  }

  get userInitials(): string {
    const user = this.auth.currentUser();
    if (!user) return '?';
    return (user.firstName[0] + user.lastName[0]).toUpperCase();
  }

  get userFullName(): string {
    const user = this.auth.currentUser();
    return user ? `${user.firstName} ${user.lastName}` : '';
  }
}
