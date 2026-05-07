package com.recruitment.dto.application;

import com.recruitment.entity.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public record ApplicationStatusUpdateRequest(
    @NotNull ApplicationStatus status
) {}
