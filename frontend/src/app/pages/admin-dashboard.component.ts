import { Component, OnInit, inject } from '@angular/core';
import { CommonModule }              from '@angular/common';
import { ApiService, AppUser, BmiRecord } from '../core/api.service';

type AdminTab = 'users' | 'bmi';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="card">
      <div class="tabs">
        <button [class.active]="activeTab === 'users'" (click)="activeTab = 'users'">Users</button>
        <button [class.active]="activeTab === 'bmi'"   (click)="activeTab = 'bmi'">BMI by User</button>
      </div>

      <!-- Users tab -->
      <div *ngIf="activeTab === 'users'">
        <h2>User Management</h2>
        <table>
          <thead>
            <tr><th>ID</th><th>Username</th><th>Role</th><th>Action</th></tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.role }}</td>
              <td>
                <button class="danger" (click)="removeUser(user.id)">Remove</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- BMI records tab -->
      <div *ngIf="activeTab === 'bmi'">
        <h2>BMI Records</h2>
        <div class="user-group" *ngFor="let group of groupedBmiRecords | keyvalue">
          <h3>{{ group.key }}</h3>
          <table>
            <thead>
              <tr><th>Date</th><th>Height (cm)</th><th>Weight (kg)</th><th>BMI</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let record of group.value">
                <td>{{ record.createdAt | date:'mediumDate' }}</td>
                <td>{{ record.heightCm }}</td>
                <td>{{ record.weightKg }}</td>
                <td>{{ record.bmi }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .card { background: #fff; border-radius: 12px; padding: 1rem; box-shadow: 0 8px 24px rgba(0,0,0,.08); }
    .tabs { display: flex; gap: .6rem; margin-bottom: 1rem; }
    .tabs button { border: none; border-radius: 8px; padding: .5rem .8rem; background: #d8e7fa; cursor: pointer; }
    .tabs .active { background: #0f67c4; color: #fff; }
    table { width: 100%; border-collapse: collapse; margin-bottom: .8rem; }
    th, td { text-align: left; border-bottom: 1px solid #e3eaf4; padding: .45rem; }
    .danger { background: #c7364d; color: #fff; border: none; border-radius: 8px; padding: .4rem .8rem; cursor: pointer; }
    .user-group { border-top: 1px solid #dfe8f4; padding-top: .8rem; margin-top: .8rem; }
  `]
})
export class AdminDashboardComponent implements OnInit {

  private readonly api = inject(ApiService);

  activeTab: AdminTab = 'users';
  users: AppUser[] = [];
  groupedBmiRecords: Record<string, BmiRecord[]> = {};

  ngOnInit(): void {
    this.loadUsers();
    this.loadBmiRecords();
  }

  removeUser(userId: number): void {
    this.api.deleteUser(userId).subscribe({
      next: () => { this.loadUsers(); this.loadBmiRecords(); }
    });
  }

  private loadUsers(): void {
    this.api.getAllUsers().subscribe(users => { this.users = users; });
  }

  private loadBmiRecords(): void {
    this.api.getAllBmiRecords().subscribe(records => {
      this.groupedBmiRecords = this.groupRecordsByUsername(records);
    });
  }

  private groupRecordsByUsername(records: BmiRecord[]): Record<string, BmiRecord[]> {
    return records.reduce((groups, record) => {
      const key = record.username;
      groups[key] = groups[key] ? [...groups[key], record] : [record];
      return groups;
    }, {} as Record<string, BmiRecord[]>);
  }
}
