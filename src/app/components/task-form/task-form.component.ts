import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  template: `
    <div class="task-form">
      <h2>{{ isEditing ? 'Edit Task' : 'Create New Task' }}</h2>
      <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
        <mat-form-field appearance="fill">
          <mat-label>Title</mat-label>
          <input matInput formControlName="title" required>
          <mat-error *ngIf="taskForm.get('title')?.errors?.['required']">
            Title is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Description</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status" required>
            <mat-option value="pending">Pending</mat-option>
            <mat-option value="in-progress">In Progress</mat-option>
            <mat-option value="completed">Completed</mat-option>
          </mat-select>
          <mat-error *ngIf="taskForm.get('status')?.errors?.['required']">
            Status is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Priority</mat-label>
          <mat-select formControlName="priority" required>
            <mat-option value="low">Low</mat-option>
            <mat-option value="medium">Medium</mat-option>
            <mat-option value="high">High</mat-option>
          </mat-select>
          <mat-error *ngIf="taskForm.get('priority')?.errors?.['required']">
            Priority is required
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill">
          <mat-label>Due Date</mat-label>
          <input matInput [matDatepicker]="picker" formControlName="dueDate">
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <div class="form-actions">
          <button mat-button type="button" (click)="onCancel()">Cancel</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="taskForm.invalid || isLoading">
            {{ isLoading ? 'Creating...' : (isEditing ? 'Update' : 'Create') }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .task-form {
      padding: 20px;
      max-width: 500px;
      margin: 0 auto;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1rem;
    }

    mat-form-field {
      width: 100%;
    }

    textarea {
      min-height: 100px;
    }
  `]
})
export class TaskFormComponent {
  taskForm: FormGroup;
  isEditing: boolean = false;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private authService: AuthService,
    private dialogRef: MatDialogRef<TaskFormComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      status: ['pending', [Validators.required]],
      priority: ['medium', [Validators.required]],
      dueDate: [null]
    });

    if (this.data?.task) {
      this.isEditing = true;
      this.taskForm.patchValue({
        ...this.data.task,
        dueDate: this.data.task.dueDate ? new Date(this.data.task.dueDate) : null
      });
    }
  }

  onSubmit(): void {
    console.log('Form submitted', this.taskForm.value);
    if (this.taskForm.valid) {
      this.isLoading = true;
      const currentUser = this.authService.getCurrentUser();
      if (!currentUser) {
        console.error('No user logged in');
        this.snackBar.open('Please log in to create a task', 'Close', { duration: 3000 });
        this.isLoading = false;
        return;
      }

      const taskData = {
        ...this.taskForm.value,
        createdBy: currentUser.id
      };
      
      console.log('Submitting task data:', taskData);
      
      if (this.isEditing) {
        this.taskService.updateTask(this.data.task._id, taskData).subscribe({
          next: (updatedTask) => {
            console.log('Task updated successfully:', updatedTask);
            this.snackBar.open('Task updated successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(updatedTask);
          },
          error: (error) => {
            console.error('Error updating task:', error);
            this.snackBar.open('Error updating task: ' + (error.error?.message || 'Unknown error'), 'Close', { duration: 5000 });
            this.isLoading = false;
          }
        });
      } else {
        this.taskService.createTask(taskData).subscribe({
          next: (newTask) => {
            console.log('Task created successfully:', newTask);
            this.snackBar.open('Task created successfully', 'Close', { duration: 3000 });
            this.dialogRef.close(newTask);
          },
          error: (error) => {
            console.error('Error creating task:', error);
            this.snackBar.open('Error creating task: ' + (error.error?.message || 'Unknown error'), 'Close', { duration: 5000 });
            this.isLoading = false;
          }
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 