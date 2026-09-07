package com.reclamation.chat.repository;

import com.reclamation.chat.domain.Message;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    Optional<Message> findByIdMsg(String idMsg);

    List<Message> findByConversation_IdOrderByDateEnvoiAsc(Long conversationId);
}
