import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

// Define what the backend login response looks like
interface LoginResponse {
  token: string;
  username?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/auth';
  private readonly TOKEN_KEY = 'revaDoToken';

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * SIGNUP
   * Backend returns a simple string, so we use responseType: 'text'
   */
  signup(user: any): Observable<string> {
    return this.http.post(`${this.apiUrl}/signup`, user, { responseType: 'text' });
  }

  /**
   * LOGIN
   * Saves the JWT token to localStorage on success
   */
  login(credentials: any): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        if (res && res.token) {
          localStorage.setItem(this.TOKEN_KEY, res.token);
        }
      })
    );
  }

  /**
   * LOGOUT
   * Clears token and sends user back to login
   */
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/login']);
  }

  /**
   * GET TOKEN
   * Helper to retrieve the current token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * IS LOGGED IN
   * Returns true if a token exists
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    // Optional: You could add logic here to check if the token is expired
    return !!token;
  }
}