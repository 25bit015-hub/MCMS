package com.clinic.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinic.api.entity.Pregnancy;

public interface PregnancyRepository
        extends JpaRepository<Pregnancy, Long> {

    /*
     * Pregnancies zote za patient mmoja.
     */
    List<Pregnancy> findByPatientIdOrderByCreatedAtDesc(
            Long patientId
    );

    /*
     * Pregnancies active za patient.
     */
    List<Pregnancy> findByPatientIdAndStatusOrderByCreatedAtDesc(
            Long patientId,
            String status
    );

    /*
     * Idadi ya pregnancies za patient.
     */
    long countByPatientId(Long patientId);

    /*
     * Idadi ya pregnancies zenye status fulani.
     */
    long countByStatus(String status);

    /*
     * Idadi ya high-risk pregnancies.
     */
    long countByHighRiskTrue();
    boolean existsByPatientIdAndStatus(Long patientId, String status);
}