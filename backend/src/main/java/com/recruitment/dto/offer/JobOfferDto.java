package com.recruitment.dto.offer;

import com.recruitment.entity.OfferStatus;

import java.time.LocalDateTime;

public record JobOfferDto(
    Long id,
    String title,
    String description,
    String department,
    String location,
    String contractType,
    String requiredSkills,
    OfferStatus status,
    Long createdById,
    String createdByName,
    LocalDateTime createdAt,
    LocalDateTime closesAt
) {}
