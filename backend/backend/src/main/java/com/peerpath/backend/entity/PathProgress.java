package com.peerpath.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "path_progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"follow_id", "resource_id"})
})
public class PathProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "progress_id")
    private Long progressId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "follow_id", nullable = false)
    private FollowPath followPath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    @Column(name = "is_completed", nullable = false)
    private boolean isCompleted = false;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "time_to_completion")
    private Integer timeToCompletion; // Time spent on this step

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // --- GETTERS AND SETTERS ---
    public Long getProgressId() { return progressId; }
    public void setProgressId(Long progressId) { this.progressId = progressId; }

    public FollowPath getFollowPath() { return followPath; }
    public void setFollowPath(FollowPath followPath) { this.followPath = followPath; }

    public Resource getResource() { return resource; }
    public void setResource(Resource resource) { this.resource = resource; }

    public boolean isCompleted() { return isCompleted; }
    public void setCompleted(boolean completed) { this.isCompleted = completed; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }

    public Integer getTimeToCompletion() { return timeToCompletion; }
    public void setTimeToCompletion(Integer timeToCompletion) { this.timeToCompletion = timeToCompletion; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}