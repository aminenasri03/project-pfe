package com.recruitment.service;

import com.recruitment.dto.evaluation.EvaluationDto;
import com.recruitment.dto.evaluation.EvaluationRequest;
import com.recruitment.entity.ApplicationStatus;
import com.recruitment.entity.Decision;
import com.recruitment.entity.Evaluation;
import com.recruitment.exception.ResourceNotFoundException;
import com.recruitment.mapper.EntityMapper;
import com.recruitment.repository.ApplicationRepository;
import com.recruitment.repository.EvaluationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final ApplicationRepository applicationRepository;
    private final CurrentUser currentUser;

    @Transactional
    public EvaluationDto create(EvaluationRequest req) {
        var app = applicationRepository.findById(req.applicationId())
            .orElseThrow(() -> new ResourceNotFoundException("Application " + req.applicationId() + " not found"));
        var ev = Evaluation.builder()
            .application(app)
            .evaluator(currentUser.user())
            .score(req.score())
            .comments(req.comments())
            .decision(req.decision())
            .build();
        ev = evaluationRepository.save(ev);

        if (req.decision() == Decision.HIRE) {
            app.setStatus(ApplicationStatus.ACCEPTED);
        } else if (req.decision() == Decision.REJECT) {
            app.setStatus(ApplicationStatus.REJECTED);
        }
        return EntityMapper.toEvaluationDto(ev);
    }

    @Transactional(readOnly = true)
    public List<EvaluationDto> byApplication(Long applicationId) {
        return evaluationRepository.findByApplicationId(applicationId).stream()
            .map(EntityMapper::toEvaluationDto).toList();
    }
}
