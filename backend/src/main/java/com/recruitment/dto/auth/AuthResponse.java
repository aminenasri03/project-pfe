package com.recruitment.dto.auth;

import java.util.Set;

public record AuthResponse(
    String token,
    long expiresIn,
    Long userId,
    String email,
    String firstName,
    String lastName,
    Set<String> roles
) {}
