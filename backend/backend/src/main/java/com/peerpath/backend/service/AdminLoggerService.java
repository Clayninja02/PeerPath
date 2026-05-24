package com.peerpath.backend.service;

import org.springframework.stereotype.Service;
import java.io.FileWriter;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class AdminLoggerService {

    // This will create a file right in your main project folder
    private static final String FILE_PATH = "admin_security_log.txt";

    public void logAction(String adminName, String action) {
        // The 'true' parameter in FileWriter tells Java to APPEND to the file, not overwrite it!
        try (FileWriter fileWriter = new FileWriter(FILE_PATH, true);
             PrintWriter printWriter = new PrintWriter(fileWriter)) {

            String timeStamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
            String logEntry = String.format("[%s] ADMIN: %s | ACTION: %s", timeStamp, adminName, action);
            
            // Write to the actual .txt file
            printWriter.println(logEntry);
            
            // Print to console so we can see it happening
            System.out.println("📝 [FILE I/O] Successfully wrote to " + FILE_PATH);

        } catch (IOException e) {
            System.out.println("❌ [FILE I/O] Error writing to log file: " + e.getMessage());
        }
    }
}