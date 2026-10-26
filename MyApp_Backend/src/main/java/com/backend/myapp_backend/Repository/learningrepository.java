package com.backend.myapp_backend.Repository;

import com.backend.myapp_backend.Entity.learning;
import org.springframework.data.jpa.repository.JpaRepository;

public interface learningrepository extends JpaRepository<learning, Long> {
    
}
