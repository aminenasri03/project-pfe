package com.recruitment.controller;

import com.recruitment.dto.user.UserDto;
import com.recruitment.entity.RoleName;
import com.recruitment.service.CurrentUser;
import com.recruitment.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final CurrentUser currentUser;

    @GetMapping("/api/users/me")
    public UserDto me() {
        return com.recruitment.mapper.EntityMapper.toUserDto(currentUser.user());
    }

    @GetMapping("/api/admin/users")
    public Page<UserDto> list(Pageable pageable) {
        return userService.list(pageable);
    }

    @GetMapping("/api/admin/users/{id}")
    public UserDto get(@PathVariable Long id) {
        return userService.get(id);
    }

    @PatchMapping("/api/admin/users/{id}")
    public UserDto setEnabled(@PathVariable Long id, @RequestParam boolean enabled) {
        return userService.setEnabled(id, enabled);
    }

    @PostMapping("/api/admin/users/{id}/roles/{role}")
    public UserDto addRole(@PathVariable Long id, @PathVariable RoleName role) {
        return userService.assignRole(id, role);
    }

    @DeleteMapping("/api/admin/users/{id}/roles/{role}")
    public UserDto removeRole(@PathVariable Long id, @PathVariable RoleName role) {
        return userService.removeRole(id, role);
    }

    @DeleteMapping("/api/admin/users/{id}")
    public void delete(@PathVariable Long id) {
        userService.delete(id);
    }
}
