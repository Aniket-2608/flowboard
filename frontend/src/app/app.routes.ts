import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';
import { AddTaskComponent } from './pages/add-task/add-task.component';
import { VerifyEmailComponent } from './pages/verify-email/verify-email.component';
import { LandingComponent } from './pages/landing/landing.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';

export const routes: Routes = [
    { path: '', component: LandingComponent },
    {path: 'login', component : LoginComponent},
    {path: 'register', component : RegisterComponent},
    {path: 'dashboard', component : DashboardComponent, canActivate : [authGuard]},
    {path: 'add-task/:id', component : AddTaskComponent, canActivate : [authGuard]},
    {path: 'verify', component : VerifyEmailComponent},
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password/:token', component: ResetPasswordComponent },

    {path: '', redirectTo: 'dashboard', pathMatch : 'full'}, // default to login
    {path: '**', redirectTo: 'login', pathMatch : 'full'}, 
];
