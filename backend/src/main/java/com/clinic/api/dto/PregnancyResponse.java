package com.clinic.api.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class PregnancyResponse {

    private Long id;

    private Long patientId;

    private String patientNumber;

    private String patientName;

    private LocalDate lmp;

    private LocalDate edd;

    private Integer gravida;

    private Integer para;

    private Integer livingChildren;

    private Integer abortions;

    private String status;

    private Boolean highRisk;

    private String notes;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public PregnancyResponse() {
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

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public LocalDate getLmp() {
        return lmp;
    }

    public void setLmp(LocalDate lmp) {
        this.lmp = lmp;
    }

    public LocalDate getEdd() {
        return edd;
    }

    public void setEdd(LocalDate edd) {
        this.edd = edd;
    }

    public Integer getGravida() {
        return gravida;
    }

    public void setGravida(Integer gravida) {
        this.gravida = gravida;
    }

    public Integer getPara() {
        return para;
    }

    public void setPara(Integer para) {
        this.para = para;
    }

    public Integer getLivingChildren() {
        return livingChildren;
    }

    public void setLivingChildren(Integer livingChildren) {
        this.livingChildren = livingChildren;
    }

    public Integer getAbortions() {
        return abortions;
    }

    public void setAbortions(Integer abortions) {
        this.abortions = abortions;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getHighRisk() {
        return highRisk;
    }

    public void setHighRisk(Boolean highRisk) {
        this.highRisk = highRisk;
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
