package com.clinic.api.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "pregnancies")
public class Pregnancy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Mgonjwa mwenye ujauzito.
     *
     * Patient mmoja anaweza kuwa na pregnancies
     * zaidi ya moja katika maisha yake.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "patient_id",
        nullable = false,
        foreignKey = @ForeignKey(
            name = "fk_pregnancy_patient"
        )
    )
    private Patient patient;

    /*
     * Last Menstrual Period
     */
    @Column(name = "lmp")
    private LocalDate lmp;

    /*
     * Expected Date of Delivery
     */
    @Column(name = "edd")
    private LocalDate edd;

    /*
     * Number of pregnancies including current pregnancy.
     */
    @Column
    private Integer gravida;

    /*
     * Number of births after viability.
     */
    @Column
    private Integer para;

    /*
     * Number of living children.
     */
    @Column(name = "living_children")
    private Integer livingChildren;

    /*
     * Previous pregnancy losses.
     */
    @Column(name = "abortions")
    private Integer abortions;

    /*
     * Current pregnancy status.
     *
     * Examples:
     * ACTIVE
     * COMPLETED
     * MISSED
     * TERMINATED
     */
    @Column(
        nullable = false,
        length = 30
    )
    private String status;

    /*
     * Database-level key used to allow only
     * one ACTIVE pregnancy per patient.
     *
     * ACTIVE pregnancy:
     * activePregnancyKey = patient.id
     *
     * Non-active pregnancy:
     * activePregnancyKey = null
     */
    @Column(name = "active_pregnancy_key")
    private Long activePregnancyKey;

    /*
     * Whether pregnancy has been identified
     * as high risk.
     */
    @Column(
        name = "high_risk",
        nullable = false
    )
    private Boolean highRisk;

    /*
     * Additional clinical notes.
     */
    @Column(length = 3000)
    private String notes;

    @Column(
        name = "created_at",
        nullable = false
    )
    private LocalDateTime createdAt;

    @Column(
        name = "updated_at"
    )
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {

        if (status == null || status.isBlank()) {
            status = "ACTIVE";
        }

        if (highRisk == null) {
            highRisk = false;
        }

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Pregnancy() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
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

    public Long getActivePregnancyKey() {
        return activePregnancyKey;
    }

    public void setActivePregnancyKey(Long activePregnancyKey) {
        this.activePregnancyKey = activePregnancyKey;
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