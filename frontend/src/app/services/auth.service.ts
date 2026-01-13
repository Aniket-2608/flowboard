import { inject, Injectable, signal} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoginRequest, RegisterRequest } from '../models/authModel';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;

  //Signal to track if the user is logged in or not ?
  currentUser = signal<any | null >(this.getUserFromStorage());

  register(userData : RegisterRequest){
    return this.http.post(`${this.apiUrl}/users/register`, userData).pipe(
      tap((response : any)=>{
        if(response.token){
         this.setSession(response);
        }
      })
    )
  }

  login(userData: LoginRequest) {
    return this.http.post(`${this.apiUrl}/users/login`, userData).pipe(
      tap((response: any) => {
        if (response.token) {
          this.setSession(response);
        }
      })
    );
  }

  // 3. LOGOUT
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null); // Update Signal
    this.router.navigate(['/login']);
  }

  // Helper: Save Token & User to LocalStorage
  private setSession(response: any) {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response));
    this.currentUser.set(response); // Update Signal
  }

  // Helper: Get user from LocalStorage on startup
  private getUserFromStorage() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Helper: Check if logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }
}
