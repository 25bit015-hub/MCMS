package com.clinic.api.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clinic.api.entity.InsuranceClaim;
import com.clinic.api.entity.InsuranceProvider;
import com.clinic.api.entity.Invoice;
import com.clinic.api.repository.InsuranceClaimRepository;
import com.clinic.api.repository.InsuranceProviderRepository;
import com.clinic.api.repository.InvoiceRepository;

@Service
public class InsuranceClaimService {

    private final InsuranceClaimRepository insuranceClaimRepository;
    private final InvoiceRepository invoiceRepository;
    private final InsuranceProviderRepository insuranceProviderRepository;

    public InsuranceClaimService(
            InsuranceClaimRepository insuranceClaimRepository,
            InvoiceRepository invoiceRepository,
            InsuranceProviderRepository insuranceProviderRepository
    ) {
        this.insuranceClaimRepository = insuranceClaimRepository;
        this.invoiceRepository = invoiceRepository;
        this.insuranceProviderRepository = insuranceProviderRepository;
    }

    /**
     * Create insurance claim
     */
    @Transactional
    public InsuranceClaim createClaim(
            InsuranceClaim claim
    ) {

        if (claim.getClaimNumber() == null ||
                claim.getClaimNumber().trim().isEmpty()) {

            throw new RuntimeException(
                    "Claim number is required"
            );
        }

        if (claim.getInvoice() == null ||
                claim.getInvoice().getId() == null) {

            throw new RuntimeException(
                    "Invoice is required"
            );
        }

        if (claim.getInsuranceProvider() == null ||
                claim.getInsuranceProvider().getId() == null) {

            throw new RuntimeException(
                    "Insurance provider is required"
            );
        }

        if (claim.getMemberNumber() == null ||
                claim.getMemberNumber().trim().isEmpty()) {

            throw new RuntimeException(
                    "Member number is required"
            );
        }

        String claimNumber =
                claim.getClaimNumber().trim().toUpperCase();

        if (insuranceClaimRepository
                .existsByClaimNumber(claimNumber)) {

            throw new RuntimeException(
                    "Claim number already exists"
            );
        }

        // Find invoice
        Invoice invoice = invoiceRepository
                .findById(claim.getInvoice().getId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invoice not found"
                        )
                );

        // Invoice must be insurance
        if (invoice.getBillingType() !=
                Invoice.BillingType.INSURANCE) {

            throw new RuntimeException(
                    "Claim can only be created for an insurance invoice"
            );
        }

        // Find insurance provider
        InsuranceProvider provider =
                insuranceProviderRepository
                        .findById(
                                claim.getInsuranceProvider().getId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Insurance provider not found"
                                )
                        );

        if (!provider.isActive()) {

            throw new RuntimeException(
                    "Insurance provider is not active"
            );
        }

        // Validate claimed amount
        BigDecimal claimedAmount =
                claim.getClaimedAmount();

        if (claimedAmount == null ||
                claimedAmount.compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Claimed amount must be greater than zero"
            );
        }

        if (claimedAmount.compareTo(
                invoice.getTotalAmount()) > 0) {

            throw new RuntimeException(
                    "Claimed amount cannot exceed invoice total"
            );
        }

        // Set managed relationships
        claim.setClaimNumber(claimNumber);
        claim.setInvoice(invoice);
        claim.setInsuranceProvider(provider);

        // Initial amounts
        claim.setApprovedAmount(BigDecimal.ZERO);

        claim.setCopaymentAmount(BigDecimal.ZERO);

        claim.setInsuranceBalance(
                claimedAmount
        );

        claim.setStatus(
                InsuranceClaim.ClaimStatus.PENDING
        );

        return insuranceClaimRepository.save(claim);
    }

    /**
     * Get claim by ID
     */
    public InsuranceClaim getClaimById(Long id) {

        return insuranceClaimRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Insurance claim not found"
                        )
                );
    }

    /**
     * Get claim by claim number
     */
    public InsuranceClaim getClaimByNumber(
            String claimNumber
    ) {

        return insuranceClaimRepository
                .findByClaimNumber(
                        claimNumber.trim().toUpperCase()
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Insurance claim not found"
                        )
                );
    }

    /**
     * Get all claims
     */
    public List<InsuranceClaim> getAllClaims() {

        return insuranceClaimRepository.findAll();
    }

    /**
     * Get claims by invoice
     */
    public List<InsuranceClaim> getClaimsByInvoice(
            Long invoiceId
    ) {

        if (!invoiceRepository.existsById(invoiceId)) {

            throw new RuntimeException(
                    "Invoice not found"
            );
        }

        return insuranceClaimRepository
                .findByInvoiceId(invoiceId);
    }

    /**
     * Get claims by insurance provider
     */
    public List<InsuranceClaim> getClaimsByProvider(
            Long providerId
    ) {

        if (!insuranceProviderRepository
                .existsById(providerId)) {

            throw new RuntimeException(
                    "Insurance provider not found"
            );
        }

        return insuranceClaimRepository
                .findByInsuranceProviderId(providerId);
    }

    /**
     * Get claims by status
     */
    public List<InsuranceClaim> getClaimsByStatus(
            InsuranceClaim.ClaimStatus status
    ) {

        if (status == null) {

            throw new RuntimeException(
                    "Claim status is required"
            );
        }

        return insuranceClaimRepository
                .findByStatus(status);
    }

    /**
     * Get claims by member number
     */
    public List<InsuranceClaim> getClaimsByMemberNumber(
            String memberNumber
    ) {

        if (memberNumber == null ||
                memberNumber.trim().isEmpty()) {

            throw new RuntimeException(
                    "Member number is required"
            );
        }

        return insuranceClaimRepository
                .findByMemberNumber(
                        memberNumber.trim()
                );
    }

    /**
     * Submit claim
     */
    @Transactional
    public InsuranceClaim submitClaim(Long id) {

        InsuranceClaim claim = getClaimById(id);

        if (claim.getStatus() !=
                InsuranceClaim.ClaimStatus.PENDING) {

            throw new RuntimeException(
                    "Only pending claims can be submitted"
            );
        }

        claim.setStatus(
                InsuranceClaim.ClaimStatus.SUBMITTED
        );

        claim.setSubmittedAt(
                LocalDateTime.now()
        );

        return insuranceClaimRepository.save(claim);
    }

    /**
     * Approve claim
     */
    @Transactional
    public InsuranceClaim approveClaim(
            Long id,
            BigDecimal approvedAmount,
            BigDecimal copaymentAmount
    ) {

        InsuranceClaim claim = getClaimById(id);

        if (claim.getStatus() !=
                InsuranceClaim.ClaimStatus.SUBMITTED) {

            throw new RuntimeException(
                    "Only submitted claims can be approved"
            );
        }

        if (approvedAmount == null ||
                approvedAmount.compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException(
                    "Approved amount cannot be negative"
            );
        }

        if (copaymentAmount == null ||
                copaymentAmount.compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException(
                    "Copayment amount cannot be negative"
            );
        }

        BigDecimal claimedAmount =
                claim.getClaimedAmount();

        if (approvedAmount.compareTo(
                claimedAmount) > 0) {

            throw new RuntimeException(
                    "Approved amount cannot exceed claimed amount"
            );
        }

        BigDecimal totalCovered =
                approvedAmount.add(copaymentAmount);

        if (totalCovered.compareTo(
                claimedAmount) > 0) {

            throw new RuntimeException(
                    "Approved amount plus copayment cannot exceed claimed amount"
            );
        }

        claim.setApprovedAmount(approvedAmount);
        claim.setCopaymentAmount(copaymentAmount);

        claim.setInsuranceBalance(
                approvedAmount
        );

        claim.setStatus(
                InsuranceClaim.ClaimStatus.APPROVED
        );

        claim.setApprovedAt(
                LocalDateTime.now()
        );

        return insuranceClaimRepository.save(claim);
    }

    /**
     * Reject claim
     */
    @Transactional
    public InsuranceClaim rejectClaim(Long id) {

        InsuranceClaim claim = getClaimById(id);

        if (claim.getStatus() !=
                InsuranceClaim.ClaimStatus.SUBMITTED) {

            throw new RuntimeException(
                    "Only submitted claims can be rejected"
            );
        }

        claim.setStatus(
                InsuranceClaim.ClaimStatus.REJECTED
        );

        claim.setInsuranceBalance(
                BigDecimal.ZERO
        );

        return insuranceClaimRepository.save(claim);
    }

    /**
     * Mark claim as paid
     */
    @Transactional
public InsuranceClaim markAsPaid(Long id) {

    InsuranceClaim claim = getClaimById(id);

    if (claim.getStatus() != InsuranceClaim.ClaimStatus.APPROVED) {
        throw new RuntimeException(
                "Only approved claims can be marked as paid"
        );
    }

    Invoice invoice = claim.getInvoice();

    if (invoice == null) {
        throw new RuntimeException("Invoice not found for this claim");
    }

    BigDecimal approvedAmount = claim.getApprovedAmount();

    if (approvedAmount == null ||
            approvedAmount.compareTo(BigDecimal.ZERO) <= 0) {
        throw new RuntimeException(
                "Approved insurance amount must be greater than zero"
        );
    }

    BigDecimal currentPaid = invoice.getPaidAmount();

    if (currentPaid == null) {
        currentPaid = BigDecimal.ZERO;
    }

    BigDecimal totalPaid =
            currentPaid.add(approvedAmount);

    BigDecimal newBalance =
            invoice.getTotalAmount().subtract(totalPaid);

    if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
        newBalance = BigDecimal.ZERO;
    }

    invoice.setPaidAmount(totalPaid);
    invoice.setBalanceAmount(newBalance);

    if (newBalance.compareTo(BigDecimal.ZERO) == 0) {
        invoice.setStatus(Invoice.InvoiceStatus.PAID);
    } else {
        invoice.setStatus(
                Invoice.InvoiceStatus.PARTIALLY_PAID
        );
    }

    invoiceRepository.save(invoice);

    claim.setStatus(InsuranceClaim.ClaimStatus.PAID);
    claim.setInsuranceBalance(BigDecimal.ZERO);
    claim.setPaidAt(LocalDateTime.now());

    return insuranceClaimRepository.save(claim);
}
}