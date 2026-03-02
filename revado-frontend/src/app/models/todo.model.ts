export interface Subtask {
    id?: number;
    title: string;
    completed: boolean;
    isEditing?: boolean;
  }
  
  export interface Todo {
    id?: number;
    title: string;
    description: string;
    category?: string;
    priority: 'High' | 'Medium' | 'Low';
    dueDate?: string;
    completed: boolean;
    archived: boolean;
    subtasks: Subtask[]; // Array of subtasks inside the Todo
    isEditing?: boolean;
  }

  