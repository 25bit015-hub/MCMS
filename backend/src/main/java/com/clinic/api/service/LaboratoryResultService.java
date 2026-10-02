package com.clinic.api.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clinic.api.dto.LaboratoryResultRequest;
import com.clinic.api.dto.LaboratoryResultResponse;
import com.clinic.api.entity.Consultation;
import com.clinic.api.entity.LaboratoryResult;
import com.clinic.api.entity.Patient;
import com.clinic.api.entity.PatientQueue;
import com.clinic.api.entity.Visit;
import com.clinic.api.repository.ConsultationRepository;
import com.clinic.api.repository.LaboratoryResultRepository;
import com.clinic.api.repository.PatientQueueRepository;
import com.clinic.api.repository.PatientRepository;
import com.clinic.api.repository.VisitRepository;

@Service
public class LaboratoryResultService {

    private final LaboratoryResultRepository laboratoryResultRepository;
    private final PatientRepository patientRepository;
    private final PatientQueueRepository patientQueueRepository;
    private final ConsultationRepository consultationRepository;
    private final VisitRepository visitRepository;

    public LaboratoryResultService(
            LaboratoryResultRepository laboratoryResultRepository,
            PatientRepository patientRepository,
            PatientQueueRepository patientQueueRepository,
            ConsultationRepository consultationRepository,
            VisitRepository visitRepository) {

        this.laboratoryResultRepository =
                laboratoryResultRepository;

        this.patientRepository =
                patientRepository;

        this.patientQueueRepository =
                patientQueueRepository;

        this.consultationRepository =
                consultationRepository;

        this.visitRepository =
                visitRepository;
    }

    /*
     * =========================================================
     * CREATE LABORATORY RESULT
     * =========================================================
     */
    @Transactional
    public LaboratoryResultResponse createResult(
            LaboratoryResultRequest request) {

        /*
         * -----------------------------------------------------
         * 1. FIND PATIENT
         * -----------------------------------------------------
         */
        Patient patient =
                patientRepository.findById(request.getPatientId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Patient not found"
                                )
                        );

        /*
         * -----------------------------------------------------
         * 2. FIND QUEUE
         * -----------------------------------------------------
         */
        PatientQueue queue =
                patientQueueRepository.findById(request.getQueueId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Patient queue not found"
                                )
                        );

        /*
         * -----------------------------------------------------
         * 3. MAKE SURE QUEUE BELONGS TO PATIENT
         * -----------------------------------------------------
         */
        if (queue.getPatient() == null ||
                !queue.getPatient().getId()
                        .equals(patient.getId())) {

            throw new RuntimeException(
                    "Queue does not belong to this patient"
            );
        }

        /*
         * -----------------------------------------------------
         * 4. FIND VISIT
         * -----------------------------------------------------
         */
        Visit visit =
                visitRepository.findById(request.getVisitId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Visit not found"
                                )
                        );

        /*
         * -----------------------------------------------------
         * 5. MAKE SURE VISIT BELONGS TO PATIENT
         * -----------------------------------------------------
         */
        if (visit.getPatient() == null ||
                !visit.getPatient().getId()
                        .equals(patient.getId())) {

            throw new RuntimeException(
                    "Visit does not belong to this patient"
            );
        }

        /*
         * -----------------------------------------------------
         * 6. MAKE SURE QUEUE BELONGS TO VISIT
         * -----------------------------------------------------
         */
        if (queue.getVisit() == null) {

            throw new RuntimeException(
                    "Queue is not linked to a visit"
            );
        }

        if (!queue.getVisit().getId()
                .equals(visit.getId())) {

            throw new RuntimeException(
                    "Queue and Visit do not match"
            );
        }

        /*
         * -----------------------------------------------------
         * 7. OPTIONAL CONSULTATION
         * -----------------------------------------------------
         */
        Consultation consultation = null;

        if (request.getConsultationId() != null) {

            consultation =
                    consultationRepository
                            .findById(
                                    request.getConsultationId()
                            )
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Consultation not found"
                                    )
                            );

            /*
             * Consultation must belong to patient.
             */
            if (consultation.getPatient() == null ||
                    !consultation.getPatient().getId()
                            .equals(patient.getId())) {

                throw new RuntimeException(
                        "Consultation does not belong to this patient"
                );
            }

            /*
             * Consultation must belong to same Visit.
             */
            if (consultation.getVisit() == null) {

                throw new RuntimeException(
                        "Consultation is not linked to a visit"
                );
            }

            if (!consultation.getVisit().getId()
                    .equals(visit.getId())) {

                throw new RuntimeException(
                        "Consultation and Visit do not match"
                );
            }
        }

        /*
         * -----------------------------------------------------
         * 8. CREATE RESULT
         * -----------------------------------------------------
         */
        LaboratoryResult result =
                new LaboratoryResult();

        result.setPatient(patient);
        result.setQueue(queue);
        result.setVisit(visit);
        result.setConsultation(consultation);

        result.setResults(
                request.getResults().trim()
        );

        if (request.getNotes() != null) {

            result.setNotes(
                    request.getNotes().trim()
            );
        }

        /*
         * -----------------------------------------------------
         * 9. SAVE
         * -----------------------------------------------------
         */
        result =
                laboratoryResultRepository.save(result);

        /*
         * -----------------------------------------------------
         * 10. RESPONSE
         * -----------------------------------------------------
         */
        return LaboratoryResultResponse.fromEntity(
                result
        );
    }

    /*
     * =========================================================
     * GET ALL RESULTS FOR PATIENT
     * =========================================================
     *
     * This endpoint remains available for Laboratory history.
     *
     * Doctor Consultation should NOT use this endpoint when
     * loading the result for the current Visit.
     */
    @Transactional(readOnly = true)
    public List<LaboratoryResultResponse> getPatientResults(
            Long patientId) {

        patientRepository.findById(patientId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Patient not found"
                        )
                );

        return laboratoryResultRepository
                .findByPatientIdOrderByPerformedAtDesc(
                        patientId
                )
                .stream()
                .map(
                        LaboratoryResultResponse::fromEntity
                )
                .toList();
    }

    /*
     * =========================================================
     * GET LATEST RESULT FOR PATIENT
     * =========================================================
     */
    @Transactional(readOnly = true)
    public LaboratoryResultResponse getLatestPatientResult(
            Long patientId) {

        patientRepository.findById(patientId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Patient not found"
                        )
                );

        LaboratoryResult result =
                laboratoryResultRepository
                        .findFirstByPatientIdOrderByPerformedAtDesc(
                                patientId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Laboratory result not found"
                                )
                        );

        return LaboratoryResultResponse.fromEntity(
                result
        );
    }

    /*
     * =========================================================
     * GET RESULT BY QUEUE
     * =========================================================
     */
    @Transactional(readOnly = true)
    public LaboratoryResultResponse getQueueResult(
            Long queueId) {

        patientQueueRepository.findById(queueId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Patient queue not found"
                        )
                );

        LaboratoryResult result =
                laboratoryResultRepository
                        .findFirstByQueueIdOrderByPerformedAtDesc(
                                queueId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Laboratory result not found"
                                )
                        );

        return LaboratoryResultResponse.fromEntity(
                result
        );
    }

    /*
     * =========================================================
     * GET ALL RESULTS FOR VISIT
     * =========================================================
     *
     * This is the important new method.
     *
     * One patient can have:
     *
     * Visit 1
     * Visit 2
     * Visit 3
     *
     * Therefore laboratory history must be filterable
     * by Visit.
     */
    @Transactional(readOnly = true)
    public List<LaboratoryResultResponse> getVisitResults(
            Long visitId) {

        visitRepository.findById(visitId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Visit not found"
                        )
                );

        return laboratoryResultRepository
                .findByVisitIdOrderByPerformedAtDesc(
                        visitId
                )
                .stream()
                .map(
                        LaboratoryResultResponse::fromEntity
                )
                .toList();
    }

    /*
     * =========================================================
     * GET LATEST RESULT FOR VISIT
     * =========================================================
     *
     * Useful when Doctor returns from Laboratory.
     */
    @Transactional(readOnly = true)
    public LaboratoryResultResponse getLatestVisitResult(
            Long visitId) {

        visitRepository.findById(visitId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Visit not found"
                        )
                );

        LaboratoryResult result =
                laboratoryResultRepository
                        .findFirstByVisitIdOrderByPerformedAtDesc(
                                visitId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Laboratory result not found"
                                )
                        );

        return LaboratoryResultResponse.fromEntity(
                result
        );
    }
}