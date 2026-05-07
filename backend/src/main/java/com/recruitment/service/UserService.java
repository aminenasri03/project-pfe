package com.recruitment.service;

import com.recruitment.dto.user.UserDto;
import com.recruitment.entity.RoleName;
import com.recruitment.exception.BusinessException;
import com.recruitment.exception.ResourceNotFoundException;
import com.recruitment.mapper.EntityMapper;
import com.recruitment.repository.RoleRepository;
import com.recruitment.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Transactional(readOnly = true)
    public Page<UserDto> list(Pageable pageable) {
        return userRepository.findAll(pageable).map(EntityMapper::toUserDto);
    }

    @Transactional(readOnly = true)
    public UserDto get(Long id) {
        return userRepository.findById(id)
            .map(EntityMapper::toUserDto)
            .orElseThrow(() -> new ResourceNotFoundException("User " + id + " not found"));
    }

    @Transactional
    public UserDto setEnabled(Long id, boolean enabled) {
        var user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User " + id + " not found"));
        user.setEnabled(enabled);
        return EntityMapper.toUserDto(user);
    }

    @Transactional
    public UserDto assignRole(Long userId, RoleName roleName) {
        var user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User " + userId + " not found"));
        var role = roleRepository.findByName(roleName)
            .orElseThrow(() -> new BusinessException("Role not found: " + roleName));
        user.getRoles().add(role);
        return EntityMapper.toUserDto(user);
    }

    @Transactional
    public UserDto removeRole(Long userId, RoleName roleName) {
        var user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User " + userId + " not found"));
        user.getRoles().removeIf(r -> r.getName() == roleName);
        return EntityMapper.toUserDto(user);
    }

    @Transactional
    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User " + id + " not found");
        }
        userRepository.deleteById(id);
    }
}
