package com.clientportal.repository;

import com.clientportal.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByMilestoneIdOrderByCreatedAtAsc(Long milestoneId);

    @Query("SELECT t FROM Task t WHERE t.milestone.project.id = :projectId ORDER BY t.createdAt ASC")
    List<Task> findByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT t FROM Task t WHERE t.milestone.project.id = :projectId AND t.status = :status")
    List<Task> findByProjectIdAndStatus(@Param("projectId") Long projectId, @Param("status") Task.Status status);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.milestone.project.id = :projectId")
    long countByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.milestone.project.id = :projectId AND t.status = 'DONE'")
    long countDoneByProjectId(@Param("projectId") Long projectId);
}
