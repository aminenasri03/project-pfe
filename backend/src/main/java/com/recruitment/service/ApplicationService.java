package com.recruitment.service;

import com.recruitment.dto.application.ApplicationDto;
import com.recruitment.dto.application.ApplicationStatusUpdateRequest;
import com.recruitment.entity.Application;
import com.recruitment.entity.ApplicationStatus;
import com.recruitment.exception.BusinessException;
import com.recruitment.exception.ResourceNotFoundException;
import com.recruitment.mapper.EntityMapper;
import com.recruitment.repository.ApplicationRepository;
import com.recruitment.repository.JobOfferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobOfferRepository offerRepository;
    private final FileStorageService fileStorageService;
    private final CurrentUser currentUser;
    private final NotificationCreator notifications;

    @Transactional
    public ApplicationDto submit(Long offerId, String coverLetter, MultipartFile cv) {
        var candidate = currentUser.user();
        var offer = offerRepository.findById(offerId)
            .orElseThrow(() -> new ResourceNotFoundException("Offer " + offerId + " not found"));
        if (applicationRepository.existsByOfferIdAndCandidateId(offerId, candidate.getId())) {
            throw new BusinessException("You already applied to this offer");
        }
        var stored = fileStorageService.storeCv(cv);
        var application = Application.builder()
            .offer(offer)
            .candidate(candidate)
            .coverLetter(coverLetter)
            .cvFilePath(stored.absolutePath())
            .cvFileName(stored.originalName())
            .status(ApplicationStatus.SUBMITTED)
            .build();
        application = applicationRepository.save(application);

        notifications.send(candidate,
            "Candidature envoyée",
            "Votre candidature pour « " + offer.getTitle() + " » a été reçue.",
            "APPLICATION_SUBMITTED");

        return EntityMapper.toApplicationDto(application);
    }

    @Transactional(readOnly = true)
    public Page<ApplicationDto> myApplications(Pageable pageable) {
        return applicationRepository.findByCandidateId(currentUser.principal().getId(), pageable)
            .map(EntityMapper::toApplicationDto);
    }

    @Transactional(readOnly = true)
    public Page<ApplicationDto> byOffer(Long offerId, Pageable pageable) {
        return applicationRepository.findByOfferId(offerId, pageable)
            .map(EntityMapper::toApplicationDto);
    }

    @Transactional(readOnly = true)
    public ApplicationDto get(Long id) {
        return applicationRepository.findById(id)
            .map(EntityMapper::toApplicationDto)
            .orElseThrow(() -> new ResourceNotFoundException("Application " + id + " not found"));
    }

    @Transactional
    public ApplicationDto updateStatus(Long id, ApplicationStatusUpdateRequest req) {
        var app = applicationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Application " + id + " not found"));
        app.setStatus(req.status());
        notifications.send(app.getCandidate(),
            "Mise à jour de votre candidature",
            "Statut: " + req.status().name() + " pour « " + app.getOffer().getTitle() + " »",
            "APPLICATION_STATUS");
        return EntityMapper.toApplicationDto(app);
    }

    @Transactional
    public void withdraw(Long id) {
        var app = applicationRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Application " + id + " not found"));
        if (!app.getCandidate().getId().equals(currentUser.principal().getId())) {
            throw new BusinessException("You can only withdraw your own application");
        }
        app.setStatus(ApplicationStatus.WITHDRAWN);
    }
}
