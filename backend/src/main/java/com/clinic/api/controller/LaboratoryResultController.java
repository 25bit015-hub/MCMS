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

import com.clinic.api.dto.LaboratoryResultRequest;
import com.clinic.api.dto.LaboratoryResultResponse;
import com.clinic.api.service.LaboratoryResultService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/laboratory-results")
public class LaboratoryResultController {

    private final LaboratoryResultService laboratoryResultService;

    public LaboratoryResultController(
            LaboratoryResultService laboratoryResultService) {

        this.laboratoryResultService =
                laboratoryResultService;
    }

    /*
     * =========================================================
     * CREATE LABORATORY RESULT
     * =========================================================
     */
    @PostMapping
    public ResponseEntity<LaboratoryResultResponse> createResult(
            @Valid @RequestBody LaboratoryResultRequest request) {

        LaboratoryResultResponse response =
                laboratoryResultService.createResult(
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /*
     * =========================================================
     * GET ALL PATIENT LABORATORY RESULTS
     * =========================================================
     *
     * Kept for Laboratory history.
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<LaboratoryResultResponse>> getPatientResults(
            @PathVariable Long patientId) {

        return ResponseEntity.ok(
                laboratoryResultService
                        .getPatientResults(patientId)
        );
    }

    /*
     * =========================================================
     * GET LATEST PATIENT LABORATORY RESULT
     * =========================================================
     */
    @GetMapping("/patient/{patientId}/latest")
    public ResponseEntity<LaboratoryResultResponse> getLatestPatientResult(
            @PathVariable Long patientId) {

        return ResponseEntity.ok(
                laboratoryResultService
                        .getLatestPatientResult(patientId)
        );
    }

    /*
     * =========================================================
     * GET LABORATORY RESULT BY QUEUE
     * =========================================================
     */
    @GetMapping("/queue/{queueId}")
    public ResponseEntity<LaboratoryResultResponse> getQueueResult(
            @PathVariable Long queueId) {

        return ResponseEntity.ok(
                laboratoryResultService
                        .getQueueResult(queueId)
        );
    }

    /*
     * =========================================================
     * GET ALL LABORATORY RESULTS FOR VISIT
     * =========================================================
     *
     * Example:
     *
     * GET /api/laboratory-results/visit/1
     */
    @GetMapping("/visit/{visitId}")
    public ResponseEntity<List<LaboratoryResultResponse>> getVisitResults(
            @PathVariable Long visitId) {

        return ResponseEntity.ok(
                laboratoryResultService
                        .getVisitResults(visitId)
        );
    }

    /*
     * =========================================================
     * GET LATEST LABORATORY RESULT FOR VISIT
     * =========================================================
     *
     * Example:
     *
     * GET /api/laboratory-results/visit/1/latest
     */
    @GetMapping("/visit/{visitId}/latest")
    public ResponseEntity<LaboratoryResultResponse> getLatestVisitResult(
            @PathVariable Long visitId) {

        return ResponseEntity.ok(
                laboratoryResultService
                        .getLatestVisitResult(visitId)
        );
    }
}