package com.peerpath.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "blacklisted_domains")
public class BlacklistedDomain {

    @Id
    @Column(length = 255)
    private String domain; // The domain string is the Primary Key

    @Column(length = 255)
    private String reason;

    @CreationTimestamp
    @Column(name = "added_at", updatable = false)
    private LocalDateTime addedAt;

    // --- GETTERS AND SETTERS ---
    public String getDomain() { return domain; }
    public void setDomain(String domain) { this.domain = domain; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public LocalDateTime getAddedAt() { return addedAt; }
}