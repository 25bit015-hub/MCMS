package com.clinic.api.dto;

import java.util.ArrayList;
import java.util.List;

import com.clinic.api.entity.Invoice.BillingType;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateInvoiceRequest {

    @NotNull(message = "Patient is required")
    private Long patientId;

    @NotNull(message = "Billing type is required")
    private BillingType billingType;

    @NotEmpty(message = "Invoice must contain at least one item")
    @Valid
    private List<InvoiceItemRequest> items = new ArrayList<>();

    @Size(max = 500, message = "Notes cannot exceed 500 characters")
    private String notes;

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public BillingType getBillingType() {
        return billingType;
    }

    public void setBillingType(BillingType billingType) {
        this.billingType = billingType;
    }

    public List<InvoiceItemRequest> getItems() {
        return items;
    }

    public void setItems(List<InvoiceItemRequest> items) {
        this.items = items;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public static class InvoiceItemRequest {

        @NotNull(message = "Item description is required")
        @Size(max = 255, message = "Description cannot exceed 255 characters")
        private String description;

        @NotNull(message = "Quantity is required")
        private java.math.BigDecimal quantity;

        @NotNull(message = "Unit price is required")
        private java.math.BigDecimal unitPrice;

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public java.math.BigDecimal getQuantity() {
            return quantity;
        }

        public void setQuantity(java.math.BigDecimal quantity) {
            this.quantity = quantity;
        }

        public java.math.BigDecimal getUnitPrice() {
            return unitPrice;
        }

        public void setUnitPrice(java.math.BigDecimal unitPrice) {
            this.unitPrice = unitPrice;
        }
    }
}