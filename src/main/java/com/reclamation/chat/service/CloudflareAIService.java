package com.reclamation.chat.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.reclamation.chat.domain.Reclamation;
import com.reclamation.chat.domain.Role;
import com.reclamation.chat.domain.User;
import com.reclamation.chat.repository.ReclamationRepository;
import com.reclamation.chat.repository.UserRepository;
import com.reclamation.chat.web.websocket.ActivityService;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class CloudflareAIService {

    private static final Logger log = LoggerFactory.getLogger(CloudflareAIService.class);

    @Value("${cloudflare.ai.account-id:}")
    private String accountId;

    @Value("${cloudflare.ai.api-token:}")
    private String apiToken;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final UserRepository userRepository;
    private final ReclamationRepository reclamationRepository;
    private final ActivityService activityService;

    public CloudflareAIService(
        UserRepository userRepository,
        ReclamationRepository reclamationRepository,
        @Autowired(required = false) ActivityService activityService
    ) {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
        this.userRepository = userRepository;
        this.reclamationRepository = reclamationRepository;
        this.activityService = activityService;
    }

    /**
     * Classifies a reclamation
     *
     * @param titre
     * @param description
     * @return
     */
    public String classifyReclamation(String titre, String description) {
        try {
            String prompt = buildClassificationPrompt(titre, description);
            String aiResponse = callCloudflareAI(prompt);
            return parseClassificationResponse(aiResponse);
        } catch (Exception e) {
            log.error("Error classifying reclamation with AI: {}", e.getMessage(), e);
            return "NIVEAU_1"; // Default to normal
        }
    }

    private String buildClassificationPrompt(String titre, String description) {
        return String.format(
            "Tu es un système de classification de réclamations. Analyse cette réclamation et détermine son niveau d'urgence.\n\n" +
                "Critères de classification:\n" +
                "- NIVEAU_1 (Normal): Questions générales, demandes d'information, problèmes mineurs non urgents\n" +
                "- NIVEAU_2 (Urgent): Problèmes affectant le service mais non critiques, dysfonctionnements modérés, retards\n" +
                "- NIVEAU_3 (Critique): Urgences, services essentiels coupés (eau, électricité), dangers immédiats, problèmes graves de sécurité\n\n" +
                "Réclamation:\n" +
                "Titre: %s\n" +
                "Description: %s\n\n" +
                "Réponds UNIQUEMENT avec: NIVEAU_1, NIVEAU_2 ou NIVEAU_3",
            titre,
            description
        );
    }

    private String callCloudflareAI(String prompt) throws Exception {
        // Using Claude 3 Haiku - faster and more accurate than Llama
        String url = String.format("https://api.cloudflare.com/client/v4/accounts/%s/ai/run/@cf/anthropic/claude-3-haiku", accountId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiToken);

        Map<String, Object> message = new HashMap<>();
        message.put("role", "user");
        message.put("content", prompt);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("messages", List.of(message));

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

        log.debug("Cloudflare AI Response: {}", response.getBody());

        return response.getBody();
    }

    private String parseClassificationResponse(String jsonResponse) throws Exception {
        JsonNode root = objectMapper.readTree(jsonResponse);

        if (!root.path("success").asBoolean()) {
            throw new RuntimeException("Cloudflare AI request failed");
        }

        String content = root.path("result").path("choices").get(0).path("message").path("content").asText().trim().toUpperCase();

        // Extract level from response
        if (content.contains("NIVEAU_3") || content.contains("3")) {
            return "NIVEAU_3";
        } else if (content.contains("NIVEAU_2") || content.contains("2")) {
            return "NIVEAU_2";
        } else {
            return "NIVEAU_1";
        }
    }

    /**
     * AI-based assignment: Assigns a reclamation to a conseiller and generates a French notification message
     *
     * @param reclamation
     * @return
     */
    public AssignmentResult assignReclamationWithAI(Reclamation reclamation) {
        try {
            Long entrepriseId = reclamation.getEntreprise() != null ? reclamation.getEntreprise().getId() : null;

            if (entrepriseId == null) {
                log.warn("Cannot AI-assign: reclamation has no entreprise");
                return new AssignmentResult(null, "Erreur: Impossible d'assigner la réclamation. Veuillez contacter le support.");
            }

            List<User> conseillers = userRepository.findAllByEntrepriseIdAndRole(entrepriseId, Role.CONSEILLER);

            if (conseillers.isEmpty()) {
                log.warn("No Conseillers found for entreprise ID: {}", entrepriseId);
                return new AssignmentResult(null, "Votre réclamation a été enregistrée. Un conseiller vous contactera dès que possible.");
            }

            // Build AI prompt to select the best conseiller
            String prompt = buildAssignmentPrompt(reclamation, conseillers);
            String aiResponse = callCloudflareAI(prompt);
            String selectedConseillerLogin = parseAssignmentResponse(aiResponse, conseillers);

            // Find the selected conseiller
            Optional<User> selectedConseiller = conseillers
                .stream()
                .filter(c -> c.getLogin().equals(selectedConseillerLogin))
                .findFirst();

            if (selectedConseiller.isPresent()) {
                User conseiller = selectedConseiller.orElseThrow();

                // Assign the reclamation
                reclamation.setAssignedTo(conseiller);
                reclamation.setAssignedDate(Instant.now());

                log.info("AI-assigned reclamation {} to Conseiller: {}", reclamation.getIdReclamation(), conseiller.getLogin());

                // Generate French notification message
                String frenchMessage = generateFrenchNotification(reclamation, conseiller);

                return new AssignmentResult(conseiller, frenchMessage);
            } else {
                // assign to first available conseiller
                User fallbackConseiller = conseillers.get(0);
                reclamation.setAssignedTo(fallbackConseiller);
                reclamation.setAssignedDate(Instant.now());

                log.warn("AI assignment failed, using fallback conseiller: {}", fallbackConseiller.getLogin());

                String frenchMessage = generateFrenchNotification(reclamation, fallbackConseiller);
                return new AssignmentResult(fallbackConseiller, frenchMessage);
            }
        } catch (Exception e) {
            log.error("Error during AI assignment: {}", e.getMessage(), e);
            return new AssignmentResult(null, "Votre réclamation a été enregistrée. Un conseiller vous assistera bientôt.");
        }
    }

    private String buildAssignmentPrompt(Reclamation reclamation, List<User> conseillers) {
        StringBuilder conseillerList = new StringBuilder();

        for (int i = 0; i < conseillers.size(); i++) {
            User c = conseillers.get(i);

            //count of active reclamations
            int workload = reclamationRepository.countActiveReclamationsByConseiller(c.getId());

            // real online status
            boolean isOnline = activityService != null && activityService.isUserOnline(c.getLogin());

            conseillerList.append(
                String.format(
                    "%d. Login: %s, Nom: %s %s, Charge: %d réclamations actives, Statut: %s\n",
                    i + 1,
                    c.getLogin(),
                    c.getFirstName(),
                    c.getLastName(),
                    workload,
                    isOnline ? "EN LIGNE ✓" : "HORS LIGNE"
                )
            );

            log.debug("Conseiller {}: workload={}, online={}", c.getLogin(), workload, isOnline);
        }

        String urgencyGuidance = "";
        if ("NIVEAU_3".equals(reclamation.getNiveau())) {
            urgencyGuidance =
                "\n⚠️ URGENCE CRITIQUE (NIVEAU_3): Privilégier ABSOLUMENT le conseiller EN LIGNE avec la PLUS FAIBLE charge de travail!";
        } else if ("NIVEAU_2".equals(reclamation.getNiveau())) {
            urgencyGuidance = "\n⚡ URGENCE MOYENNE (NIVEAU_2): Privilégier un conseiller EN LIGNE avec une charge raisonnable.";
        } else {
            urgencyGuidance = "\n✓ URGENCE NORMALE (NIVEAU_1): Équilibrer la charge entre tous les conseillers disponibles.";
        }

        String prompt = String.format(
            "Tu es un système intelligent d'assignation de réclamations. Sélectionne le MEILLEUR conseiller pour cette réclamation.\n\n" +
                "Réclamation:\n" +
                "- Titre: %s\n" +
                "- Description: %s\n" +
                "- Niveau d'urgence: %s%s\n\n" +
                "Conseillers disponibles:\n%s\n" +
                "CRITÈRES DE SÉLECTION (par ordre de priorité):\n" +
                "1. Statut EN LIGNE = PRIORITAIRE (les conseillers en ligne doivent TOUJOURS être préférés)\n" +
                "2. Niveau d'urgence: Plus le niveau est élevé (NIVEAU_3), plus il faut privilégier le conseiller avec le MOINS de charge\n" +
                "3. Charge de travail ÉQUILIBRÉE: Distribuer les réclamations pour éviter la surcharge\n" +
                "4. Si AUCUN conseiller EN LIGNE: choisir celui avec la plus faible charge (il sera notifié)\n\n" +
                "Réponds UNIQUEMENT avec le login du conseiller sélectionné (exemple: conseiller1). Aucune explication.",
            reclamation.getTitre(),
            reclamation.getDescription(),
            reclamation.getNiveau(),
            urgencyGuidance,
            conseillerList.toString()
        );

        log.debug("AI Assignment Prompt:\n{}", prompt);
        return prompt;
    }

    /**
     * Parse AI response to extract selected conseiller login
     */
    private String parseAssignmentResponse(String jsonResponse, List<User> conseillers) throws Exception {
        JsonNode root = objectMapper.readTree(jsonResponse);

        if (!root.path("success").asBoolean()) {
            throw new RuntimeException("Cloudflare AI request failed");
        }

        String content = root.path("result").path("choices").get(0).path("message").path("content").asText().trim().toLowerCase();

        log.debug("AI assignment response: {}", content);

        // Try to find a matching conseiller login in the response
        for (User conseiller : conseillers) {
            if (content.contains(conseiller.getLogin().toLowerCase())) {
                return conseiller.getLogin();
            }
        }

        // return first conseiller
        return conseillers.get(0).getLogin();
    }

    //Generate a French notification message for the client

    private String generateFrenchNotification(Reclamation reclamation, User conseiller) {
        String urgencyText = "";
        switch (reclamation.getNiveau()) {
            case "NIVEAU_3":
                urgencyText = "urgente";
                break;
            case "NIVEAU_2":
                urgencyText = "prioritaire";
                break;
            default:
                urgencyText = "normale";
                break;
        }

        return String.format(
            "Merci pour votre réclamation (Réf: %s). " +
                "Votre demande %s a été enregistrée et assignée à %s %s. " +
                "Un conseiller vous assistera très bientôt. Merci de votre patience.",
            reclamation.getIdReclamation(),
            urgencyText,
            conseiller.getFirstName(),
            conseiller.getLastName()
        );
    }

    //Result of AI-based assignment

    public static class AssignmentResult {

        private final User assignedConseiller;
        private final String frenchMessage;

        public AssignmentResult(User assignedConseiller, String frenchMessage) {
            this.assignedConseiller = assignedConseiller;
            this.frenchMessage = frenchMessage;
        }

        public User getAssignedConseiller() {
            return assignedConseiller;
        }

        public String getFrenchMessage() {
            return frenchMessage;
        }
    }
}
