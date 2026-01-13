import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { CreateTaskRequest, Task } from '../models/task.model';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private http = inject(HttpClient);
  private apiURL= `${environment.apiUrl}/tasks`;

  tasks = signal<Task[]>([]);

  //get all task
  getTasks(){
    return this.http.get<Task[]>(this.apiURL).pipe(
      tap((taskList)=>{
        this.tasks.set(taskList); //update signal store
      })
    )
  }

  //getSingleTask
  getTask(id: string) {
    return this.http.get<Task>(`${this.apiURL}/${id}`);
  }

  //create task
  createTask(taskData : CreateTaskRequest){
    return this.http.post<Task>(this.apiURL, taskData).pipe(
      tap((newTask)=>{
        //optimistic UI Update : Add to the list immediately
        this.tasks.update((current)=>[...current, newTask]);
      })
    )
  }

  //update
  updateTask(id:string, updates: Partial<Task>){
    return this.http.put<Task>(`${this.apiURL}/${id}`, updates).pipe(
      tap((updatedTask)=>{
        //Replace Old Task with the new one in our list.
        this.tasks.update((current)=>current.map((t)=> (t._id === id ? updatedTask : t)));
      })
    );
  }

  //deleteTask
  deletTask(id:string){
    return this.http.delete(`${this.apiURL}/${id}`).pipe(
      tap(()=>{
        //Remove from the list when id matches with the requested id
        this.tasks.update((current)=>current.filter((t)=>t._id !== id));
      })
    );
  }

  // Helper: Update local state immediately (Optimistic UI)
  updateLocalTaskStatus(taskId: string, newStatus: any) {
    this.tasks.update((currentTasks) => 
      currentTasks.map((t) => 
        t._id === taskId ? { ...t, status: newStatus } : t
      )
    );
  }
}