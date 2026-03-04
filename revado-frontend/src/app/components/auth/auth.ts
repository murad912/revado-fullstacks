import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrls: ['./auth.css']
})
export class AuthComponent {
  isLoginMode = true;
  isForgotMode = false;
  user = { username: '', password: '', email: '' };
  resetEmail = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false; // Controls the button state

  constructor(private authService: AuthService, private router: Router) {}

  onToggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.isForgotMode = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.user = { username: '', password: '', email: '' }; 
  }

  sendResetLink() {
    if (!this.resetEmail) {
      this.errorMessage = 'Please enter your email.';
      return;
    }

    this.isLoading = true; // First click: Start loading immediately
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.forgotPassword(this.resetEmail).subscribe({
      next: () => {
        this.isLoading = false; // Stop loading
        this.successMessage = 'If that email exists, a link was sent!';
        this.resetEmail = ''; // Clear the input box
        setTimeout(() => {
          this.isForgotMode = false;
          this.successMessage = '';
        }, 5000);
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to send reset link. Try again.';
      }
    });
  }

  onSubmit() {
    if (this.isForgotMode) {
      this.sendResetLink();
      return;
    }
  
    this.isLoading = true; // First click: Start loading
    this.errorMessage = '';

    if (this.isLoginMode) {
      this.authService.login(this.user).subscribe({
        next: () => {
          this.isLoading = false;
          this.user = { username: '', password: '', email: '' };
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'Invalid username or password';
        }
      });
    } else {
      this.authService.signup(this.user).subscribe({
        next: () => {
          this.isLoading = false;
          this.user = { username: '', password: '', email: '' }; 
          this.isLoginMode = true; 
          alert('Signup successful! Please login.');
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Signup failed.';
        }
      });
    }
  }
}