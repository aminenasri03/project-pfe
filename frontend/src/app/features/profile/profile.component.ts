import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { AuthService } from '../../core/services/auth.service';

interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  department?: string;
  jobTitle?: string;
  roles: string[];
  enabled: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatChipsModule
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private auth = inject(AuthService);

  profile: UserProfile | null = null;
  loading = true;
  error = '';

  ngOnInit() {
    this.auth.getMe().subscribe({
      next: (p) => { this.profile = p; this.loading = false; },
      error: () => { this.error = 'Impossible de charger votre profil.'; this.loading = false; }
    });
  }

  roleLabel(role: string): string {
    return role.replace('ROLE_', '');
  }
}
