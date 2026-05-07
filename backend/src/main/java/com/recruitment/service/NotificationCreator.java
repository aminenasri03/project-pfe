package com.recruitment.service;

import com.recruitment.entity.Notification;
import com.recruitment.entity.User;
import com.recruitment.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationCreator {

    private final NotificationRepository notificationRepository;

    @Transactional
    public void send(User user, String title, String message, String type) {
        var n = Notification.builder()
            .user(user)
            .title(title)
            .message(message)
            .type(type)
            .read(false)
            .build();
        notificationRepository.save(n);
    }
}
