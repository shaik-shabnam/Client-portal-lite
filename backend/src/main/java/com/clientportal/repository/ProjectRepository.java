package com.clientportal.repository;

import com.clientportal.entity.Project;
import com.clientportal.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    @Query("SELECT p FROM Project p JOIN FETCH p.admin JOIN FETCH p.client WHERE p.admin = :admin ORDER BY p.createdAt DESC")
    List<Project> findByAdminOrderByCreatedAtDesc(@Param("admin") User admin);

    @Query("SELECT p FROM Project p JOIN FETCH p.admin JOIN FETCH p.client WHERE p.client = :client ORDER BY p.createdAt DESC")
    List<Project> findByClientOrderByCreatedAtDesc(@Param("client") User client);

    @Query("SELECT p FROM Project p JOIN FETCH p.admin JOIN FETCH p.client WHERE p.admin = :user OR p.client = :user ORDER BY p.createdAt DESC")
    List<Project> findByAdminOrClient(@Param("user") User user);

    @Query("SELECT p FROM Project p JOIN FETCH p.admin JOIN FETCH p.client ORDER BY p.createdAt DESC")
    List<Project> findAllWithUsers();

    @Query("SELECT p FROM Project p JOIN FETCH p.admin JOIN FETCH p.client WHERE p.id = :id")
    Optional<Project> findByIdWithUsers(@Param("id") Long id);

    @Query("SELECT COUNT(p) FROM Project p WHERE p.admin.id = :adminId")
    long countByAdminId(@Param("adminId") Long adminId);

    @Query("SELECT COUNT(p) FROM Project p WHERE p.admin.id = :adminId AND p.status = 'COMPLETED'")
    long countCompletedByAdminId(@Param("adminId") Long adminId);
}
