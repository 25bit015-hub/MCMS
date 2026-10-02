package com.clinic.api.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.clinic.api.entity.Visit;

public interface VisitRepository extends JpaRepository<Visit, Long> {

    /*
     * Visits zote za patient mmoja,
     * mpya kwanza.
     */
    List<Visit> findByPatientIdOrderByVisitDateDescCreatedAtDesc(
            Long patientId
    );

    /*
     * Visits za patient mmoja kwa pagination.
     *
     * Hii itatusaidia baadaye kwenye
     * Patient Profile / Visit History.
     */
    Page<Visit> findByPatientIdOrderByVisitDateDescCreatedAtDesc(
            Long patientId,
            Pageable pageable
    );

    /*
     * Tafuta visit kwa visit number.
     */
    Optional<Visit> findByVisitNumber(
            String visitNumber
    );

    /*
     * Hakikisha visit number haijatumika.
     */
    boolean existsByVisitNumber(
            String visitNumber
    );

    /*
     * Visits za patient ndani ya tarehe fulani.
     *
     * Hii itatusaidia kwenye monthly history.
     */
    List<Visit> findByPatientIdAndVisitDateBetweenOrderByVisitDateDescCreatedAtDesc(
            Long patientId,
            LocalDate startDate,
            LocalDate endDate
    );

    /*
     * Visits za tarehe fulani.
     */
    List<Visit> findByVisitDateOrderByCreatedAtAsc(
            LocalDate visitDate
    );

    /*
     * Count ya visits za patient.
     */
    long countByPatientId(
            Long patientId
    );

    /*
     * Count ya visits za patient ndani ya mwezi/tarehe range.
     */
    long countByPatientIdAndVisitDateBetween(
            Long patientId,
            LocalDate startDate,
            LocalDate endDate
    );
}