package com.recruitment.controller;

import com.recruitment.dto.interview.InterviewDto;
import com.recruitment.dto.interview.InterviewRequest;
import com.recruitment.entity.InterviewStatus;
import com.recruitment.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECRUITER')")
    public InterviewDto schedule(@Valid @RequestBody InterviewRequest req) {
        return interviewService.schedule(req);
    }

    @GetMapping("/by-application/{applicationId}")
    public List<InterviewDto> byApplication(@PathVariable Long applicationId) {
        return interviewService.byApplication(applicationId);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','RECRUITER')")
    public InterviewDto updateStatus(@PathVariable Long id, @RequestParam InterviewStatus status) {
        return interviewService.updateStatus(id, status);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECRUITER')")
    public void cancel(@PathVariable Long id) {
        interviewService.cancel(id);
    }
}
