import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { TaskFormComponent } from '../task-form/task-form.component';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
    TaskFormComponent
  ],
  template: `
    <div class="task-list-container">
      <div class="header">
        <h2>Tasks</h2>
        <button mat-raised-button color="primary" (click)="openNewTaskModal()">New Task</button>
      </div>

      <div class="filters">
        <mat-select [(ngModel)]="statusFilter" (selectionChange)="filterTasks()">
          <mat-option value="">All Status</mat-option>
          <mat-option value="pending">Pending</mat-option>
          <mat-option value="in-progress">In Progress</mat-option>
          <mat-option value="completed">Completed</mat-option>
        </mat-select>

        <mat-select [(ngModel)]="priorityFilter" (selectionChange)="filterTasks()">
          <mat-option value="">All Priority</mat-option>
          <mat-option value="low">Low</mat-option>
          <mat-option value="medium">Medium</mat-option>
          <mat-option value="high">High</mat-option>
        </mat-select>
      </div>

      <div class="task-grid">
        <div *ngFor="let task of filteredTasks" class="task-card">
          <h3>{{ task.title }}</h3>
          <p>{{ task.description }}</p>
          <div class="task-info">
            <span class="badge" [ngClass]="task.status">{{ task.status }}</span>
            <div class="task-details">
              <span>Assigned to: {{ task.assignedTo?.name || 'Unassigned' }}</span>
              <span class="priority" [ngClass]="task.priority">
                Priority: {{ task.priority }}
              </span>
              <span class="due-date" *ngIf="task.dueDate">
                Due: {{ task.dueDate | date }}
              </span>
            </div>
          </div>
          <div class="task-actions">
            <button mat-button color="primary" (click)="editTask(task)">Edit</button>
            <button mat-button color="warn" (click)="deleteTask(task._id)">Delete</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .task-list-container {
      padding: 2rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .filters {
      margin-bottom: 2rem;
      display: flex;
      gap: 1rem;
    }

    mat-select {
      width: 200px;
    }

    .task-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 2rem;
    }

    .task-card {
      background: white;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .task-info {
      margin-top: 1rem;
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .pending {
      background-color: #fef3c7;
      color: #92400e;
    }

    .in-progress {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .completed {
      background-color: #dcfce7;
      color: #166534;
    }

    .task-details {
      margin-top: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      font-size: 0.875rem;
    }

    .priority {
      display: inline-block;
    }

    .low {
      color: #059669;
    }

    .medium {
      color: #d97706;
    }

    .high {
      color: #dc2626;
    }

    .due-date {
      color: #6b7280;
    }

    .task-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }
  `]
})
export class TaskListComponent implements OnInit {
  tasks: any[] = [];
  filteredTasks: any[] = [];
  statusFilter: string = '';
  priorityFilter: string = '';

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is logged in
    const currentUser = this.authService.getCurrentUser();
    const token = this.authService.getToken();
    console.log('Current user:', currentUser);
    console.log('Token:', token);

    if (!currentUser || !token) {
      console.log('User not logged in, redirecting to login');
      this.snackBar.open('Please log in to access tasks', 'Close', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }

    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (tasks) => {
        console.log('Tasks loaded:', tasks);
        this.tasks = tasks;
        this.filterTasks();
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.snackBar.open('Error loading tasks: ' + (error.error?.message || 'Unknown error'), 'Close', { duration: 5000 });
      }
    });
  }

  filterTasks(): void {
    this.filteredTasks = this.tasks.filter(task => {
      const matchesStatus = !this.statusFilter || task.status === this.statusFilter;
      const matchesPriority = !this.priorityFilter || task.priority === this.priorityFilter;
      return matchesStatus && matchesPriority;
    });
  }

  openNewTaskModal(): void {
    // Check if user is logged in
    const currentUser = this.authService.getCurrentUser();
    const token = this.authService.getToken();
    console.log('Opening modal - Current user:', currentUser);
    console.log('Opening modal - Token:', token);

    if (!currentUser || !token) {
      console.log('User not logged in, redirecting to login');
      this.snackBar.open('Please log in to create tasks', 'Close', { duration: 3000 });
      this.router.navigate(['/login']);
      return;
    }

    console.log('Opening new task modal');
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '500px',
      disableClose: true,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog closed with result:', result);
      if (result) {
        this.loadTasks(); // Reload all tasks after creation
      }
    });
  }

  editTask(task: any): void {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '500px',
      data: { task },
      disableClose: true,
      autoFocus: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTasks(); // Reload all tasks after edit
      }
    });
  }

  deleteTask(taskId: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId).subscribe({
        next: () => {
          this.snackBar.open('Task deleted successfully', 'Close', { duration: 3000 });
          this.loadTasks(); // Reload all tasks after deletion
        },
        error: (error) => {
          console.error('Error deleting task:', error);
          this.snackBar.open('Error deleting task: ' + (error.error?.message || 'Unknown error'), 'Close', { duration: 5000 });
        }
      });
    }
  }
} 