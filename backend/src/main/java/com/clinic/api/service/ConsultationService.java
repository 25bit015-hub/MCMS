package com.clinic.api.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clinic.api.dto.ConsultationRequest;
import com.clinic.api.dto.ConsultationResponse;
import com.clinic.api.entity.Consultation;
import com.clinic.api.entity.Patient;
import com.clinic.api.entity.PatientQueue;
import com.clinic.api.entity.Prescription;
import com.clinic.api.entity.Prescription.PaymentType;
import com.clinic.api.entity.Visit;
import com.clinic.api.repository.ConsultationRepository;
import com.clinic.api.repository.PatientQueueRepository;
import com.clinic.api.repository.PatientRepository;
import com.clinic.api.repository.VisitRepository;

@Service
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final PatientRepository patientRepository;
    private final PatientQueueRepository patientQueueRepository;
    private final PatientQueueService patientQueueService;
    private final VisitRepository visitRepository;
    private final PrescriptionService prescriptionService;

    public ConsultationService(
            ConsultationRepository consultationRepository,
            PatientRepository patientRepository,
            PatientQueueRepository patientQueueRepository,
            PatientQueueService patientQueueService,
            VisitRepository visitRepository,
            PrescriptionService prescriptionService
    ) {
        this.consultationRepository = consultationRepository;
        this.patientRepository = patientRepository;
        this.patientQueueRepository = patientQueueRepository;
        this.patientQueueService = patientQueueService;
        this.visitRepository = visitRepository;
        this.prescriptionService = prescriptionService;
    }

    /*
     * =========================================================
     * CREATE CONSULTATION
     * =========================================================
     */
    @Transactional
    public ConsultationResponse createConsultation(
            ConsultationRequest request
    ) {

        /*
         * =====================================================
         * 1. PATIENT VALIDATION
         * =====================================================
         */
        Patient patient =
                patientRepository
                        .findById(request.getPatientId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Patient not found: "
                                                + request.getPatientId()
                                )
                        );

        /*
         * =====================================================
         * 2. QUEUE VALIDATION
         * =====================================================
         */
        PatientQueue queue =
                patientQueueRepository
                        .findById(request.getQueueId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Queue not found: "
                                                + request.getQueueId()
                                )
                        );

        if (
                queue.getPatient() == null
                || !queue.getPatient()
                        .getId()
                        .equals(patient.getId())
        ) {
            throw new RuntimeException(
                    "Queue does not belong to this patient."
            );
        }

        /*
         * =====================================================
         * 3. VISIT VALIDATION
         * =====================================================
         */
        Visit visit =
                visitRepository
                        .findById(request.getVisitId())
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Visit not found: "
                                                + request.getVisitId()
                                )
                        );

        if (
                visit.getPatient() == null
                || !visit.getPatient()
                        .getId()
                        .equals(patient.getId())
        ) {
            throw new RuntimeException(
                    "Visit does not belong to this patient."
            );
        }

        /*
         * =====================================================
         * 4. QUEUE MUST BELONG TO VISIT
         * =====================================================
         */
        if (queue.getVisit() == null) {
            throw new RuntimeException(
                    "Queue is not linked to a visit."
            );
        }

        if (
                !queue.getVisit()
                        .getId()
                        .equals(visit.getId())
        ) {
            throw new RuntimeException(
                    "Queue does not belong to this visit."
            );
        }

        /*
         * =====================================================
         * 5. CREATE CONSULTATION
         * =====================================================
         *
         * Hii ni logic ya mwanzo.
         * Tunaendelea kuihifadhi.
         */
        Consultation consultation =
                new Consultation();

        consultation.setPatient(patient);
        consultation.setQueue(queue);
        consultation.setVisit(visit);

        consultation.setComplaint(
                request.getComplaint().trim()
        );

        consultation.setExamination(
                request.getExamination().trim()
        );

        consultation.setDiagnosis(
                request.getDiagnosis().trim()
        );

        consultation.setTreatment(
                request.getTreatment().trim()
        );

        consultation.setLabRequired(
                request.isLabRequired()
        );

        consultation.setLabNotes(
                clean(request.getLabNotes())
        );

        consultation.setPharmacyRequired(
                request.isPharmacyRequired()
        );

        /*
         * =====================================================
         * OLD PRESCRIPTION STRING
         * =====================================================
         *
         * Compatibility na workflow ya zamani.
         */
        consultation.setPrescription(
                clean(request.getPrescription())
        );

        consultation.setInjectionRequired(
                request.isInjectionRequired()
        );

        consultation.setInjectionNotes(
                clean(request.getInjectionNotes())
        );

        /*
         * =====================================================
         * 6. NEXT SERVICE
         * =====================================================
         */
        String nextService =
                request.getNextService()
                        .trim()
                        .toUpperCase();

        validateNextService(
                nextService,
                request
        );

        consultation.setNextService(
                nextService
        );

        /*
         * =====================================================
         * 7. SAVE CONSULTATION
         * =====================================================
         */
        Consultation saved =
                consultationRepository.save(
                        consultation
                );

        /*
         * =====================================================
         * 8. CREATE STRUCTURED PRESCRIPTION
         * =====================================================
         *
         * Prescription inatengenezwa tu pale:
         *
         * nextService = PHARMACY
         *
         * na kuna prescription items.
         */
        createPrescriptionIfProvided(
                request,
                patient,
                visit,
                nextService
        );

        /*
         * =====================================================
         * 9. UPDATE QUEUE
         * =====================================================
         */
        updateQueueStatus(
                queue,
                nextService
        );

        return ConsultationResponse.fromEntity(
                saved
        );
    }

    /*
     * =========================================================
     * CREATE STRUCTURED PRESCRIPTION
     * =========================================================
     */
    private void createPrescriptionIfProvided(
            ConsultationRequest request,
            Patient patient,
            Visit visit,
            String nextService
    ) {

        /*
         * Prescription haihusiani na pharmacyRequired pekee.
         *
         * Lazima Doctor amchague Pharmacy kama next service.
         */
        if (!"PHARMACY".equals(nextService)) {
            return;
        }

        if (!request.isPharmacyRequired()) {
            return;
        }

        /*
         * Hakuna structured items.
         *
         * Old free-text prescription workflow
         * bado inaweza kuendelea.
         */
        if (
                request.getPrescriptionItems() == null
                || request.getPrescriptionItems().isEmpty()
        ) {
            return;
        }

        /*
         * =====================================================
         * CONVERT ITEMS
         * =====================================================
         */
        List<PrescriptionService.PrescriptionItemRequest>
                prescriptionItems =
                        new ArrayList<>();

        for (
                ConsultationRequest.PrescriptionItemRequest
                        requestItem
                : request.getPrescriptionItems()
        ) {

            if (requestItem == null) {
                continue;
            }

            String medicineName =
                    clean(requestItem.getMedicineName());

            /*
             * Skip empty medicine rows.
             */
            if (medicineName == null) {
                continue;
            }

            Integer quantity =
                    requestItem.getQuantity();

            /*
             * Quantity lazima iwe valid.
             */
            if (
                    quantity == null
                    || quantity <= 0
            ) {
                throw new RuntimeException(
                        "Quantity for medicine '"
                                + medicineName
                                + "' must be greater than zero."
                );
            }

            BigDecimal unitPrice =
                    requestItem.getUnitPrice();

            /*
             * Unit price ni optional,
             * lakini ikiwa imetumwa isiwe negative.
             */
            if (
                    unitPrice != null
                    && unitPrice.compareTo(
                            BigDecimal.ZERO
                    ) < 0
            ) {
                throw new RuntimeException(
                        "Unit price for medicine '"
                                + medicineName
                                + "' cannot be negative."
                );
            }

            PrescriptionService.PrescriptionItemRequest
                    item =
                            new PrescriptionService
                                    .PrescriptionItemRequest();

            item.setMedicineName(
                    medicineName
            );

            item.setStrength(
                    clean(requestItem.getStrength())
            );

            item.setDosage(
                    clean(requestItem.getDosage())
            );

            item.setFrequency(
                    clean(requestItem.getFrequency())
            );

            item.setDuration(
                    clean(requestItem.getDuration())
            );

            item.setQuantity(
                    quantity
            );

            item.setInstructions(
                    clean(requestItem.getInstructions())
            );

            item.setUnitPrice(
                    unitPrice
            );

            prescriptionItems.add(item);
        }

        /*
         * Kama rows zote zilikuwa tupu,
         * hakuna Prescription ya ku-create.
         */
        if (prescriptionItems.isEmpty()) {
            return;
        }

        /*
         * =====================================================
         * PAYMENT TYPE
         * =====================================================
         *
         * Kwa sasa ConsultationRequest haina paymentType.
         * Tunatumia CASH kama default.
         *
         * CASH / INSURANCE tutaiunganisha kwenye
         * Pharmacy workflow hatua inayofuata.
         */
        PaymentType paymentType =
                PaymentType.CASH;

        /*
         * =====================================================
         * PRESCRIPTION NOTES
         * =====================================================
         *
         * Free-text prescription ya zamani
         * inaweza kubaki kama notes.
         */
        String notes =
                clean(request.getPrescription());

        /*
         * =====================================================
         * CREATE PRESCRIPTION
         * =====================================================
         */
        Prescription prescription =
                prescriptionService.createPrescription(
                        patient.getId(),
                        visit.getId(),
                        paymentType,
                        notes,
                        prescriptionItems
                );

        System.out.println(
                "Prescription created successfully."
                        + " Prescription ID: "
                        + prescription.getId()
                        + ", Patient ID: "
                        + patient.getId()
                        + ", Visit ID: "
                        + visit.getId()
                        + ", Items: "
                        + prescriptionItems.size()
        );
    }

    /*
     * =========================================================
     * GET PATIENT CONSULTATIONS
     * =========================================================
     */
    @Transactional(readOnly = true)
    public List<ConsultationResponse> getPatientConsultations(
            Long patientId
    ) {

        patientRepository
                .findById(patientId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Patient not found: "
                                        + patientId
                        )
                );

        return consultationRepository
                .findByPatientIdOrderByCreatedAtDesc(
                        patientId
                )
                .stream()
                .map(
                        ConsultationResponse::fromEntity
                )
                .toList();
    }

    /*
     * =========================================================
     * GET LATEST PATIENT CONSULTATION
     * =========================================================
     */
    @Transactional(readOnly = true)
    public ConsultationResponse getLatestConsultation(
            Long patientId
    ) {

        patientRepository
                .findById(patientId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Patient not found: "
                                        + patientId
                        )
                );

        Consultation consultation =
                consultationRepository
                        .findFirstByPatientIdOrderByCreatedAtDesc(
                                patientId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No consultation found for patient: "
                                                + patientId
                        )
                        );

        return ConsultationResponse.fromEntity(
                consultation
        );
    }

    /*
     * =========================================================
     * GET VISIT CONSULTATIONS
     * =========================================================
     */
    @Transactional(readOnly = true)
    public List<ConsultationResponse> getVisitConsultations(
            Long visitId
    ) {

        visitRepository
                .findById(visitId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Visit not found: "
                                        + visitId
                        )
                );

        return consultationRepository
                .findByVisitIdOrderByCreatedAtDesc(
                        visitId
                )
                .stream()
                .map(
                        ConsultationResponse::fromEntity
                )
                .toList();
    }

    /*
     * =========================================================
     * GET LATEST VISIT CONSULTATION
     * =========================================================
     */
    @Transactional(readOnly = true)
    public ConsultationResponse getLatestVisitConsultation(
            Long visitId
    ) {

        visitRepository
                .findById(visitId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Visit not found: "
                                        + visitId
                        )
                );

        Consultation consultation =
                consultationRepository
                        .findFirstByVisitIdOrderByCreatedAtDesc(
                                visitId
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "No consultation found for visit: "
                                                + visitId
                        )
                        );

        return ConsultationResponse.fromEntity(
                consultation
        );
    }

    /*
     * =========================================================
     * UPDATE QUEUE STATUS
     * =========================================================
     */
    private void updateQueueStatus(
            PatientQueue queue,
            String nextService
    ) {

        PatientQueue.QueueStatus status;

        switch (nextService) {

            case "LABORATORY":

                status =
                        PatientQueue.QueueStatus
                                .LAB_PENDING;

                break;

            case "PHARMACY":

                status =
                        PatientQueue.QueueStatus
                                .PHARMACY_PENDING;

                break;

            case "INJECTION":

                status =
                        PatientQueue.QueueStatus
                                .INJECTION_PENDING;

                break;

            case "COMPLETED":

                status =
                        PatientQueue.QueueStatus
                                .COMPLETED;

                break;

            default:

                throw new RuntimeException(
                        "Invalid next service: "
                                + nextService
                );
        }

        patientQueueService.updateStatus(
                queue.getId(),
                status
        );
    }

    /*
     * =========================================================
     * VALIDATE NEXT SERVICE
     * =========================================================
     */
    private void validateNextService(
            String nextService,
            ConsultationRequest request
    ) {

        if (
                "LABORATORY".equals(nextService)
                && !request.isLabRequired()
        ) {

            throw new RuntimeException(
                    "Laboratory was selected as next service "
                            + "but labRequired is false."
            );
        }

        if (
                "PHARMACY".equals(nextService)
                && !request.isPharmacyRequired()
        ) {

            throw new RuntimeException(
                    "Pharmacy was selected as next service "
                            + "but pharmacyRequired is false."
            );
        }

        if (
                "INJECTION".equals(nextService)
                && !request.isInjectionRequired()
        ) {

            throw new RuntimeException(
                    "Injection was selected as next service "
                            + "but injectionRequired is false."
            );
        }

        if (
                !nextService.equals("LABORATORY")
                && !nextService.equals("PHARMACY")
                && !nextService.equals("INJECTION")
                && !nextService.equals("COMPLETED")
        ) {

            throw new RuntimeException(
                    "Invalid next service: "
                            + nextService
            );
        }
    }

    /*
     * =========================================================
     * CLEAN STRING
     * =========================================================
     */
    private String clean(String value) {

        if (value == null) {
            return null;
        }

        String trimmed =
                value.trim();

        if (trimmed.isEmpty()) {
            return null;
        }

        return trimmed;
    }
}