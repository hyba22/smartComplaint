package com.reclamation.chat.service;

import java.io.IOException;
import org.springframework.web.multipart.MultipartFile;

public interface StorageProvider {
    boolean supports(String type, String contentType);
    StoredFile store(MultipartFile file, String type) throws IOException;
    void delete(String reference) throws IOException;
}
