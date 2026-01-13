import { Injectable, signal } from '@angular/core';

export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<Toast[]>([]); // Signal holding the list of toasts

  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    const id = Date.now();
    const toast: Toast = { message, type, id };
    
    // Add new toast to the list
    this.toasts.update(current => [...current, toast]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      this.remove(id);
    }, 3000);
  }

  remove(id: number) {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }
}