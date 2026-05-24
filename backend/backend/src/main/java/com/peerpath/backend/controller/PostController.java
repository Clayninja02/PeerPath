package com.peerpath.backend.controller;

import com.peerpath.backend.entity.Post;
import com.peerpath.backend.entity.Resource;
import com.peerpath.backend.entity.Skill;
import com.peerpath.backend.repository.PostRepository;
import com.peerpath.backend.repository.SkillRepository;
import com.peerpath.backend.service.UrlValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*")
public class PostController {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private UrlValidationService urlValidationService;

    // ==========================================
    // GET ALL POSTS
    // ==========================================
    @GetMapping
    public ResponseEntity<List<Post>> getAllPosts() {
        return ResponseEntity.ok(postRepository.findAllByOrderByCreatedAtDesc());
    }

    // ==========================================
    // CREATE POST
    // ==========================================
    @PostMapping
    @Transactional
    public ResponseEntity<?> createPost(@RequestBody PostRequest payload) {

        // 1. Get the real author name from the JWT token via Spring Security
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String authorEmail = authentication.getName(); // This is the email from JWT

        // Use the email username part as display name if no better option
        // Later you can look up user.getuName() from UserRepository if preferred
        String authorName = authorEmail.contains("@")
                ? authorEmail.substring(0, authorEmail.indexOf("@"))
                : authorEmail;

        // 2. Validate payload basics
        if (payload.getTitle() == null || payload.getTitle().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("message", "Title is required."));
        }

        // 3. Resolve Skill: find existing or create new
        String skillName = (payload.getSkillName() != null && !payload.getSkillName().trim().isEmpty())
                ? payload.getSkillName().trim()
                : "General Engineering";

        Skill skill = skillRepository.findBysName(skillName)
                .orElseGet(() -> {
                    Skill newSkill = new Skill();
                    newSkill.setsName(skillName);
                    return skillRepository.save(newSkill);
                });

        // 4. Build the Post
        Post newPost = new Post();
        newPost.setTitle(payload.getTitle().trim());
        newPost.setDescription(payload.getDescription() != null ? payload.getDescription().trim() : "");
        newPost.setAuthorName(authorName);
        newPost.setSkill(skill);

        // 5. Attach Resources and trigger background URL validation
        if (payload.getResources() != null) {
            for (ResourceRequest req : payload.getResources()) {
                Resource resource = new Resource();
                resource.setTitle(req.getTitle() != null ? req.getTitle() : "Untitled Step");
                resource.setUrl(req.getUrl());
                resource.setType(req.getType() != null ? req.getType() : "article");
                resource.setOrderNumber(req.getOrderNumber());
                newPost.addResource(resource);

                // Fire background URL validation (non-blocking)
                if (req.getUrl() != null && !req.getUrl().trim().isEmpty()) {
                    urlValidationService.validateResourceLinksInBackground(null, req.getUrl());
                }
            }
        }

        // 6. Save and return
        Post savedPost = postRepository.save(newPost);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPost);
    }

    // ==========================================
    // LIKE A POST
    // ==========================================
    @PostMapping("/{id}/like")
    @Transactional
    public ResponseEntity<?> likePost(@PathVariable Long id) {
        Post post = postRepository.findById(id).orElse(null);
        if (post == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(java.util.Map.of("message", "Post not found"));
        }
        post.setLikes(post.getLikes() + 1);
        postRepository.save(post);
        return ResponseEntity.ok(java.util.Map.of("likes", post.getLikes()));
    }
}

// ==========================================
// DTOs (Data Transfer Objects)
// ==========================================
class PostRequest {
    private String title;
    private String description;
    private String skillName;
    private List<ResourceRequest> resources;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getSkillName() {
        return skillName;
    }

    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }

    public List<ResourceRequest> getResources() {
        return resources;
    }

    public void setResources(List<ResourceRequest> resources) {
        this.resources = resources;
    }
}

class ResourceRequest {
    private String type;
    private String title;
    private String url;
    private int orderNumber;

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public int getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(int orderNumber) {
        this.orderNumber = orderNumber;
    }
}