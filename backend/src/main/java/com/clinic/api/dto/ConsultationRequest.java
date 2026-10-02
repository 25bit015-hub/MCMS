package com.clinic.api.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ConsultationRequest {

    @NotNull
    private Long patientId;

    @NotNull
    private Long queueId;

    @NotNull
    private Long visitId;

    @NotBlank
    private String complaint;

    @NotBlank
    private String examination;

    @NotBlank
    private String diagnosis;

    @NotBlank
    private String treatment;

    private boolean labRequired;
    private String labNotes;

    private boolean pharmacyRequired;

    /*
     * =====================================================
     * OLD PRESCRIPTION FIELD
     * =====================================================
     *
     * Tunaiweka kwa compatibility na workflow ya zamani.
     */
    private String prescription;

    /*
     * =====================================================
     * NEW STRUCTURED PRESCRIPTION ITEMS
     * =====================================================
     *
     * Doctor anaweza kuandika dawa zaidi ya moja.
     */
    private List<PrescriptionItemRequest> prescriptionItems;

    private boolean injectionRequired;
    private String injectionNotes;

    @NotBlank
    private String nextService;

    public ConsultationRequest() {
    }

    // =====================================================
    // GETTERS & SETTERS
    // =====================================================

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public Long getQueueId() {
        return queueId;
    }

    public void setQueueId(Long queueId) {
        this.queueId = queueId;
    }

    public Long getVisitId() {
        return visitId;
    }

    public void setVisitId(Long visitId) {
        this.visitId = visitId;
    }

    public String getComplaint() {
        return complaint;
    }

    public void setComplaint(String complaint) {
        this.complaint = complaint;
    }

    public String getExamination() {
        return examination;
    }

    public void setExamination(String examination) {
        this.examination = examination;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getTreatment() {
        return treatment;
    }

    public void setTreatment(String treatment) {
        this.treatment = treatment;
    }

    public boolean isLabRequired() {
        return labRequired;
    }

    public void setLabRequired(boolean labRequired) {
        this.labRequired = labRequired;
    }

    public String getLabNotes() {
        return labNotes;
    }

    public void setLabNotes(String labNotes) {
        this.labNotes = labNotes;
    }

    public boolean isPharmacyRequired() {
        return pharmacyRequired;
    }

    public void setPharmacyRequired(boolean pharmacyRequired) {
        this.pharmacyRequired = pharmacyRequired;
    }

    public String getPrescription() {
        return prescription;
    }

    public void setPrescription(String prescription) {
        this.prescription = prescription;
    }

    public List<PrescriptionItemRequest> getPrescriptionItems() {
        return prescriptionItems;
    }

    public void setPrescriptionItems(
            List<PrescriptionItemRequest> prescriptionItems
    ) {
        this.prescriptionItems = prescriptionItems;
    }

    public boolean isInjectionRequired() {
        return injectionRequired;
    }

    public void setInjectionRequired(boolean injectionRequired) {
        this.injectionRequired = injectionRequired;
    }

    public String getInjectionNotes() {
        return injectionNotes;
    }

    public void setInjectionNotes(String injectionNotes) {
        this.injectionNotes = injectionNotes;
    }

    public String getNextService() {
        return nextService;
    }

    public void setNextService(String nextService) {
        this.nextService = nextService;
    }

    /*
     * =====================================================
     * PRESCRIPTION ITEM
     * =====================================================
     */
    public static class PrescriptionItemRequest {

        private String medicineName;
        private String strength;
        private String dosage;
        private String frequency;
        private String duration;
        private Integer quantity;
        private String instructions;
        private BigDecimal unitPrice;

        public PrescriptionItemRequest() {
        }

        public String getMedicineName() {
            return medicineName;
        }

        public void setMedicineName(String medicineName) {
            this.medicineName = medicineName;
        }

        public String getStrength() {
            return strength;
        }

        public void setStrength(String strength) {
            this.strength = strength;
        }

        public String getDosage() {
            return dosage;
        }

        public void setDosage(String dosage) {
            this.dosage = dosage;
        }

        public String getFrequency() {
            return frequency;
        }

        public void setFrequency(String frequency) {
            this.frequency = frequency;
        }

        public String getDuration() {
            return duration;
        }

        public void setDuration(String duration) {
            this.duration = duration;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public String getInstructions() {
            return instructions;
        }

        public void setInstructions(String instructions) {
            this.instructions = instructions;
        }

        public BigDecimal getUnitPrice() {
            return unitPrice;
        }

        public void setUnitPrice(BigDecimal unitPrice) {
            this.unitPrice = unitPrice;
        }
    }
}