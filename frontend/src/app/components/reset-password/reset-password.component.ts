import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
})
export class ResetPasswordComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);

  token = signal('');
  password = signal('');
  confirmPassword = signal('');
  
  message = signal('');
  error = signal('');
  loading = signal(false);

  ngOnInit() {
    // We can just grab the snapshot for a one-time read
    this.token.set(this.route.snapshot.params['token']);
  }

  onSubmit() {
    // Validation
    if (this.password() !== this.confirmPassword()) {
      this.error.set("Passwords do not match!");
      return;
    }
    if (this.password().length < 6) {
      this.error.set("Password must be at least 6 characters long.");
      return;
    }

    this.loading.set(true);
    this.message.set('');
    this.error.set('');

    this.authService.resetPassword(this.token(), this.password()).subscribe({
      next: () => {
        this.loading.set(false);
        this.message.set('Password reset successful! Redirecting...');
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error.message || 'Invalid or expired token.');
      }
    });
  }
}