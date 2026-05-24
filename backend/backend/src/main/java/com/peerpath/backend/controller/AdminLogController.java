package com.peerpath.backend.controller;

import com.peerpath.backend.service.AdminLoggerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AdminLogController {

    @Autowired
    private AdminLoggerService loggerService;

    // A test endpoint for your university requirement
    @PostMapping("/test-file-io")
    public Map<String, String> testFileLog(@RequestBody Map<String, String> request) {
        String adminName = request.getOrDefault("admin", "Unknown Admin");
        String action = request.getOrDefault("action", "Did something suspicious");

        // Trigger the File I/O write
        loggerService.logAction(adminName, action);

        return Map.of("status", "Success", "message", "Admin action permanently logged to text file!");
    }
}