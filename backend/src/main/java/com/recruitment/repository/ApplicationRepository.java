package com.recruitment.repository;

import com.recruitment.entity.Application;
import com.recruitment.entity.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {

    Page<Application> findByCandidateId(Long candidateId, Pageable pageable);

    Page<Application> findByOfferId(Long offerId, Pageable pageable);

    Page<Application> findByOfferIdAndStatus(Long offerId, ApplicationStatus status, Pageable pageable);

    boolean existsByOfferIdAndCandidateId(Long offerId, Long candidateId);

    List<Application> findByOfferId(Long offerId);
}
