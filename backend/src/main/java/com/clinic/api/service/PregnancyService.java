package com.clinic.api.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clinic.api.dto.PregnancyRequest;
import com.clinic.api.dto.PregnancyResponse;
import com.clinic.api.entity.Patient;
import com.clinic.api.entity.Pregnancy;
import com.clinic.api.repository.PatientRepository;
import com.clinic.api.repository.PregnancyRepository;

@Service
public class PregnancyService {

    private final PregnancyRepository pregnancyRepository;
    private final PatientRepository patientRepository;

    public PregnancyService(
            PregnancyRepository pregnancyRepository,
            PatientRepository patientRepository
    ) {
        this.pregnancyRepository = pregnancyRepository;
        this.patientRepository = patientRepository;
    }

    // =====================================================
    // CREATE PREGNANCY
    // =====================================================

    @Transactional
    public PregnancyResponse createPregnancy(
            PregnancyRequest request
    ) {

        Patient patient =
                patientRepository
                        .findById(request.getPatientId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Patient not found with id: "
                                                + request.getPatientId()
                                )
                        );

        String status =
                request.getStatus() == null ||
                request.getStatus().isBlank()
                        ? "ACTIVE"
                        : request.getStatus();

        /*
         * Only one ACTIVE pregnancy is allowed
         * for one patient.
         */
        boolean activePregnancyExists =
                "ACTIVE".equalsIgnoreCase(status)
                && pregnancyRepository
                        .existsByPatientIdAndStatus(
                                request.getPatientId(),
                                "ACTIVE"
                        );

        if (activePregnancyExists) {
            throw new IllegalArgumentException(
                    "An active pregnancy already exists for this patient."
            );
        }

        Pregnancy pregnancy = new Pregnancy();

        pregnancy.setPatient(patient);
        pregnancy.setLmp(request.getLmp());
        pregnancy.setEdd(request.getEdd());
        pregnancy.setGravida(request.getGravida());
        pregnancy.setPara(request.getPara());
        pregnancy.setLivingChildren(request.getLivingChildren());
        pregnancy.setAbortions(request.getAbortions());

        pregnancy.setStatus(status);

        /*
         * Database-level duplicate protection.
         *
         * ACTIVE:
         * activePregnancyKey = patient.id
         *
         * Non-active:
         * activePregnancyKey = null
         */
        updateActivePregnancyKey(
                pregnancy,
                patient
        );

        pregnancy.setHighRisk(
                request.getHighRisk() == null
                        ? false
                        : request.getHighRisk()
        );

        pregnancy.setNotes(request.getNotes());

        pregnancy.setCreatedAt(LocalDateTime.now());
        pregnancy.setUpdatedAt(LocalDateTime.now());

        pregnancy =
                pregnancyRepository.save(pregnancy);

        return toResponse(pregnancy);
    }

    // =====================================================
    // GET ALL PREGNANCIES
    // =====================================================

    @Transactional(readOnly = true)
    public List<PregnancyResponse> getAllPregnancies() {

        return pregnancyRepository
                .findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =====================================================
    // GET PREGNANCY BY ID
    // =====================================================

    @Transactional(readOnly = true)
    public PregnancyResponse getPregnancyById(
            Long id
    ) {

        Pregnancy pregnancy =
                pregnancyRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Pregnancy not found with id: "
                                                + id
                                )
                        );

        return toResponse(pregnancy);
    }

    // =====================================================
    // GET PREGNANCIES BY PATIENT
    // =====================================================

    @Transactional(readOnly = true)
    public List<PregnancyResponse> getByPatient(
            Long patientId
    ) {

        if (!patientRepository.existsById(patientId)) {
            throw new RuntimeException(
                    "Patient not found with id: "
                            + patientId
            );
        }

        return pregnancyRepository
                .findByPatientIdOrderByCreatedAtDesc(
                        patientId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =====================================================
    // GET ACTIVE PREGNANCIES
    // =====================================================

    @Transactional(readOnly = true)
    public List<PregnancyResponse> getActivePregnancies() {

        return pregnancyRepository
                .findAll()
                .stream()
                .filter(p ->
                        "ACTIVE".equalsIgnoreCase(
                                p.getStatus()
                        )
                )
                .map(this::toResponse)
                .toList();
    }

    // =====================================================
    // UPDATE PREGNANCY
    // =====================================================

    @Transactional
    public PregnancyResponse updatePregnancy(
            Long id,
            PregnancyRequest request
    ) {

        Pregnancy pregnancy =
                pregnancyRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Pregnancy not found with id: "
                                                + id
                                )
                        );

        /*
         * A pregnancy must remain permanently linked
         * to its original patient.
         *
         * Changing patientId during an update would
         * corrupt the patient's medical history.
         */
        if (request.getPatientId() == null) {
            throw new IllegalArgumentException(
                    "Patient ID is required when updating a pregnancy."
            );
        }

        if (!pregnancy.getPatient()
                .getId()
                .equals(request.getPatientId())) {

            throw new IllegalArgumentException(
                    "A pregnancy cannot be moved to another patient. "
                            + "The original patient relationship must be preserved."
            );
        }

        /*
         * Keep the original patient ID in a final variable.
         *
         * This is required because pregnancy is reassigned
         * later after pregnancyRepository.save(pregnancy).
         */
        final Long existingPatientId =
                pregnancy.getPatient().getId();

        /*
         * Load the original patient relationship.
         *
         * We intentionally use the patient already linked
         * to the pregnancy instead of replacing it.
         */
        Patient patient =
                patientRepository
                        .findById(existingPatientId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Patient not found with id: "
                                                + existingPatientId
                                )
                        );

        String status =
                request.getStatus() == null ||
                request.getStatus().isBlank()
                        ? pregnancy.getStatus()
                        : request.getStatus();

        /*
         * Prevent another ACTIVE pregnancy
         * for the same patient.
         *
         * The current pregnancy is allowed to remain ACTIVE.
         */
        if ("ACTIVE".equalsIgnoreCase(status)) {

            boolean duplicateActivePregnancy =
                    pregnancyRepository
                            .existsByPatientIdAndStatus(
                                    existingPatientId,
                                    "ACTIVE"
                            );

            if (duplicateActivePregnancy
                    && !(
                        "ACTIVE".equalsIgnoreCase(
                                pregnancy.getStatus()
                        )
                    )) {

                throw new IllegalArgumentException(
                        "An active pregnancy already exists for this patient."
                );
            }
        }

        /*
         * IMPORTANT:
         * Do not change pregnancy.patient.
         *
         * The original patient relationship is preserved
         * for medical history and continuity of care.
         */

        pregnancy.setLmp(request.getLmp());
        pregnancy.setEdd(request.getEdd());
        pregnancy.setGravida(request.getGravida());
        pregnancy.setPara(request.getPara());
        pregnancy.setLivingChildren(
                request.getLivingChildren()
        );
        pregnancy.setAbortions(
                request.getAbortions()
        );

        pregnancy.setStatus(status);

        /*
         * Keep database active key synchronized
         * with pregnancy status.
         */
        updateActivePregnancyKey(
                pregnancy,
                patient
        );

        if (request.getHighRisk() != null) {

            pregnancy.setHighRisk(
                    request.getHighRisk()
            );
        }

        pregnancy.setNotes(request.getNotes());
        pregnancy.setUpdatedAt(LocalDateTime.now());

        pregnancy =
                pregnancyRepository.save(pregnancy);

        return toResponse(pregnancy);
    }

    // =====================================================
    // ARCHIVE PREGNANCY
    // =====================================================

    @Transactional
    public void deletePregnancy(Long id) {

        Pregnancy pregnancy =
                pregnancyRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Pregnancy not found with id: "
                                                + id
                                )
                        );

        /*
         * Never physically delete a pregnancy because
         * ANC visits and other maternity records may
         * depend on this pregnancy.
         *
         * Archive instead so the complete medical history
         * remains available.
         */
        pregnancy.setStatus("ARCHIVED");

        /*
         * Remove the active database key so that
         * the patient can have another ACTIVE pregnancy
         * in the future.
         */
        pregnancy.setActivePregnancyKey(null);

        pregnancy.setUpdatedAt(
                LocalDateTime.now()
        );

        pregnancyRepository.save(pregnancy);
    }

    // =====================================================
    // DASHBOARD COUNTS
    // =====================================================

    @Transactional(readOnly = true)
    public long countActivePregnancies() {

        return pregnancyRepository.countByStatus(
                "ACTIVE"
        );
    }

    @Transactional(readOnly = true)
    public long countHighRiskPregnancies() {

        return pregnancyRepository.countByHighRiskTrue();
    }

    // =====================================================
    // ACTIVE PREGNANCY KEY
    // =====================================================

    private void updateActivePregnancyKey(
            Pregnancy pregnancy,
            Patient patient
    ) {

        if ("ACTIVE".equalsIgnoreCase(
                pregnancy.getStatus()
        )) {

            pregnancy.setActivePregnancyKey(
                    patient.getId()
            );

        } else {

            pregnancy.setActivePregnancyKey(
                    null
            );
        }
    }

    // =====================================================
    // RESPONSE MAPPER
    // =====================================================

    private PregnancyResponse toResponse(
            Pregnancy pregnancy
    ) {

        PregnancyResponse response =
                new PregnancyResponse();

        Patient patient =
                pregnancy.getPatient();

        response.setId(
                pregnancy.getId()
        );

        response.setPatientId(
                patient.getId()
        );

        response.setPatientNumber(
                patient.getPatientNumber()
        );

        response.setPatientName(
                patient.getFirstName()
                        + " "
                        + patient.getLastName()
        );

        response.setLmp(
                pregnancy.getLmp()
        );

        response.setEdd(
                pregnancy.getEdd()
        );

        response.setGravida(
                pregnancy.getGravida()
        );

        response.setPara(
                pregnancy.getPara()
        );

        response.setLivingChildren(
                pregnancy.getLivingChildren()
        );

        response.setAbortions(
                pregnancy.getAbortions()
        );

        response.setStatus(
                pregnancy.getStatus()
        );

        response.setHighRisk(
                pregnancy.getHighRisk()
        );

        response.setNotes(
                pregnancy.getNotes()
        );

        response.setCreatedAt(
                pregnancy.getCreatedAt()
        );

        response.setUpdatedAt(
                pregnancy.getUpdatedAt()
        );

        return response;
    }
}