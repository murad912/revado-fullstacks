import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../../services/todo';
import { AuthService } from '../../services/auth'; // 1. Ensure this import is here
import { Todo, Subtask } from '../../models/todo.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  todoList: Todo[] = [];
  newTitle: string = '';
  newDescription: string = '';
  newSubtaskTitles: { [key: number]: string } = {};
  isSaving = false;

  // 2. Add authService to your constructor
  constructor(
    private todoService: TodoService, 
    private authService: AuthService, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.refreshData();
  }

  // 3. Add the Logout handler
  onLogout() {
    this.authService.logout();
  }

  // --- EXISTING TODO LOGIC ---

  refreshData() {
    this.todoService.getTodos().subscribe({
      next: (data) => {
        this.todoList = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Load Error:', err)
    });
  }

  addTask() {
    if (this.newTitle.trim()) {
      const newTask: any = {
        title: this.newTitle,
        description: this.newDescription,
        isCompleted: false,
        subtasks: []
      };

      this.todoService.addTodo(newTask).subscribe(() => {
        this.newTitle = '';
        this.newDescription = '';
        this.refreshData();
      });
    }
  }

  removeTask(id: number) {
    this.todoService.deleteTodo(id).subscribe(() => {
      this.refreshData();
    });
  }

  toggleStatus(todo: Todo) {
    todo.completed = !todo.completed;
    this.todoService.updateTodo(todo).subscribe(() => {
      this.refreshData();
    });
  }

  // --- SUBTASK LOGIC ---
  
  createSubtask(todoId: number) {
    const title = this.newSubtaskTitles[todoId];
    if (title && title.trim()) {
      const todo = this.todoList.find(t => t.id === todoId);
      if (todo) {
        todo.subtasks.push({ id: null as any, title: title, completed: false });
        
        this.todoService.updateTodo(todo).subscribe({
          next: () => {
            this.newSubtaskTitles[todoId] = ''; 
            this.refreshData();
          },
          error: (err) => console.error('Error adding subtask:', err)
        });
      }
    }
  }

  toggleSubtask(todo: Todo, subtask: Subtask) {
    subtask.completed = !subtask.completed; 
  
    this.todoService.updateTodo(todo).subscribe({
      next: () => {
        console.log('Sync successful');
        this.refreshData();
      },
      error: (err) => {
        subtask.completed = !subtask.completed;
        console.error(err);
      }
    });
  }

  removeSubtask(todo: Todo, subtaskId: number) {
    todo.subtasks = todo.subtasks.filter(s => s.id !== subtaskId);
    this.todoService.updateTodo(todo).subscribe(() => {
      this.refreshData();
    });
  }

  // --- EDITING LOGIC ---

  startEdit(item: any) {
    item.isEditing = true;
  }

  saveTaskEdit(todo: Todo) {
    if (this.isSaving || !todo.title.trim()) return;

    this.isSaving = true;
    todo.isEditing = false;

    this.todoService.updateTodo(todo).subscribe({
      next: () => {
        this.isSaving = false;
        this.refreshData();
      },
      error: (err) => {
        this.isSaving = false;
        console.error('Update failed:', err);
      }
    });
  }

  saveSubtaskEdit(todo: Todo, sub: Subtask) {
    sub.isEditing = false;
    this.todoService.updateTodo(todo).subscribe({
      next: () => this.refreshData(),
      error: (err) => console.error('Subtask edit failed', err)
    });
  }
}