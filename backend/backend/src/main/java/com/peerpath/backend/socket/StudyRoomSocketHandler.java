package com.peerpath.backend.socket;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

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
        System.out.println("🟢 [SOCKET] New user joined the study room! Session ID: " + session.getId());
        session.sendMessage(new TextMessage("Welcome to the PeerPath Live Study Room!"));
    }

    // When a user sends a message
    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();
        System.out.println("💬 [SOCKET] Received message: " + payload);

        // Broadcast the message to EVERYONE who is connected
        for (WebSocketSession webSocketSession : sessions) {
            if (webSocketSession.isOpen()) {
                // Prepend a generic user label for now
                webSocketSession.sendMessage(new TextMessage("User-" + session.getId().substring(0,4) + ": " + payload));
            }
        }
    }

    // When a user disconnects
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
        System.out.println("🔴 [SOCKET] User left the study room. Session ID: " + session.getId());
    }
}
