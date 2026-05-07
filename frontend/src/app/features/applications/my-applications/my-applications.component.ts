import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ApplicationService } from '../../../core/services/application.service';
import { Application } from '../../../core/models/application.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './my-applications.component.html',
  styleUrl: './my-applications.component.scss'
})
export class MyApplicationsComponent implements OnInit {
  applications: Application[] = [];
  loading = true;
  displayedColumns = ['offer', 'department', 'appliedAt', 'status', 'actions'];

  constructor(
    private appService: ApplicationService,
    private snack: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.appService.getMyApplications().subscribe({
      next: (apps) => { this.applications = apps; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  withdraw(app: Application) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { message: `Retirer la candidature pour "${app.offerTitle}" ?` }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.appService.withdraw(app.id).subscribe({
        next: () => {
          this.snack.open('Candidature retirée.', 'OK', { duration: 3000 });
          this.load();
        },
        error: () => this.snack.open('Erreur lors du retrait.', 'OK', { duration: 4000 })
      });
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      SUBMITTED: 'Soumise',
      UNDER_REVIEW: 'En examen',
      SHORTLISTED: 'Présélectionné(e)',
      INTERVIEW_SCHEDULED: 'Entretien planifié',
      ACCEPTED: 'Acceptée',
      REJECTED: 'Refusée',
      WITHDRAWN: 'Retirée'
    };
    return map[status] ?? status;
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      SUBMITTED: 'submitted',
      UNDER_REVIEW: 'under-review',
      SHORTLISTED: 'shortlisted',
      INTERVIEW_SCHEDULED: 'interview',
      ACCEPTED: 'accepted',
      REJECTED: 'rejected',
      WITHDRAWN: 'withdrawn'
    };
    return map[status] ?? '';
  }

  canWithdraw(status: string): boolean {
    return ['SUBMITTED', 'UNDER_REVIEW'].includes(status);
  }
}
