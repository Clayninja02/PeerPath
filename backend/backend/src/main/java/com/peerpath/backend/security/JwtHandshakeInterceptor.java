package com.peerpath.backend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        
        // Ensure this is an HTTP request upgrading to a WebSocket
        if (request instanceof ServletServerHttpRequest) {
            ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
            
            // Extract the token from the query parameters (e.g., ?token=...)
            String token = servletRequest.getServletRequest().getParameter("token");

            if (token != null) {
                try {
                    // Try to extract the email. If the token is expired/invalid, this will throw an exception
                    String email = jwtUtil.extractEmail(token);
                    
                    if (email != null) {
                        // Success! Save the user's email into the socket's session attributes
                        // so we know WHO is sending messages later.
                        attributes.put("userEmail", email);
                        return true; // Allow the connection
                    }
                } catch (Exception e) {
                    System.out.println("⚠️ [SOCKET] Invalid token during handshake: " + e.getMessage());
                }
            }
        }
        
        System.out.println("🔴 [SOCKET] Connection rejected: Missing or invalid JWT token.");
        return false; // Reject the connection
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        // No action needed after the handshake completes
    }
}