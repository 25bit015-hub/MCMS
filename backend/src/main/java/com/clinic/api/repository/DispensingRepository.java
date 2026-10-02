package com.clinic.api.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinic.api.entity.Dispensing;
import com.clinic.api.entity.Dispensing.DispensingStatus;
import com.clinic.api.entity.Dispensing.PaymentType;

public interface DispensingRepository
        extends JpaRepository<Dispensing, Long> {

    // =========================
    // PATIENT HISTORY
    // =========================
    List<Dispensing> findByPatientIdOrderByDispensedAtDesc(
            Long patientId
    );

    // =========================
    // VISIT HISTORY
    // =========================
    List<Dispensing> findByVisitIdOrderByDispensedAtDesc(
            Long visitId
    );

    // =========================
    // PRESCRIPTION
    // =========================
    List<Dispensing> findByPrescriptionIdOrderByDispensedAtDesc(
            Long prescriptionId
    );

    // =========================
    // PAYMENT TYPE
    // =========================
    List<Dispensing> findByPaymentTypeOrderByDispensedAtDesc(
            PaymentType paymentType
    );

    // =========================
    // STATUS
    // =========================
    List<Dispensing> findByStatusOrderByDispensedAtDesc(
            DispensingStatus status
    );

    // =========================
    // DATE RANGE
    // DAILY / MONTHLY HISTORY
    // =========================
    List<Dispensing>
    findByDispensedAtBetweenOrderByDispensedAtDesc(
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    // =========================
    // PATIENT + DATE RANGE
    // =========================
    List<Dispensing>
    findByPatientIdAndDispensedAtBetweenOrderByDispensedAtDesc(
            Long patientId,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    // =========================
    // PAYMENT + DATE RANGE
    // =========================
    List<Dispensing>
    findByPaymentTypeAndDispensedAtBetweenOrderByDispensedAtDesc(
            PaymentType paymentType,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    // =========================
    // PATIENT + PAYMENT + DATE
    // =========================
    List<Dispensing>
    findByPatientIdAndPaymentTypeAndDispensedAtBetweenOrderByDispensedAtDesc(
            Long patientId,
            PaymentType paymentType,
            LocalDateTime startDate,
            LocalDateTime endDate
    );
}