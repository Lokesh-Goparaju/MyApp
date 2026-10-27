package com.backend.myapp_backend.Service;

import com.backend.myapp_backend.Entity.job;
import com.backend.myapp_backend.Repository.jobrepository;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class jobservice {
    private final jobrepository jobRepository;

    public jobservice(jobrepository jobRepository) {
        this.jobRepository = jobRepository;
    }

    public job createJob(job job) {
        return jobRepository.save(job);
    }

    public List<job> getAllJobs() {
        return jobRepository.findAll();
    }

    public job getJobById(Long id) {
        return jobRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Job not found with id: " + id));
    }

    public job updateJob(Long id, job updatedJob) {
        job existingJob = getJobById(id);
        existingJob.setCompany(updatedJob.getCompany());
        existingJob.setPosition(updatedJob.getPosition());
        existingJob.setStatus(updatedJob.getStatus());
        existingJob.setApplicationDate(updatedJob.getApplicationDate());
        existingJob.setNextSteps(updatedJob.getNextSteps());
        existingJob.setAction(updatedJob.getAction());
        return jobRepository.save(existingJob);
    }

    public void deleteJob(Long id) {
        jobRepository.deleteById(id);
    }


}
