package com.backend.myapp_backend.Controller;

import com.backend.myapp_backend.Entity.job;
import com.backend.myapp_backend.Service.jobservice;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/job")
@CrossOrigin(origins = {"http://localhost:5500","http://1200.0.1:5500"})
public class jobcontroller {
    private final jobservice jobService;

    public jobcontroller(jobservice jobService) {
        this.jobService = jobService;
    }

    @PostMapping
    public job createJob(@RequestBody job job) {
        return jobService.createJob(job);
    }

    @GetMapping
    public List<job> getAllJobs() {
        return jobService.getAllJobs();
    }

    @GetMapping("/{id}")
    public job getJobById(@PathVariable Long id) {
        return jobService.getJobById(id);
    }

    @PutMapping("/{id}")
    public job updateJob(@PathVariable Long id, @RequestBody job job) {
        return jobService.updateJob(id, job);
    }

    @DeleteMapping("/{id}")
    public void deleteJob(@PathVariable Long id) {
        jobService.deleteJob(id);
    }
}
