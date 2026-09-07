package com.reclamation.chat.web.rest;

import com.reclamation.chat.service.FileStorageService;
import com.reclamation.chat.service.StoredFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
public class FileUploadResource {

    private static final Logger log = LoggerFactory.getLogger(FileUploadResource.class);
    private final FileStorageService fileStorageService;

    public FileUploadResource(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        log.debug("REST request to upload file: {}", file.getOriginalFilename());

        try {
            String contentType = file.getContentType();
            if (
                contentType == null ||
                (!contentType.startsWith("image/") && !contentType.equals("application/pdf") && !contentType.startsWith("application/vnd"))
            ) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only image and document files are allowed"));
            }

            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "File size must be less than 10MB"));
            }

            StoredFile stored = fileStorageService.storeFile(file, "uploads");

            Map<String, String> response = new HashMap<>();
            response.put("url", stored.url());
            response.put("filePath", stored.reference());

            log.debug("File uploaded successfully: {}", stored.reference());
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            log.error("Error uploading file", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to upload file"));
        }
    }

    @PostMapping("/upload/image")
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        log.debug("REST request to upload image: {}", file.getOriginalFilename());

        try {
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed"));
            }

            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "File size must be less than 5MB"));
            }

            StoredFile stored = fileStorageService.storeFile(file, "images");

            Map<String, String> response = new HashMap<>();
            response.put("filePath", stored.reference());
            response.put("fileUrl", stored.url());

            log.debug("Image uploaded successfully: {}", stored.reference());
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            log.error("Error uploading image", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to upload image"));
        }
    }

    @PostMapping("/upload/voice")
    public ResponseEntity<Map<String, String>> uploadVoice(@RequestParam("file") MultipartFile file) {
        log.debug("REST request to upload voice message: {}", file.getOriginalFilename());

        try {
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("audio/")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only audio files are allowed"));
            }

            if (file.getSize() > 10 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "File size must be less than 10MB"));
            }

            StoredFile stored = fileStorageService.storeFile(file, "voice");

            Map<String, String> response = new HashMap<>();
            response.put("filePath", stored.reference());
            response.put("fileUrl", stored.url());

            log.debug("Voice message uploaded successfully: {}", stored.reference());
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            log.error("Error uploading voice message", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to upload voice message"));
        }
    }

    @GetMapping("/download")
    public ResponseEntity<Resource> downloadFile(@RequestParam String filePath) {
        log.debug("REST request to download file: {}", filePath);

        if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.FOUND).header(HttpHeaders.LOCATION, filePath).build();
        }

        try {
            Path path = fileStorageService.getFilePath(filePath);
            Resource resource = new UrlResource(path.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(path);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
            } else {
                log.warn("File not found or not readable: {}", filePath);
                return ResponseEntity.notFound().build();
            }
        } catch (SecurityException e) {
            log.warn("Invalid download path: {}", filePath);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error downloading file: {}", filePath, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/uploads/{filename:.+}")
    public ResponseEntity<Resource> downloadLegacyFile(@PathVariable String filename) {
        log.debug("REST request to download legacy file: {}", filename);

        try {
            Path path = fileStorageService.getFilePath("uploads/" + filename);
            Resource resource = new UrlResource(path.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(path);
                if (contentType == null) {
                    contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
            } else {
                log.warn("Legacy file not found or not readable: {}", filename);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error downloading legacy file: {}", filename, e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
