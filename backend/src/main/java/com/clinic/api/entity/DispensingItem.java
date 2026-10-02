package com.clinic.api.entity;

import java.math.BigDecimal;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "dispensing_items")
public class DispensingItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "dispensing_id",
        nullable = false,
        foreignKey = @ForeignKey(
            name = "fk_dispensing_item_dispensing"
        )
    )
    private Dispensing dispensing;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "batch_id",
        nullable = false,
        foreignKey = @ForeignKey(
            name = "fk_dispensing_item_batch"
        )
    )
    private MedicineBatch batch;

    @Column(
        name = "medicine_name",
        nullable = false,
        length = 200
    )
    private String medicineName;

    @Column(length = 100)
    private String strength;

    @Column(
        name = "prescribed_quantity",
        nullable = false
    )
    private Integer prescribedQuantity;

    @Column(
        name = "dispensed_quantity",
        nullable = false
    )
    private Integer dispensedQuantity;

    @Column(
        name = "unit_price",
        precision = 12,
        scale = 2
    )
    private BigDecimal unitPrice;

    @Column(
        name = "total_price",
        precision = 12,
        scale = 2
    )
    private BigDecimal totalPrice;

    @Column(length = 1000)
    private String instructions;

    public DispensingItem() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Dispensing getDispensing() {
        return dispensing;
    }

    public void setDispensing(Dispensing dispensing) {
        this.dispensing = dispensing;
    }

    public MedicineBatch getBatch() {
        return batch;
    }

    public void setBatch(MedicineBatch batch) {
        this.batch = batch;
    }

    public String getMedicineName() {
        return medicineName;
    }

    public void setMedicineName(String medicineName) {
        this.medicineName = medicineName;
    }

    public String getStrength() {
        return strength;
    }

    public void setStrength(String strength) {
        this.strength = strength;
    }

    public Integer getPrescribedQuantity() {
        return prescribedQuantity;
    }

    public void setPrescribedQuantity(Integer prescribedQuantity) {
        this.prescribedQuantity = prescribedQuantity;
    }

    public Integer getDispensedQuantity() {
        return dispensedQuantity;
    }

    public void setDispensedQuantity(Integer dispensedQuantity) {
        this.dispensedQuantity = dispensedQuantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }
}