package com.backend.myapp_backend.Controller;

import org.springframework.web.bind.annotation.*;
import com.backend.myapp_backend.Entity.learning;
import com.backend.myapp_backend.Service.learningservice;

import java.util.List;

@RestController 
@RequestMapping("/api/learning")
@CrossOrigin(origins = {"http://localhost:5500","http://12007.0.0.1:5500"})
public class learningcontroller {
    private final learningservice learningService;

    public learningcontroller(learningservice learningService) {
        this.learningService = learningService;
    }
    
    @PostMapping
    public learning createLearning(@RequestBody learning learning) {
        return learningService.createLearning(learning);
    }

    @GetMapping
    public List<learning> getAllLearnings() {
        return learningService.getAllLearnings();
    }

    @GetMapping({"/id"})
    public learning getLearningById(@PathVariable Long id) {
        return learningService.getLearningById(id);
    }

    @PutMapping({"/id"})
    public learning updateLearning(@PathVariable Long id, @RequestBody learning learning) {
        return learningService.updateLearning(id, learning);
    }

    @DeleteMapping({"/id"})
    public void deleteLearning(@PathVariable Long id) {
        learningService.deleteLearning(id);
    }
}
