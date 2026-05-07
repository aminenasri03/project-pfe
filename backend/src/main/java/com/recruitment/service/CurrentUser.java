package com.recruitment.service;

import com.recruitment.entity.User;
import com.recruitment.exception.ResourceNotFoundException;
import com.recruitment.repository.UserRepository;
import com.recruitment.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CurrentUser {

    private final UserRepository userRepository;

    public UserPrincipal principal() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal up)) {
            throw new ResourceNotFoundException("Not authenticated");
        }
        return up;
    }

    public User user() {
        var p = principal();
        return userRepository.findById(p.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }
}
