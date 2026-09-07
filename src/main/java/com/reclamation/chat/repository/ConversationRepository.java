package com.reclamation.chat.repository;

import com.reclamation.chat.domain.Conversation;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    @EntityGraph(attributePaths = { "participants", "messages", "messages.sender" })
    Optional<Conversation> findByIdConversation(String idConversation);

    @EntityGraph(attributePaths = { "participants", "messages", "messages.sender" })
    Optional<Conversation> findWithDetailsById(Long id);

    @EntityGraph(attributePaths = { "participants" })
    List<Conversation> findAllByParticipants_Login(String login);
}
