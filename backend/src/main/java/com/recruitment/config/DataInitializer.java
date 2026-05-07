package com.recruitment.config;

import com.recruitment.entity.RoleName;
import com.recruitment.entity.User;
import com.recruitment.repository.RoleRepository;
import com.recruitment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.admin-email:admin@recruitment.local}")
    private String adminEmail;

    @Value("${app.bootstrap.admin-password:Admin@12345}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }
        var adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
            .orElseThrow(() -> new IllegalStateException("ROLE_ADMIN missing - check Flyway migrations"));
        var roles = new HashSet<com.recruitment.entity.Role>();
        roles.add(adminRole);
        var admin = User.builder()
            .email(adminEmail)
            .passwordHash(passwordEncoder.encode(adminPassword))
            .firstName("Admin")
            .lastName("User")
            .enabled(true)
            .roles(roles)
            .build();
        userRepository.save(admin);
        log.info("Bootstrap admin created: {} / {}", adminEmail, adminPassword);
    }
}
