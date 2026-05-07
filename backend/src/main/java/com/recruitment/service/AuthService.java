package com.recruitment.service;

import com.recruitment.dto.auth.AuthResponse;
import com.recruitment.dto.auth.LoginRequest;
import com.recruitment.dto.auth.RegisterRequest;
import com.recruitment.entity.RoleName;
import com.recruitment.entity.User;
import com.recruitment.exception.BusinessException;
import com.recruitment.repository.RoleRepository;
import com.recruitment.repository.UserRepository;
import com.recruitment.security.JwtService;
import com.recruitment.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new BusinessException("Email already in use");
        }
        var candidateRole = roleRepository.findByName(RoleName.ROLE_CANDIDATE)
            .orElseThrow(() -> new IllegalStateException("ROLE_CANDIDATE missing - run migrations"));

        var roles = new HashSet<com.recruitment.entity.Role>();
        roles.add(candidateRole);

        var user = User.builder()
            .email(req.email())
            .passwordHash(passwordEncoder.encode(req.password()))
            .firstName(req.firstName())
            .lastName(req.lastName())
            .department(req.department())
            .jobTitle(req.jobTitle())
            .enabled(true)
            .roles(roles)
            .build();

        user = userRepository.save(user);
        return buildAuthResponse(user);
    }

    public AuthResponse login(LoginRequest req) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.email(), req.password())
        );
        var user = userRepository.findByEmail(req.email())
            .orElseThrow(() -> new BusinessException("User not found"));
        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        var principal = UserPrincipal.from(user);
        String token = jwtService.generateToken(principal);
        Set<String> roles = user.getRoles().stream()
            .map(r -> r.getName().name()).collect(Collectors.toSet());
        return new AuthResponse(
            token, jwtService.getExpirationMs(),
            user.getId(), user.getEmail(),
            user.getFirstName(), user.getLastName(),
            roles
        );
    }
}
