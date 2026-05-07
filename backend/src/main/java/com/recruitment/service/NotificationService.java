package com.recruitment.service;

import com.recruitment.dto.notification.NotificationDto;
import com.recruitment.entity.Notification;
import com.recruitment.exception.ResourceNotFoundException;
import com.recruitment.mapper.EntityMapper;
import com.recruitment.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final CurrentUser currentUser;

    @Transactional(readOnly = true)
    public Page<NotificationDto> mine(Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(currentUser.principal().getId(), pageable)
            .map(EntityMapper::toNotificationDto);
    }

    @Transactional(readOnly = true)
    public long unreadCount() {
        return notificationRepository.countByUserIdAndReadFalse(currentUser.principal().getId());
    }

    @Transactional
    public void markAsRead(Long id) {
        Notification n = notificationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Notification " + id + " not found"));
        if (!n.getUser().getId().equals(currentUser.principal().getId())) {
            throw new ResourceNotFoundException("Notification " + id + " not found");
        }
        n.setRead(true);
    }
}
