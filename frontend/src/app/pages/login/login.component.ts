import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms'; // <--- Reactive Forms
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { LoginRequest } from '../../models/authModel';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule], 
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  // 1. Reactive Form Definition
  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  // 2. Signals for Local State
  isLoading = signal<boolean>(false);

  onSubmit() {
    if (this.loginForm.invalid) {
      this.toastService.show('Please fill in all fields correctly', 'error');
      return;
    }

    this.isLoading.set(true); // Start loading

    const loginData: LoginRequest = this.loginForm.value;

    this.authService.login(loginData).subscribe({
      next: (res) => {
        this.isLoading.set(false); // Stop loading
        this.toastService.show('Welcome back!', 'success');
        this.router.navigate(['/dashboard']); // We will enable this later
      },
      error: (err) => {
        this.isLoading.set(false); // Stop loading
        const msg = err.error.message || 'Login failed';
        this.toastService.show(msg, 'error');
      }
    });
  }
}