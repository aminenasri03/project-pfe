package com.recruitment.controller;

import com.recruitment.dto.cv.CvAnalysisRequest;
import com.recruitment.dto.cv.CvAnalysisResponse;
import com.recruitment.service.CvAnalysisService;
import com.recruitment.service.CvTextExtractorService;
import com.recruitment.service.ApplicationService;
import com.recruitment.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/cv")
@RequiredArgsConstructor
public class CvAnalysisController {

    private final CvAnalysisService cvAnalysisService;
    private final CvTextExtractorService cvTextExtractorService;

    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','RECRUITER')")
    public CvAnalysisResponse analyze(
            @RequestPart("cv") MultipartFile cvFile,
            @RequestParam("jobDescription") String jobDescription) throws IOException {

        String cvText = cvTextExtractorService.extract(cvFile);
        CvAnalysisRequest request = new CvAnalysisRequest(cvText, jobDescription);
        return cvAnalysisService.analyze(request);
    }

    /**
     * Analyse the CV already attached to an application.
     * Reads the stored file, extracts text, and compares with the job offer.
     */
    @PostMapping("/analyze-application/{applicationId}")
    @PreAuthorize("hasAnyRole('ADMIN','RECRUITER')")
    public CvAnalysisResponse analyzeApplication(@PathVariable Long applicationId) throws IOException {
        return cvAnalysisService.analyzeApplication(applicationId);
    }
}
