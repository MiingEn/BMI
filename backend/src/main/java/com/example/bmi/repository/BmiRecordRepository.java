package com.example.bmi.repository;

import com.example.bmi.model.BmiRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface BmiRecordRepository extends JpaRepository<BmiRecord, Long> {
    List<BmiRecord> findByUserUsernameOrderByCreatedAtDesc(String username);
    List<BmiRecord> findAllByOrderByCreatedAtDesc();
    long countByUserUsername(String username);

    @Transactional
    void deleteByUserId(Long userId);
}
