package com.clinic.api.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clinic.api.entity.InsuranceProvider;
import com.clinic.api.repository.InsuranceProviderRepository;

@Service
public class InsuranceProviderService {

    private final InsuranceProviderRepository insuranceProviderRepository;

    public InsuranceProviderService(
            InsuranceProviderRepository insuranceProviderRepository
    ) {
        this.insuranceProviderRepository = insuranceProviderRepository;
    }

    /**
     * Create insurance provider
     */
    @Transactional
    public InsuranceProvider createProvider(
            InsuranceProvider provider
    ) {

        if (provider.getName() == null ||
                provider.getName().trim().isEmpty()) {

            throw new RuntimeException(
                    "Insurance provider name is required"
            );
        }

        if (provider.getCode() == null ||
                provider.getCode().trim().isEmpty()) {

            throw new RuntimeException(
                    "Insurance provider code is required"
            );
        }

        String name = provider.getName().trim();
        String code = provider.getCode().trim().toUpperCase();

        // Prevent duplicate name
        if (insuranceProviderRepository.existsByName(name)) {

            throw new RuntimeException(
                    "Insurance provider with this name already exists"
            );
        }

        // Prevent duplicate code
        if (insuranceProviderRepository.existsByCode(code)) {

            throw new RuntimeException(
                    "Insurance provider with this code already exists"
            );
        }

        provider.setName(name);
        provider.setCode(code);

        if (!provider.isActive()) {
            provider.setActive(true);
        }

        return insuranceProviderRepository.save(provider);
    }

    /**
     * Get provider by ID
     */
    public InsuranceProvider getProviderById(Long id) {

        return insuranceProviderRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Insurance provider not found"
                        )
                );
    }

    /**
     * Get provider by code
     */
    public InsuranceProvider getProviderByCode(String code) {

        return insuranceProviderRepository.findByCode(
                        code.trim().toUpperCase()
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Insurance provider not found"
                        )
                );
    }

    /**
     * Get all providers
     */
    public List<InsuranceProvider> getAllProviders() {

        return insuranceProviderRepository.findAll();
    }

    /**
     * Get active providers
     */
    public List<InsuranceProvider> getActiveProviders() {

        return insuranceProviderRepository.findByActiveTrue();
    }

    /**
     * Update provider
     */
    @Transactional
    public InsuranceProvider updateProvider(
            Long id,
            InsuranceProvider updatedProvider
    ) {

        InsuranceProvider existingProvider =
                getProviderById(id);

        if (updatedProvider.getName() == null ||
                updatedProvider.getName().trim().isEmpty()) {

            throw new RuntimeException(
                    "Insurance provider name is required"
            );
        }

        if (updatedProvider.getCode() == null ||
                updatedProvider.getCode().trim().isEmpty()) {

            throw new RuntimeException(
                    "Insurance provider code is required"
            );
        }

        String name = updatedProvider.getName().trim();
        String code = updatedProvider.getCode().trim().toUpperCase();

        // Check duplicate name
        insuranceProviderRepository.findByName(name)
                .ifPresent(provider -> {

                    if (!provider.getId().equals(id)) {

                        throw new RuntimeException(
                                "Insurance provider with this name already exists"
                        );
                    }
                });

        // Check duplicate code
        insuranceProviderRepository.findByCode(code)
                .ifPresent(provider -> {

                    if (!provider.getId().equals(id)) {

                        throw new RuntimeException(
                                "Insurance provider with this code already exists"
                        );
                    }
                });

        existingProvider.setName(name);
        existingProvider.setCode(code);
        existingProvider.setPhone(
                updatedProvider.getPhone()
        );
        existingProvider.setEmail(
                updatedProvider.getEmail()
        );
        existingProvider.setAddress(
                updatedProvider.getAddress()
        );
        existingProvider.setActive(
                updatedProvider.isActive()
        );

        return insuranceProviderRepository.save(
                existingProvider
        );
    }

    /**
     * Activate provider
     */
    @Transactional
    public InsuranceProvider activateProvider(Long id) {

        InsuranceProvider provider =
                getProviderById(id);

        provider.setActive(true);

        return insuranceProviderRepository.save(provider);
    }

    /**
     * Deactivate provider
     */
    @Transactional
    public InsuranceProvider deactivateProvider(Long id) {

        InsuranceProvider provider =
                getProviderById(id);

        provider.setActive(false);

        return insuranceProviderRepository.save(provider);
    }

    /**
     * Delete provider
     */
    @Transactional
    public void deleteProvider(Long id) {

        InsuranceProvider provider =
                getProviderById(id);

        insuranceProviderRepository.delete(provider);
    }
}