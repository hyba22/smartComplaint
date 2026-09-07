package com.reclamation.chat.service;

import java.io.IOException;
import java.nio.file.Path;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    private final List<StorageProvider> providers;
    private final LocalStorageProvider localProvider;

    public FileStorageService(List<StorageProvider> providers, LocalStorageProvider localProvider) {
        this.providers = providers;
        this.localProvider = localProvider;
    }

    public StoredFile storeFile(MultipartFile file, String type) throws IOException {
        String contentType = file.getContentType();
        for (StorageProvider provider : providers) {
            if (provider.supports(type, contentType)) {
                return provider.store(file, type);
            }
        }
        throw new IllegalStateException("No storage provider found for type " + type);
    }

    public void deleteFile(String reference) {
        if (reference == null || reference.isEmpty()) {
            return;
        }
        try {
            if (reference.startsWith("http://") || reference.startsWith("https://")) {
                log.warn("Cannot delete Cloudinary image without public_id for URL: {}", reference);
                return;
            }
            localProvider.delete(reference);
        } catch (Exception e) {
            log.error("Error deleting file: {}", reference, e);
        }
    }

    public Path getFilePath(String filePath) throws IOException {
        return localProvider.getFilePath(filePath);
    }
}
