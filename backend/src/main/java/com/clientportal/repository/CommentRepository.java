package com.clientportal.repository;

import com.clientportal.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTaskIdOrderByCreatedAtAsc(Long taskId);
    List<Comment> findByDeliverableIdOrderByCreatedAtAsc(Long deliverableId);
}
