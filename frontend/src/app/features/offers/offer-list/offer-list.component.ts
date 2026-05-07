import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, startWith, takeUntil } from 'rxjs/operators';
import { OfferService } from '../../../core/services/offer.service';
import { AuthService } from '../../../core/services/auth.service';
import { JobOffer } from '../../../core/models/offer.model';

@Component({
  selector: 'app-offer-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule
  ],
  templateUrl: './offer-list.component.html',
  styleUrl: './offer-list.component.scss'
})
export class OfferListComponent implements OnInit, OnDestroy {
  offers: JobOffer[] = [];
  totalElements = 0;
  pageSize = 9;
  pageIndex = 0;
  loading = false;

  filterForm!: FormGroup;

  departments = ['IT', 'RH', 'Finance', 'Marketing', 'Commercial', 'Opérations', 'Juridique'];

  private offerService = inject(OfferService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  readonly canSeeDraft = this.authService.isAdmin || this.authService.isRecruiter;
  private destroy$ = new Subject<void>();
  private page$ = new BehaviorSubject<{ index: number; size: number }>({ index: 0, size: 9 });

  constructor() {
    this.filterForm = this.fb.group({
      keyword: [''],
      department: [''],
      status: ['OPEN']
    });
  }

  ngOnInit() {
    const keyword$ = this.filterForm.get('keyword')!.valueChanges.pipe(
      startWith(this.filterForm.get('keyword')!.value),
      debounceTime(400),
      distinctUntilChanged()
    );
    const department$ = this.filterForm.get('department')!.valueChanges.pipe(
      startWith(this.filterForm.get('department')!.value),
      distinctUntilChanged()
    );
    const status$ = this.filterForm.get('status')!.valueChanges.pipe(
      startWith(this.filterForm.get('status')!.value),
      distinctUntilChanged()
    );

    combineLatest([keyword$, department$, status$]).pipe(
      debounceTime(0),
      switchMap(([keyword, department, status]) => {
        this.page$.next({ index: 0, size: this.pageSize });
        this.loading = true;
        return this.offerService.getOffers({
          keyword: keyword || undefined,
          department: department || undefined,
          status: status || undefined,
          page: 0,
          size: this.pageSize
        });
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: (page) => {
        this.pageIndex = 0;
        this.offers = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOffers() {
    this.loading = true;
    const { keyword, department, status } = this.filterForm.value;
    this.offerService.getOffers({
      keyword: keyword || undefined,
      department: department || undefined,
      status: status || undefined,
      page: this.pageIndex,
      size: this.pageSize
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (page) => {
        this.offers = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onPage(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadOffers();
  }

  resetFilters() {
    this.filterForm.reset({ keyword: '', department: '', status: 'OPEN' });
    this.pageIndex = 0;
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = { OPEN: 'Ouverte', CLOSED: 'Fermée', DRAFT: 'Brouillon' };
    return map[status] ?? status;
  }

  statusColor(status: string): string {
    const map: Record<string, string> = { OPEN: 'primary', CLOSED: 'warn', DRAFT: 'accent' };
    return map[status] ?? '';
  }
}
