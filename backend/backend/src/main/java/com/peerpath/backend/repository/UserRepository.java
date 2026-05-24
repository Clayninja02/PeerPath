package com.peerpath.backend.repository;

import com.peerpath.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Spring Boot automatically writes the SQL query to find a user by email!
    Optional<User> findByEmail(String email);
}