import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, RouterModule],
  template: `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:60vh;gap:16px">
      <mat-icon style="font-size:72px;height:72px;width:72px;color:#C8102E">lock</mat-icon>
      <h1 style="color:#1D1D1B;font-weight:800;letter-spacing:-0.3px">Accès refusé</h1>
      <p style="color:#6B7280;font-size:0.95rem">Vous n'avez pas les droits pour accéder à cette page.</p>
      <button mat-raised-button color="primary" routerLink="/offers">Retour aux offres</button>
    </div>
  `
})
export class UnauthorizedComponent {}
