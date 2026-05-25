package com.peerpath.backend.repository;

import com.peerpath.backend.entity.FollowPath;
import com.peerpath.backend.entity.Post;
import com.peerpath.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowPathRepository extends JpaRepository<FollowPath, Long> {
    Optional<FollowPath> findByUserAndPost(User user, Post post);

    List<FollowPath> findByPost(Post post);
}