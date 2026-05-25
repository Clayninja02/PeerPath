package com.peerpath.backend.controller;

import com.peerpath.backend.entity.*;
import com.peerpath.backend.repository.*;
import com.peerpath.backend.service.UrlValidationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*")
public class PostController {

    @Autowired
    private PostRepository postRepository;
    @Autowired
    private SkillRepository skillRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private LikeDislikeRepository likeDislikeRepository;
    @Autowired
    private CommentRepository commentRepository;
    @Autowired
    private FollowPathRepository followPathRepository;
    @Autowired
    private PostChatMessageRepository postChatMessageRepository;
    @Autowired
    private HiddenPostRepository hiddenPostRepository; // NEW INJECTION
    @Autowired
    private UrlValidationService urlValidationService;

    private User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName().equals("anonymousUser")) {
            return null;
        }
        return userRepository.findByEmail(auth.getName()).orElse(null);
    }

    // ==========================================
    // GET ALL POSTS (NOW EXCLUDES HIDDEN POSTS)
    // ==========================================
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<Post>> getAllPosts() {
        User currentUser = getAuthenticatedUser();
        List<Post> allPosts = postRepository.findAllByOrderByCreatedAtDesc();

        if (currentUser != null) {
            // Find IDs of posts the user has hidden
            List<Long> hiddenPostIds = hiddenPostRepository.findByUser(currentUser)
                    .stream()
                    .map(hp -> hp.getPost().getId())
                    .collect(Collectors.toList());

            // Filter them out
            allPosts = allPosts.stream()
                    .filter(p -> !hiddenPostIds.contains(p.getId()))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(allPosts);
    }

    @PostMapping
    @Transactional
    public ResponseEntity<?> createPost(@RequestBody PostRequest payload) {
        User currentUser = getAuthenticatedUser();
        if (currentUser == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        if (payload.getTitle() == null || payload.getTitle().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Title is required."));
        }

        String skillName = (payload.getSkillName() != null && !payload.getSkillName().trim().isEmpty())
                ? payload.getSkillName().trim()
                : "General Engineering";

        Skill skill = skillRepository.findBysName(skillName).orElseGet(() -> {
            Skill newSkill = new Skill();
            newSkill.setsName(skillName);
            return skillRepository.save(newSkill);
        });

        Post newPost = new Post();
        newPost.setTitle(payload.getTitle().trim());
        newPost.setDescription(payload.getDescription() != null ? payload.getDescription().trim() : "");
        newPost.setAuthorName(currentUser.getuName());
        newPost.setSkill(skill);

        if (payload.getResources() != null) {
            for (ResourceRequest req : payload.getResources()) {
                Resource resource = new Resource();
                resource.setTitle(req.getTitle() != null ? req.getTitle() : "Untitled Step");
                resource.setUrl(req.getUrl());
                resource.setType(req.getType() != null ? req.getType() : "article");
                resource.setOrderNumber(req.getOrderNumber());
                newPost.addResource(resource);
            }
        }

        Post savedPost = postRepository.save(newPost);
        if (savedPost.getResources() != null) {
            for (Resource res : savedPost.getResources()) {
                if (res.getUrl() != null && !res.getUrl().trim().isEmpty()) {
                    urlValidationService.validateResourceLinksInBackground(res.getId(), res.getUrl());
                }
            }
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(savedPost);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<?> editPost(@PathVariable Long id, @RequestBody PostRequest payload) {
        User user = getAuthenticatedUser();
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Post post = postRepository.findById(id).orElse(null);
        if (post == null)
            return ResponseEntity.notFound().build();

        if (!post.getAuthorName().equals(user.getuName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only edit your own posts"));
        }

        String skillName = (payload.getSkillName() != null && !payload.getSkillName().trim().isEmpty())
                ? payload.getSkillName().trim()
                : "General Engineering";

        Skill skill = skillRepository.findBysName(skillName).orElseGet(() -> {
            Skill newSkill = new Skill();
            newSkill.setsName(skillName);
            return skillRepository.save(newSkill);
        });

        post.setTitle(payload.getTitle().trim());
        post.setDescription(payload.getDescription() != null ? payload.getDescription().trim() : "");
        post.setSkill(skill);

        post.getResources().clear();
        if (payload.getResources() != null) {
            for (ResourceRequest req : payload.getResources()) {
                Resource resource = new Resource();
                resource.setTitle(req.getTitle() != null ? req.getTitle() : "Untitled Step");
                resource.setUrl(req.getUrl());
                resource.setType(req.getType() != null ? req.getType() : "article");
                resource.setOrderNumber(req.getOrderNumber());
                post.addResource(resource);
            }
        }

        Post savedPost = postRepository.save(post);
        if (savedPost.getResources() != null) {
            for (Resource res : savedPost.getResources()) {
                if (res.getUrl() != null && !res.getUrl().trim().isEmpty()) {
                    urlValidationService.validateResourceLinksInBackground(res.getId(), res.getUrl());
                }
            }
        }
        return ResponseEntity.ok(savedPost);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Post post = postRepository.findById(id).orElse(null);
        if (post == null)
            return ResponseEntity.notFound().build();

        if (!post.getAuthorName().equals(user.getuName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only delete your own posts"));
        }

        // Clean up linked data
        commentRepository.deleteAll(commentRepository.findByPostOrderByCreatedAtDesc(post));
        postChatMessageRepository.deleteAll(postChatMessageRepository.findByPostOrderByCreatedAtDesc(post));
        likeDislikeRepository.deleteAll(likeDislikeRepository.findByPost(post));
        followPathRepository.deleteAll(followPathRepository.findByPost(post));
        hiddenPostRepository.deleteAll(hiddenPostRepository.findByPost(post)); // NEW CLEANUP

        postRepository.delete(post);
        return ResponseEntity.ok(Map.of("message", "Post deleted successfully"));
    }

    // ==========================================
    // HIDE POST (NEW)
    // ==========================================
    @PostMapping("/{id}/hide")
    @Transactional
    public ResponseEntity<?> hidePost(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Post post = postRepository.findById(id).orElse(null);
        if (post == null)
            return ResponseEntity.notFound().build();

        Optional<HiddenPost> existingHidden = hiddenPostRepository.findByUserAndPost(user, post);

        if (existingHidden.isEmpty()) {
            HiddenPost hiddenPost = new HiddenPost();
            hiddenPost.setUser(user);
            hiddenPost.setPost(post);
            hiddenPostRepository.save(hiddenPost);
        }

        return ResponseEntity.ok(Map.of("message", "Post permanently hidden"));
    }

    @PostMapping("/{id}/like")
    @Transactional
    public ResponseEntity<?> toggleLike(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Post post = postRepository.findById(id).orElse(null);
        if (post == null)
            return ResponseEntity.notFound().build();

        Optional<LikeDislike> existingLike = likeDislikeRepository.findByUserAndPost(user, post);

        if (existingLike.isPresent()) {
            likeDislikeRepository.delete(existingLike.get());
            post.setLikes(post.getLikes() - 1);
        } else {
            LikeDislike newLike = new LikeDislike();
            newLike.setUser(user);
            newLike.setPost(post);
            newLike.setType("like");
            likeDislikeRepository.save(newLike);
            post.setLikes(post.getLikes() + 1);
        }

        postRepository.save(post);
        return ResponseEntity.ok(Map.of("likes", post.getLikes()));
    }

    @GetMapping("/{id}/comments")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getComments(@PathVariable Long id) {
        Post post = postRepository.findById(id).orElse(null);
        if (post == null)
            return ResponseEntity.notFound().build();

        List<CommentResponse> comments = commentRepository.findByPostOrderByCreatedAtDesc(post)
                .stream()
                .map(c -> new CommentResponse(c.getCommentId(), c.getContent(), c.getUser().getuName(),
                        c.getCreatedAt()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(comments);
    }

    @PostMapping("/{id}/comments")
    @Transactional
    public ResponseEntity<?> addComment(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        User user = getAuthenticatedUser();
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Post post = postRepository.findById(id).orElse(null);
        if (post == null)
            return ResponseEntity.notFound().build();

        String content = payload.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Comment cannot be empty"));
        }

        Comment comment = new Comment();
        comment.setUser(user);
        comment.setPost(post);
        comment.setContent(content.trim());
        Comment savedComment = commentRepository.save(comment);

        post.setReplies(post.getReplies() + 1);
        postRepository.save(post);

        return ResponseEntity.ok(new CommentResponse(
                savedComment.getCommentId(),
                savedComment.getContent(),
                user.getuName(),
                savedComment.getCreatedAt()));
    }

    @PutMapping("/{postId}/comments/{commentId}")
    @Transactional
    public ResponseEntity<?> editComment(@PathVariable Long postId, @PathVariable Long commentId,
            @RequestBody Map<String, String> payload) {
        User user = getAuthenticatedUser();
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Comment comment = commentRepository.findById(commentId).orElse(null);
        if (comment == null || !comment.getPost().getId().equals(postId))
            return ResponseEntity.notFound().build();

        if (!comment.getUser().getUserId().equals(user.getUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only edit your own comments"));
        }

        String content = payload.get("content");
        if (content == null || content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Comment cannot be empty"));
        }

        comment.setContent(content.trim());
        Comment updatedComment = commentRepository.save(comment);

        return ResponseEntity.ok(new CommentResponse(updatedComment.getCommentId(), updatedComment.getContent(),
                user.getuName(), updatedComment.getCreatedAt()));
    }

    @DeleteMapping("/{postId}/comments/{commentId}")
    @Transactional
    public ResponseEntity<?> deleteComment(@PathVariable Long postId, @PathVariable Long commentId) {
        User user = getAuthenticatedUser();
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Comment comment = commentRepository.findById(commentId).orElse(null);
        if (comment == null || !comment.getPost().getId().equals(postId))
            return ResponseEntity.notFound().build();

        if (!comment.getUser().getUserId().equals(user.getUserId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only delete your own comments"));
        }

        commentRepository.delete(comment);
        Post post = comment.getPost();
        post.setReplies(Math.max(0, post.getReplies() - 1));
        postRepository.save(post);

        return ResponseEntity.ok(Map.of("message", "Comment deleted successfully"));
    }

    @GetMapping("/{id}/chat")
    @Transactional(readOnly = true)
    public ResponseEntity<?> getChatMessages(@PathVariable Long id) {
        Post post = postRepository.findById(id).orElse(null);
        if (post == null)
            return ResponseEntity.notFound().build();

        List<ChatMessageResponse> messages = postChatMessageRepository.findByPostOrderByCreatedAtDesc(post)
                .stream()
                .map(m -> new ChatMessageResponse(m.getId(), m.getMessage(), m.getSender().getuName(),
                        m.getCreatedAt()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(messages);
    }

    @PostMapping("/{id}/chat")
    @Transactional
    public ResponseEntity<?> sendChatMessage(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        User user = getAuthenticatedUser();
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Post post = postRepository.findById(id).orElse(null);
        if (post == null)
            return ResponseEntity.notFound().build();

        String messageTxt = payload.get("message");
        if (messageTxt == null || messageTxt.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Message cannot be empty"));
        }

        PostChatMessage chatMessage = new PostChatMessage();
        chatMessage.setPost(post);
        chatMessage.setSender(user);
        chatMessage.setMessage(messageTxt.trim());
        PostChatMessage savedMessage = postChatMessageRepository.save(chatMessage);

        return ResponseEntity.ok(new ChatMessageResponse(savedMessage.getId(), savedMessage.getMessage(),
                user.getuName(), savedMessage.getCreatedAt()));
    }

    @PostMapping("/{id}/follow")
    @Transactional
    public ResponseEntity<?> toggleFollow(@PathVariable Long id) {
        User user = getAuthenticatedUser();
        if (user == null)
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Post post = postRepository.findById(id).orElse(null);
        if (post == null)
            return ResponseEntity.notFound().build();

        Optional<FollowPath> existingFollow = followPathRepository.findByUserAndPost(user, post);

        if (existingFollow.isPresent()) {
            followPathRepository.delete(existingFollow.get());
            return ResponseEntity.ok(Map.of("following", false, "message", "Bookmark removed"));
        } else {
            FollowPath follow = new FollowPath();
            follow.setUser(user);
            follow.setPost(post);
            followPathRepository.save(follow);
            return ResponseEntity.ok(Map.of("following", true, "message", "Path bookmarked successfully"));
        }
    }
}

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

class CommentResponse {
    private Long id;
    private String content;
    private String authorName;
    private LocalDateTime createdAt;

    public CommentResponse(Long id, String content, String authorName, LocalDateTime createdAt) {
        this.id = id;
        this.content = content;
        this.authorName = authorName;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getContent() {
        return content;
    }

    public String getAuthorName() {
        return authorName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}

class ChatMessageResponse {
    private Long id;
    private String message;
    private String senderName;
    private LocalDateTime createdAt;

    public ChatMessageResponse(Long id, String message, String senderName, LocalDateTime createdAt) {
        this.id = id;
        this.message = message;
        this.senderName = senderName;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getMessage() {
        return message;
    }

    public String getSenderName() {
        return senderName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}