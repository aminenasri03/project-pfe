package com.recruitment.controller;

import com.recruitment.dto.application.ApplicationDto;
import com.recruitment.dto.application.ApplicationStatusUpdateRequest;
import com.recruitment.service.ApplicationService;
import com.recruitment.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final FileStorageService fileStorageService;

    @Operation(summary = "Submit a job application with CV upload")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('CANDIDATE')")
    public ApplicationDto submit(
            @RequestParam Long offerId,
            @RequestParam(required = false) String coverLetter,
            @Parameter(description = "CV file (PDF, DOC, DOCX — max 10 MB)",
                       content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                                          schema = @Schema(type = "string", format = "binary")))
            @RequestPart("cv") MultipartFile cv) {
        return applicationService.submit(offerId, coverLetter, cv);
    }

    @GetMapping("/me")
    public Page<ApplicationDto> mine(Pageable pageable) {
        return applicationService.myApplications(pageable);
    }

    @GetMapping("/by-offer/{offerId}")
    @PreAuthorize("hasAnyRole('ADMIN','RECRUITER')")
    public Page<ApplicationDto> byOffer(@PathVariable Long offerId, Pageable pageable) {
        return applicationService.byOffer(offerId, pageable);
    }

    @GetMapping("/{id}")
    public ApplicationDto get(@PathVariable Long id) {
        return applicationService.get(id);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','RECRUITER')")
    public ApplicationDto updateStatus(@PathVariable Long id, @Valid @RequestBody ApplicationStatusUpdateRequest req) {
        return applicationService.updateStatus(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public void withdraw(@PathVariable Long id) {
        applicationService.withdraw(id);
    }

    @GetMapping("/{id}/cv")
    @PreAuthorize("hasAnyRole('ADMIN','RECRUITER')")
    public ResponseEntity<Resource> downloadCv(@PathVariable Long id) {
        ApplicationDto app = applicationService.get(id);
        if (app.cvFileName() == null) {
            return ResponseEntity.notFound().build();
        }
        // Retrieve the cvFilePath via the service
        var pathAndName = applicationService.getCvPath(id);
        Resource resource = new PathResource(pathAndName.path());
        String ext = app.cvFileName().contains(".")
            ? app.cvFileName().substring(app.cvFileName().lastIndexOf('.') + 1).toLowerCase()
            : "pdf";
        MediaType mediaType = ext.equals("pdf") ? MediaType.APPLICATION_PDF
            : MediaType.parseMediaType("application/msword");
        return ResponseEntity.ok()
            .contentType(mediaType)
            .header(HttpHeaders.CONTENT_DISPOSITION,
                ContentDisposition.inline().filename(app.cvFileName()).build().toString())
            .body(resource);
    }
}
