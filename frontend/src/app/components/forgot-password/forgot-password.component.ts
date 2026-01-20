import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);

  // Using Signals for state
  email = signal('');
  message = signal('');
  error = signal('');
  loading = signal(false);

  onSubmit() {
    if (!this.email()) return;
    
    this.loading.set(true);
    this.message.set('');
    this.error.set('');

    this.authService.forgotPassword(this.email()).subscribe({
      next: () => {
        this.loading.set(false);
        this.message.set('Reset link sent! Please check your email inbox.');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error.message || 'Something went wrong. Please try again.');
      }
    });
  }
}