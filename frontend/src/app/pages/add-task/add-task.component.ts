import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
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
  private route = inject(ActivatedRoute); // <--- Inject Route
  private toastService = inject(ToastService);

  isLoading = signal(false);
  isEditMode = signal(false); // <--- Track mode
  currentTaskId: string = '';

  taskForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: [''],
    priority: ['low'],
    status: ['todo']
  });

  ngOnInit() {
    // Check the URL parameter
    const id = this.route.snapshot.paramMap.get('id');

    if (id && id !== 'new' && id !== '0') {
      // EDIT MODE
      this.isEditMode.set(true);
      this.currentTaskId = id;
      this.loadTaskData(id);
    } else {
      // CREATE MODE (Do nothing, form is already empty)
      this.isEditMode.set(false);
    }
  }

  loadTaskData(id: string) {
    this.isLoading.set(true);
    this.taskService.getTask(id).subscribe({
      next: (task) => {
        this.isLoading.set(false);
        this.taskForm.patchValue(task); // Fill the form
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
      // UPDATE EXISTING
      this.taskService.updateTask(this.currentTaskId, this.taskForm.value).subscribe({
        next: () => this.handleSuccess('Task updated!'),
        error: () => this.handleError('Failed to update task')
      });
    } else {
      // CREATE NEW
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
}