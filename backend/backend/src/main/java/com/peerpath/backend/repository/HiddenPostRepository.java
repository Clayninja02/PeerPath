package com.peerpath.backend.repository;

import com.peerpath.backend.entity.HiddenPost;
import com.peerpath.backend.entity.Post;
import com.peerpath.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HiddenPostRepository extends JpaRepository<HiddenPost, Long> {
    Optional<HiddenPost> findByUserAndPost(User user, Post post);

    List<HiddenPost> findByUser(User user);

    List<HiddenPost> findByPost(Post post);
}