package com.peerpath.backend.repository;

import com.peerpath.backend.entity.PostChatMessage;
import com.peerpath.backend.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostChatMessageRepository extends JpaRepository<PostChatMessage, Long> {
    List<PostChatMessage> findByPostOrderByCreatedAtDesc(Post post);
}