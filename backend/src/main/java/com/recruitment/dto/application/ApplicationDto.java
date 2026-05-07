package com.recruitment.dto.application;

import com.recruitment.entity.ApplicationStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ApplicationDto(
    Long id,
    Long offerId,
    String offerTitle,
    Long candidateId,
    String candidateFullName,
    String candidateEmail,
    String coverLetter,
    String cvFileName,
    BigDecimal matchingScore,
    ApplicationStatus status,
    LocalDateTime submittedAt,
    LocalDateTime updatedAt
) {}
