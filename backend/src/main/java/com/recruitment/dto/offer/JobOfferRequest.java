package com.recruitment.dto.offer;

import com.recruitment.entity.OfferStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record JobOfferRequest(
    @NotBlank @Size(max = 200) String title,
    @NotBlank String description,
    String department,
    String location,
    String contractType,
    String requiredSkills,
    OfferStatus status,
    LocalDateTime closesAt
) {}
