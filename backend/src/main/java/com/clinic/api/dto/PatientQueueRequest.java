package com.clinic.api.dto;

import jakarta.validation.constraints.NotNull;

public class PatientQueueRequest {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private String notes;

    public PatientQueueRequest() {
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}