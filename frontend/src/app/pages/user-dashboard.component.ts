import { Component, OnInit, inject }     from '@angular/core';
import { CommonModule }                  from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService, BmiRecord }         from '../core/api.service';

// ── BMI category helpers ──────────────────────────────────────────────────────

interface BmiCategory {
  label: string;
  color: string;
  range: string;
}

const BMI_CATEGORIES: BmiCategory[] = [
  { label: 'Underweight', color: '#f59e0b', range: '< 18.5'    },
  { label: 'Normal',      color: '#10b981', range: '18.5–24.9' },
  { label: 'Overweight',  color: '#f97316', range: '25–29.9'   },
  { label: 'Obese',       color: '#ef4444', range: '≥ 30'      },
];

function categoryForBmi(bmi: number): BmiCategory {
  if (bmi < 18.5) return BMI_CATEGORIES[0];
  if (bmi < 25)   return BMI_CATEGORIES[1];
  if (bmi < 30)   return BMI_CATEGORIES[2];
  return BMI_CATEGORIES[3];
}

// ── Sort / Pagination types ───────────────────────────────────────────────────

type SortField     = 'createdAt' | 'bmi' | 'weightKg' | 'heightCm';
type SortDirection = 'asc' | 'desc';

// ── Summary model ─────────────────────────────────────────────────────────────

interface CategoryCount {
  label:      string;
  color:      string;
  count:      number;
  percentage: number;
}

interface BmiSummary {
  totalRecords:    number;
  averageBmi:      number;
  minBmi:          number;
  maxBmi:          number;
  currentCategory: BmiCategory;
  categoryCounts:  CategoryCount[];
}

const EMPTY_SUMMARY: BmiSummary = {
  totalRecords: 0, averageBmi: 0, minBmi: 0, maxBmi: 0,
  currentCategory: BMI_CATEGORIES[1], categoryCounts: [],
};

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

// ── Component ─────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <section class="top-grid">

      <!-- ── BMI entry form ──────────────────────────────────────────── -->
      <article class="card">
        <h2>{{ isEditing ? 'Edit BMI Record' : 'Log BMI' }}</h2>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <label>Height (cm)
            <input type="number" formControlName="heightCm" min="50" max="300" />
          </label>
          <label>Weight (kg)
            <input type="number" formControlName="weightKg" min="10" max="500" />
          </label>
          <div class="btn-row">
            <button type="submit" class="primary">{{ isEditing ? 'Update' : 'Save' }}</button>
            <button *ngIf="isEditing" type="button" class="secondary" (click)="cancelEdit()">Cancel</button>
          </div>
        </form>

        <!-- Real-time BMI preview -->
        <div *ngIf="previewBmi > 0" class="preview-card" [style.border-color]="previewCategory.color">
          <div class="preview-left">
            <span class="bmi-value">{{ previewBmi }}</span>
            <span class="bmi-label">BMI</span>
          </div>
          <div class="preview-right">
            <span class="badge" [style.background]="previewCategory.color">{{ previewCategory.label }}</span>
            <span class="bmi-range">{{ previewCategory.range }}</span>
          </div>
        </div>
      </article>

      <!-- ── Analytics summary ───────────────────────────────────────── -->
      <article class="card" *ngIf="summary.totalRecords > 0">
        <h2>My Analytics</h2>
        <div class="metrics-row">
          <div class="metric"><span class="metric-value">{{ summary.totalRecords }}</span><span class="metric-label">Records</span></div>
          <div class="metric"><span class="metric-value">{{ summary.averageBmi | number:'1.1-1' }}</span><span class="metric-label">Avg BMI</span></div>
          <div class="metric"><span class="metric-value">{{ summary.minBmi | number:'1.1-1' }}</span><span class="metric-label">Lowest</span></div>
          <div class="metric"><span class="metric-value">{{ summary.maxBmi | number:'1.1-1' }}</span><span class="metric-label">Highest</span></div>
        </div>
        <div class="current-status">
          <span class="status-label">Current status</span>
          <span class="badge lg" [style.background]="summary.currentCategory.color">{{ summary.currentCategory.label }}</span>
          <span class="status-range">{{ summary.currentCategory.range }}</span>
        </div>
        <div class="breakdown-section">
          <p class="section-title">Category breakdown</p>
          <div class="trend-bar">
            <div *ngFor="let cat of summary.categoryCounts" class="trend-segment"
                 [style.flex]="cat.count" [style.background]="cat.color"
                 [title]="cat.label + ': ' + cat.count + ' (' + cat.percentage + '%)'"></div>
          </div>
          <div class="category-legend">
            <div class="legend-item" *ngFor="let cat of summary.categoryCounts">
              <span class="legend-dot" [style.background]="cat.color"></span>
              <span class="legend-text">{{ cat.label }}</span>
              <span class="legend-count">{{ cat.count }} <span class="legend-pct">({{ cat.percentage }}%)</span></span>
            </div>
          </div>
        </div>
        <div class="bmi-scale">
          <p class="section-title">BMI reference scale</p>
          <div class="scale-bar">
            <div *ngFor="let cat of bmiCategories" class="scale-segment"
                 [style.background]="cat.color" [title]="cat.label + ' ' + cat.range">
              <span class="scale-label">{{ cat.label }}</span>
              <span class="scale-range">{{ cat.range }}</span>
            </div>
          </div>
          <div class="scale-indicator" *ngIf="indicatorPercent >= 0" [style.left]="indicatorPercent + '%'">▲</div>
        </div>
      </article>
    </section>

    <!-- ── History table with sorting & pagination ─────────────────────── -->
    <article class="card history-card">
      <div class="history-header">
        <h2>My BMI History</h2>
        <div class="filter-row">
          <label>From <input type="date" [(ngModel)]="filterFrom" /></label>
          <label>To   <input type="date" [(ngModel)]="filterTo"   /></label>
          <button class="primary sm"   (click)="applyFilter()">Filter</button>
          <button class="secondary sm" (click)="clearFilter()">Clear</button>
        </div>
      </div>

      <!-- Toolbar: page size + record count -->
      <div class="table-toolbar" *ngIf="allHistory.length > 0">
        <span class="record-count">{{ allHistory.length }} record{{ allHistory.length !== 1 ? 's' : '' }}</span>
        <label class="page-size-select">
          Show
          <select [(ngModel)]="pageSize" (ngModelChange)="onPageSizeChange()">
            <option *ngFor="let n of pageSizeOptions" [value]="n">{{ n }}</option>
          </select>
          per page
        </label>
      </div>

      <table *ngIf="pagedHistory.length; else emptyHistory">
        <thead>
          <tr>
            <th class="sortable" (click)="sortBy('createdAt')">
              Date {{ sortIcon('createdAt') }}
            </th>
            <th class="sortable" (click)="sortBy('heightCm')">
              Height {{ sortIcon('heightCm') }}
            </th>
            <th class="sortable" (click)="sortBy('weightKg')">
              Weight {{ sortIcon('weightKg') }}
            </th>
            <th class="sortable" (click)="sortBy('bmi')">
              BMI {{ sortIcon('bmi') }}
            </th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let record of pagedHistory">
            <td>{{ record.createdAt | date:'mediumDate' }}</td>
            <td>{{ record.heightCm }} cm</td>
            <td>{{ record.weightKg }} kg</td>
            <td><strong>{{ record.bmi }}</strong></td>
            <td>
              <span class="badge" [style.background]="categoryForBmi(record.bmi).color">
                {{ categoryForBmi(record.bmi).label }}
              </span>
            </td>
            <td class="action-cell">
              <button class="icon-btn" title="Edit"   (click)="startEdit(record)">✏️</button>
              <button class="icon-btn" title="Delete" (click)="openDeleteModal(record.id)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination controls -->
      <div class="pagination" *ngIf="totalPages > 1">
        <button class="page-btn" (click)="goToPage(1)"           [disabled]="currentPage === 1">«</button>
        <button class="page-btn" (click)="goToPage(currentPage - 1)" [disabled]="currentPage === 1">‹</button>

        <button *ngFor="let p of pageNumbers" class="page-btn"
                [class.active]="p === currentPage" (click)="goToPage(p)">
          {{ p }}
        </button>

        <button class="page-btn" (click)="goToPage(currentPage + 1)" [disabled]="currentPage === totalPages">›</button>
        <button class="page-btn" (click)="goToPage(totalPages)"      [disabled]="currentPage === totalPages">»</button>

        <span class="page-info">Page {{ currentPage }} of {{ totalPages }}</span>
      </div>

      <ng-template #emptyHistory>
        <p class="empty-state">
          {{ filterFrom || filterTo ? 'No records in this date range.' : 'No BMI records yet — log your first entry above.' }}
        </p>
      </ng-template>
    </article>

    <!-- ── Delete confirmation modal ──────────────────────────────────── -->
    <div class="modal-overlay" *ngIf="pendingDeleteId !== null" (click)="pendingDeleteId = null">
      <div class="modal" (click)="$event.stopPropagation()">
        <h3>Delete this record?</h3>
        <p>This action cannot be undone.</p>
        <div class="btn-row">
          <button class="danger"    (click)="confirmDelete()">Delete</button>
          <button class="secondary" (click)="pendingDeleteId = null">Cancel</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .top-grid    { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1rem; }
    .history-card { margin-top: 1rem; }
    .card { background: #fff; border-radius: 12px; padding: 1.25rem; box-shadow: 0 4px 20px rgba(0,0,0,.08); }
    h2 { margin: 0 0 .9rem; font-size: 1.05rem; color: #1e3a5f; }

    label { display: block; margin-top: .6rem; font-size: .85rem; color: #4b6080; }
    input[type=number], input[type=date] {
      display: block; width: 100%; padding: .45rem .6rem; margin-top: .25rem;
      border: 1px solid #c9d4e2; border-radius: 8px; box-sizing: border-box; font-size: .95rem; outline: none;
    }
    input:focus { border-color: #0f67c4; }

    .btn-row { display: flex; gap: .6rem; margin-top: .85rem; flex-wrap: wrap; }
    button.primary   { border: none; border-radius: 8px; padding: .55rem 1.1rem; background: #0f67c4; color: #fff; cursor: pointer; font-size: .9rem; }
    button.secondary { border: 1px solid #c9d4e2; border-radius: 8px; padding: .55rem 1.1rem; background: #f5f8fc; color: #3a5173; cursor: pointer; font-size: .9rem; }
    button.danger    { border: none; border-radius: 8px; padding: .55rem 1.1rem; background: #ef4444; color: #fff; cursor: pointer; font-size: .9rem; }
    button.sm        { padding: .35rem .75rem; font-size: .82rem; }

    .preview-card { display: flex; align-items: center; gap: 1rem; margin-top: 1rem; padding: .85rem 1rem; border-radius: 10px; border: 2px solid; }
    .preview-left  { display: flex; flex-direction: column; align-items: center; }
    .preview-right { display: flex; flex-direction: column; gap: .3rem; }
    .bmi-value { font-size: 2.2rem; font-weight: 700; color: #1e3a5f; line-height: 1; }
    .bmi-label { font-size: .75rem; color: #6b84a0; text-transform: uppercase; letter-spacing: .05em; }
    .bmi-range { font-size: .78rem; color: #6b84a0; }

    .badge    { display: inline-block; padding: .2rem .7rem; border-radius: 20px; color: #fff; font-size: .8rem; font-weight: 600; white-space: nowrap; }
    .badge.lg { padding: .3rem 1rem; font-size: .9rem; }

    .metrics-row  { display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .metric       { display: flex; flex-direction: column; min-width: 60px; }
    .metric-value { font-size: 1.5rem; font-weight: 700; color: #1e3a5f; }
    .metric-label { font-size: .72rem; color: #6b84a0; text-transform: uppercase; letter-spacing: .04em; }

    .current-status { display: flex; align-items: center; gap: .6rem; padding: .6rem .8rem; background: #f5f8fc; border-radius: 8px; margin-bottom: 1rem; }
    .status-label   { font-size: .8rem; color: #6b84a0; }
    .status-range   { font-size: .78rem; color: #6b84a0; margin-left: auto; }

    .breakdown-section { margin-bottom: 1rem; }
    .section-title { font-size: .78rem; color: #6b84a0; text-transform: uppercase; letter-spacing: .05em; margin: 0 0 .5rem; }
    .trend-bar     { display: flex; height: 14px; border-radius: 7px; overflow: hidden; gap: 2px; margin-bottom: .65rem; }
    .trend-segment { min-width: 6px; border-radius: 4px; }
    .category-legend { display: flex; flex-direction: column; gap: .3rem; }
    .legend-item  { display: flex; align-items: center; gap: .5rem; font-size: .82rem; }
    .legend-dot   { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
    .legend-text  { color: #3a5173; flex: 1; }
    .legend-count { color: #1e3a5f; font-weight: 600; }
    .legend-pct   { font-weight: 400; color: #6b84a0; }

    .bmi-scale { position: relative; padding-bottom: 1.2rem; }
    .scale-bar { display: flex; height: 28px; border-radius: 8px; overflow: hidden; gap: 2px; }
    .scale-segment { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; }
    .scale-label { font-size: .6rem; font-weight: 700; color: #fff; line-height: 1; }
    .scale-range { font-size: .55rem; color: rgba(255,255,255,.85); }
    .scale-indicator { position: absolute; bottom: 0; transform: translateX(-50%); font-size: .8rem; color: #1e3a5f; transition: left .3s ease; }

    .history-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: .6rem; margin-bottom: .75rem; }
    .filter-row { display: flex; flex-wrap: wrap; gap: .5rem; align-items: flex-end; }
    .filter-row label { margin: 0; display: flex; gap: .35rem; align-items: center; font-size: .82rem; }
    .filter-row input { width: 130px; margin: 0; display: inline-block; padding: .3rem .5rem; }

    /* Table toolbar */
    .table-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: .6rem; font-size: .82rem; color: #6b84a0; }
    .record-count  { }
    .page-size-select { display: flex; align-items: center; gap: .4rem; }
    .page-size-select select { border: 1px solid #c9d4e2; border-radius: 6px; padding: .2rem .4rem; font-size: .82rem; }

    table { width: 100%; border-collapse: collapse; }
    th { font-size: .78rem; color: #6b84a0; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; }
    th.sortable { cursor: pointer; user-select: none; }
    th.sortable:hover { color: #0f67c4; }
    th, td { text-align: left; border-bottom: 1px solid #eef2f9; padding: .55rem .4rem; }
    tr:last-child td { border-bottom: none; }

    .action-cell { white-space: nowrap; }
    .icon-btn { background: none; border: none; cursor: pointer; font-size: 1rem; padding: .2rem .3rem; border-radius: 6px; transition: background .15s; }
    .icon-btn:hover { background: #f0f4fc; }
    .empty-state { color: #8fa3be; text-align: center; padding: 1.8rem 0; }

    /* Pagination */
    .pagination { display: flex; align-items: center; gap: .3rem; margin-top: .8rem; flex-wrap: wrap; }
    .page-btn   { border: 1px solid #c9d4e2; border-radius: 6px; padding: .3rem .6rem; background: #fff; cursor: pointer; font-size: .85rem; min-width: 32px; text-align: center; }
    .page-btn:hover:not(:disabled) { background: #e8f0fb; border-color: #0f67c4; }
    .page-btn.active { background: #0f67c4; color: #fff; border-color: #0f67c4; }
    .page-btn:disabled { opacity: .4; cursor: not-allowed; }
    .page-info  { margin-left: .5rem; font-size: .8rem; color: #6b84a0; }

    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
    .modal { background: #fff; border-radius: 14px; padding: 1.5rem 2rem; max-width: 340px; width: 90%; box-shadow: 0 8px 40px rgba(0,0,0,.2); }
    .modal h3 { margin: 0 0 .5rem; }
    .modal p  { color: #6b84a0; margin-bottom: 1rem; }
  `]
})
export class UserDashboardComponent implements OnInit {

  private readonly api = inject(ApiService);
  private readonly fb  = inject(FormBuilder);

  readonly bmiCategories  = BMI_CATEGORIES;
  readonly categoryForBmi = categoryForBmi;
  readonly pageSizeOptions = PAGE_SIZE_OPTIONS;

  // Full unsliced list (after filter)
  allHistory:   BmiRecord[] = [];
  // Current page slice
  pagedHistory: BmiRecord[] = [];

  summary: BmiSummary = EMPTY_SUMMARY;

  isEditing        = false;
  editingRecordId: number | null = null;
  pendingDeleteId: number | null = null;

  filterFrom = '';
  filterTo   = '';

  // Sorting
  sortField:     SortField     = 'createdAt';
  sortDirection: SortDirection = 'desc';

  // Pagination
  currentPage = 1;
  pageSize    = 10;

  form = this.fb.group({
    heightCm: [170, [Validators.required, Validators.min(50),  Validators.max(300)]],
    weightKg: [70,  [Validators.required, Validators.min(10),  Validators.max(500)]]
  });

  // ── Computed ────────────────────────────────────────────────────────────

  get previewBmi(): number {
    const { heightCm, weightKg } = this.form.getRawValue();
    if (!heightCm || !weightKg || this.form.invalid) return 0;
    const h = heightCm / 100;
    return Math.round((weightKg / (h * h)) * 100) / 100;
  }

  get previewCategory(): BmiCategory { return categoryForBmi(this.previewBmi); }

  get indicatorPercent(): number {
    const bmi = this.previewBmi || this.summary.averageBmi;
    if (!bmi) return -1;
    return Math.min(100, Math.max(0, ((bmi - 10) / 30) * 100));
  }

  get totalPages(): number {
    return Math.ceil(this.allHistory.length / this.pageSize);
  }

  get pageNumbers(): number[] {
    const delta = 2;
    const start = Math.max(1, this.currentPage - delta);
    const end   = Math.min(this.totalPages, this.currentPage + delta);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  ngOnInit(): void { this.loadHistory(); }

  // ── Sorting ──────────────────────────────────────────────────────────────

  sortBy(field: SortField): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField     = field;
      this.sortDirection = 'desc';
    }
    this.currentPage = 1;
    this.applySortAndPage();
  }

  sortIcon(field: SortField): string {
    if (this.sortField !== field) return '⇅';
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  // ── Pagination ───────────────────────────────────────────────────────────

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.applyPage();
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
    this.applyPage();
  }

  // ── Form actions ─────────────────────────────────────────────────────────

  submit(): void {
    if (this.form.invalid) return;
    const { heightCm, weightKg } = this.form.getRawValue();

    if (this.isEditing && this.editingRecordId !== null) {
      this.api.updateBmiRecord(this.editingRecordId, heightCm!, weightKg!).subscribe(() => {
        this.cancelEdit();
        this.loadHistory();
      });
    } else {
      this.api.createBmiRecord(heightCm!, weightKg!).subscribe(() => this.loadHistory());
    }
  }

  startEdit(record: BmiRecord): void {
    this.isEditing       = true;
    this.editingRecordId = record.id;
    this.form.patchValue({ heightCm: record.heightCm, weightKg: record.weightKg });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit(): void {
    this.isEditing       = false;
    this.editingRecordId = null;
    this.form.patchValue({ heightCm: 170, weightKg: 70 });
  }

  // ── Delete actions ────────────────────────────────────────────────────────

  openDeleteModal(recordId: number): void { this.pendingDeleteId = recordId; }

  confirmDelete(): void {
    if (this.pendingDeleteId === null) return;
    this.api.deleteBmiRecord(this.pendingDeleteId).subscribe(() => {
      this.pendingDeleteId = null;
      this.loadHistory();
    });
  }

  // ── Filter actions ────────────────────────────────────────────────────────

  applyFilter(): void { this.loadHistory(this.filterFrom, this.filterTo); }
  clearFilter(): void { this.filterFrom = ''; this.filterTo = ''; this.loadHistory(); }

  // ── Private helpers ───────────────────────────────────────────────────────

  private loadHistory(from = '', to = ''): void {
    this.api.getBmiHistory(from || undefined, to || undefined).subscribe(records => {
      this.summary    = this.buildSummary(records);
      this.allHistory = records;
      this.currentPage = 1;
      this.applySortAndPage();
    });
  }

  private applySortAndPage(): void {
    this.allHistory = this.sortRecords(this.allHistory);
    this.applyPage();
  }

  private applyPage(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedHistory = this.allHistory.slice(start, start + this.pageSize);
  }

  private sortRecords(records: BmiRecord[]): BmiRecord[] {
    return [...records].sort((a, b) => {
      const aVal = this.fieldValue(a);
      const bVal = this.fieldValue(b);
      const order = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return this.sortDirection === 'asc' ? order : -order;
    });
  }

  private fieldValue(record: BmiRecord): number | string {
    if (this.sortField === 'createdAt') return record.createdAt;
    return record[this.sortField];
  }

  private buildSummary(records: BmiRecord[]): BmiSummary {
    if (!records.length) return EMPTY_SUMMARY;
    const bmiValues  = records.map(r => r.bmi);
    const totalBmi   = bmiValues.reduce((sum, v) => sum + v, 0);
    return {
      totalRecords:    records.length,
      averageBmi:      Math.round((totalBmi / records.length) * 10) / 10,
      minBmi:          Math.min(...bmiValues),
      maxBmi:          Math.max(...bmiValues),
      currentCategory: categoryForBmi(records[0].bmi),
      categoryCounts:  this.countByCategory(records),
    };
  }

  private countByCategory(records: BmiRecord[]): CategoryCount[] {
    const counts = new Map<string, number>(BMI_CATEGORIES.map(c => [c.label, 0]));
    for (const r of records) {
      const label = categoryForBmi(r.bmi).label;
      counts.set(label, (counts.get(label) ?? 0) + 1);
    }
    return BMI_CATEGORIES
      .filter(cat => (counts.get(cat.label) ?? 0) > 0)
      .map(cat => ({
        label:      cat.label,
        color:      cat.color,
        count:      counts.get(cat.label)!,
        percentage: Math.round((counts.get(cat.label)! / records.length) * 100),
      }));
  }
}
