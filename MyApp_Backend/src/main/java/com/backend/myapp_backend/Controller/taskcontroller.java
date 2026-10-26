package com.backend.myapp_backend.Controller;

import com.backend.myapp_backend.Entity.task;
import com.backend.myapp_backend.Service.taskservice;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = {"http://localhost:5500","http://127.0.0.1:5500"}
)
public class taskcontroller {
    private final taskservice taskService;

    public taskcontroller(taskservice taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public task createTask(@RequestBody task task) {
        return taskService.createTask(task);
    }

    @GetMapping
    public List<task> getAllTasks() {
        return taskService.getAllTasks();
    }

    @GetMapping("/{id}")
    public task getTaskById(@PathVariable Long id) {
        return taskService.getTaskById(id);
    }
    
    @PutMapping("/{id}")
    public task updateTask(@PathVariable Long id,@RequestBody task task){
        return taskService.updateTask(id, task);
    }

    @DeleteMapping("/{id}")
    public void deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
    }
    
}
