import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  assignedTo: string[];
  createdBy: string;
  comments: Comment[];
  attachments: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  _id: string;
  user: string;
  text: string;
  createdAt: Date;
}

export interface Attachment {
  _id: string;
  name: string;
  url: string;
  uploadedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(`${environment.apiUrl}/tasks`, { headers: this.getHeaders() });
  }

  getTask(id: string): Observable<Task> {
    return this.http.get<Task>(`${environment.apiUrl}/tasks/${id}`, { headers: this.getHeaders() });
  }

  createTask(task: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(`${environment.apiUrl}/tasks`, task, { headers: this.getHeaders() });
  }

  updateTask(id: string, task: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${environment.apiUrl}/tasks/${id}`, task, { headers: this.getHeaders() });
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/tasks/${id}`, { headers: this.getHeaders() });
  }

  addComment(taskId: string, text: string): Observable<Task> {
    return this.http.post<Task>(`${environment.apiUrl}/tasks/${taskId}/comments`, { text }, { headers: this.getHeaders() });
  }

  uploadAttachment(taskId: string, file: File): Observable<Task> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Task>(`${environment.apiUrl}/tasks/${taskId}/attachments`, formData, { headers: this.getHeaders() });
  }
} 