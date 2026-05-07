import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { OfferService } from '../../../core/services/offer.service';
import { ApplicationService } from '../../../core/services/application.service';
import { EvaluationService } from '../../../core/services/evaluation.service';
import { InterviewService } from '../../../core/services/interview.service';
import { JobOffer, OfferStatus } from '../../../core/models/offer.model';
import { Application } from '../../../core/models/application.model';
import { Evaluation } from '../../../core/models/evaluation.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-recruiter-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTabsModule,
    MatBadgeModule
  ],
  templateUrl: './recruiter-dashboard.component.html',
  styleUrl: './recruiter-dashboard.component.scss'
})
export class RecruiterDashboardComponent implements OnInit {
  offers: JobOffer[] = [];
  applications: Application[] = [];
  loadingOffers = true;
  loadingApps = true;
  showOfferForm = false;
  editingOffer: JobOffer | null = null;

  offerColumns = ['title', 'department', 'status', 'createdAt', 'actions'];
  appColumns = ['candidate', 'offer', 'appliedAt', 'status', 'actions'];

  // Evaluations state
  selectedAppId: number | null = null;
  evaluations: Evaluation[] = [];
  loadingEvals = false;
  savingEval = false;
  evalColumns = ['evaluator', 'score', 'decision', 'comments', 'createdAt'];
  evalForm!: FormGroup;

  // Interview scheduling state
  interviewTargetApp: Application | null = null;
  savingInterview = false;
  interviewForm!: FormGroup;

  offerForm!: FormGroup;

  departments = ['IT', 'RH', 'Finance', 'Marketing', 'Commercial', 'Opérations', 'Juridique'];
  contractTypes = ['CDI', 'CDD', 'Stage', 'Alternance', 'Freelance'];

  applicationStatuses = [
    { value: 'UNDER_REVIEW', label: 'En examen' },
    { value: 'SHORTLISTED', label: 'Présélectionné(e)' },
    { value: 'INTERVIEW_SCHEDULED', label: 'Entretien planifié' },
    { value: 'ACCEPTED', label: 'Acceptée' },
    { value: 'REJECTED', label: 'Refusée' }
  ];

  private offerService = inject(OfferService);
  private appService = inject(ApplicationService);
  private evalService = inject(EvaluationService);
  private interviewService = inject(InterviewService);
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);

  constructor() {
    this.offerForm = this.fb.group({
      title: ['', Validators.required],
      department: ['', Validators.required],
      location: ['', Validators.required],
      contractType: ['CDI', Validators.required],
      requiredSkills: [''],
      description: ['', Validators.required],
      closesAt: [null as string | null]
    });
    this.evalForm = this.fb.group({
      score: [null],
      comments: [''],
      decision: ['']
    });
    this.interviewForm = this.fb.group({
      scheduledAt: ['', Validators.required],
      mode: ['VIDEO'],
      location: [''],
      notes: ['']
    });
  }

  ngOnInit() {
    this.loadOffers();
    // loadApplications is called after loadOffers succeeds
  }

  loadOffers() {
    this.loadingOffers = true;
    this.offerService.getMyOffers().subscribe({
      next: (offers) => {
        this.offers = offers;
        this.loadingOffers = false;
        this.cdr.detectChanges();
        this.loadApplications();
      },
      error: () => { this.loadingOffers = false; this.cdr.detectChanges(); }
    });
  }

  loadApplications() {
    this.loadingApps = true;
    if (this.offers.length === 0) {
      this.applications = [];
      this.loadingApps = false;
      this.cdr.detectChanges();
      return;
    }
    forkJoin(this.offers.map(o => this.appService.getApplicationsByOffer(o.id))).subscribe({
      next: (pages) => {
        this.applications = pages.flatMap(p => p.content);
        this.loadingApps = false;
        this.cdr.detectChanges();
      },
      error: () => { this.loadingApps = false; this.cdr.detectChanges(); }
    });
  }

  startCreate() {
    this.editingOffer = null;
    this.offerForm.reset({ contractType: 'CDI' });
    this.showOfferForm = true;
  }

  startEdit(offer: JobOffer) {
    this.editingOffer = offer;
    this.offerForm.patchValue({
      title: offer.title,
      department: offer.department,
      location: offer.location,
      contractType: offer.contractType,
      requiredSkills: offer.requiredSkills ?? '',
      description: offer.description,
      closesAt: offer.closesAt ? offer.closesAt.substring(0, 10) : null
    });
    this.showOfferForm = true;
  }

  saveOffer() {
    if (this.offerForm.invalid) return;
    const v = this.offerForm.value;
    const data: Partial<JobOffer> = {
      title: v.title,
      description: v.description,
      department: v.department,
      location: v.location,
      contractType: v.contractType,
      requiredSkills: v.requiredSkills || undefined,
      status: this.editingOffer?.status ?? 'DRAFT',
      closesAt: v.closesAt ? `${v.closesAt}T00:00:00` : undefined
    };
    const obs = this.editingOffer
      ? this.offerService.updateOffer(this.editingOffer.id, data)
      : this.offerService.createOffer(data);

    obs.subscribe({
      next: () => {
        this.snack.open(this.editingOffer ? 'Offre mise à jour.' : 'Offre créée.', 'OK', { duration: 3000 });
        this.showOfferForm = false;
        this.loadOffers();
      },
      error: (e) => this.snack.open(e.error?.message ?? 'Erreur.', 'OK', { duration: 4000 })
    });
  }

  publishOffer(offer: JobOffer) {
    this.offerService.setOfferStatus(offer, 'OPEN').subscribe({
      next: () => { this.snack.open('Offre publiée.', 'OK', { duration: 3000 }); this.loadOffers(); },
      error: () => this.snack.open('Erreur.', 'OK', { duration: 3000 })
    });
  }

  closeOffer(offer: JobOffer) {
    const ref = this.dialog.open(ConfirmDialogComponent, { data: { message: `Fermer l'offre "${offer.title}" ?` } });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.offerService.setOfferStatus(offer, 'CLOSED').subscribe({
        next: () => { this.snack.open('Offre fermée.', 'OK', { duration: 3000 }); this.loadOffers(); },
        error: () => this.snack.open('Erreur.', 'OK', { duration: 3000 })
      });
    });
  }

  deleteOffer(offer: JobOffer) {
    const ref = this.dialog.open(ConfirmDialogComponent, { data: { message: `Supprimer l'offre "${offer.title}" ?` } });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.offerService.deleteOffer(offer.id).subscribe({
        next: () => { this.snack.open('Offre supprimée.', 'OK', { duration: 3000 }); this.loadOffers(); },
        error: () => this.snack.open('Erreur.', 'OK', { duration: 3000 })
      });
    });
  }

  updateAppStatus(app: Application, status: string) {
    this.appService.updateStatus(app.id, status).subscribe({
      next: () => { this.snack.open('Statut mis à jour.', 'OK', { duration: 3000 }); this.loadApplications(); },
      error: () => this.snack.open('Erreur.', 'OK', { duration: 3000 })
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      SUBMITTED: 'Soumise', UNDER_REVIEW: 'En examen', SHORTLISTED: 'Présélectionné(e)',
      INTERVIEW_SCHEDULED: 'Entretien planifié', ACCEPTED: 'Acceptée', REJECTED: 'Refusée',
      WITHDRAWN: 'Retirée', OPEN: 'Ouverte', CLOSED: 'Fermée', DRAFT: 'Brouillon'
    };
    return map[status] ?? status;
  }

  get pendingCount() {
    return this.applications.filter(a => a.status === 'SUBMITTED').length;
  }

  loadEvaluations() {
    if (!this.selectedAppId) return;
    this.loadingEvals = true;
    this.evalService.getByApplication(this.selectedAppId).subscribe({
      next: (evals) => { this.evaluations = evals; this.loadingEvals = false; this.cdr.detectChanges(); },
      error: () => { this.loadingEvals = false; this.cdr.detectChanges(); }
    });
  }

  submitEvaluation() {
    if (!this.selectedAppId) return;
    this.savingEval = true;
    const v = this.evalForm.value;
    const req = {
      applicationId: this.selectedAppId,
      score: v.score !== null && v.score !== '' ? Number(v.score) : undefined,
      comments: v.comments || undefined,
      decision: v.decision || undefined
    };
    this.evalService.create(req).subscribe({
      next: () => {
        this.savingEval = false;
        this.evalForm.reset({ score: null, comments: '', decision: '' });
        this.snack.open('Évaluation enregistrée.', 'OK', { duration: 3000 });
        this.loadEvaluations();
      },
      error: (err: { error?: { message?: string } }) => {
        this.savingEval = false;
        this.snack.open(err.error?.message ?? 'Erreur.', 'OK', { duration: 3000 });
      }
    });
  }

  openInterviewForm(app: Application) {
    this.interviewTargetApp = app;
    this.interviewForm.reset({ scheduledAt: '', mode: 'VIDEO', location: '', notes: '' });
  }

  submitInterview() {
    if (!this.interviewTargetApp || this.interviewForm.invalid) return;
    this.savingInterview = true;
    const v = this.interviewForm.value;
    // datetime-local gives 'YYYY-MM-DDTHH:mm', backend needs LocalDateTime (same ISO format)
    this.interviewService.scheduleInterview({
      applicationId: this.interviewTargetApp.id,
      scheduledAt: v.scheduledAt,
      mode: v.mode || undefined,
      location: v.location || undefined,
      notes: v.notes || undefined
    }).subscribe({
      next: () => {
        this.savingInterview = false;
        this.interviewTargetApp = null;
        this.snack.open('Entretien planifié.', 'OK', { duration: 3000 });
        // auto-update status to INTERVIEW_SCHEDULED
        this.loadApplications();
      },
      error: (err: { error?: { message?: string } }) => {
        this.savingInterview = false;
        this.snack.open(err.error?.message ?? 'Erreur lors de la planification.', 'OK', { duration: 3000 });
      }
    });
  }
}
