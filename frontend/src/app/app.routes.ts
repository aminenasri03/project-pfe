import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/offers', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'offers',
    loadComponent: () => import('./features/offers/offer-list/offer-list.component').then(m => m.OfferListComponent)
  },
  {
    path: 'offers/:id',
    loadComponent: () => import('./features/offers/offer-detail/offer-detail.component').then(m => m.OfferDetailComponent)
  },
  {
    path: 'my-applications',
    canActivate: [authGuard, roleGuard('CANDIDATE')],
    loadComponent: () => import('./features/applications/my-applications/my-applications.component').then(m => m.MyApplicationsComponent)
  },
  {
    path: 'recruiter',
    canActivate: [authGuard, roleGuard('RECRUITER', 'ADMIN')],
    loadComponent: () => import('./features/recruiter/recruiter-dashboard/recruiter-dashboard.component').then(m => m.RecruiterDashboardComponent)
  },
  {
    path: 'recruiter/application/:id',
    canActivate: [authGuard, roleGuard('RECRUITER', 'ADMIN')],
    loadComponent: () => import('./features/recruiter/application-detail/application-detail.component').then(m => m.ApplicationDetailComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard('ADMIN')],
    loadComponent: () => import('./features/admin/admin-panel/admin-panel.component').then(m => m.AdminPanelComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'unauthorized',
    loadComponent: () => import('./shared/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
  },
  { path: '**', redirectTo: '/offers' }
];
