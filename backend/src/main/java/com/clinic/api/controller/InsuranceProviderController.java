package com.clinic.api.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clinic.api.entity.InsuranceProvider;
import com.clinic.api.service.InsuranceProviderService;

@RestController
@RequestMapping("/api/insurance-providers")
@CrossOrigin(origins = "http://localhost:5173")
public class InsuranceProviderController {

    private final InsuranceProviderService insuranceProviderService;

    public InsuranceProviderController(
            InsuranceProviderService insuranceProviderService
    ) {
        this.insuranceProviderService = insuranceProviderService;
    }

    /**
     * Create insurance provider
     */
    @PostMapping
    public ResponseEntity<InsuranceProvider> createProvider(
            @RequestBody InsuranceProvider provider
    ) {

        InsuranceProvider savedProvider =
                insuranceProviderService.createProvider(provider);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedProvider);
    }

    /**
     * Get all insurance providers
     */
    @GetMapping
    public ResponseEntity<List<InsuranceProvider>> getAllProviders() {

        return ResponseEntity.ok(
                insuranceProviderService.getAllProviders()
        );
    }

    /**
     * Get active insurance providers
     */
    @GetMapping("/active")
    public ResponseEntity<List<InsuranceProvider>> getActiveProviders() {

        return ResponseEntity.ok(
                insuranceProviderService.getActiveProviders()
        );
    }

    /**
     * Get provider by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<InsuranceProvider> getProviderById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                insuranceProviderService.getProviderById(id)
        );
    }

    /**
     * Get provider by code
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<InsuranceProvider> getProviderByCode(
            @PathVariable String code
    ) {

        return ResponseEntity.ok(
                insuranceProviderService.getProviderByCode(code)
        );
    }

    /**
     * Update provider
     */
    @PutMapping("/{id}")
    public ResponseEntity<InsuranceProvider> updateProvider(
            @PathVariable Long id,
            @RequestBody InsuranceProvider provider
    ) {

        return ResponseEntity.ok(
                insuranceProviderService.updateProvider(
                        id,
                        provider
                )
        );
    }

    /**
     * Activate provider
     */
    @PatchMapping("/{id}/activate")
    public ResponseEntity<InsuranceProvider> activateProvider(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                insuranceProviderService.activateProvider(id)
        );
    }

    /**
     * Deactivate provider
     */
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<InsuranceProvider> deactivateProvider(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                insuranceProviderService.deactivateProvider(id)
        );
    }

    /**
     * Delete provider
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProvider(
            @PathVariable Long id
    ) {

        insuranceProviderService.deleteProvider(id);

        return ResponseEntity.noContent().build();
    }
}