package com.clinic.api.entity;

import java.math.BigDecimal;
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
@Table(name = "dispensings")
public class Dispensing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "patient_id",
        nullable = false,
        foreignKey = @ForeignKey(
            name = "fk_dispensing_patient"
        )
    )
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "visit_id",
        nullable = false,
        foreignKey = @ForeignKey(
            name = "fk_dispensing_visit"
        )
    )
    private Visit visit;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "prescription_id",
        nullable = false,
        foreignKey = @ForeignKey(
            name = "fk_dispensing_prescription"
        )
    )
    private Prescription prescription;

    @Enumerated(EnumType.STRING)
    @Column(
        name = "payment_type",
        nullable = false,
        length = 20
    )
    private PaymentType paymentType;

    @Column(
        name = "total_amount",
        precision = 12,
        scale = 2
    )
    private BigDecimal totalAmount;

    @Column(
        name = "dispensed_at",
        nullable = false
    )
    private LocalDateTime dispensedAt;

    @Enumerated(EnumType.STRING)
    @Column(
        nullable = false,
        length = 20
    )
    private DispensingStatus status;

    @Column(length = 1000)
    private String notes;

    @PrePersist
    public void prePersist() {

        if (dispensedAt == null) {
            dispensedAt = LocalDateTime.now();
        }

        if (paymentType == null) {
            paymentType = PaymentType.CASH;
        }

        if (status == null) {
            status = DispensingStatus.COMPLETED;
        }

        if (totalAmount == null) {
            totalAmount = BigDecimal.ZERO;
        }
    }

    public enum PaymentType {
        CASH,
        INSURANCE
    }

    public enum DispensingStatus {
        COMPLETED,
        PARTIAL,
        CANCELLED
    }

    public Dispensing() {
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

    public Prescription getPrescription() {
        return prescription;
    }

    public void setPrescription(Prescription prescription) {
        this.prescription = prescription;
    }

    public PaymentType getPaymentType() {
        return paymentType;
    }

    public void setPaymentType(PaymentType paymentType) {
        this.paymentType = paymentType;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public LocalDateTime getDispensedAt() {
        return dispensedAt;
    }

    public void setDispensedAt(LocalDateTime dispensedAt) {
        this.dispensedAt = dispensedAt;
    }

    public DispensingStatus getStatus() {
        return status;
    }

    public void setStatus(DispensingStatus status) {
        this.status = status;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}