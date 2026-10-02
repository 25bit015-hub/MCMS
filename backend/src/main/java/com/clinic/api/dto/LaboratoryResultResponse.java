package com.clinic.api.dto;

import java.time.LocalDateTime;

import com.clinic.api.entity.LaboratoryResult;

public class LaboratoryResultResponse {

    private Long id;

    private Long patientId;
    private String patientNumber;
    private String firstName;
    private String lastName;

    private Long queueId;
    private String queueNumber;
    private String queueStatus;

    private Long visitId;
    private String visitNumber;

    private Long consultationId;

    private String results;
    private String notes;

    private LocalDateTime performedAt;

    public static LaboratoryResultResponse fromEntity(
            LaboratoryResult result
    ) {
        LaboratoryResultResponse response =
                new LaboratoryResultResponse();

        response.setId(result.getId());

        if (result.getPatient() != null) {
            response.setPatientId(result.getPatient().getId());
            response.setPatientNumber(
                    result.getPatient().getPatientNumber()
            );
            response.setFirstName(
                    result.getPatient().getFirstName()
            );
            response.setLastName(
                    result.getPatient().getLastName()
            );
        }

        if (result.getQueue() != null) {
            response.setQueueId(result.getQueue().getId());
            response.setQueueNumber(
                    result.getQueue().getQueueNumber()
            );

            if (result.getQueue().getStatus() != null) {
                response.setQueueStatus(
                        result.getQueue().getStatus().name()
                );
            }
        }

        if (result.getVisit() != null) {
            response.setVisitId(
                    result.getVisit().getId()
            );
            response.setVisitNumber(
                    result.getVisit().getVisitNumber()
            );
        }

        if (result.getConsultation() != null) {
            response.setConsultationId(
                    result.getConsultation().getId()
            );
        }

        response.setResults(result.getResults());
        response.setNotes(result.getNotes());
        response.setPerformedAt(result.getPerformedAt());

        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getPatientNumber() {
        return patientNumber;
    }

    public void setPatientNumber(String patientNumber) {
        this.patientNumber = patientNumber;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public Long getQueueId() {
        return queueId;
    }

    public void setQueueId(Long queueId) {
        this.queueId = queueId;
    }

    public String getQueueNumber() {
        return queueNumber;
    }

    public void setQueueNumber(String queueNumber) {
        this.queueNumber = queueNumber;
    }

    public String getQueueStatus() {
        return queueStatus;
    }

    public void setQueueStatus(String queueStatus) {
        this.queueStatus = queueStatus;
    }

    public Long getVisitId() {
        return visitId;
    }

    public void setVisitId(Long visitId) {
        this.visitId = visitId;
    }

    public String getVisitNumber() {
        return visitNumber;
    }

    public void setVisitNumber(String visitNumber) {
        this.visitNumber = visitNumber;
    }

    public Long getConsultationId() {
        return consultationId;
    }

    public void setConsultationId(Long consultationId) {
        this.consultationId = consultationId;
    }

    public String getResults() {
        return results;
    }

    public void setResults(String results) {
        this.results = results;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getPerformedAt() {
        return performedAt;
    }

    public void setPerformedAt(LocalDateTime performedAt) {
        this.performedAt = performedAt;
    }
}