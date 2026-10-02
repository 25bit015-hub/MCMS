package com.clinic.api.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;

import com.clinic.api.dto.DashboardResponse;
import com.clinic.api.entity.InsuranceClaim;
import com.clinic.api.entity.Invoice;
import com.clinic.api.repository.InsuranceClaimRepository;
import com.clinic.api.repository.InvoiceRepository;
import com.clinic.api.repository.PatientRepository;
import com.clinic.api.repository.PaymentRepository;

@Service
public class DashboardService {

    private final PatientRepository patientRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final InsuranceClaimRepository insuranceClaimRepository;

    public DashboardService(
            PatientRepository patientRepository,
            InvoiceRepository invoiceRepository,
            PaymentRepository paymentRepository,
            InsuranceClaimRepository insuranceClaimRepository
    ) {
        this.patientRepository = patientRepository;
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
        this.insuranceClaimRepository = insuranceClaimRepository;
    }

    public DashboardResponse getDashboardStats() {

        LocalDate today = LocalDate.now();

        LocalDateTime startOfDay =
                today.atStartOfDay();

        LocalDateTime startOfTomorrow =
                today.plusDays(1).atStartOfDay();

        long patientsToday =
                patientRepository
                        .countByRegisteredAtGreaterThanEqualAndRegisteredAtLessThan(
                                startOfDay,
                                startOfTomorrow
                        );

        long totalPatients =
                patientRepository.count();

        BigDecimal revenueToday =
                paymentRepository.sumAmountByPaidAtBetween(
                        startOfDay,
                        startOfTomorrow
                );

        if (revenueToday == null) {
            revenueToday = BigDecimal.ZERO;
        }

        long pendingBills =
                invoiceRepository.countByStatus(
                        Invoice.InvoiceStatus.UNPAID
                )
                +
                invoiceRepository.countByStatus(
                        Invoice.InvoiceStatus.PARTIALLY_PAID
                );

        long totalInvoices =
                invoiceRepository.count();

        long pendingInsuranceClaims =
                insuranceClaimRepository
                        .findByStatus(
                                InsuranceClaim.ClaimStatus.PENDING
                        )
                        .size();

        long totalPayments =
                paymentRepository.count();

        DashboardResponse response =
                new DashboardResponse();

        response.setPatientsToday(patientsToday);
        response.setTotalPatients(totalPatients);
        response.setRevenueToday(revenueToday);
        response.setPendingBills(pendingBills);
        response.setTotalInvoices(totalInvoices);
        response.setPendingInsuranceClaims(
                pendingInsuranceClaims
        );
        response.setTotalPayments(totalPayments);

        return response;
    }
}