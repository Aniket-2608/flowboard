import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2">
      <div 
        *ngFor="let toast of toastService.toasts()" 
        class="px-4 py-3 rounded shadow-lg text-white transition-all transform animate-slide-in"
        [ngClass]="{
          'bg-green-500': toast.type === 'success',
          'bg-red-500': toast.type === 'error',
          'bg-blue-500': toast.type === 'info'
        }"
      >
        <div class="flex items-center justify-between gap-4">
          <span>{{ toast.message }}</span>
          <button (click)="toastService.remove(toast.id)" class="text-white hover:text-gray-200">✕</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}