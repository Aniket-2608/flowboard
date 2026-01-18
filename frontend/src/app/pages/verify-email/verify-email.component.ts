import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  imports: [CommonModule, RouterModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss'
})
export class VerifyEmailComponent implements OnInit {

  route = inject(ActivatedRoute);
  authService = inject(AuthService);
  router = inject(Router);

  status = signal<'loading' | 'success' | 'error'>('loading');
  message = signal('');

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.status.set('error');
      this.message.set('Invalid verification link.');
      return;
    }

    //call backend
    this.authService.verifyEmail(token).subscribe({
      next : (res : any)=>{
        this.status.set('success');
        this.message.set('Email Verified successfully! You can login now.');

        setTimeout(() => {
          this.router.navigate(['/login'])
        }, 3000);
      }
    })
  }
}
