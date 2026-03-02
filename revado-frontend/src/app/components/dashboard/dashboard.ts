import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../../services/todo';
import { AuthService } from '../../services/auth';
import { Todo, Subtask } from '../../models/todo.model';
import { DragDropModule, moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  todoList: Todo[] = [];
  newTitle: string = '';
  newDescription: string = '';
  newDueDate: string = '';
  newSubtaskTitles: { [key: number]: string } = {};
  
  searchTerm: string = '';
  categories: string[] = ['Work', 'Personal', 'Shopping']; 
  priorities: string[] = ['High', 'Medium', 'Low'];
  selectedPriority: 'High' | 'Medium' | 'Low' = 'Medium'; 
  selectedCategory: string = 'Personal'; 
  filterCategory: string = 'All';   
  
  manualOrderMode: boolean = false;

  constructor(
    private todoService: TodoService, 
    private authService: AuthService, 
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const savedTasks = localStorage.getItem('todos');
    if (savedTasks) {
      this.todoList = JSON.parse(savedTasks);
    }
    this.refreshData();
  }
  
  private saveToLocalStorage(): void {
    localStorage.setItem('todos', JSON.stringify(this.todoList));
  }

  drop(event: CdkDragDrop<Todo[]>) {
    this.manualOrderMode = true; 
    moveItemInArray(this.todoList, event.previousIndex, event.currentIndex);
    this.saveToLocalStorage();
    this.cdr.detectChanges();
  }

  trackByTodoId(index: number, todo: Todo): number | undefined {
    return todo.id;
  }

  onLogout() { this.authService.logout(); }

  refreshData() {
    this.todoService.getTodos().subscribe({
      next: (data) => {
        
        this.todoList = data.map(t => ({
          ...t,
          archived: t.archived === true
        }));
        this.saveToLocalStorage();
        this.manualOrderMode = false; 
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Load Error:', err)
    });
  }

  get filteredTodos() {
    return this.todoList.filter(todo => {
      const isArchiveView = this.filterCategory === 'Archived';

      // If we are looking at Archives, only show archived tasks.
      // If we are looking at anything else, hide archived tasks completely.
      if (isArchiveView) {
        if (!todo.archived) return false;
      } else {
        if (todo.archived) return false;
      }

      // Category Match
      const activeFilter = (this.filterCategory || 'All').toLowerCase().trim();
      const categoryMatch = activeFilter === 'all' || isArchiveView || 
                            (todo.category || 'Personal').toLowerCase().trim() === activeFilter;

      // Search Match
      const term = (this.searchTerm || '').toLowerCase().trim();
      const searchMatch = !term || 
                          todo.title.toLowerCase().includes(term) || 
                          (todo.description && todo.description.toLowerCase().includes(term));

      return categoryMatch && searchMatch;
    }).sort((a, b) => {
      if (this.manualOrderMode) return 0;
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const pMap = { 'High': 1, 'Medium': 2, 'Low': 3 };
      const pA = pMap[a.priority as keyof typeof pMap] || 4;
      const pB = pMap[b.priority as keyof typeof pMap] || 4;
      if (pA !== pB) return pA - pB;
      return 0;
    });
  }

  get cleanUpButtonLabel(): string {
    if (this.filterCategory === 'Archived') return 'Clear All Archives';
    if (this.completedCount > 0) return 'Clear Completed';
    return 'Clear All Active';
  }

  handleCleanUp() {
    if (this.filterCategory === 'Archived') {
      this.clearAllTasks();
    } else if (this.completedCount > 0) {
      this.clearCompleted();
    } else {
      this.clearAllTasks();
    }
  }

  archiveTask(todo: Todo) {
    todo.archived = true;
    this.todoService.updateTodo(todo).subscribe({
      next: () => {
        this.saveToLocalStorage();
        this.todoList = [...this.todoList]; 
        this.cdr.detectChanges();
      }
    });
  }
  
  unarchiveTask(todo: Todo) {
    todo.archived = false;
    this.todoService.updateTodo(todo).subscribe({
      next: () => {
        this.saveToLocalStorage();
        this.refreshData();
      }
    });
  }

  addTask() {
    if (this.newTitle.trim()) {
      const newTask: Todo = {
        title: this.newTitle,
        description: this.newDescription,
        category: this.selectedCategory,
        priority: this.selectedPriority,
        dueDate: this.newDueDate,
        completed: false,
        archived: false,
        subtasks: []
      };
  
      this.todoService.addTodo(newTask).subscribe({
        next: (response) => {
          this.newTitle = '';
          this.newDescription = '';
          this.newDueDate = '';
          
          this.todoList = [...this.todoList, { ...response, archived: false }];
          // this.refreshData();

          this.saveToLocalStorage();
          this.cdr.detectChanges();
        }
      });
    }
  }

  toggleStatus(todo: Todo) {
    todo.completed = !todo.completed;
    this.todoService.updateTodo(todo).subscribe({
      next: () => {
        this.saveToLocalStorage();
        this.todoList = [...this.todoList]; 
        this.cdr.detectChanges();
      }
    });
  }
  
  removeTask(id: number) {
    if(confirm('Delete this task?')) {
      this.todoService.deleteTodo(id).subscribe(() => {
        this.todoList = this.todoList.filter(t => t.id !== id);
        this.saveToLocalStorage();
        this.refreshData();
      });
    }
  }

  createSubtask(todoId: number) {
    const title = this.newSubtaskTitles[todoId];
    if (title?.trim()) {
      const todo = this.todoList.find(t => t.id === todoId);
      if (todo) {
        if (!todo.subtasks) todo.subtasks = [];
        todo.subtasks.push({ title: title, completed: false } as Subtask);
        this.todoService.updateTodo(todo).subscribe({
          next: () => {
            this.newSubtaskTitles[todoId] = ''; 
            this.refreshData();
          }
        });
      }
    }
  }

  toggleSubtask(todo: Todo, subtask: Subtask) {
    subtask.completed = !subtask.completed; 
    this.todoService.updateTodo(todo).subscribe();
  }

  calculateProgress(todo: Todo): number {
    if (!todo.subtasks || todo.subtasks.length === 0) return todo.completed ? 100 : 0;
    const completedCount = todo.subtasks.filter(s => s.completed).length;
    return Math.round((completedCount / todo.subtasks.length) * 100);
  }

  isOverdue(dueDate: any): boolean {
    if (!dueDate) return false;
    const today = new Date().setHours(0,0,0,0);
    const taskDate = new Date(dueDate).setHours(0,0,0,0);
    return taskDate < today;
  }

  get pendingCount(): number { return this.todoList.filter(t => !t.completed && !t.archived).length; }
  get completedCount(): number { return this.todoList.filter(t => t.completed && !t.archived).length; }

  clearCompleted() {
    const completed = this.todoList.filter(t => t.completed && !t.archived);
    if (confirm(`Delete ${completed.length} tasks?`)) {
      completed.forEach(t => this.todoService.deleteTodo(t.id!).subscribe(() => this.refreshData()));
    }
  }

  startEdit(item: any) { item.isEditing = true; }
  saveTaskEdit(todo: Todo) {
    todo.isEditing = false;
    this.todoService.updateTodo(todo).subscribe(() => this.refreshData());
  }

  async clearAllTasks() {
    const tasksToDelete = [...this.filteredTodos];
    if (tasksToDelete.length === 0) return;
  
    if (confirm("Delete visible tasks?")) {
      for (const task of tasksToDelete) {
        await this.todoService.deleteTodo(task.id!).toPromise();
      }
      this.refreshData();
    }
  }
}