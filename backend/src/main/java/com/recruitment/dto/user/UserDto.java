package com.recruitment.dto.user;

import java.time.LocalDateTime;
import java.util.Set;

public record UserDto(
    Long id,
    String email,
    String firstName,
    String lastName,
    String department,
    String jobTitle,
    boolean enabled,
    Set<String> roles,
    LocalDateTime createdAt
) {}
