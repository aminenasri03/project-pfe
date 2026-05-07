package com.recruitment.dto.interview;

import com.recruitment.entity.InterviewMode;
import com.recruitment.entity.InterviewStatus;

import java.time.LocalDateTime;

public record InterviewDto(
    Long id,
    Long applicationId,
    LocalDateTime scheduledAt,
    String location,
    InterviewMode mode,
    String notes,
    InterviewStatus status,
    LocalDateTime createdAt
) {}
