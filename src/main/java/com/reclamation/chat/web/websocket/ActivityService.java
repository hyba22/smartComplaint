package com.reclamation.chat.web.websocket;

import static com.reclamation.chat.config.WebsocketConfiguration.IP_ADDRESS;

import com.reclamation.chat.web.websocket.dto.ActivityDTO;
import java.security.Principal;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationListener;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Controller
public class ActivityService implements ApplicationListener<SessionDisconnectEvent> {

    private static final Logger LOG = LoggerFactory.getLogger(ActivityService.class);

    private final SimpMessageSendingOperations messagingTemplate;

    // Track online users: login -> sessionId
    private final Map<String, String> onlineUsers = new ConcurrentHashMap<>();

    public ActivityService(SimpMessageSendingOperations messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/topic/activity")
    @SendTo("/topic/tracker")
    public ActivityDTO sendActivity(@Payload ActivityDTO activityDTO, StompHeaderAccessor stompHeaderAccessor, Principal principal) {
        String userLogin = principal.getName();
        String sessionId = stompHeaderAccessor.getSessionId();

        activityDTO.setUserLogin(userLogin);
        activityDTO.setSessionId(sessionId);
        activityDTO.setIpAddress(stompHeaderAccessor.getSessionAttributes().get(IP_ADDRESS).toString());
        activityDTO.setTime(Instant.now());

        // Track this user as online
        onlineUsers.put(userLogin, sessionId);

        LOG.debug("Sending user tracking data {} (Online users: {})", activityDTO, onlineUsers.size());
        return activityDTO;
    }

    @Override
    public void onApplicationEvent(SessionDisconnectEvent event) {
        String sessionId = event.getSessionId();

        // Remove user from online list
        onlineUsers.entrySet().removeIf(entry -> entry.getValue().equals(sessionId));

        ActivityDTO activityDTO = new ActivityDTO();
        activityDTO.setSessionId(sessionId);
        activityDTO.setPage("logout");
        messagingTemplate.convertAndSend("/topic/tracker", activityDTO);

        LOG.debug("User disconnected. Online users: {}", onlineUsers.size());
    }

    // Check if a user is currently online

    public boolean isUserOnline(String userLogin) {
        return onlineUsers.containsKey(userLogin);
    }

    // Get count of online users

    public int getOnlineUserCount() {
        return onlineUsers.size();
    }
}
