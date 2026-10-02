package com.clinic.api.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinic.api.entity.PatientQueue;
import com.clinic.api.entity.PatientQueue.QueueService;
import com.clinic.api.entity.PatientQueue.QueueStatus;

public interface PatientQueueRepository
        extends JpaRepository<PatientQueue, Long> {

    List<PatientQueue> findByQueueDateOrderByCheckInTimeAsc(
            LocalDate queueDate
    );

    List<PatientQueue> findByQueueDateAndStatusOrderByCheckInTimeAsc(
            LocalDate queueDate,
            QueueStatus status
    );

    List<PatientQueue> findByQueueDateAndServiceOrderByCheckInTimeAsc(
            LocalDate queueDate,
            QueueService service
    );

    Optional<PatientQueue> findByQueueNumber(
            String queueNumber
    );

    boolean existsByQueueNumber(
            String queueNumber
    );

    boolean existsByPatientIdAndQueueDateAndStatusNot(
            Long patientId,
            LocalDate queueDate,
            QueueStatus statusNot
    );

    long countByQueueDate(
            LocalDate queueDate
    );

    long countByQueueDateAndStatus(
            LocalDate queueDate,
            QueueStatus status
    );

    // =========================================================
    // FIND QUEUE BY PATIENT AND VISIT
    // =========================================================

    Optional<PatientQueue> findByPatientIdAndVisitId(
            Long patientId,
            Long visitId
    );
}