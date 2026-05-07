package com.recruitment.dto.evaluation;

import com.recruitment.entity.Decision;

import java.time.LocalDateTime;

public record EvaluationDto(
    Long id,
    Long applicationId,
    Long evaluatorId,
    String evaluatorName,
    Integer score,
    String comments,
    Decision decision,
    LocalDateTime createdAt
) {}
