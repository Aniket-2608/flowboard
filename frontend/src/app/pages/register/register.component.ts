import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { RegisterRequest } from '../../models/authModel';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  isLoading = signal<boolean>(false);

  // 1. Defined the Form with the Custom Validator attached to the GROUP
  registerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator }); // <--- Applied here

  // 2. Custom Validator Function
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    // If passwords don't match, return an error object
    return password === confirmPassword ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.toastService.show('Please fix the errors in the form', 'error');
      return;
    }

    this.isLoading.set(true);

    // 3. Prepare Data (Exclude confirmPassword)
    // We strictly map only the fields the Backend expects
    const registerData: RegisterRequest = {
      name: this.registerForm.value.name,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password
    };

    this.authService.register(registerData).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.toastService.show('Account created successfully!', 'success');
        this.router.navigate(['/login']); // Redirect to login after registration
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err.error.message || 'Registration failed';
        this.toastService.show(msg, 'error');
      }
    });
  }
}