package com.clinic.api.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class VitalSignsRequest {

    /*
     * Visit ambayo nurse anaweka vital signs zake.
     */
    @NotNull(
        message = "Visit ID is required"
    )
    private Long visitId;

    @DecimalMin(
        value = "0.0",
        inclusive = false,
        message = "Temperature must be greater than 0"
    )
    private BigDecimal temperature;

    private String bloodPressure;

    @Min(
        value = 0,
        message = "Pulse rate cannot be negative"
    )
    private Integer pulseRate;

    @Min(
        value = 0,
        message = "Respiratory rate cannot be negative"
    )
    private Integer respiratoryRate;

    @Min(
        value = 0,
        message = "Oxygen saturation cannot be negative"
    )
    @Max(
        value = 100,
        message = "Oxygen saturation cannot exceed 100"
    )
    private Integer oxygenSaturation;

    @DecimalMin(
        value = "0.0",
        inclusive = false,
        message = "Weight must be greater than 0"
    )
    private BigDecimal weight;

    @DecimalMin(
        value = "0.0",
        inclusive = false,
        message = "Height must be greater than 0"
    )
    private BigDecimal height;

    private String notes;

    public VitalSignsRequest() {
    }

    public Long getVisitId() {
        return visitId;
    }

    public void setVisitId(Long visitId) {
        this.visitId = visitId;
    }

    public BigDecimal getTemperature() {
        return temperature;
    }

    public void setTemperature(BigDecimal temperature) {
        this.temperature = temperature;
    }

    public String getBloodPressure() {
        return bloodPressure;
    }

    public void setBloodPressure(String bloodPressure) {
        this.bloodPressure = bloodPressure;
    }

    public Integer getPulseRate() {
        return pulseRate;
    }

    public void setPulseRate(Integer pulseRate) {
        this.pulseRate = pulseRate;
    }

    public Integer getRespiratoryRate() {
        return respiratoryRate;
    }

    public void setRespiratoryRate(Integer respiratoryRate) {
        this.respiratoryRate = respiratoryRate;
    }

    public Integer getOxygenSaturation() {
        return oxygenSaturation;
    }

    public void setOxygenSaturation(Integer oxygenSaturation) {
        this.oxygenSaturation = oxygenSaturation;
    }

    public BigDecimal getWeight() {
        return weight;
    }

    public void setWeight(BigDecimal weight) {
        this.weight = weight;
    }

    public BigDecimal getHeight() {
        return height;
    }

    public void setHeight(BigDecimal height) {
        this.height = height;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}