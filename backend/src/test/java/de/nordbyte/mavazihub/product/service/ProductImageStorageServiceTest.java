package de.nordbyte.mavazihub.product.service;

import de.nordbyte.mavazihub.common.config.MediaStorageProperties;
import de.nordbyte.mavazihub.common.exception.BusinessException;
import de.nordbyte.mavazihub.product.dto.ProductImageUploadResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ProductImageStorageServiceTest {

    @TempDir
    private Path tempDir;

    @Test
    void storeProductImageStoresLocalFileAndReturnsMediaUrl() throws Exception {
        ProductImageStorageService service = new ProductImageStorageService(mediaStorageProperties());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "stoff.png",
                "image/png",
                new byte[]{1, 2, 3}
        );

        ProductImageUploadResponse response = service.storeProductImage(file);

        assertThat(response.imageUrl()).startsWith("/media/products/").endsWith(".png");

        String fileName = response.imageUrl().replace("/media/products/", "");
        assertThat(Files.readAllBytes(tempDir.resolve("products").resolve(fileName)))
                .containsExactly(1, 2, 3);
    }

    @Test
    void storeProductImageRejectsUnsupportedFiles() {
        ProductImageStorageService service = new ProductImageStorageService(mediaStorageProperties());
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "notiz.txt",
                "text/plain",
                "kein bild".getBytes()
        );

        assertThatThrownBy(() -> service.storeProductImage(file))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("JPG");
    }

    private MediaStorageProperties mediaStorageProperties() {
        MediaStorageProperties properties = new MediaStorageProperties();
        properties.setUploadDir(tempDir.toString());
        return properties;
    }
}
