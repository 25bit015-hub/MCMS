package com.clinic.api.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(
    name = "labour_records",
    indexes = {
        @Index(name = "idx_labour_pregnancy", columnList = "pregnancy_id"),
        @Index(name = "idx_labour_status", columnList = "record_status")
    }
)
public class LabourRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pregnancy_id", nullable = false)
    private Pregnancy pregnancy;

    // Labour information
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

    // Maternal assessment
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

    // Fetal assessment
    private Integer fetalHeartRate;

    private String fetalCondition;

    private String fetalPresentation;

    private String fetalLie;

    private String fetalPosition;

    private String fetalMovement;

    // Delivery information
    private LocalDate deliveryDate;

    private String deliveryTime;

    private String deliveryMode;

    private String deliveryIndication;

    private String deliveryOutcome;

    private String deliveryComplications;

    // Mother after delivery
    private String maternalOutcome;

    private String postpartumBleeding;

    private String placentaStatus;

    private String estimatedBloodLoss;

    // Clinical management
    @Column(columnDefinition = "TEXT")
    private String assessment;

    @Column(columnDefinition = "TEXT")
    private String diagnosis;

    @Column(columnDefinition = "TEXT")
    private String treatment;

    @Column(columnDefinition = "TEXT")
    private String medication;

    @Column(columnDefinition = "TEXT")
    private String referral;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // Record protection
    @Column(name = "record_status", nullable = false)
    private String recordStatus = "ACTIVE";

    @Column(name = "archive_reason", columnDefinition = "TEXT")
    private String archiveReason;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        updatedAt = now;

        if (recordStatus == null || recordStatus.isBlank()) {
            recordStatus = "ACTIVE";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Pregnancy getPregnancy() {
        return pregnancy;
    }

    public void setPregnancy(Pregnancy pregnancy) {
        this.pregnancy = pregnancy;
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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}