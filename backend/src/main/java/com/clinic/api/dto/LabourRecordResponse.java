package com.clinic.api.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class LabourRecordResponse {

    private Long id;

    private Long pregnancyId;
    private Long patientId;
    private String patientNumber;
    private String patientName;

    private LocalDate admissionDate;
    private String admissionTime;
    private String admissionReason;
    private String labourOnset;
    private String labourStage;
    private String membraneStatus;
    private String liquor;
    private String cervicalDilation;
    private String cervicalEffacement;
    private String fetalDescent;
    private String contractionFrequency;
    private String contractionDuration;

    private Double maternalWeight;
    private Integer bloodPressureSystolic;
    private Integer bloodPressureDiastolic;
    private Integer pulse;
    private Double temperature;
    private Integer respiratoryRate;
    private String maternalCondition;
    private String painScore;
    private String bleeding;
    private String complications;

    private Integer fetalHeartRate;
    private String fetalCondition;
    private String fetalPresentation;
    private String fetalLie;
    private String fetalPosition;
    private String fetalMovement;

    private LocalDate deliveryDate;
    private String deliveryTime;
    private String deliveryMode;
    private String deliveryIndication;
    private String deliveryOutcome;
    private String deliveryComplications;

    private String maternalOutcome;
    private String postpartumBleeding;
    private String placentaStatus;
    private String estimatedBloodLoss;

    private String assessment;
    private String diagnosis;
    private String treatment;
    private String medication;
    private String referral;
    private String notes;

    private String recordStatus;
    private String archiveReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPregnancyId() {
        return pregnancyId;
    }

    public void setPregnancyId(Long pregnancyId) {
        this.pregnancyId = pregnancyId;
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

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public LocalDate getAdmissionDate() {
        return admissionDate;
    }

    public void setAdmissionDate(LocalDate admissionDate) {
        this.admissionDate = admissionDate;
    }

    public String getAdmissionTime() {
        return admissionTime;
    }

    public void setAdmissionTime(String admissionTime) {
        this.admissionTime = admissionTime;
    }

    public String getAdmissionReason() {
        return admissionReason;
    }

    public void setAdmissionReason(String admissionReason) {
        this.admissionReason = admissionReason;
    }

    public String getLabourOnset() {
        return labourOnset;
    }

    public void setLabourOnset(String labourOnset) {
        this.labourOnset = labourOnset;
    }

    public String getLabourStage() {
        return labourStage;
    }

    public void setLabourStage(String labourStage) {
        this.labourStage = labourStage;
    }

    public String getMembraneStatus() {
        return membraneStatus;
    }

    public void setMembraneStatus(String membraneStatus) {
        this.membraneStatus = membraneStatus;
    }

    public String getLiquor() {
        return liquor;
    }

    public void setLiquor(String liquor) {
        this.liquor = liquor;
    }

    public String getCervicalDilation() {
        return cervicalDilation;
    }

    public void setCervicalDilation(String cervicalDilation) {
        this.cervicalDilation = cervicalDilation;
    }

    public String getCervicalEffacement() {
        return cervicalEffacement;
    }

    public void setCervicalEffacement(String cervicalEffacement) {
        this.cervicalEffacement = cervicalEffacement;
    }

    public String getFetalDescent() {
        return fetalDescent;
    }

    public void setFetalDescent(String fetalDescent) {
        this.fetalDescent = fetalDescent;
    }

    public String getContractionFrequency() {
        return contractionFrequency;
    }

    public void setContractionFrequency(String contractionFrequency) {
        this.contractionFrequency = contractionFrequency;
    }

    public String getContractionDuration() {
        return contractionDuration;
    }

    public void setContractionDuration(String contractionDuration) {
        this.contractionDuration = contractionDuration;
    }

    public Double getMaternalWeight() {
        return maternalWeight;
    }

    public void setMaternalWeight(Double maternalWeight) {
        this.maternalWeight = maternalWeight;
    }

    public Integer getBloodPressureSystolic() {
        return bloodPressureSystolic;
    }

    public void setBloodPressureSystolic(Integer bloodPressureSystolic) {
        this.bloodPressureSystolic = bloodPressureSystolic;
    }

    public Integer getBloodPressureDiastolic() {
        return bloodPressureDiastolic;
    }

    public void setBloodPressureDiastolic(Integer bloodPressureDiastolic) {
        this.bloodPressureDiastolic = bloodPressureDiastolic;
    }

    public Integer getPulse() {
        return pulse;
    }

    public void setPulse(Integer pulse) {
        this.pulse = pulse;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Integer getRespiratoryRate() {
        return respiratoryRate;
    }

    public void setRespiratoryRate(Integer respiratoryRate) {
        this.respiratoryRate = respiratoryRate;
    }

    public String getMaternalCondition() {
        return maternalCondition;
    }

    public void setMaternalCondition(String maternalCondition) {
        this.maternalCondition = maternalCondition;
    }

    public String getPainScore() {
        return painScore;
    }

    public void setPainScore(String painScore) {
        this.painScore = painScore;
    }

    public String getBleeding() {
        return bleeding;
    }

    public void setBleeding(String bleeding) {
        this.bleeding = bleeding;
    }

    public String getComplications() {
        return complications;
    }

    public void setComplications(String complications) {
        this.complications = complications;
    }

    public Integer getFetalHeartRate() {
        return fetalHeartRate;
    }

    public void setFetalHeartRate(Integer fetalHeartRate) {
        this.fetalHeartRate = fetalHeartRate;
    }

    public String getFetalCondition() {
        return fetalCondition;
    }

    public void setFetalCondition(String fetalCondition) {
        this.fetalCondition = fetalCondition;
    }

    public String getFetalPresentation() {
        return fetalPresentation;
    }

    public void setFetalPresentation(String fetalPresentation) {
        this.fetalPresentation = fetalPresentation;
    }

    public String getFetalLie() {
        return fetalLie;
    }

    public void setFetalLie(String fetalLie) {
        this.fetalLie = fetalLie;
    }

    public String getFetalPosition() {
        return fetalPosition;
    }

    public void setFetalPosition(String fetalPosition) {
        this.fetalPosition = fetalPosition;
    }

    public String getFetalMovement() {
        return fetalMovement;
    }

    public void setFetalMovement(String fetalMovement) {
        this.fetalMovement = fetalMovement;
    }

    public LocalDate getDeliveryDate() {
        return deliveryDate;
    }

    public void setDeliveryDate(LocalDate deliveryDate) {
        this.deliveryDate = deliveryDate;
    }

    public String getDeliveryTime() {
        return deliveryTime;
    }

    public void setDeliveryTime(String deliveryTime) {
        this.deliveryTime = deliveryTime;
    }

    public String getDeliveryMode() {
        return deliveryMode;
    }

    public void setDeliveryMode(String deliveryMode) {
        this.deliveryMode = deliveryMode;
    }

    public String getDeliveryIndication() {
        return deliveryIndication;
    }

    public void setDeliveryIndication(String deliveryIndication) {
        this.deliveryIndication = deliveryIndication;
    }

    public String getDeliveryOutcome() {
        return deliveryOutcome;
    }

    public void setDeliveryOutcome(String deliveryOutcome) {
        this.deliveryOutcome = deliveryOutcome;
    }

    public String getDeliveryComplications() {
        return deliveryComplications;
    }

    public void setDeliveryComplications(String deliveryComplications) {
        this.deliveryComplications = deliveryComplications;
    }

    public String getMaternalOutcome() {
        return maternalOutcome;
    }

    public void setMaternalOutcome(String maternalOutcome) {
        this.maternalOutcome = maternalOutcome;
    }

    public String getPostpartumBleeding() {
        return postpartumBleeding;
    }

    public void setPostpartumBleeding(String postpartumBleeding) {
        this.postpartumBleeding = postpartumBleeding;
    }

    public String getPlacentaStatus() {
        return placentaStatus;
    }

    public void setPlacentaStatus(String placentaStatus) {
        this.placentaStatus = placentaStatus;
    }

    public String getEstimatedBloodLoss() {
        return estimatedBloodLoss;
    }

    public void setEstimatedBloodLoss(String estimatedBloodLoss) {
        this.estimatedBloodLoss = estimatedBloodLoss;
    }

    public String getAssessment() {
        return assessment;
    }

    public void setAssessment(String assessment) {
        this.assessment = assessment;
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

    public String getMedication() {
        return medication;
    }

    public void setMedication(String medication) {
        this.medication = medication;
    }

    public String getReferral() {
        return referral;
    }

    public void setReferral(String referral) {
        this.referral = referral;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getRecordStatus() {
        return recordStatus;
    }

    public void setRecordStatus(String recordStatus) {
        this.recordStatus = recordStatus;
    }

    public String getArchiveReason() {
        return archiveReason;
    }

    public void setArchiveReason(String archiveReason) {
        this.archiveReason = archiveReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}