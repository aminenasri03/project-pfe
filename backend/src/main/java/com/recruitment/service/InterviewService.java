package com.recruitment.service;

import com.recruitment.dto.interview.InterviewDto;
import com.recruitment.dto.interview.InterviewRequest;
import com.recruitment.entity.ApplicationStatus;
import com.recruitment.entity.Interview;
import com.recruitment.entity.InterviewStatus;
import com.recruitment.exception.ResourceNotFoundException;
import com.recruitment.mapper.EntityMapper;
import com.recruitment.repository.ApplicationRepository;
import com.recruitment.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final NotificationCreator notifications;

    @Transactional
    public InterviewDto schedule(InterviewRequest req) {
        var app = applicationRepository.findById(req.applicationId())
            .orElseThrow(() -> new ResourceNotFoundException("Application " + req.applicationId() + " not found"));
        var interview = Interview.builder()
            .application(app)
            .scheduledAt(req.scheduledAt())
            .location(req.location())
            .mode(req.mode())
            .notes(req.notes())
            .status(InterviewStatus.SCHEDULED)
            .build();
        interview = interviewRepository.save(interview);
        app.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED);

        notifications.send(app.getCandidate(),
            "Entretien planifié",
            "Un entretien est planifié le " + req.scheduledAt() + " pour « " + app.getOffer().getTitle() + " »",
            "INTERVIEW_SCHEDULED");

        return EntityMapper.toInterviewDto(interview);
    }

    @Transactional(readOnly = true)
    public List<InterviewDto> byApplication(Long applicationId) {
        return interviewRepository.findByApplicationId(applicationId).stream()
            .map(EntityMapper::toInterviewDto).toList();
    }

    @Transactional
    public InterviewDto updateStatus(Long id, InterviewStatus status) {
        var i = interviewRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Interview " + id + " not found"));
        i.setStatus(status);
        return EntityMapper.toInterviewDto(i);
    }

    @Transactional
    public void cancel(Long id) {
        var i = interviewRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Interview " + id + " not found"));
        i.setStatus(InterviewStatus.CANCELLED);
    }
}
