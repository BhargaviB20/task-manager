import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <a routerLink="/" class="brand">Task Manager</a>
      </div>
      <div class="navbar-menu">
        <ng-container *ngIf="authService.isAuthenticated()">
          <a routerLink="/tasks" class="nav-item">Tasks</a>
          <button (click)="logout()" class="nav-item">Logout</button>
        </ng-container>
        <ng-container *ngIf="!authService.isAuthenticated()">
          <a routerLink="/login" class="nav-item">Login</a>
        </ng-container>
      </div>
    </nav>

    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background-color: #fff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .navbar-brand {
      font-size: 1.5rem;
      font-weight: bold;
    }

    .brand {
      color: #007bff;
      text-decoration: none;
    }

    .navbar-menu {
      display: flex;
      gap: 1rem;
    }

    .nav-item {
      color: #333;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: background-color 0.3s ease;
    }

    .nav-item:hover {
      background-color: #f8f9fa;
    }

    main {
      min-height: calc(100vh - 64px);
      background-color: #f8f9fa;
    }
  `]
})
export class AppComponent {
  constructor(public authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
