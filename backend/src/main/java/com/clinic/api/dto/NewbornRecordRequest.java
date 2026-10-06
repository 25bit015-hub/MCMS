package com.clinic.api.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;

public class NewbornRecordRequest {

    // =========================
    // RELATIONSHIP
    // =========================

    @NotNull(message = "Labour record ID is required.")
    private Long labourRecordId;

    // =========================
    // BASIC NEWBORN INFORMATION
    // =========================

    @NotNull(message = "Date of birth is required.")
    private LocalDate dateOfBirth;

    private String timeOfBirth;
    private String sex;
    private Integer birthOrder;

    // =========================
    // BIRTH MEASUREMENTS
    // =========================

    private Double birthWeight;
    private Double birthLength;
    private Double headCircumference;

    // =========================
    // APGAR
    // =========================

    private Integer apgarOneMinute;
    private Integer apgarFiveMinutes;
    private Integer apgarTenMinutes;

    // =========================
    // CONDITION AT BIRTH
    // =========================

    private String conditionAtBirth;
    private String cryAtBirth;
    private String breathingAtBirth;
    private String muscleTone;
    private String skinColour;

    // =========================
    // RESUSCITATION
    // =========================

    private Boolean resuscitationRequired;
    private String resuscitationMethod;
    private String resuscitationDuration;

    // =========================
    // CLINICAL FINDINGS
    // =========================

    private String congenitalAbnormalities;
    private String clinicalCondition;
    private Double temperature;
    private Integer heartRate;
    private Integer respiratoryRate;

    // =========================
    // IMMEDIATE NEWBORN CARE
    // =========================

    private Boolean breastfeedingStarted;
    private String breastfeedingTime;
    private Boolean skinToSkin;
    private Boolean vitaminKGiven;
    private Boolean bcgGiven;
    private Boolean opvGiven;

    // =========================
    // NEWBORN OUTCOME
    // =========================

    private String newbornOutcome;
    private String placeOfCare;
    private Boolean referralRequired;
    private String referralReason;

    // =========================
    // CLINICAL NOTES
    // =========================

    private String assessment;
    private String treatment;
    private String notes;

    // =========================
    // GETTERS AND SETTERS
    // =========================

    public Long getLabourRecordId() {
        return labourRecordId;
    }

    public void setLabourRecordId(Long labourRecordId) {
        this.labourRecordId = labourRecordId;
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
}