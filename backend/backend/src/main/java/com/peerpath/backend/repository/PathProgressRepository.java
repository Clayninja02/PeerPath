package com.peerpath.backend.repository;

import com.peerpath.backend.entity.PathProgress;
import com.peerpath.backend.entity.Post;
import com.peerpath.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PathProgressRepository extends JpaRepository<PathProgress, Long> {
    Optional<PathProgress> findByUserAndPost(User user, Post post);

    List<PathProgress> findByPost(Post post);
}