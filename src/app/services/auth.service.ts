import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private token: string | null = null;

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    console.log('Loading stored user:', storedUser);
    console.log('Loading stored token:', storedToken);
    
    if (storedUser && storedToken) {
      this.currentUserSubject.next(JSON.parse(storedUser));
      this.token = storedToken;
    }
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, {
      name,
      email,
      password
    }).pipe(
      tap(response => {
        console.log('Register response:', response);
        this.handleAuthResponse(response);
      })
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, {
      email,
      password
    }).pipe(
      tap(response => {
        console.log('Login response:', response);
        this.handleAuthResponse(response);
      })
    );
  }

  logout(): void {
    console.log('Logging out user');
    this.currentUserSubject.next(null);
    this.token = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  private handleAuthResponse(response: AuthResponse): void {
    console.log('Handling auth response:', response);
    this.token = response.token;
    this.currentUserSubject.next(response.user);
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
  }

  getToken(): string | null {
    console.log('Getting token:', this.token);
    return this.token;
  }

  isAuthenticated(): boolean {
    const isAuth = !!this.token;
    console.log('Is authenticated:', isAuth);
    return isAuth;
  }

  getCurrentUser(): User | null {
    const user = this.currentUserSubject.value;
    console.log('Getting current user:', user);
    return user;
  }
} 