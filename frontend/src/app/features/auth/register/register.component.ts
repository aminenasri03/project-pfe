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

@Component({
  selector: 'app-register',
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
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
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
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      department: [''],
      jobTitle: ['']
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { firstName, lastName, email, password, department, jobTitle } = this.form.value;
    this.auth.register({
      firstName: firstName!,
      lastName: lastName!,
      email: email!,
      password: password!,
      department: department || undefined,
      jobTitle: jobTitle || undefined
    }).subscribe({
      next: () => {
        this.loading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/offers']);
      },
      error: (err: { status: number; error?: { message?: string } }) => {
        this.loading = false;
        this.cdr.detectChanges();
        if (err.status === 409) {
          this.error = 'Cette adresse e-mail est déjà utilisée.';
        } else {
          this.error = err.error?.message ?? 'Erreur lors de l\'inscription. Réessayez.';
        }
      }
    });
  }
}
