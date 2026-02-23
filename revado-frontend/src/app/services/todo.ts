import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Required for API calls
import { Observable } from 'rxjs'; // Required for handling async data
import { Todo, Subtask } from '../models/todo.model'


@Injectable({
  providedIn: 'root'
})
// export class TodoService {
//   private mockTodos: Todo[] = [
//     { 
//       id: 1, 
//       title: 'Finish Revature Project', 
//       description: 'Complete the RevaDo Angular frontend', 
//       isCompleted: false, 
//       subtasks: [{ id: 101, title: 'Create Service', isCompleted: true }]
//     }
//   ];

//   getTodos(): Todo[] {
//     return this.mockTodos;
//   }

//   // Inside your TodoService class
// addTodo(newTodo: Todo) {
//   this.mockTodos.push(newTodo);
// }


// // Inside your TodoService class
// deleteTodo(id: number) {
//   this.mockTodos = this.mockTodos.filter(t => t.id !== id);
// }

// toggleTodo(id: number) {
//   const todo = this.mockTodos.find(t => t.id === id);
//   if (todo) {
//     todo.isCompleted = !todo.isCompleted;
//   }
// }


// // Inside your TodoService class
// addSubtask(todoId: number, subtaskTitle: string) {
//   const todo = this.mockTodos.find(t => t.id === todoId);
//   if (todo) {
//     const newSub: Subtask = {
//       id: Date.now(),
//       title: subtaskTitle,
//       isCompleted: false
//     };
//     todo.subtasks.push(newSub);
//   }
// }

// toggleSubtask(todoId: number, subtaskId: number) {
//   const todo = this.mockTodos.find(t => t.id === todoId);
//   const sub = todo?.subtasks.find(s => s.id === subtaskId);
//   if (sub) {
//     sub.isCompleted = !sub.isCompleted;
//   }
// }

// // Inside TodoService in src/app/services/todo.ts
// deleteSubtask(todoId: number, subtaskId: number) {
//   const todo = this.mockTodos.find(t => t.id === todoId);
//   if (todo) {
//     todo.subtasks = todo.subtasks.filter(s => s.id !== subtaskId);
//   }
// }

export class TodoService {
  // This URL matches your Spring Boot @RequestMapping("/api/todos")
  private apiUrl = 'http://localhost:8080/api/todos';

  constructor(private http: HttpClient) { }

  // 1. Get all Todos from SQLite
  getTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.apiUrl);
  }

  // 2. Add a new Todo to the database
  addTodo(newTodo: Todo): Observable<Todo> {
    return this.http.post<Todo>(this.apiUrl, newTodo);
  }

  // 3. Delete a Todo by ID
  deleteTodo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // 4. Update a Todo (Toggle status)
  // Note: Your backend Controller needs a PUT method for this!
  updateTodo(todo: Todo): Observable<Todo> {
    return this.http.put<Todo>(`${this.apiUrl}/${todo.id}`, todo);
  }

  // --- SUBTASK METHODS ---
  // Since subtasks are nested inside Todo in your Java Entity, 
  // usually you just update the whole Todo object.
}
