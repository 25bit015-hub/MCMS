package com.clinic.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinic.api.entity.LaboratoryResult;

public interface LaboratoryResultRepository
        extends JpaRepository<LaboratoryResult, Long> {

    List<LaboratoryResult> findByPatientIdOrderByPerformedAtDesc(
            Long patientId
    );

    List<LaboratoryResult> findByQueueIdOrderByPerformedAtDesc(
            Long queueId
    );

    Optional<LaboratoryResult> findFirstByPatientIdOrderByPerformedAtDesc(
            Long patientId
    );

    Optional<LaboratoryResult> findFirstByQueueIdOrderByPerformedAtDesc(
            Long queueId
    );

    /*
     * Visit-specific laboratory results
     */
    List<LaboratoryResult> findByVisitIdOrderByPerformedAtDesc(
            Long visitId
    );

    Optional<LaboratoryResult> findFirstByVisitIdOrderByPerformedAtDesc(
            Long visitId
    );
}