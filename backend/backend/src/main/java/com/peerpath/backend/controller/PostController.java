package com.peerpath.backend.controller;

import com.peerpath.backend.entity.Post;
import com.peerpath.backend.entity.Resource;
import com.peerpath.backend.entity.Skill;
import com.peerpath.backend.repository.PostRepository;
import com.peerpath.backend.repository.SkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:5173") 
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private SkillRepository skillRepository;

    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        return ResponseEntity.ok(postRepository.findAllByOrderByCreatedAtDesc());
    }

    @PostMapping
    @Transactional // Ensures the Post and all its Resources are saved as one unit
    public ResponseEntity<Post> createPost(@RequestBody PostRequest payload) {
        // 1. Resolve Skill: Find existing or create new if it doesn't exist
        String skillName = (payload.getSkillName() != null && !payload.getSkillName().isEmpty()) 
                           ? payload.getSkillName() : "General";
                           
        Skill skill = skillRepository.findBysName(skillName)
                .orElseGet(() -> {
                    Skill newSkill = new Skill();
                    newSkill.setsName(skillName);
                    return skillRepository.save(newSkill);
                });

        // 2. Initialize Post
        Post newPost = new Post();
        newPost.setTitle(payload.getTitle());
        newPost.setDescription(payload.getDescription());
        newPost.setAuthorName("Student"); // Placeholder for JWT User
        newPost.setSkill(skill); // LINK THE ID HERE
        
        // 3. Attach Resources (if any)
        if (payload.getResources() != null) {
            for (ResourceRequest req : payload.getResources()) {
                Resource resource = new Resource();
                resource.setTitle(req.getTitle());
                resource.setUrl(req.getUrl());
                resource.setType(req.getType());
                resource.setOrderNumber(req.getOrderNumber());
                newPost.addResource(resource);
            }
        }
        
        Post savedPost = postRepository.save(newPost);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPost);
    }
}

// --- DTOs (Data Transfer Objects) ---
class PostRequest {
    private String title;
    private String description;
    private String skillName;
    private List<ResourceRequest> resources;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getSkillName() { return skillName; }
    public void setSkillName(String skillName) { this.skillName = skillName; }
    public List<ResourceRequest> getResources() { return resources; }
    public void setResources(List<ResourceRequest> resources) { this.resources = resources; }
}

class ResourceRequest {
    private String type;
    private String title;
    private String url;
    private int orderNumber;

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public int getOrderNumber() { return orderNumber; }
    public void setOrderNumber(int orderNumber) { this.orderNumber = orderNumber; }
}