package com.recruitment.service;

import com.recruitment.exception.BusinessException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "doc", "docx");
    private static final long MAX_SIZE = 10L * 1024 * 1024; // 10 MB

    @Value("${app.storage.cv-dir}")
    private String cvDir;

    private Path baseDir;

    @PostConstruct
    void init() throws IOException {
        baseDir = Paths.get(cvDir).toAbsolutePath().normalize();
        Files.createDirectories(baseDir);
        log.info("CV storage directory: {}", baseDir);
    }

    public StoredFile storeCv(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("CV file is required");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new BusinessException("File too large (max 10 MB)");
        }
        String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "cv";
        String ext = getExtension(original).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new BusinessException("Allowed file types: pdf, doc, docx");
        }
        String storedName = UUID.randomUUID() + "." + ext;
        Path target = baseDir.resolve(storedName).normalize();
        if (!target.startsWith(baseDir)) {
            throw new BusinessException("Invalid file path");
        }
        try {
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException ex) {
            throw new BusinessException("Failed to store file: " + ex.getMessage());
        }
        return new StoredFile(target.toString(), original);
    }

    private String getExtension(String name) {
        int idx = name.lastIndexOf('.');
        return idx >= 0 ? name.substring(idx + 1) : "";
    }

    public record StoredFile(String absolutePath, String originalName) {}
}
