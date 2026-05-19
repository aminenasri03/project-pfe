package com.recruitment.dto.cv;

import jakarta.validation.constraints.NotBlank;

public record CvAnalysisRequest(
    @NotBlank String cvText,
    @NotBlank String jobDescription
) {}
