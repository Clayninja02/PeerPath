package com.peerpath.backend.repository;

import com.peerpath.backend.entity.LikeDislike;
import com.peerpath.backend.entity.Post;
import com.peerpath.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeDislikeRepository extends JpaRepository<LikeDislike, Long> {
    Optional<LikeDislike> findByUserAndPost(User user, Post post);
    List<LikeDislike> findByPost(Post post);
}