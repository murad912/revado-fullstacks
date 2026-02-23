export interface Subtask {
    id: number;
    title: string;
    completed: boolean;
    isEditing?: boolean;
  }
  
  export interface Todo {
    id: number;
    title: string;
    description: string;
    completed: boolean;
    subtasks: Subtask[]; // Array of subtasks inside the Todo
    isEditing?: boolean;
  }