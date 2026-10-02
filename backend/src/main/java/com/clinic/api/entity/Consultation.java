package com.clinic.api.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "consultations")
public class Consultation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ============================================================
    // PATIENT
    // ============================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "patient_id",
        nullable = false,
        foreignKey = @ForeignKey(
            name = "fk_consultation_patient"
        )
    )
    private Patient patient;

    // ============================================================
    // QUEUE
    // ============================================================

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "queue_id",
        nullable = false,
        foreignKey = @ForeignKey(
            name = "fk_consultation_queue"
        )
    )
    private PatientQueue queue;

    // ============================================================
    // VISIT
    //
    // Nullable for old/legacy consultation records.
    // New consultations must have a visit.
    // ============================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "visit_id",
        nullable = true,
        foreignKey = @ForeignKey(
            name = "fk_consultation_visit"
        )
    )
    private Visit visit;

    // ============================================================
    // CLINICAL INFORMATION
    // ============================================================

    @Lob
    @Column(
        nullable = false
    )
    private String complaint;

    @Lob
    @Column(
        nullable = false
    )
    private String examination;

    @Lob
    @Column(
        nullable = false
    )
    private String diagnosis;

    @Lob
    @Column(
        nullable = false
    )
    private String treatment;

    // ============================================================
    // LABORATORY
    // ============================================================

    @Column(
        name = "lab_required",
        nullable = false
    )
    private boolean labRequired = false;

    @Lob
    @Column(
        name = "lab_notes"
    )
    private String labNotes;

    // ============================================================
    // PHARMACY
    // ============================================================

    @Column(
        name = "pharmacy_required",
        nullable = false
    )
    private boolean pharmacyRequired = false;

    @Lob
    @Column(
        name = "prescription"
    )
    private String prescription;

    // ============================================================
    // INJECTION
    // ============================================================

    @Column(
        name = "injection_required",
        nullable = false
    )
    private boolean injectionRequired = false;

    @Lob
    @Column(
        name = "injection_notes"
    )
    private String injectionNotes;

    // ============================================================
    // NEXT SERVICE
    // ============================================================

    @Column(
        name = "next_service",
        nullable = false,
        length = 50
    )
    private String nextService;

    // ============================================================
    // CREATED AT
    // ============================================================

    @Column(
        name = "created_at",
        nullable = false
    )
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    // ============================================================
    // GETTERS / SETTERS
    // ============================================================

    public Long getId() {
        return id;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public PatientQueue getQueue() {
        return queue;
    }

    public void setQueue(PatientQueue queue) {
        this.queue = queue;
    }

    public Visit getVisit() {
        return visit;
    }

    public void setVisit(Visit visit) {
        this.visit = visit;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}