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
  isLoginMode = true; // Toggles between Login and Signup
  user = { username: '', password: '', email: '' };
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  // Clears fields if user clicks "Switch to Signup/Login"
  onToggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
    this.user = { username: '', password: '', email: '' }; 
  }

  onSubmit() {
    if (this.isLoginMode) {
      // LOGIN LOGIC
      this.authService.login(this.user).subscribe({
        next: () => {
          // Clear fields so if they logout later, the boxes are empty
          this.user = { username: '', password: '', email: '' };
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.errorMessage = 'Invalid username or password';
        }
      });
    } else {
      // SIGNUP LOGIC
      this.authService.signup(this.user).subscribe({
        next: () => {
          // THE FIX: Reset the user object so fields are empty for the login screen
          this.user = { username: '', password: '', email: '' }; 
          this.isLoginMode = true; 
          alert('Signup successful! Please login.');
        },
        error: () => {
          this.errorMessage = 'Signup failed. Try a different username.';
        }
      });
    }
  }
}