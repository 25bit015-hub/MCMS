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
    name = "newborn_records",
    indexes = {
        @Index(
            name = "idx_newborn_labour",
            columnList = "labour_record_id"
        ),
        @Index(
            name = "idx_newborn_status",
            columnList = "record_status"
        ),
        @Index(
            name = "idx_newborn_birth_date",
            columnList = "date_of_birth"
        )
    }
)
public class NewbornRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Delivery/Labour record ambayo mtoto huyu alitokana nayo.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "labour_record_id",
        nullable = false
    )
    private LabourRecord labourRecord;

    // =========================
    // BASIC NEWBORN INFORMATION
    // =========================

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "time_of_birth")
    private String timeOfBirth;

    @Column(name = "sex")
    private String sex;

    @Column(name = "birth_order")
    private Integer birthOrder;

    // =========================
    // BIRTH MEASUREMENTS
    // =========================

    @Column(name = "birth_weight")
    private Double birthWeight;

    @Column(name = "birth_length")
    private Double birthLength;

    @Column(name = "head_circumference")
    private Double headCircumference;

    // =========================
    // APGAR
    // =========================

    @Column(name = "apgar_one_minute")
    private Integer apgarOneMinute;

    @Column(name = "apgar_five_minutes")
    private Integer apgarFiveMinutes;

    @Column(name = "apgar_ten_minutes")
    private Integer apgarTenMinutes;

    // =========================
    // CONDITION AT BIRTH
    // =========================

    @Column(name = "condition_at_birth", columnDefinition = "TEXT")
    private String conditionAtBirth;

    @Column(name = "cry_at_birth")
    private String cryAtBirth;

    @Column(name = "breathing_at_birth")
    private String breathingAtBirth;

    @Column(name = "muscle_tone")
    private String muscleTone;

    @Column(name = "skin_colour")
    private String skinColour;

    // =========================
    // RESUSCITATION
    // =========================

    @Column(name = "resuscitation_required")
    private Boolean resuscitationRequired = false;

    @Column(name = "resuscitation_method", columnDefinition = "TEXT")
    private String resuscitationMethod;

    @Column(name = "resuscitation_duration")
    private String resuscitationDuration;

    // =========================
    // CLINICAL FINDINGS
    // =========================

    @Column(name = "congenital_abnormalities", columnDefinition = "TEXT")
    private String congenitalAbnormalities;

    @Column(name = "clinical_condition", columnDefinition = "TEXT")
    private String clinicalCondition;

    @Column(name = "temperature")
    private Double temperature;

    @Column(name = "heart_rate")
    private Integer heartRate;

    @Column(name = "respiratory_rate")
    private Integer respiratoryRate;

    // =========================
    // IMMEDIATE NEWBORN CARE
    // =========================

    @Column(name = "breastfeeding_started")
    private Boolean breastfeedingStarted = false;

    @Column(name = "breastfeeding_time")
    private String breastfeedingTime;

    @Column(name = "skin_to_skin")
    private Boolean skinToSkin = false;

    @Column(name = "vitamin_k_given")
    private Boolean vitaminKGiven = false;

    @Column(name = "bcg_given")
    private Boolean bcgGiven = false;

    @Column(name = "opv_given")
    private Boolean opvGiven = false;

    // =========================
    // NEWBORN OUTCOME
    // =========================

    @Column(name = "newborn_outcome")
    private String newbornOutcome;

    @Column(name = "place_of_care")
    private String placeOfCare;

    @Column(name = "referral_required")
    private Boolean referralRequired = false;

    @Column(name = "referral_reason", columnDefinition = "TEXT")
    private String referralReason;

    // =========================
    // CLINICAL NOTES
    // =========================

    @Column(name = "assessment", columnDefinition = "TEXT")
    private String assessment;

    @Column(name = "treatment", columnDefinition = "TEXT")
    private String treatment;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // =========================
    // RECORD PROTECTION
    // =========================

    @Column(name = "record_status", nullable = false)
    private String recordStatus = "ACTIVE";

    @Column(name = "archive_reason", columnDefinition = "TEXT")
    private String archiveReason;

    // =========================
    // AUDIT TIMESTAMPS
    // =========================

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // =========================
    // LIFECYCLE
    // =========================

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;

        if (recordStatus == null || recordStatus.isBlank()) {
            recordStatus = "ACTIVE";
        }

        if (resuscitationRequired == null) {
            resuscitationRequired = false;
        }

        if (breastfeedingStarted == null) {
            breastfeedingStarted = false;
        }

        if (skinToSkin == null) {
            skinToSkin = false;
        }

        if (vitaminKGiven == null) {
            vitaminKGiven = false;
        }

        if (bcgGiven == null) {
            bcgGiven = false;
        }

        if (opvGiven == null) {
            opvGiven = false;
        }

        if (referralRequired == null) {
            referralRequired = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();

        if (recordStatus == null || recordStatus.isBlank()) {
            recordStatus = "ACTIVE";
        }
    }

    // =========================
    // GETTERS AND SETTERS
    // =========================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LabourRecord getLabourRecord() {
        return labourRecord;
    }

    public void setLabourRecord(LabourRecord labourRecord) {
        this.labourRecord = labourRecord;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getTimeOfBirth() {
        return timeOfBirth;
    }

    public void setTimeOfBirth(String timeOfBirth) {
        this.timeOfBirth = timeOfBirth;
    }

    public String getSex() {
        return sex;
    }

    public void setSex(String sex) {
        this.sex = sex;
    }

    public Integer getBirthOrder() {
        return birthOrder;
    }

    public void setBirthOrder(Integer birthOrder) {
        this.birthOrder = birthOrder;
    }

    public Double getBirthWeight() {
        return birthWeight;
    }

    public void setBirthWeight(Double birthWeight) {
        this.birthWeight = birthWeight;
    }

    public Double getBirthLength() {
        return birthLength;
    }

    public void setBirthLength(Double birthLength) {
        this.birthLength = birthLength;
    }

    public Double getHeadCircumference() {
        return headCircumference;
    }

    public void setHeadCircumference(Double headCircumference) {
        this.headCircumference = headCircumference;
    }

    public Integer getApgarOneMinute() {
        return apgarOneMinute;
    }

    public void setApgarOneMinute(Integer apgarOneMinute) {
        this.apgarOneMinute = apgarOneMinute;
    }

    public Integer getApgarFiveMinutes() {
        return apgarFiveMinutes;
    }

    public void setApgarFiveMinutes(Integer apgarFiveMinutes) {
        this.apgarFiveMinutes = apgarFiveMinutes;
    }

    public Integer getApgarTenMinutes() {
        return apgarTenMinutes;
    }

    public void setApgarTenMinutes(Integer apgarTenMinutes) {
        this.apgarTenMinutes = apgarTenMinutes;
    }

    public String getConditionAtBirth() {
        return conditionAtBirth;
    }

    public void setConditionAtBirth(String conditionAtBirth) {
        this.conditionAtBirth = conditionAtBirth;
    }

    public String getCryAtBirth() {
        return cryAtBirth;
    }

    public void setCryAtBirth(String cryAtBirth) {
        this.cryAtBirth = cryAtBirth;
    }

    public String getBreathingAtBirth() {
        return breathingAtBirth;
    }

    public void setBreathingAtBirth(String breathingAtBirth) {
        this.breathingAtBirth = breathingAtBirth;
    }

    public String getMuscleTone() {
        return muscleTone;
    }

    public void setMuscleTone(String muscleTone) {
        this.muscleTone = muscleTone;
    }

    public String getSkinColour() {
        return skinColour;
    }

    public void setSkinColour(String skinColour) {
        this.skinColour = skinColour;
    }

    public Boolean getResuscitationRequired() {
        return resuscitationRequired;
    }

    public void setResuscitationRequired(Boolean resuscitationRequired) {
        this.resuscitationRequired = resuscitationRequired;
    }

    public String getResuscitationMethod() {
        return resuscitationMethod;
    }

    public void setResuscitationMethod(String resuscitationMethod) {
        this.resuscitationMethod = resuscitationMethod;
    }

    public String getResuscitationDuration() {
        return resuscitationDuration;
    }

    public void setResuscitationDuration(String resuscitationDuration) {
        this.resuscitationDuration = resuscitationDuration;
    }

    public String getCongenitalAbnormalities() {
        return congenitalAbnormalities;
    }

    public void setCongenitalAbnormalities(String congenitalAbnormalities) {
        this.congenitalAbnormalities = congenitalAbnormalities;
    }

    public String getClinicalCondition() {
        return clinicalCondition;
    }

    public void setClinicalCondition(String clinicalCondition) {
        this.clinicalCondition = clinicalCondition;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }

    public Integer getHeartRate() {
        return heartRate;
    }

    public void setHeartRate(Integer heartRate) {
        this.heartRate = heartRate;
    }

    public Integer getRespiratoryRate() {
        return respiratoryRate;
    }

    public void setRespiratoryRate(Integer respiratoryRate) {
        this.respiratoryRate = respiratoryRate;
    }

    public Boolean getBreastfeedingStarted() {
        return breastfeedingStarted;
    }

    public void setBreastfeedingStarted(Boolean breastfeedingStarted) {
        this.breastfeedingStarted = breastfeedingStarted;
    }

    public String getBreastfeedingTime() {
        return breastfeedingTime;
    }

    public void setBreastfeedingTime(String breastfeedingTime) {
        this.breastfeedingTime = breastfeedingTime;
    }

    public Boolean getSkinToSkin() {
        return skinToSkin;
    }

    public void setSkinToSkin(Boolean skinToSkin) {
        this.skinToSkin = skinToSkin;
    }

    public Boolean getVitaminKGiven() {
        return vitaminKGiven;
    }

    public void setVitaminKGiven(Boolean vitaminKGiven) {
        this.vitaminKGiven = vitaminKGiven;
    }

    public Boolean getBcgGiven() {
        return bcgGiven;
    }

    public void setBcgGiven(Boolean bcgGiven) {
        this.bcgGiven = bcgGiven;
    }

    public Boolean getOpvGiven() {
        return opvGiven;
    }

    public void setOpvGiven(Boolean opvGiven) {
        this.opvGiven = opvGiven;
    }

    public String getNewbornOutcome() {
        return newbornOutcome;
    }

    public void setNewbornOutcome(String newbornOutcome) {
        this.newbornOutcome = newbornOutcome;
    }

    public String getPlaceOfCare() {
        return placeOfCare;
    }

    public void setPlaceOfCare(String placeOfCare) {
        this.placeOfCare = placeOfCare;
    }

    public Boolean getReferralRequired() {
        return referralRequired;
    }

    public void setReferralRequired(Boolean referralRequired) {
        this.referralRequired = referralRequired;
    }

    public String getReferralReason() {
        return referralReason;
    }

    public void setReferralReason(String referralReason) {
        this.referralReason = referralReason;
    }

    public String getAssessment() {
        return assessment;
    }

    public void setAssessment(String assessment) {
        this.assessment = assessment;
    }

    public String getTreatment() {
        return treatment;
    }

    public void setTreatment(String treatment) {
        this.treatment = treatment;
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