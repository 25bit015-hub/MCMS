package com.clinic.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinic.api.entity.VitalSigns;

public interface VitalSignsRepository
        extends JpaRepository<VitalSigns, Long> {

    /*
     * Vitals zote za patient.
     *
     * Hii inatusaidia kuonyesha history ya
     * vital signs za mgonjwa.
     */
    List<VitalSigns> findByPatientIdOrderByRecordedAtDesc(
            Long patientId
    );

    /*
     * Vital signs ya mwisho kabisa ya patient.
     *
     * Hii inaweza kutumika kuonyesha latest vitals
     * kwenye patient profile.
     */
    Optional<VitalSigns> findFirstByPatientIdOrderByRecordedAtDesc(
            Long patientId
    );

    /*
     * Vitals zote za visit fulani.
     *
     * Muhimu kwa workflow yetu:
     *
     * Patient
     *    ↓
     * Visit
     *    ↓
     * VitalSigns
     */
    List<VitalSigns> findByVisitIdOrderByRecordedAtDesc(
            Long visitId
    );

    /*
     * Vital signs ya mwisho kwenye visit fulani.
     */
    Optional<VitalSigns> findFirstByVisitIdOrderByRecordedAtDesc(
            Long visitId
    );

    /*
     * Idadi ya vital-sign records za patient.
     */
    long countByPatientId(
            Long patientId
    );

    /*
     * Idadi ya vital-sign records kwenye visit fulani.
     */
    long countByVisitId(
            Long visitId
    );
}