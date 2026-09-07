package com.reclamation.chat.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import java.io.IOException;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
@ConditionalOnProperty(prefix = "app.storage", name = "provider", havingValue = "cloudinary")
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CloudinaryStorageProvider implements StorageProvider {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryStorageProvider.class);

    private final Cloudinary cloudinary;

    public CloudinaryStorageProvider(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    @Override
    public boolean supports(String type, String contentType) {
        return contentType != null && contentType.startsWith("image/");
    }

    @Override
    public StoredFile store(MultipartFile file, String type) throws IOException {
        Map<String, Object> options = ObjectUtils.asMap("resource_type", "image", "folder", type);
        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), options);
            String url = (String) uploadResult.get("secure_url");
            String publicId = (String) uploadResult.get("public_id");
            log.info("Image uploaded to Cloudinary: {}", publicId);
            return new StoredFile(publicId, url);
        } catch (Exception e) {
            throw new IOException("Failed to upload image to Cloudinary", e);
        }
    }

    @Override
    public void delete(String reference) throws IOException {
        try {
            cloudinary.uploader().destroy(reference, ObjectUtils.emptyMap());
            log.info("Cloudinary image deleted: {}", reference);
        } catch (Exception e) {
            throw new IOException("Failed to delete image from Cloudinary", e);
        }
    }
}
