package com.revado.Controller;

import com.revado.model.Subtask;
import com.revado.model.Todo;
import com.revado.serivce.TodoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/todos")
//@CrossOrigin(origins = "http://localhost:4200") // Allow Angular access
@CrossOrigin(origins = "http://localhost:5173")
public class TodoController {

    @Autowired
    private TodoService todoService;

    @GetMapping
    public List<Todo> getTodos() {
        return todoService.getAllTodos();
    }

    @PostMapping
    public Todo createTodo(@RequestBody Todo todo) {
        return todoService.saveTodo(todo);
    }

    @DeleteMapping("/{id}")
    public void deleteTodo(@PathVariable Long id) {
        todoService.deleteTodo(id);
    }

    // Add this to your TodoController.java in IntelliJ
    @PutMapping("/{id}")
    public Todo updateTodo(@PathVariable Long id, @RequestBody Todo todo) {
        // 1. Force the ID to match the URL
        todo.setId(id);

        // 2. THIS IS THE CRITICAL LINK:
        // Without this loop, the subtasks are 'orphans' and SQLite ignores them
        if (todo.getSubtasks() != null) {
            for (Subtask sub : todo.getSubtasks()) {
                sub.setTodo(todo); // Manually link child to parent
            }
        }

        return todoService.saveTodo(todo);
    }



    @PostMapping("/{todoId}/subtasks")
    public Todo addSubtask(@PathVariable Long todoId, @RequestBody Subtask subtask) {
        Todo todo = todoService.getTodoById(todoId);
        subtask.setTodo(todo); // Link subtask to the parent
        todo.getSubtasks().add(subtask);
        return todoService.saveTodo(todo);
    }


    @PutMapping("/{todoId}/subtasks/{subtaskId}")
    public Todo updateSubtask(@PathVariable Long todoId,
                              @PathVariable Long subtaskId,
                              @RequestBody Subtask subtaskDetails) {
        Todo todo = todoService.getTodoById(todoId);

        // Find the subtask in the list and update its status
        todo.getSubtasks().stream()
                .filter(s -> s.getId().equals(subtaskId))
                .forEach(s -> s.setCompleted(subtaskDetails.isCompleted()));

        return todoService.saveTodo(todo);
    }

    @DeleteMapping("/{todoId}/subtasks/{subtaskId}")
    public Todo deleteSubtask(@PathVariable Long todoId, @PathVariable Long subtaskId) {
        Todo todo = todoService.getTodoById(todoId);

        // Remove the subtask from the list based on its ID
        todo.getSubtasks().removeIf(sub -> sub.getId().equals(subtaskId));

        // Save the updated Todo (this will orphan and delete the subtask in the DB)
        return todoService.saveTodo(todo);
    }
}