package com.clinic.api.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
@Table(name = "prescriptions")
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Patient anayepokea prescription
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "patient_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_prescription_patient"
            )
    )
    private Patient patient;

    /*
     * Visit husika ya mgonjwa.
     * Hii ndiyo inatenganisha dawa za visit moja
     * na visit nyingine.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "visit_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_prescription_visit"
            )
    )
    private Visit visit;

    /*
     * Aina ya malipo.
     */
    @Enumerated(EnumType.STRING)
    @Column(
            name = "payment_type",
            nullable = false,
            length = 20
    )
    private PaymentType paymentType;

    /*
     * Maelezo ya jumla ya prescription.
     */
    @Column(length = 2000)
    private String notes;

    /*
     * Status ya prescription kwenye Pharmacy.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PrescriptionStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {

        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }

        if (status == null) {
            status = PrescriptionStatus.PENDING;
        }

        if (paymentType == null) {
            paymentType = PaymentType.CASH;
        }
    }

    public enum PrescriptionStatus {
        PENDING,
        DISPENSING,
        COMPLETED,
        CANCELLED
    }

    public enum PaymentType {
        CASH,
        INSURANCE
    }

    public Prescription() {
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

    public Visit getVisit() {
        return visit;
    }

    public void setVisit(Visit visit) {
        this.visit = visit;
    }

    public PaymentType getPaymentType() {
        return paymentType;
    }

    public void setPaymentType(PaymentType paymentType) {
        this.paymentType = paymentType;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public PrescriptionStatus getStatus() {
        return status;
    }

    public void setStatus(PrescriptionStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}