package com.backend.myapp_backend.Repository;

import com.backend.myapp_backend.Entity.task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface taskrepository extends JpaRepository<task, Long> {
    
}