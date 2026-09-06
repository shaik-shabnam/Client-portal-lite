package com.clientportal.repository;

import com.clientportal.entity.Deliverable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliverableRepository extends JpaRepository<Deliverable, Long> {
    List<Deliverable> findByProjectIdOrderByCreatedAtDesc(Long projectId);
    List<Deliverable> findByProjectIdAndCategoryOrderByCreatedAtDesc(Long projectId, Deliverable.Category category);
    long countByProjectIdAndStatus(Long projectId, Deliverable.DeliverableStatus status);
}
