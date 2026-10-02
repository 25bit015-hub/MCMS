package com.clinic.api.dto;

import java.time.LocalDateTime;

import com.clinic.api.entity.Consultation;

public class ConsultationResponse {

    private Long id;

    // ============================================================
    // PATIENT
    // ============================================================

    private Long patientId;
    private String patientNumber;
    private String firstName;
    private String lastName;

    // ============================================================
    // QUEUE
    // ============================================================

    private Long queueId;
    private String queueNumber;
    private String queueStatus;

    // ============================================================
    // VISIT
    // ============================================================

    private Long visitId;
    private String visitNumber;

    // ============================================================
    // CLINICAL INFORMATION
    // ============================================================

    private String complaint;
    private String examination;
    private String diagnosis;
    private String treatment;

    // ============================================================
    // LABORATORY
    // ============================================================

    private boolean labRequired;
    private String labNotes;

    // ============================================================
    // PHARMACY
    // ============================================================

    private boolean pharmacyRequired;
    private String prescription;

    // ============================================================
    // INJECTION
    // ============================================================

    private boolean injectionRequired;
    private String injectionNotes;

    // ============================================================
    // NEXT SERVICE
    // ============================================================

    private String nextService;

    private LocalDateTime createdAt;

    // ============================================================
    // ENTITY -> RESPONSE
    // ============================================================

    public static ConsultationResponse fromEntity(
            Consultation consultation
    ) {

        ConsultationResponse response =
                new ConsultationResponse();

        response.id =
                consultation.getId();

        // --------------------------------------------------------
        // Patient
        // --------------------------------------------------------

        response.patientId =
                consultation.getPatient().getId();

        response.patientNumber =
                consultation.getPatient().getPatientNumber();

        response.firstName =
                consultation.getPatient().getFirstName();

        response.lastName =
                consultation.getPatient().getLastName();

        // --------------------------------------------------------
        // Queue
        // --------------------------------------------------------

        response.queueId =
                consultation.getQueue().getId();

        response.queueNumber =
                consultation.getQueue().getQueueNumber();

        response.queueStatus =
                consultation.getQueue().getStatus().name();

        // --------------------------------------------------------
        // Visit
        //
        // Nullable because old consultations may not
        // have a visit.
        // --------------------------------------------------------

        if (consultation.getVisit() != null) {

            response.visitId =
                    consultation.getVisit().getId();

            response.visitNumber =
                    consultation.getVisit().getVisitNumber();
        }

        // --------------------------------------------------------
        // Clinical information
        // --------------------------------------------------------

        response.complaint =
                consultation.getComplaint();

        response.examination =
                consultation.getExamination();

        response.diagnosis =
                consultation.getDiagnosis();

        response.treatment =
                consultation.getTreatment();

        // --------------------------------------------------------
        // Laboratory
        // --------------------------------------------------------

        response.labRequired =
                consultation.isLabRequired();

        response.labNotes =
                consultation.getLabNotes();

        // --------------------------------------------------------
        // Pharmacy
        // --------------------------------------------------------

        response.pharmacyRequired =
                consultation.isPharmacyRequired();

        response.prescription =
                consultation.getPrescription();

        // --------------------------------------------------------
        // Injection
        // --------------------------------------------------------

        response.injectionRequired =
                consultation.isInjectionRequired();

        response.injectionNotes =
                consultation.getInjectionNotes();

        // --------------------------------------------------------
        // Next service
        // --------------------------------------------------------

        response.nextService =
                consultation.getNextService();

        response.createdAt =
                consultation.getCreatedAt();

        return response;
    }

    // ============================================================
    // GETTERS
    // ============================================================

    public Long getId() {
        return id;
    }

    public Long getPatientId() {
        return patientId;
    }

    public String getPatientNumber() {
        return patientNumber;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public Long getQueueId() {
        return queueId;
    }

    public String getQueueNumber() {
        return queueNumber;
    }

    public String getQueueStatus() {
        return queueStatus;
    }

    public Long getVisitId() {
        return visitId;
    }

    public String getVisitNumber() {
        return visitNumber;
    }

    public String getComplaint() {
        return complaint;
    }

    public String getExamination() {
        return examination;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public String getTreatment() {
        return treatment;
    }

    public boolean isLabRequired() {
        return labRequired;
    }

    public String getLabNotes() {
        return labNotes;
    }

    public boolean isPharmacyRequired() {
        return pharmacyRequired;
    }

    public String getPrescription() {
        return prescription;
    }

    public boolean isInjectionRequired() {
        return injectionRequired;
    }

    public String getInjectionNotes() {
        return injectionNotes;
    }

    public String getNextService() {
        return nextService;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}