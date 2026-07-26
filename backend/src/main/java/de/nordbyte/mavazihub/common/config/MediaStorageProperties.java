package de.nordbyte.mavazihub.common.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.nio.file.Path;
import java.nio.file.Paths;

@ConfigurationProperties(prefix = "mavazihub.media")
public class MediaStorageProperties {

    private String uploadDir = "./media";

    public String getUploadDir() {
        return uploadDir;
    }

    public void setUploadDir(String uploadDir) {
        this.uploadDir = uploadDir;
    }

    public Path uploadPath() {
        return Paths.get(uploadDir).toAbsolutePath().normalize();
    }
}
