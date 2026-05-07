package com.recruitment.dto.evaluation;

import com.recruitment.entity.Decision;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record EvaluationRequest(
    @NotNull Long applicationId,
    @Min(0) @Max(100) Integer score,
    String comments,
    Decision decision
) {}
