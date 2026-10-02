package com.clinic.api.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.clinic.api.entity.InsuranceClaim;
import com.clinic.api.service.InsuranceClaimService;

@RestController
@RequestMapping("/api/insurance-claims")
@CrossOrigin(origins = "http://localhost:5173")
public class InsuranceClaimController {

    private final InsuranceClaimService insuranceClaimService;

    public InsuranceClaimController(
            InsuranceClaimService insuranceClaimService
    ) {
        this.insuranceClaimService = insuranceClaimService;
    }

    /**
     * Create insurance claim
     */
    @PostMapping
    public ResponseEntity<InsuranceClaim> createClaim(
            @RequestBody InsuranceClaim claim
    ) {

        InsuranceClaim savedClaim =
                insuranceClaimService.createClaim(claim);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedClaim);
    }

    /**
     * Get all claims
     */
    @GetMapping
    public ResponseEntity<List<InsuranceClaim>> getAllClaims() {

        return ResponseEntity.ok(
                insuranceClaimService.getAllClaims()
        );
    }

    /**
     * Get claim by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<InsuranceClaim> getClaimById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                insuranceClaimService.getClaimById(id)
        );
    }

    /**
     * Get claim by claim number
     */
    @GetMapping("/number/{claimNumber}")
    public ResponseEntity<InsuranceClaim> getClaimByNumber(
            @PathVariable String claimNumber
    ) {

        return ResponseEntity.ok(
                insuranceClaimService.getClaimByNumber(
                        claimNumber
                )
        );
    }

    /**
     * Get claims by invoice
     */
    @GetMapping("/invoice/{invoiceId}")
    public ResponseEntity<List<InsuranceClaim>> getClaimsByInvoice(
            @PathVariable Long invoiceId
    ) {

        return ResponseEntity.ok(
                insuranceClaimService.getClaimsByInvoice(
                        invoiceId
                )
        );
    }

    /**
     * Get claims by insurance provider
     */
    @GetMapping("/provider/{providerId}")
    public ResponseEntity<List<InsuranceClaim>> getClaimsByProvider(
            @PathVariable Long providerId
    ) {

        return ResponseEntity.ok(
                insuranceClaimService.getClaimsByProvider(
                        providerId
                )
        );
    }

    /**
     * Get claims by status
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<InsuranceClaim>> getClaimsByStatus(
            @PathVariable InsuranceClaim.ClaimStatus status
    ) {

        return ResponseEntity.ok(
                insuranceClaimService.getClaimsByStatus(
                        status
                )
        );
    }

    /**
     * Get claims by member number
     */
    @GetMapping("/member/{memberNumber}")
    public ResponseEntity<List<InsuranceClaim>> getClaimsByMemberNumber(
            @PathVariable String memberNumber
    ) {

        return ResponseEntity.ok(
                insuranceClaimService.getClaimsByMemberNumber(
                        memberNumber
                )
        );
    }

    /**
     * Submit claim
     */
    @PatchMapping("/{id}/submit")
    public ResponseEntity<InsuranceClaim> submitClaim(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                insuranceClaimService.submitClaim(id)
        );
    }

    /**
     * Approve claim
     */
    @PatchMapping("/{id}/approve")
    public ResponseEntity<InsuranceClaim> approveClaim(
            @PathVariable Long id,
            @RequestParam BigDecimal approvedAmount,
            @RequestParam BigDecimal copaymentAmount
    ) {

        return ResponseEntity.ok(
                insuranceClaimService.approveClaim(
                        id,
                        approvedAmount,
                        copaymentAmount
                )
        );
    }

    /**
     * Reject claim
     */
    @PatchMapping("/{id}/reject")
    public ResponseEntity<InsuranceClaim> rejectClaim(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                insuranceClaimService.rejectClaim(id)
        );
    }

    /**
     * Mark claim as paid
     */
    @PatchMapping("/{id}/paid")
    public ResponseEntity<InsuranceClaim> markAsPaid(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                insuranceClaimService.markAsPaid(id)
        );
    }
}