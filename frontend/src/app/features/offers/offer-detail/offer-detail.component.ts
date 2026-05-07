import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { OfferService } from '../../../core/services/offer.service';
import { ApplicationService } from '../../../core/services/application.service';
import { AuthService } from '../../../core/services/auth.service';
import { JobOffer } from '../../../core/models/offer.model';

@Component({
  selector: 'app-offer-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule
  ],
  templateUrl: './offer-detail.component.html',
  styleUrl: './offer-detail.component.scss'
})
export class OfferDetailComponent implements OnInit {
  offer: JobOffer | null = null;
  loading = true;
  applying = false;
  showApplyForm = false;
  applyForm: FormGroup;
  selectedCv: File | null = null;

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private offerService = inject(OfferService);
  private applicationService = inject(ApplicationService);
  auth = inject(AuthService);
  private snack = inject(MatSnackBar);

  constructor() {
    this.applyForm = this.fb.group({
      coverLetter: ['', Validators.required]
    });
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.offerService.getOffer(id).subscribe({
      next: (offer) => { this.offer = offer; this.loading = false; },
      error: () => { this.loading = false; this.router.navigate(['/offers']); }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedCv = input.files?.[0] ?? null;
  }

  apply() {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    if (this.applyForm.invalid) return;
    if (!this.selectedCv) {
      this.snack.open('Veuillez joindre votre CV (PDF/DOC).', 'Fermer', { duration: 4000 });
      return;
    }
    this.applying = true;
    const { coverLetter } = this.applyForm.value;
    this.applicationService.apply(this.offer!.id, coverLetter || undefined, this.selectedCv).subscribe({
      next: () => {
        this.applying = false;
        this.showApplyForm = false;
        this.selectedCv = null;
        this.snack.open('Candidature envoyée avec succès !', 'Fermer', { duration: 4000, panelClass: 'snack-success' });
      },
      error: (err: { error?: { message?: string } }) => {
        this.applying = false;
        const msg = err.error?.message ?? "Erreur lors de l'envoi.";
        this.snack.open(msg, 'Fermer', { duration: 5000, panelClass: 'snack-error' });
      }
    });
  }
}
