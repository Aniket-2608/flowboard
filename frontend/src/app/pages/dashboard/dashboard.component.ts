import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { Task, TaskStatus } from '../../models/task.model';
import { TaskCardComponent } from '../../components/task-card/task-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    DragDropModule,
    TaskCardComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  taskService = inject(TaskService);
  private router = inject(Router);

  // Regular arrays for CDK - NOT computed signals
  todoTasks: Task[] = [];
  inProgressTasks: Task[] = [];
  doneTasks: Task[] = [];

  constructor() {
    // Use effect to watch the signal and update our arrays
    effect(() => {
      const allTasks = this.taskService.tasks();
      this.updateColumns(allTasks);
    });
  }

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getTasks().subscribe();
  }

  // Helper method to split tasks into columns
  private updateColumns(tasks: Task[]) {
    this.todoTasks = tasks.filter(t => t.status === 'todo');
    this.inProgressTasks = tasks.filter(t => t.status === 'inprogress');
    this.doneTasks = tasks.filter(t => t.status === 'done');
  }

  navigateToCreate(id: string = 'new') {
    this.router.navigate(['/add-task', id]);
  }

  trackByTask(index: number, task: Task): string {
    return task._id; 
  }

  onDrop(event: CdkDragDrop<Task[]>, newStatus: TaskStatus) {
    if (event.previousContainer === event.container) {
      // Same column - just reorder
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Different column - transfer the item
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Get the task that was moved
      const task = event.item.data as Task;

      // Update backend
      this.taskService.updateTask(task._id, { status: newStatus }).subscribe({
        next: () => {
          // Reload to ensure sync
          this.loadTasks();
        },
        error: (err) => {
          console.error('Failed to update status', err);
          // Reload on error to revert UI
          this.loadTasks();
        }
      });
    }
  }
}