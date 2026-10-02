package com.clinic.api.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clinic.api.dto.VitalSignsRequest;
import com.clinic.api.dto.VitalSignsResponse;
import com.clinic.api.service.VitalSignsService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/vitals")
public class VitalSignsController {

    private final VitalSignsService vitalSignsService;

    public VitalSignsController(
            VitalSignsService vitalSignsService
    ) {
        this.vitalSignsService = vitalSignsService;
    }

    // ==========================================
    // CREATE VITALS FOR PATIENT + VISIT
    // ==========================================

    @PostMapping("/patient/{patientId}")
    public ResponseEntity<VitalSignsResponse> createVitals(
            @PathVariable Long patientId,
            @Valid @RequestBody VitalSignsRequest request
    ) {

        VitalSignsResponse response =
                vitalSignsService.createVitals(
                        patientId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // ==========================================
    // GET ALL VITALS FOR PATIENT
    // ==========================================

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<VitalSignsResponse>> getPatientVitals(
            @PathVariable Long patientId
    ) {

        return ResponseEntity.ok(
                vitalSignsService.getPatientVitals(
                        patientId
                )
        );
    }

    // ==========================================
    // GET LATEST VITALS FOR PATIENT
    // ==========================================

    @GetMapping("/patient/{patientId}/latest")
    public ResponseEntity<VitalSignsResponse> getLatestVitals(
            @PathVariable Long patientId
    ) {

        return ResponseEntity.ok(
                vitalSignsService.getLatestVitals(
                        patientId
                )
        );
    }

    // ==========================================
    // GET ALL VITALS FOR VISIT
    // ==========================================

    @GetMapping("/visit/{visitId}")
    public ResponseEntity<List<VitalSignsResponse>> getVisitVitals(
            @PathVariable Long visitId
    ) {

        return ResponseEntity.ok(
                vitalSignsService.getVisitVitals(
                        visitId
                )
        );
    }

    // ==========================================
    // GET LATEST VITALS FOR VISIT
    // ==========================================

    @GetMapping("/visit/{visitId}/latest")
    public ResponseEntity<VitalSignsResponse> getLatestVisitVitals(
            @PathVariable Long visitId
    ) {

        return ResponseEntity.ok(
                vitalSignsService.getLatestVisitVitals(
                        visitId
                )
        );
    }
}