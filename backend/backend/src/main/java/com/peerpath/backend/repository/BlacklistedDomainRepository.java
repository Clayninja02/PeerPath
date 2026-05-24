package com.peerpath.backend.repository;

import com.peerpath.backend.entity.BlacklistedDomain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BlacklistedDomainRepository extends JpaRepository<BlacklistedDomain, String> {
    // Spring Boot automatically writes the SQL query for this!
    boolean existsByDomain(String domain);
}