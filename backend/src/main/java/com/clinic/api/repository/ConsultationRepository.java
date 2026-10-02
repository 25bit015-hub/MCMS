package com.clinic.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinic.api.entity.Consultation;

public interface ConsultationRepository
        extends JpaRepository<Consultation, Long> {

    // ============================================================
    // PATIENT CONSULTATIONS
    // ============================================================

    List<Consultation>
    findByPatientIdOrderByCreatedAtDesc(
            Long patientId
    );

    Optional<Consultation>
    findFirstByPatientIdOrderByCreatedAtDesc(
            Long patientId
    );

    // ============================================================
    // QUEUE CONSULTATIONS
    // ============================================================

    List<Consultation>
    findByQueueIdOrderByCreatedAtDesc(
            Long queueId
    );

    // ============================================================
    // VISIT CONSULTATIONS
    // ============================================================

    List<Consultation>
    findByVisitIdOrderByCreatedAtDesc(
            Long visitId
    );

    Optional<Consultation>
    findFirstByVisitIdOrderByCreatedAtDesc(
            Long visitId
    );
}