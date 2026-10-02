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
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "laboratory_results")
public class LaboratoryResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "patient_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_lab_result_patient")
    )
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "queue_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_lab_result_queue")
    )
    private PatientQueue queue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "consultation_id",
        foreignKey = @ForeignKey(name = "fk_lab_result_consultation")
    )
    private Consultation consultation;

    /*
     * Visit associated with this laboratory result.
     *
     * Nullable for legacy laboratory results that were created
     * before Visit tracking was introduced.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "visit_id",
        nullable = true,
        foreignKey = @ForeignKey(name = "fk_lab_result_visit")
    )
    private Visit visit;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String results;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "performed_at", nullable = false)
    private LocalDateTime performedAt;

    @PrePersist
    public void prePersist() {
        if (performedAt == null) {
            performedAt = LocalDateTime.now();
        }
    }

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

    public Consultation getConsultation() {
        return consultation;
    }

    public void setConsultation(Consultation consultation) {
        this.consultation = consultation;
    }

    public Visit getVisit() {
        return visit;
    }

    public void setVisit(Visit visit) {
        this.visit = visit;
    }

    public String getResults() {
        return results;
    }

    public void setResults(String results) {
        this.results = results;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getPerformedAt() {
        return performedAt;
    }
}