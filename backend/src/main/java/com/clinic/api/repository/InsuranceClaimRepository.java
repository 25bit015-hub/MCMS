package com.clinic.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinic.api.entity.InsuranceClaim;

public interface InsuranceClaimRepository
        extends JpaRepository<InsuranceClaim, Long> {

    Optional<InsuranceClaim> findByClaimNumber(String claimNumber);

    boolean existsByClaimNumber(String claimNumber);

    List<InsuranceClaim> findByInvoiceId(Long invoiceId);

    List<InsuranceClaim> findByInsuranceProviderId(Long insuranceProviderId);

    List<InsuranceClaim> findByStatus(InsuranceClaim.ClaimStatus status);

    List<InsuranceClaim> findByMemberNumber(String memberNumber);
}