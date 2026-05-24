package com.peerpath.backend.service;

import com.peerpath.backend.repository.BlacklistedDomainRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;

@Service
public class UrlValidationService {

    @Autowired
    private BlacklistedDomainRepository blacklistRepo;

    // The @Async annotation tells Spring to run this method on a separate background thread!
    @Async
    public void validateResourceLinksInBackground(Long postId, String url) {
        // Logging the thread name is great for your project report to prove you used threads!
        System.out.println("🧵 [THREAD: " + Thread.currentThread().getName() + "] Starting background URL check for: " + url);

        try {
            // Simulate processing time (so we can actually see the thread working in the background)
            Thread.sleep(2000); 

            // Extract the domain from the URL
            URI uri = new URI(url);
            String domain = uri.getHost();

            if (domain != null && domain.startsWith("www.")) {
                domain = domain.substring(4);
            }

            // Check the database
            boolean isBlacklisted = blacklistRepo.existsByDomain(domain);

            if (isBlacklisted) {
                System.out.println("🚨 [WARNING] Blacklisted domain detected in background: " + domain);
                // TODO: Later, we will add code here to auto-flag the post or delete the resource!
            } else {
                System.out.println("✅ [CLEAN] URL passed background validation: " + domain);
            }

        } catch (Exception e) {
            System.out.println("❌ [ERROR] Failed to parse URL: " + e.getMessage());
        }
    }
}