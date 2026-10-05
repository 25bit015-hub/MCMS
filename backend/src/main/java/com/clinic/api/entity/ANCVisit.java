package com.clinic.api.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;


@Entity
@Table(
    name = "anc_visits",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_anc_visit_active_record",
            columnNames = {
                "pregnancy_id",
                "visit_date",
                "visit_type",
                "record_status"
            }
        )
    }
)
public class ANCVisit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // PREGNANCY
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pregnancy_id", nullable = false)
    private Pregnancy pregnancy;

    // =========================================================
    // VISIT INFORMATION
    // =========================================================

    @Column(nullable = false)
    private LocalDate visitDate;

    @Column(nullable = false)
    private String visitType;

    private Integer gestationalWeeks;

    private Integer gestationalDays;

    // =========================================================
    // MATERNAL ASSESSMENT
    // =========================================================

    private Double weight;

    private Double bloodPressureSystolic;

    private Double bloodPressureDiastolic;

    private Integer pulse;

    private Double temperature;

    private Integer respiratoryRate;

    @Column(columnDefinition = "TEXT")
    private String generalCondition;

    @Column(columnDefinition = "TEXT")
    private String oedema;

    @Column(columnDefinition = "TEXT")
    private String pallor;

    @Column(columnDefinition = "TEXT")
    private String symptoms;

    // =========================================================
    // PREGNANCY / FETAL ASSESSMENT
    // =========================================================

    private Double fundalHeight;

    private Integer fetalHeartRate;

    private String fetalMovement;

    private String presentation;

    private String lie;

    private String position;

    // =========================================================
    // INVESTIGATIONS
    // =========================================================

    private String haemoglobin;

    private String bloodGroup;

    private String rhesus;

    @Column(columnDefinition = "TEXT")
    private String urinalysis;

    private String bloodSugar;

    private String hivResult;

    private String syphilisResult;

    private String hepatitisBResult;

    @Column(columnDefinition = "TEXT")
    private String ultrasound;

    @Column(columnDefinition = "TEXT")
    private String otherInvestigations;

    // =========================================================
    // CLINICAL MANAGEMENT
    // =========================================================

    @Column(columnDefinition = "TEXT")
    private String assessment;

    @Column(columnDefinition = "TEXT")
    private String riskAssessment;

    @Column(columnDefinition = "TEXT")
    private String diagnosis;

    @Column(columnDefinition = "TEXT")
    private String treatment;

    @Column(columnDefinition = "TEXT")
    private String medication;

    @Column(columnDefinition = "TEXT")
    private String advice;

    @Column(columnDefinition = "TEXT")
    private String healthEducation;

    @Column(columnDefinition = "TEXT")
    private String referral;

    // =========================================================
    // FOLLOW-UP
    // =========================================================

    private LocalDate nextVisitDate;

    // =========================================================
    // RECORD CONTROL
    // =========================================================

    @Column(nullable = false)
    private String recordStatus = "ACTIVE";

    @Column(columnDefinition = "TEXT")
    private String archiveReason;

    @Column(columnDefinition = "TEXT")
    private String notes;

    // =========================================================
    // TIMESTAMPS
    // =========================================================

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // =========================================================
    // PRE PERSIST
    // =========================================================

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }

        if (recordStatus == null || recordStatus.isBlank()) {
            recordStatus = "ACTIVE";
        }
    }

    // =========================================================
    // PRE UPDATE
    // =========================================================

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // =========================================================
    // GETTERS AND SETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Pregnancy getPregnancy() {
        return pregnancy;
    }

    public void setPregnancy(Pregnancy pregnancy) {
        this.pregnancy = pregnancy;
    }

    public LocalDate getVisitDate() {
        return visitDate;
    }

    public void setVisitDate(LocalDate visitDate) {
        this.visitDate = visitDate;
    }

    public String getVisitType() {
        return visitType;
    }

    public void setVisitType(String visitType) {
        this.visitType = visitType;
    }

    public Integer getGestationalWeeks() {
        return gestationalWeeks;
    }

    public void setGestationalWeeks(Integer gestationalWeeks) {
        this.gestationalWeeks = gestationalWeeks;
    }

    public Integer getGestationalDays() {
        return gestationalDays;
    }

    public void setGestationalDays(Integer gestationalDays) {
        this.gestationalDays = gestationalDays;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public Double getBloodPressureSystolic() {
        return bloodPressureSystolic;
    }

    public void setBloodPressureSystolic(Double bloodPressureSystolic) {
        this.bloodPressureSystolic = bloodPressureSystolic;
    }

    public Double getBloodPressureDiastolic() {
        return bloodPressureDiastolic;
    }

    public void setBloodPressureDiastolic(Double bloodPressureDiastolic) {
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

    public String getGeneralCondition() {
        return generalCondition;
    }

    public void setGeneralCondition(String generalCondition) {
        this.generalCondition = generalCondition;
    }

    public String getOedema() {
        return oedema;
    }

    public void setOedema(String oedema) {
        this.oedema = oedema;
    }

    public String getPallor() {
        return pallor;
    }

    public void setPallor(String pallor) {
        this.pallor = pallor;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }

    public Double getFundalHeight() {
        return fundalHeight;
    }

    public void setFundalHeight(Double fundalHeight) {
        this.fundalHeight = fundalHeight;
    }

    public Integer getFetalHeartRate() {
        return fetalHeartRate;
    }

    public void setFetalHeartRate(Integer fetalHeartRate) {
        this.fetalHeartRate = fetalHeartRate;
    }

    public String getFetalMovement() {
        return fetalMovement;
    }

    public void setFetalMovement(String fetalMovement) {
        this.fetalMovement = fetalMovement;
    }

    public String getPresentation() {
        return presentation;
    }

    public void setPresentation(String presentation) {
        this.presentation = presentation;
    }

    public String getLie() {
        return lie;
    }

    public void setLie(String lie) {
        this.lie = lie;
    }

    public String getPosition() {
        return position;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public String getHaemoglobin() {
        return haemoglobin;
    }

    public void setHaemoglobin(String haemoglobin) {
        this.haemoglobin = haemoglobin;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public String getRhesus() {
        return rhesus;
    }

    public void setRhesus(String rhesus) {
        this.rhesus = rhesus;
    }

    public String getUrinalysis() {
        return urinalysis;
    }

    public void setUrinalysis(String urinalysis) {
        this.urinalysis = urinalysis;
    }

    public String getBloodSugar() {
        return bloodSugar;
    }

    public void setBloodSugar(String bloodSugar) {
        this.bloodSugar = bloodSugar;
    }

    public String getHivResult() {
        return hivResult;
    }

    public void setHivResult(String hivResult) {
        this.hivResult = hivResult;
    }

    public String getSyphilisResult() {
        return syphilisResult;
    }

    public void setSyphilisResult(String syphilisResult) {
        this.syphilisResult = syphilisResult;
    }

    public String getHepatitisBResult() {
        return hepatitisBResult;
    }

    public void setHepatitisBResult(String hepatitisBResult) {
        this.hepatitisBResult = hepatitisBResult;
    }

    public String getUltrasound() {
        return ultrasound;
    }

    public void setUltrasound(String ultrasound) {
        this.ultrasound = ultrasound;
    }

    public String getOtherInvestigations() {
        return otherInvestigations;
    }

    public void setOtherInvestigations(String otherInvestigations) {
        this.otherInvestigations = otherInvestigations;
    }

    public String getAssessment() {
        return assessment;
    }

    public void setAssessment(String assessment) {
        this.assessment = assessment;
    }

    public String getRiskAssessment() {
        return riskAssessment;
    }

    public void setRiskAssessment(String riskAssessment) {
        this.riskAssessment = riskAssessment;
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

    public String getAdvice() {
        return advice;
    }

    public void setAdvice(String advice) {
        this.advice = advice;
    }

    public String getHealthEducation() {
        return healthEducation;
    }

    public void setHealthEducation(String healthEducation) {
        this.healthEducation = healthEducation;
    }

    public String getReferral() {
        return referral;
    }

    public void setReferral(String referral) {
        this.referral = referral;
    }

    public LocalDate getNextVisitDate() {
        return nextVisitDate;
    }

    public void setNextVisitDate(LocalDate nextVisitDate) {
        this.nextVisitDate = nextVisitDate;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
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