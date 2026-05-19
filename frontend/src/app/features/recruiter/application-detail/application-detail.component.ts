import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { ApplicationService } from '../../../core/services/application.service';
import { EvaluationService } from '../../../core/services/evaluation.service';
import { Application } from '../../../core/models/application.model';
import { Evaluation } from '../../../core/models/evaluation.model';

@Component({
  selector: 'app-application-detail',
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
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './application-detail.component.html',
  styleUrl: './application-detail.component.scss'
})
export class ApplicationDetailComponent implements OnInit {
  application: Application | null = null;
  evaluations: Evaluation[] = [];
  loadingApp = true;
  loadingEvals = false;
  savingEval = false;
  downloadingCv = false;

  evalForm!: FormGroup;
  evalColumns = ['evaluator', 'score', 'decision', 'comments', 'createdAt'];

  applicationStatuses = [
    { value: 'UNDER_REVIEW', label: 'En examen' },
    { value: 'SHORTLISTED', label: 'Présélectionné(e)' },
    { value: 'INTERVIEW_SCHEDULED', label: 'Entretien planifié' },
    { value: 'ACCEPTED', label: 'Acceptée' },
    { value: 'REJECTED', label: 'Refusée' }
  ];

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private appService = inject(ApplicationService);
  private evalService = inject(EvaluationService);
  private fb = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  constructor() {
    this.evalForm = this.fb.group({
      score: [null],
      comments: [''],
      decision: ['']
    });
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.appService.getApplicationById(id).subscribe({
      next: (app) => {
        this.application = app;
        this.loadingApp = false;
        this.loadEvaluations();
      },
      error: () => {
        this.loadingApp = false;
        this.snack.open('Candidature introuvable.', 'OK', { duration: 3000 });
        this.router.navigate(['/recruiter']);
      }
    });
  }

  loadEvaluations() {
    if (!this.application) return;
    this.loadingEvals = true;
    this.evalService.getByApplication(this.application.id).subscribe({
      next: (evals) => { this.evaluations = evals; this.loadingEvals = false; },
      error: () => { this.loadingEvals = false; }
    });
  }

  submitEvaluation() {
    if (!this.application) return;
    this.savingEval = true;
    const v = this.evalForm.value;
    const req = {
      applicationId: this.application.id,
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

  downloadCv() {
    if (!this.application?.cvFileName) return;
    this.downloadingCv = true;
    this.appService.downloadCv(this.application.id).subscribe({
      next: (response) => {
        const blob = response.body!;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.application!.cvFileName ?? 'cv.pdf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.downloadingCv = false;
      },
      error: () => {
        this.downloadingCv = false;
        this.snack.open('Erreur lors du téléchargement du CV.', 'OK', { duration: 3000 });
      }
    });
  }

  updateStatus(status: string) {
    if (!this.application) return;
    this.appService.updateStatus(this.application.id, status).subscribe({
      next: (updated) => {
        this.application = updated;
        this.snack.open('Statut mis à jour.', 'OK', { duration: 3000 });
      },
      error: () => this.snack.open('Erreur.', 'OK', { duration: 3000 })
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      SUBMITTED: 'Soumise', UNDER_REVIEW: 'En examen', SHORTLISTED: 'Présélectionné(e)',
      INTERVIEW_SCHEDULED: 'Entretien planifié', ACCEPTED: 'Acceptée',
      REJECTED: 'Refusée', WITHDRAWN: 'Retirée'
    };
    return map[status] ?? status;
  }

  goBack() {
    this.router.navigate(['/recruiter']);
  }
}
