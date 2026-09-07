package com.reclamation.chat.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

@Service
public class KeywordClassificationService {

    private static final Logger log = LoggerFactory.getLogger(KeywordClassificationService.class);

    private final ObjectMapper objectMapper;
    private JsonNode vocabularyConfig;
    private Map<String, List<String>> keywordsByLevel;
    private Map<String, List<Pattern>> patternsByLevel;

    public KeywordClassificationService() {
        this.objectMapper = new ObjectMapper();
        this.keywordsByLevel = new HashMap<>();
        this.patternsByLevel = new HashMap<>();
    }

    @PostConstruct
    public void loadVocabulary() {
        try {
            ClassPathResource resource = new ClassPathResource("config/reclamation-classification-vocabulary.json");
            vocabularyConfig = objectMapper.readTree(resource.getInputStream());

            // load keywords and patterns for each level
            JsonNode levels = vocabularyConfig.get("levels");
            for (String level : List.of("NIVEAU_1", "NIVEAU_2", "NIVEAU_3")) {
                JsonNode levelNode = levels.get(level);

                // load French keywords (primary language)
                List<String> keywords = new ArrayList<>();
                levelNode
                    .get("keywords")
                    .get("fr")
                    .forEach(node -> keywords.add(node.asText().toLowerCase()));
                keywordsByLevel.put(level, keywords);

                // load French patterns
                List<Pattern> patterns = new ArrayList<>();
                levelNode
                    .get("patterns")
                    .get("fr")
                    .forEach(node -> patterns.add(Pattern.compile(node.asText().toLowerCase(), Pattern.CASE_INSENSITIVE)));
                patternsByLevel.put(level, patterns);
            }

            log.info("Loaded classification vocabulary with {} levels", keywordsByLevel.size());
        } catch (IOException e) {
            log.error("Failed to load vocabulary configuration: {}", e.getMessage(), e);
        }
    }

    /**
     * Classify reclamation using keyword matching
     *
     * @param titre
     * @param description
     * @return
     */
    public ClassificationResult classify(String titre, String description) {
        String text = (titre + " " + description).toLowerCase();

        Map<String, Integer> scores = new HashMap<>();
        scores.put("NIVEAU_1", 0);
        scores.put("NIVEAU_2", 0);
        scores.put("NIVEAU_3", 0);

        // Check keywords for each level
        for (String level : List.of("NIVEAU_3", "NIVEAU_2", "NIVEAU_1")) {
            // critical first
            List<String> keywords = keywordsByLevel.get(level);
            List<Pattern> patterns = patternsByLevel.get(level);

            // Keyword matching (weight: 1 point per match)
            for (String keyword : keywords) {
                if (text.contains(keyword)) {
                    scores.put(level, scores.get(level) + 1);
                }
            }

            // Pattern matching (weight: 2 points per match - more specific)
            for (Pattern pattern : patterns) {
                if (pattern.matcher(text).find()) {
                    scores.put(level, scores.get(level) + 2);
                }
            }
        }

        // Find level with highest score
        String bestLevel = "NIVEAU_1";
        int maxScore = scores.get("NIVEAU_1");

        for (Map.Entry<String, Integer> entry : scores.entrySet()) {
            if (entry.getValue() > maxScore) {
                maxScore = entry.getValue();
                bestLevel = entry.getKey();
            }
        }

        // Calculate confidence
        int totalMatches = scores
            .values()
            .stream()
            .mapToInt(score -> score != null ? score : 0)
            .sum();
        double confidence = totalMatches > 0 ? ((double) maxScore / totalMatches) * 100 : 0;

        // If multiple levels have similar scores, confidence is low
        long levelsWithScores = scores
            .values()
            .stream()
            .filter(score -> score > 0)
            .count();
        if (levelsWithScores > 1) {
            confidence = confidence * 0.7; // Reduce confidence if ambiguous
        }

        log.debug("Keyword classification: {} with {}% confidence (scores: {})", bestLevel, String.format("%.1f", confidence), scores);

        return new ClassificationResult(bestLevel, confidence, maxScore > 0);
    }

    //Result of keyword-based classification
    public static class ClassificationResult {

        private final String level;
        private final double confidence;
        private final boolean hasMatches;

        public ClassificationResult(String level, double confidence, boolean hasMatches) {
            this.level = level;
            this.confidence = confidence;
            this.hasMatches = hasMatches;
        }

        public String getLevel() {
            return level;
        }

        public double getConfidence() {
            return confidence;
        }

        public boolean hasMatches() {
            return hasMatches;
        }

        public boolean isHighConfidence() {
            return confidence >= 70.0;
        }
    }
}
