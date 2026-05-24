package com.peerpath.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "post_resources")
public class PostResource {

    @EmbeddedId
    private PostResourceId id = new PostResourceId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("postId")
    @JoinColumn(name = "post_id")
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("resourceId")
    @JoinColumn(name = "resource_id")
    private Resource resource;

    @Column(name = "order_number", nullable = false)
    private Integer orderNumber = 0;

    // --- GETTERS AND SETTERS ---
    public PostResourceId getId() { return id; }
    public void setId(PostResourceId id) { this.id = id; }

    public Post getPost() { return post; }
    public void setPost(Post post) { this.post = post; }

    public Resource getResource() { return resource; }
    public void setResource(Resource resource) { this.resource = resource; }

    public Integer getOrderNumber() { return orderNumber; }
    public void setOrderNumber(Integer orderNumber) { this.orderNumber = orderNumber; }
}