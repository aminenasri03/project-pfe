package com.recruitment.controller;

import com.recruitment.dto.evaluation.EvaluationDto;
import com.recruitment.dto.evaluation.EvaluationRequest;
import com.recruitment.service.EvaluationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/evaluations")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECRUITER')")
    public EvaluationDto create(@Valid @RequestBody EvaluationRequest req) {
        return evaluationService.create(req);
    }

    @GetMapping("/by-application/{applicationId}")
    @PreAuthorize("hasAnyRole('ADMIN','RECRUITER')")
    public List<EvaluationDto> byApplication(@PathVariable Long applicationId) {
        return evaluationService.byApplication(applicationId);
    }
}
