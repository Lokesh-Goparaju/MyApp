package com.backend.myapp_backend.Service;

import com.backend.myapp_backend.Entity.learning;
import com.backend.myapp_backend.Repository.learningrepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class learningservice {
    private final learningrepository learningRepository;

    public learningservice(learningrepository learningRepository) {
        this.learningRepository = learningRepository;
    }

    public learning createLearning(learning learning) {
        return learningRepository.save(learning);
    }

    public List<learning> getAllLearnings() {
        return learningRepository.findAll();
    }

    public learning getLearningById(Long id) {
        return learningRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Learning not found with id: " + id));
    }

    public learning updateLearning(Long id, learning updatedLearning) {
        learning existingLearning = getLearningById(id);
        existingLearning.setSkill(updatedLearning.getSkill());
        existingLearning.setStatus(updatedLearning.getStatus());
        existingLearning.setProgress(updatedLearning.getProgress());
        existingLearning.setTargetDate(updatedLearning.getTargetDate());
        existingLearning.setResources(updatedLearning.getResources());
        existingLearning.setAction(updatedLearning.getAction());
        return learningRepository.save(existingLearning);
    }

    public void deleteLearning(Long id) {
        learningRepository.deleteById(id);
    }

}
