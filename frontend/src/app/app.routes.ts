import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';
import { AddTaskComponent } from './pages/add-task/add-task.component';

export const routes: Routes = [
    {path: 'login', component : LoginComponent},
    {path: 'register', component : RegisterComponent},
    {path: 'dashboard', component : DashboardComponent, canActivate : [authGuard]},
    {path: 'add-task/:id', component : AddTaskComponent, canActivate : [authGuard]},

    {path: '', redirectTo: 'dashboard', pathMatch : 'full'}, // default to login
    {path: '**', redirectTo: 'login', pathMatch : 'full'}, 
];
