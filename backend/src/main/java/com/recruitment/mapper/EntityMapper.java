package com.recruitment.mapper;

import com.recruitment.dto.application.ApplicationDto;
import com.recruitment.dto.evaluation.EvaluationDto;
import com.recruitment.dto.interview.InterviewDto;
import com.recruitment.dto.notification.NotificationDto;
import com.recruitment.dto.offer.JobOfferDto;
import com.recruitment.dto.user.UserDto;
import com.recruitment.entity.*;

import java.util.stream.Collectors;

public final class EntityMapper {

    private EntityMapper() {}

    public static UserDto toUserDto(User u) {
        return new UserDto(
            u.getId(), u.getEmail(), u.getFirstName(), u.getLastName(),
            u.getDepartment(), u.getJobTitle(), u.isEnabled(),
            u.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toSet()),
            u.getCreatedAt()
        );
    }

    public static JobOfferDto toOfferDto(JobOffer o) {
        var creator = o.getCreatedBy();
        return new JobOfferDto(
            o.getId(), o.getTitle(), o.getDescription(), o.getDepartment(),
            o.getLocation(), o.getContractType(), o.getRequiredSkills(),
            o.getStatus(),
            creator != null ? creator.getId() : null,
            creator != null ? (creator.getFirstName() + " " + creator.getLastName()) : null,
            o.getCreatedAt(), o.getClosesAt()
        );
    }

    public static ApplicationDto toApplicationDto(Application a) {
        var c = a.getCandidate();
        return new ApplicationDto(
            a.getId(),
            a.getOffer().getId(), a.getOffer().getTitle(),
            c.getId(), c.getFirstName() + " " + c.getLastName(), c.getEmail(),
            a.getCoverLetter(), a.getCvFileName(),
            a.getMatchingScore(), a.getStatus(),
            a.getSubmittedAt(), a.getUpdatedAt()
        );
    }

    public static InterviewDto toInterviewDto(Interview i) {
        return new InterviewDto(
            i.getId(), i.getApplication().getId(),
            i.getScheduledAt(), i.getLocation(), i.getMode(),
            i.getNotes(), i.getStatus(), i.getCreatedAt()
        );
    }

    public static EvaluationDto toEvaluationDto(Evaluation e) {
        var ev = e.getEvaluator();
        return new EvaluationDto(
            e.getId(), e.getApplication().getId(),
            ev.getId(), ev.getFirstName() + " " + ev.getLastName(),
            e.getScore(), e.getComments(), e.getDecision(), e.getCreatedAt()
        );
    }

    public static NotificationDto toNotificationDto(Notification n) {
        return new NotificationDto(
            n.getId(), n.getTitle(), n.getMessage(), n.getType(),
            n.isRead(), n.getCreatedAt()
        );
    }
}
