package com.reclamation.chat.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
@Order(Integer.MAX_VALUE)
public class LocalStorageProvider implements StorageProvider {

    private static final Logger log = LoggerFactory.getLogger(LocalStorageProvider.class);

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    public boolean supports(String type, String contentType) {
        return true;
    }

    @Override
    public StoredFile store(MultipartFile file, String type) throws IOException {
        Path uploadPath = Path.of(uploadDir, type);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();
        String extension =
            originalFilename != null && originalFilename.contains(".") ? originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
        String filename = UUID.randomUUID().toString() + extension;

        Path filePath = uploadPath.resolve(filename);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        log.info("File stored locally: {}", filePath);

        String reference = type + "/" + filename;
        String url = "/api/files/download?filePath=" + reference;
        return new StoredFile(reference, url);
    }

    @Override
    public void delete(String reference) throws IOException {
        Path rootDir = Path.of(uploadDir).toAbsolutePath().normalize();
        Path target = rootDir.resolve(reference).normalize();
        if (!target.startsWith(rootDir)) {
            throw new SecurityException("Invalid file path: " + reference);
        }
        Files.deleteIfExists(target);
        log.info("Local file deleted: {}", target);
    }

    public Path getFilePath(String reference) throws IOException {
        Path rootDir = Path.of(uploadDir).toAbsolutePath().normalize();
        Path target = rootDir.resolve(reference).normalize();
        if (!target.startsWith(rootDir)) {
            throw new SecurityException("Invalid file path: " + reference);
        }
        return target;
    }
}
