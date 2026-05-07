package com.recruitment.dto.interview;

import com.recruitment.entity.InterviewMode;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record InterviewRequest(
    @NotNull Long applicationId,
    @NotNull LocalDateTime scheduledAt,
    String location,
    InterviewMode mode,
    String notes
) {}
