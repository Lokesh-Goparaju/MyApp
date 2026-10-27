package com.backend.myapp_backend.Repository;

import com.backend.myapp_backend.Entity.job;
import org.springframework.data.jpa.repository.JpaRepository;

public interface jobrepository extends JpaRepository<job, Long> {
    
}
