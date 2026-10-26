
package com.backend.myapp_backend.Service;

import com.backend.myapp_backend.Entity.task;
import com.backend.myapp_backend.Repository.taskrepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class taskservice {

    private final taskrepository taskRepository;

    public taskservice(taskrepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public task createTask(task task) {
        return taskRepository.save(task);
    }

    public List<task> getAllTasks() {
        return taskRepository.findAll();
    }

    public task getTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Task not found with id: " + id));
    }
    public task updateTask(Long id, task updatedTask) {
        task existingTask = getTaskById(id);
        existingTask.setTitle(updatedTask.getTitle());
        existingTask.setCategory(updatedTask.getCategory());
        existingTask.setDueDate(updatedTask.getDueDate());
        existingTask.setStatus(updatedTask.getStatus());
        existingTask.setPriority(updatedTask.getPriority());
        existingTask.setNote(updatedTask.getNote());
        return taskRepository.save(existingTask);
    }
    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }
}
