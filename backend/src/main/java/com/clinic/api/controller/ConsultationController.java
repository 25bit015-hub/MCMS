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

import com.clinic.api.dto.ConsultationRequest;
import com.clinic.api.dto.ConsultationResponse;
import com.clinic.api.service.ConsultationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/consultations")
public class ConsultationController {

    private final ConsultationService consultationService;

    public ConsultationController(
            ConsultationService consultationService
    ) {
        this.consultationService =
                consultationService;
    }

    // ============================================================
    // CREATE CONSULTATION
    // ============================================================

    @PostMapping
    public ResponseEntity<ConsultationResponse> createConsultation(
            @Valid @RequestBody ConsultationRequest request
    ) {

        ConsultationResponse response =
                consultationService
                        .createConsultation(
                                request
                        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // ============================================================
    // GET ALL CONSULTATIONS FOR PATIENT
    // ============================================================

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<ConsultationResponse>>
    getPatientConsultations(
            @PathVariable Long patientId
    ) {

        return ResponseEntity.ok(
                consultationService
                        .getPatientConsultations(
                                patientId
                        )
        );
    }

    // ============================================================
    // GET LATEST CONSULTATION FOR PATIENT
    // ============================================================

    @GetMapping("/patient/{patientId}/latest")
    public ResponseEntity<ConsultationResponse>
    getLatestConsultation(
            @PathVariable Long patientId
    ) {

        return ResponseEntity.ok(
                consultationService
                        .getLatestConsultation(
                                patientId
                        )
        );
    }

    // ============================================================
    // GET ALL CONSULTATIONS FOR VISIT
    // ============================================================

    @GetMapping("/visit/{visitId}")
    public ResponseEntity<List<ConsultationResponse>>
    getVisitConsultations(
            @PathVariable Long visitId
    ) {

        return ResponseEntity.ok(
                consultationService
                        .getVisitConsultations(
                                visitId
                        )
        );
    }

    // ============================================================
    // GET LATEST CONSULTATION FOR VISIT
    // ============================================================

    @GetMapping("/visit/{visitId}/latest")
    public ResponseEntity<ConsultationResponse>
    getLatestVisitConsultation(
            @PathVariable Long visitId
    ) {

        return ResponseEntity.ok(
                consultationService
                        .getLatestVisitConsultation(
                                visitId
                        )
        );
    }
}