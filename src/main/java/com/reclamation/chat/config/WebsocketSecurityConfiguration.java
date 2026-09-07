package com.reclamation.chat.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.config.annotation.web.socket.EnableWebSocketSecurity;
import org.springframework.security.messaging.access.intercept.MessageMatcherDelegatingAuthorizationManager;

@Configuration
@EnableWebSocketSecurity
public class WebsocketSecurityConfiguration {

    @Bean
    public AuthorizationManager<Message<?>> messageAuthorizationManager() {
        // Define specific authorization rules
        return MessageMatcherDelegatingAuthorizationManager.builder()
            .nullDestMatcher()
            .authenticated()
            .simpDestMatchers("/topic/**")
            .authenticated()
            .simpDestMatchers("/app/chat/**", "/app/topic/activity")
            .authenticated()
            .simpTypeMatchers(SimpMessageType.MESSAGE, SimpMessageType.SUBSCRIBE)
            .denyAll()
            .anyMessage()
            .denyAll()
            .build();
    }

    /**
     * Disables CSRF
     */
    @Bean
    public ChannelInterceptor csrfChannelInterceptor() {
        return new ChannelInterceptor() {};
    }
}
