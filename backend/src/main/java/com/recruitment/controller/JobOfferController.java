package com.recruitment.controller;

import com.recruitment.dto.offer.JobOfferDto;
import com.recruitment.dto.offer.JobOfferRequest;
import com.recruitment.entity.OfferStatus;
import com.recruitment.service.JobOfferService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
public class JobOfferController {

    private final JobOfferService offerService;

    @GetMapping
    public Page<JobOfferDto> search(
            @RequestParam(required = false) OfferStatus status,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String keyword,
            Pageable pageable) {
        return offerService.search(status, department, keyword, pageable);
    }

    @GetMapping("/{id}")
    public JobOfferDto get(@PathVariable Long id) {
        return offerService.get(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','RECRUITER')")
    public JobOfferDto create(@Valid @RequestBody JobOfferRequest req) {
        return offerService.create(req);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECRUITER')")
    public JobOfferDto update(@PathVariable Long id, @Valid @RequestBody JobOfferRequest req) {
        return offerService.update(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','RECRUITER')")
    public void delete(@PathVariable Long id) {
        offerService.delete(id);
    }
}
