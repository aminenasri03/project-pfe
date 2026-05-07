package com.recruitment.service;

import com.recruitment.dto.offer.JobOfferDto;
import com.recruitment.dto.offer.JobOfferRequest;
import com.recruitment.entity.JobOffer;
import com.recruitment.entity.OfferStatus;
import com.recruitment.exception.ResourceNotFoundException;
import com.recruitment.mapper.EntityMapper;
import com.recruitment.repository.JobOfferRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JobOfferService {

    private final JobOfferRepository offerRepository;
    private final CurrentUser currentUser;

    @Transactional(readOnly = true)
    public Page<JobOfferDto> search(OfferStatus status, String department, String keyword, Pageable pageable) {
        Specification<JobOffer> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (department != null && !department.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("department")),
                    "%" + department.toLowerCase() + "%"));
            }
            if (keyword != null && !keyword.isBlank()) {
                String kw = "%" + keyword.toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("title")), kw),
                    cb.like(cb.lower(root.get("description")), kw)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return offerRepository.findAll(spec, pageable).map(EntityMapper::toOfferDto);
    }

    @Transactional(readOnly = true)
    public JobOfferDto get(Long id) {
        return offerRepository.findById(id)
            .map(EntityMapper::toOfferDto)
            .orElseThrow(() -> new ResourceNotFoundException("Offer " + id + " not found"));
    }

    @Transactional
    public JobOfferDto create(JobOfferRequest req) {
        var offer = JobOffer.builder()
            .title(req.title())
            .description(req.description())
            .department(req.department())
            .location(req.location())
            .contractType(req.contractType())
            .requiredSkills(req.requiredSkills())
            .status(req.status() != null ? req.status() : OfferStatus.OPEN)
            .closesAt(req.closesAt())
            .createdBy(currentUser.user())
            .build();
        return EntityMapper.toOfferDto(offerRepository.save(offer));
    }

    @Transactional
    public JobOfferDto update(Long id, JobOfferRequest req) {
        var offer = offerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Offer " + id + " not found"));
        offer.setTitle(req.title());
        offer.setDescription(req.description());
        offer.setDepartment(req.department());
        offer.setLocation(req.location());
        offer.setContractType(req.contractType());
        offer.setRequiredSkills(req.requiredSkills());
        if (req.status() != null) offer.setStatus(req.status());
        offer.setClosesAt(req.closesAt());
        return EntityMapper.toOfferDto(offer);
    }

    @Transactional
    public void delete(Long id) {
        if (!offerRepository.existsById(id)) {
            throw new ResourceNotFoundException("Offer " + id + " not found");
        }
        offerRepository.deleteById(id);
    }
}
