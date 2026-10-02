package com.clinic.api.dto;

import java.math.BigDecimal;

public class DashboardResponse {

    private long patientsToday;
    private long totalPatients;

    private BigDecimal revenueToday;

    private long pendingBills;
    private long totalInvoices;

    private long pendingInsuranceClaims;
    private long totalPayments;

    public DashboardResponse() {
    }

    public long getPatientsToday() {
        return patientsToday;
    }

    public void setPatientsToday(long patientsToday) {
        this.patientsToday = patientsToday;
    }

    public long getTotalPatients() {
        return totalPatients;
    }

    public void setTotalPatients(long totalPatients) {
        this.totalPatients = totalPatients;
    }

    public BigDecimal getRevenueToday() {
        return revenueToday;
    }

    public void setRevenueToday(BigDecimal revenueToday) {
        this.revenueToday = revenueToday;
    }

    public long getPendingBills() {
        return pendingBills;
    }

    public void setPendingBills(long pendingBills) {
        this.pendingBills = pendingBills;
    }

    public long getTotalInvoices() {
        return totalInvoices;
    }

    public void setTotalInvoices(long totalInvoices) {
        this.totalInvoices = totalInvoices;
    }

    public long getPendingInsuranceClaims() {
        return pendingInsuranceClaims;
    }

    public void setPendingInsuranceClaims(long pendingInsuranceClaims) {
        this.pendingInsuranceClaims = pendingInsuranceClaims;
    }

    public long getTotalPayments() {
        return totalPayments;
    }

    public void setTotalPayments(long totalPayments) {
        this.totalPayments = totalPayments;
    }
}