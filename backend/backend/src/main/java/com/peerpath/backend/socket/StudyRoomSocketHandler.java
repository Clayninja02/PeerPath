package com.peerpath.backend.socket;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class StudyRoomSocketHandler extends TextWebSocketHandler {

    // A thread-safe list to hold all users currently connected to the socket
    private final List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();

    // When a user connects
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
        
        // 📥 Extract the authenticated email we saved during the Handshake
        String userEmail = (String) session.getAttributes().get("userEmail");
        
        System.out.println("🟢 [SOCKET] User joined the study room: " + userEmail);
        session.sendMessage(new TextMessage("Welcome to the PeerPath Live Study Room, " + userEmail + "!"));
    }

    // When a user sends a message
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        
        // 👤 Get the sender's email
        String userEmail = (String) session.getAttributes().get("userEmail");
        System.out.println("💬 [SOCKET] " + userEmail + " says: " + payload);

        // Broadcast the message to EVERYONE who is connected
        for (WebSocketSession webSocketSession : sessions) {
            if (webSocketSession.isOpen()) {
                try {
                    // Prepend the user's email so the frontend knows who sent it
                    webSocketSession.sendMessage(new TextMessage(userEmail + ": " + payload));
                } catch (IOException e) {
                    System.out.println("⚠️ [SOCKET] Failed to send message to a user. Removing dead session.");
                    sessions.remove(webSocketSession); // Also fixes the memory leak I mentioned earlier!
                }
            }
        }
    }

    // When a user disconnects
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
        String userEmail = (String) session.getAttributes().get("userEmail");
        System.out.println("🔴 [SOCKET] User left the study room: " + userEmail);
    }
}