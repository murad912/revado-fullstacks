package com.revado.Controller;

import com.revado.model.Subtask;
import com.revado.model.Todo;
import com.revado.serivce.TodoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/todos")
@CrossOrigin(origins = "http://localhost:4200") // Allow Angular access
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
}