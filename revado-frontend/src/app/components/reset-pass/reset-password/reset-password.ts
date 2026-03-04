import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth';


@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>New Password</h2>
        <p class="subtitle">Enter your new password below</p>
        
        <form (ngSubmit)="onResetPassword()">
          <div class="form-group">
            <input type="password" [(ngModel)]="password" name="password" placeholder="New Password" [disabled]="isLoading" required />
          </div>
          <div class="form-group">
            <input type="password" [(ngModel)]="confirmPassword" name="confirm" placeholder="Confirm New Password" [disabled]="isLoading" required />
          </div>
          
          <button type="submit" class="btn-auth" [disabled]="isLoading || password !== confirmPassword || !password">
            {{ isLoading ? 'UPDATING...' : 'UPDATE PASSWORD' }}
          </button>
        </form>

        <p *ngIf="errorMessage" class="error fade-in">{{ errorMessage }}</p>
        <p *ngIf="successMessage" class="success fade-in">{{ successMessage }}</p>
      </div>
    </div>
  `,
  styleUrls: ['../../auth/auth.css']
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) { this.errorMessage = 'Invalid or missing reset token.'; }
  }

  onResetPassword() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isLoading = true; // Respond immediately
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.resetPassword(this.token, this.password).subscribe({
      next: (response) => {
        console.log('Reset success:', response);
        this.isLoading = false;
        this.successMessage = 'Password updated successfully! Redirecting...';
        this.password = '';
        this.confirmPassword = '';
        setTimeout(() => this.router.navigate(['/auth']), 3000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error || 'Failed to reset password. Link may have expired.';
      }
    });
  }
}