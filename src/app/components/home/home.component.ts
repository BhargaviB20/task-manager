import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="home-container">
      <h1>Welcome to Task Manager</h1>
      <p>A powerful tool to manage your tasks and collaborate with your team.</p>
      <div class="features">
        <div class="feature-card">
          <h3>Task Management</h3>
          <p>Create, update, and track your tasks efficiently</p>
        </div>
        <div class="feature-card">
          <h3>Team Collaboration</h3>
          <p>Assign tasks and work together seamlessly</p>
        </div>
        <div class="feature-card">
          <h3>Notifications</h3>
          <p>Stay updated with task reminders and updates</p>
        </div>
      </div>
      <div class="cta-buttons">
        <button class="btn btn-primary" routerLink="/login">Get Started</button>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }

    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      color: #333;
    }

    p {
      font-size: 1.2rem;
      color: #666;
      margin-bottom: 2rem;
    }

    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin: 3rem 0;
    }

    .feature-card {
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      background-color: white;
      transition: transform 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-5px);
    }

    .feature-card h3 {
      color: #007bff;
      margin-bottom: 1rem;
    }

    .cta-buttons {
      margin-top: 2rem;
    }

    .btn {
      padding: 0.75rem 2rem;
      font-size: 1.1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
      border: none;
    }

    .btn-primary:hover {
      background-color: #0056b3;
    }
  `]
})
export class HomeComponent {} 