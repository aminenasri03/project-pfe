import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { AdminService } from '../../../core/services/admin.service';
import { User, Role } from '../../../core/models/user.model';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatSnackBarModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatChipsModule,
    MatMenuModule
  ],
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.scss'
})
export class AdminPanelComponent implements OnInit {
  users: User[] = [];
  loadingUsers = true;

  displayedColumns = ['name', 'email', 'role', 'status', 'createdAt', 'actions'];

  constructor(
    private adminService: AdminService,
    private snack: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loadingUsers = true;
    this.adminService.getUsers().subscribe({
      next: (u) => { this.users = u; this.loadingUsers = false; },
      error: () => { this.loadingUsers = false; }
    });
  }

  toggleUser(user: User) {
    const action = user.enabled ? 'désactiver' : 'activer';
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { message: `Voulez-vous ${action} le compte de ${user.firstName} ${user.lastName} ?` }
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.adminService.setUserEnabled(user.id, !user.enabled).subscribe({
        next: () => { this.snack.open(`Compte ${action}.`, 'OK', { duration: 3000 }); this.loadUsers(); },
        error: () => this.snack.open('Erreur.', 'OK', { duration: 3000 })
      });
    });
  }

  deleteUser(user: User) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { message: `Supprimer définitivement le compte de ${user.firstName} ${user.lastName} ?` }
    });
    ref.afterClosed().subscribe(ok => {
      if (!ok) return;
      this.adminService.deleteUser(user.id).subscribe({
        next: () => { this.snack.open('Utilisateur supprimé.', 'OK', { duration: 3000 }); this.loadUsers(); },
        error: () => this.snack.open('Erreur.', 'OK', { duration: 3000 })
      });
    });
  }

  roleClass(role: string): string {
    return role.toLowerCase();
  }

  readonly allRoles: Role[] = ['ADMIN', 'RECRUITER', 'CANDIDATE'];

  changeRole(user: User, newRole: Role) {
    if (user.role === newRole) return;
    const oldBackendRole = `ROLE_${user.role}`;
    const newBackendRole = `ROLE_${newRole}`;
    this.adminService.removeRole(user.id, oldBackendRole).subscribe({
      next: () => {
        this.adminService.addRole(user.id, newBackendRole).subscribe({
          next: (updated) => {
            const idx = this.users.indexOf(user);
            if (idx !== -1) this.users[idx] = updated;
            this.users = [...this.users];
            this.snack.open(`Rôle changé en ${newRole}.`, 'OK', { duration: 3000 });
          },
          error: () => this.snack.open('Erreur lors de l\'attribution du rôle.', 'OK', { duration: 3000 })
        });
      },
      error: () => this.snack.open('Erreur lors de la suppression de l\'ancien rôle.', 'OK', { duration: 3000 })
    });
  }

  get adminCount() { return this.users.filter(u => u.role === 'ADMIN').length; }
  get recruiterCount() { return this.users.filter(u => u.role === 'RECRUITER').length; }
  get candidateCount() { return this.users.filter(u => u.role === 'CANDIDATE').length; }
  get activeCount() { return this.users.filter(u => u.enabled).length; }
}
