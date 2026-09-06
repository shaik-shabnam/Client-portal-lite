package com.clientportal.repository;

import com.clientportal.entity.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findByProjectIdOrderByCreatedAtDesc(Long projectId);
    List<ActivityLog> findByProjectIdOrderByCreatedAtDesc(Long projectId, Pageable pageable);

    @Modifying
    @Query("UPDATE ActivityLog a SET a.createdAt = :ts WHERE a.id = :id")
    void backdateCreatedAt(@Param("id") Long id, @Param("ts") LocalDateTime ts);
}
