import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { AuthResponse } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  form: FormGroup;
  loading = false;
  error = '';
  hidePassword = true;

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { email, password } = this.form.value;
    this.auth.login({ email: email!, password: password! }).subscribe({
      next: (res: AuthResponse) => {
        this.loading = false;
        this.cdr.detectChanges();
        // Backend returns 'ROLE_ADMIN' etc., strip prefix
        const rawRole = res.roles?.[0] ?? '';
        const role = rawRole.replace('ROLE_', '');
        if (role === 'ADMIN') this.router.navigate(['/admin']);
        else if (role === 'RECRUITER') this.router.navigate(['/recruiter']);
        else this.router.navigate(['/offers']);
      },
      error: (err: { status: number }) => {
        this.loading = false;
        this.cdr.detectChanges();
        this.error = err.status === 401
          ? 'Email ou mot de passe incorrect.'
          : 'Erreur serveur. Réessayez plus tard.';
      }
    });
  }
}
