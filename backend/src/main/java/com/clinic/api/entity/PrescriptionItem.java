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
@Table(name = "prescription_items")
public class PrescriptionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Prescription inayomiliki dawa hii.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "prescription_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_prescription_item_prescription"
            )
    )
    private Prescription prescription;

    /*
     * Kwa sasa tunahifadhi jina la dawa hapa.
     * Medicine entity tutaiunganisha hatua inayofuata.
     */
    @Column(name = "medicine_name", nullable = false, length = 200)
    private String medicineName;

    /*
     * Strength mfano:
     * 500mg, 250mg, 10mg
     */
    @Column(length = 100)
    private String strength;

    /*
     * Dosage mfano:
     * 1 tablet, 5ml
     */
    @Column(length = 100)
    private String dosage;

    /*
     * Frequency mfano:
     * Once daily, Twice daily
     */
    @Column(length = 100)
    private String frequency;

    /*
     * Duration mfano:
     * 5 days, 7 days
     */
    @Column(length = 100)
    private String duration;

    /*
     * Idadi ya dawa alizoandikiwa mgonjwa.
     */
    @Column(nullable = false)
    private Integer quantity;

    /*
     * Maelekezo ya ziada kutoka kwa daktari.
     */
    @Column(length = 1000)
    private String instructions;

    /*
     * Bei ya dawa wakati wa dispensing.
     * Tunaiacha nullable kwa sasa kwa sababu
     * pricing/stock itaunganishwa baadaye.
     */
    @Column(precision = 12, scale = 2)
    private BigDecimal unitPrice;

    public PrescriptionItem() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Prescription getPrescription() {
        return prescription;
    }

    public void setPrescription(Prescription prescription) {
        this.prescription = prescription;
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

    public String getDosage() {
        return dosage;
    }

    public void setDosage(String dosage) {
        this.dosage = dosage;
    }

    public String getFrequency() {
        return frequency;
    }

    public void setFrequency(String frequency) {
        this.frequency = frequency;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }
}