package com.peerpath.backend.controller;

import com.peerpath.backend.entity.User;
import com.peerpath.backend.repository.UserRepository;
import com.peerpath.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
//import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // ==========================================
    // 1. REGISTER ENDPOINT
    // ==========================================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> request) {
        String name = request.get("name");
        String email = request.get("email");
        String password = request.get("password");

        // 🛡️ FIX: Add strict input validation
        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Name is required"));
        }
        if (email == null || email.trim().isEmpty() || !email.contains("@")) {
            return ResponseEntity.badRequest().body(Map.of("message", "A valid email is required"));
        }
        if (password == null || password.trim().length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password must be at least 6 characters long"));
        }

        // Check if user already exists
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email already in use!"));
        }

        // Create new User
        User user = new User();
        user.setuName(name.trim());
        user.setEmail(email.trim().toLowerCase()); // Standardize emails to lowercase!
        user.setPassword(passwordEncoder.encode(password)); // Hash the password!
        user.setRole("user"); // Default role

        userRepository.save(user);

        // Generate JWT Token
        String token = jwtUtil.generateToken(email);

        // Build the exact response your React frontend expects
        Map<String, Object> response = new HashMap<>();
        response.put("message", "User registered successfully!");
        response.put("token", token);
        response.put("user", Map.of(
                "user_id", user.getUserId(),
                "u_name", user.getuName(),
                "email", user.getEmail(),
                "role", user.getRole()
        ));

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ==========================================
    // 2. LOGIN ENDPOINT
    // ==========================================
@PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        try {
            // This triggers Spring Security to check the hashed password automatically
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid credentials"));
        }

        try {
            // 🛡️ FIX: Safely extract the user or throw an exception if they vanished
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User account no longer exists in database"));
            
            String token = jwtUtil.generateToken(email);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful!");
            response.put("token", token);
            response.put("user", Map.of(
                    "user_id", user.getUserId(),
                    "u_name", user.getuName(),
                    "email", user.getEmail(),
                    "role", user.getRole()
            ));

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            // Catch our custom exception and return a clean 401 response to React
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}