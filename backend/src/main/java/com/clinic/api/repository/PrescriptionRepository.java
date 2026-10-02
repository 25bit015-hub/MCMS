package com.clinic.api.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinic.api.entity.Prescription;
import com.clinic.api.entity.Prescription.PaymentType;
import com.clinic.api.entity.Prescription.PrescriptionStatus;

public interface PrescriptionRepository
        extends JpaRepository<Prescription, Long> {

    List<Prescription> findByPatientIdOrderByCreatedAtDesc(
            Long patientId
    );

    List<Prescription> findByVisitIdOrderByCreatedAtDesc(
            Long visitId
    );

    List<Prescription> findByStatusOrderByCreatedAtDesc(
            PrescriptionStatus status
    );

    List<Prescription> findByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    List<Prescription> findByPatientIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            Long patientId,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    List<Prescription> findByPaymentTypeOrderByCreatedAtDesc(
            PaymentType paymentType
    );

    List<Prescription> findByPaymentTypeAndCreatedAtBetweenOrderByCreatedAtDesc(
            PaymentType paymentType,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    List<Prescription> findByPatientIdAndPaymentTypeAndCreatedAtBetweenOrderByCreatedAtDesc(
            Long patientId,
            PaymentType paymentType,
            LocalDateTime startDate,
            LocalDateTime endDate
    );
}