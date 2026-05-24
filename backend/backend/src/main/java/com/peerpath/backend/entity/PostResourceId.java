package com.peerpath.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class PostResourceId implements Serializable {

    @Column(name = "post_id")
    private Long postId;

    @Column(name = "resource_id")
    private Long resourceId;

    public PostResourceId() {}

    public PostResourceId(Long postId, Long resourceId) {
        this.postId = postId;
        this.resourceId = resourceId;
    }

    // --- GETTERS, SETTERS, EQUALS & HASHCODE ---
    public Long getPostId() { return postId; }
    public void setPostId(Long postId) { this.postId = postId; }

    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PostResourceId that = (PostResourceId) o;
        return Objects.equals(postId, that.postId) && Objects.equals(resourceId, that.resourceId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(postId, resourceId);
    }
}