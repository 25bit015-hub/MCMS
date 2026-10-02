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
@Table(name = "stock_movements")
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "medicine_id",
        nullable = false,
        foreignKey = @ForeignKey(
            name = "fk_stock_movement_medicine"
        )
    )
    private Medicine medicine;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "batch_id",
        nullable = false,
        foreignKey = @ForeignKey(
            name = "fk_stock_movement_batch"
        )
    )
    private MedicineBatch batch;

    @Enumerated(EnumType.STRING)
    @Column(
        name = "movement_type",
        nullable = false,
        length = 30
    )
    private MovementType movementType;

    @Column(
        nullable = false
    )
    private Integer quantity;

    @Column(
        name = "movement_date",
        nullable = false
    )
    private LocalDateTime movementDate;

    @Column(
        name = "reference_type",
        length = 50
    )
    private String referenceType;

    @Column(
        name = "reference_id"
    )
    private Long referenceId;

    @Column(
        length = 1000
    )
    private String notes;

    @PrePersist
    public void prePersist() {

        if (movementDate == null) {
            movementDate = LocalDateTime.now();
        }
    }

    public enum MovementType {
        STOCK_IN,
        DISPENSED,
        RETURNED,
        ADJUSTMENT,
        DAMAGED,
        EXPIRED
    }

    public StockMovement() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Medicine getMedicine() {
        return medicine;
    }

    public void setMedicine(Medicine medicine) {
        this.medicine = medicine;
    }

    public MedicineBatch getBatch() {
        return batch;
    }

    public void setBatch(MedicineBatch batch) {
        this.batch = batch;
    }

    public MovementType getMovementType() {
        return movementType;
    }

    public void setMovementType(MovementType movementType) {
        this.movementType = movementType;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public LocalDateTime getMovementDate() {
        return movementDate;
    }

    public void setMovementDate(LocalDateTime movementDate) {
        this.movementDate = movementDate;
    }

    public String getReferenceType() {
        return referenceType;
    }

    public void setReferenceType(String referenceType) {
        this.referenceType = referenceType;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(Long referenceId) {
        this.referenceId = referenceId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}