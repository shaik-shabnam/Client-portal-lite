package com.clientportal.repository;

import com.clientportal.entity.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, Long> {
    List<Milestone> findByProjectIdOrderByTargetDateAsc(Long projectId);
    long countByProjectIdAndIsCompleted(Long projectId, Boolean isCompleted);
}
