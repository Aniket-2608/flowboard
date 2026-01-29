import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-task.component.html'
})
export class AddTaskComponent implements OnInit {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  isLoading = signal(false);
  isEditMode = signal(false);
  currentTaskId: string = '';
  minDate : string ='';

  taskForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    priority: ['low'],
    status: ['todo'],
    dueDate: ['', [this.futureDateValidator()]] // ✅ Added dueDate control
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');

    if (id && id !== 'new' && id !== '0') {
      // EDIT MODE
      this.isEditMode.set(true);
      this.currentTaskId = id;
      this.loadTaskData(id);
    } else {
      // CREATE MODE
      this.isEditMode.set(false);
    }
  }

  private updateMinDate(){
    const nowDate = new Date();

    const localNow = new Date(nowDate.getTime()- (nowDate.getTimezoneOffset()*6000));
    this.minDate = localNow.toISOString().slice(0,16);
  }

  private futureDateValidator(){
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null; // Allow empty (optional)
      
      const inputDate = new Date(control.value);
      const now = new Date();
      
      // Check if input date is strictly smaller than now
      return inputDate < now ? { pastDate: true } : null;
    };
  }

  loadTaskData(id: string) {
    this.isLoading.set(true);
    this.taskService.getTask(id).subscribe({
      next: (task) => {
        this.isLoading.set(false);
        
        // 🛠️ FIX: Format the date before patching the form
        // We create a new object so we don't mutate the original task response
        const formValues = {
          ...task,
          dueDate: task.dueDate ? this.formatDateForInput(task.dueDate) : ''
        };

        this.taskForm.patchValue(formValues);
      },
      error: () => {
        this.isLoading.set(false);
        this.toastService.show('Error loading task', 'error');
        this.router.navigate(['/dashboard']);
      }
    });
  }

  onSubmit() {
    if (this.taskForm.invalid) return;

    this.isLoading.set(true);

    if (this.isEditMode()) {
      this.taskService.updateTask(this.currentTaskId, this.taskForm.value).subscribe({
        next: () => this.handleSuccess('Task updated!'),
        error: () => this.handleError('Failed to update task')
      });
    } else {
      this.taskService.createTask(this.taskForm.value).subscribe({
        next: () => this.handleSuccess('Task created!'),
        error: () => this.handleError('Failed to create task')
      });
    }
  }

  private handleSuccess(message: string) {
    this.isLoading.set(false);
    this.toastService.show(message, 'success');
    this.router.navigate(['/dashboard']);
  }

  private handleError(message: string) {
    this.isLoading.set(false);
    this.toastService.show(message, 'error');
  }

  // 🛠️ Helper for <input type="datetime-local">
  private formatDateForInput(dateString: string | Date): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) return '';

    // Adjust for local timezone offset so the input shows the correct local time
    const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    
    // Return "YYYY-MM-DDTHH:mm" (First 16 chars)
    return localDate.toISOString().slice(0, 16);
  }
}