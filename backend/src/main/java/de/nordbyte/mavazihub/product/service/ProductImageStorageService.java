package de.nordbyte.mavazihub.product.service;

import de.nordbyte.mavazihub.common.config.MediaStorageProperties;
import de.nordbyte.mavazihub.common.exception.BusinessException;
import de.nordbyte.mavazihub.product.dto.ProductImageUploadResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductImageStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(".jpg", ".jpeg", ".png", ".webp", ".gif");

    private final MediaStorageProperties mediaStorageProperties;

    public ProductImageUploadResponse storeProductImage(MultipartFile file) {
        validate(file);

        Path productImageDir = mediaStorageProperties.uploadPath().resolve("products").normalize();
        String fileName = UUID.randomUUID() + resolveExtension(file);
        Path target = productImageDir.resolve(fileName).normalize();

        if (!target.startsWith(productImageDir)) {
            throw new BusinessException("Bild konnte nicht gespeichert werden.");
        }

        try {
            Files.createDirectories(productImageDir);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException ex) {
            throw new BusinessException("Bild konnte nicht gespeichert werden.");
        }

        return new ProductImageUploadResponse("/media/products/" + fileName);
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("Bitte wähle eine Bilddatei aus.");
        }

        String contentType = file.getContentType();
        String extension = extractOriginalExtension(file);

        if ((contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT)))
                && !ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BusinessException("Erlaubt sind JPG, PNG, WebP und GIF.");
        }
    }

    private String resolveExtension(MultipartFile file) {
        String extension = extractOriginalExtension(file);
        return ALLOWED_EXTENSIONS.contains(extension) ? extension : ".jpg";
    }

    private String extractOriginalExtension(MultipartFile file) {
        String originalFileName = file.getOriginalFilename();

        if (originalFileName == null || !originalFileName.contains(".")) {
            return "";
        }

        return originalFileName.substring(originalFileName.lastIndexOf('.')).toLowerCase(Locale.ROOT);
    }
}
