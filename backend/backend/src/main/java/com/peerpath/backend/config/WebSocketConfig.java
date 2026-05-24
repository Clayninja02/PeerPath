package com.peerpath.backend.config;

import com.peerpath.backend.socket.StudyRoomSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Autowired
    private StudyRoomSocketHandler studyRoomSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // This opens the networking route at ws://localhost:8080/study-room
        registry.addHandler(studyRoomSocketHandler, "/study-room").setAllowedOrigins("*");
    }
}