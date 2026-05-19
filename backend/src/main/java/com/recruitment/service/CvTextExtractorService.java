package com.recruitment.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * Extracts text from CV files (PDF, DOCX).
 * PDF: uses Apache PDFBox for reliable text extraction.
 * DOCX: unzips and reads word/document.xml, stripping XML tags.
 */
@Service
@Slf4j
public class CvTextExtractorService {

    public String extract(MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new IllegalArgumentException("Le fichier n'a pas de nom.");
        }
        return extractByExtension(file.getBytes(), filename);
    }

    public String extractFromPath(Path filePath, String fileName) throws IOException {
        byte[] bytes = Files.readAllBytes(filePath);
        return extractByExtension(bytes, fileName);
    }

    private String extractByExtension(byte[] bytes, String filename) throws IOException {
        String lower = filename.toLowerCase();
        if (lower.endsWith(".pdf")) {
            return extractFromPdf(bytes);
        } else if (lower.endsWith(".docx")) {
            return extractFromDocx(bytes);
        } else {
            throw new IllegalArgumentException("Format non supporté. Formats acceptés : PDF, DOCX.");
        }
    }

    private String extractFromPdf(byte[] data) throws IOException {
        try (PDDocument document = Loader.loadPDF(data)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            log.debug("Extracted {} characters from PDF", text.length());
            return text.trim();
        }
    }

    /**
     * DOCX extraction: DOCX files are ZIP archives containing XML.
     * Reads word/document.xml and strips XML tags to get plain text.
     */
    private String extractFromDocx(byte[] data) throws IOException {
        try (ZipInputStream zis = new ZipInputStream(new ByteArrayInputStream(data))) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if ("word/document.xml".equals(entry.getName())) {
                    String xml = new String(zis.readAllBytes(), StandardCharsets.UTF_8);
                    // Replace paragraph/line break tags with newlines
                    xml = xml.replaceAll("<w:p[^>]*>", "\n");
                    xml = xml.replaceAll("<w:br[^>]*/>", "\n");
                    xml = xml.replaceAll("<w:tab[^>]*/>", "\t");
                    // Strip all XML tags
                    String text = xml.replaceAll("<[^>]+>", "").trim();
                    // Clean up multiple newlines
                    text = text.replaceAll("\\n{3,}", "\n\n");
                    log.debug("Extracted {} characters from DOCX", text.length());
                    return text;
                }
            }
        }
        throw new IllegalArgumentException("Fichier DOCX invalide : word/document.xml introuvable.");
    }
}
