package com.clinic.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinic.api.entity.InsuranceProvider;

public interface InsuranceProviderRepository
        extends JpaRepository<InsuranceProvider, Long> {

    Optional<InsuranceProvider> findByCode(String code);

    Optional<InsuranceProvider> findByName(String name);

    boolean existsByCode(String code);

    boolean existsByName(String name);

    List<InsuranceProvider> findByActiveTrue();

    List<InsuranceProvider> findByActive(boolean active);
}