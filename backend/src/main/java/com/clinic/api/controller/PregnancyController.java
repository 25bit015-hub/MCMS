package com.clinic.api.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.clinic.api.dto.PregnancyRequest;
import com.clinic.api.dto.PregnancyResponse;
import com.clinic.api.service.PregnancyService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/maternity/pregnancies")
@CrossOrigin(origins = "http://localhost:5173")
public class PregnancyController {

    private final PregnancyService pregnancyService;

    public PregnancyController(
            PregnancyService pregnancyService
    ) {
        this.pregnancyService = pregnancyService;
    }

    // =====================================================
    // GET ALL
    // =====================================================

    @GetMapping
    public ResponseEntity<List<PregnancyResponse>>
    getAllPregnancies() {

        return ResponseEntity.ok(
                pregnancyService.getAllPregnancies()
        );
    }

    // =====================================================
    // GET ACTIVE
    // =====================================================

    @GetMapping("/active")
    public ResponseEntity<List<PregnancyResponse>>
    getActivePregnancies() {

        return ResponseEntity.ok(
                pregnancyService.getActivePregnancies()
        );
    }

    // =====================================================
    // GET BY PATIENT
    // =====================================================

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<PregnancyResponse>>
    getByPatient(
            @PathVariable Long patientId
    ) {

        return ResponseEntity.ok(
                pregnancyService.getByPatient(
                        patientId
                )
        );
    }

    // =====================================================
    // GET BY ID
    // =====================================================

    @GetMapping("/{id}")
    public ResponseEntity<PregnancyResponse>
    getPregnancyById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                pregnancyService.getPregnancyById(id)
        );
    }

    // =====================================================
    // CREATE
    // =====================================================

    @PostMapping
    public ResponseEntity<PregnancyResponse>
    createPregnancy(
            @Valid @RequestBody PregnancyRequest request
    ) {

        PregnancyResponse response =
                pregnancyService.createPregnancy(
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =====================================================
    // UPDATE
    // =====================================================

    @PutMapping("/{id}")
    public ResponseEntity<PregnancyResponse>
    updatePregnancy(
            @PathVariable Long id,
            @Valid @RequestBody PregnancyRequest request
    ) {

        return ResponseEntity.ok(
                pregnancyService.updatePregnancy(
                        id,
                        request
                )
        );
    }

    // =====================================================
    // DELETE
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    deletePregnancy(
            @PathVariable Long id
    ) {

        pregnancyService.deletePregnancy(id);

        return ResponseEntity
                .noContent()
                .build();
    }

    // =====================================================
    // DASHBOARD COUNTS
    // =====================================================

    @GetMapping("/dashboard/active-count")
    public ResponseEntity<Long>
    countActivePregnancies() {

        return ResponseEntity.ok(
                pregnancyService
                        .countActivePregnancies()
        );
    }

    @GetMapping("/dashboard/high-risk-count")
    public ResponseEntity<Long>
    countHighRiskPregnancies() {

        return ResponseEntity.ok(
                pregnancyService
                        .countHighRiskPregnancies()
        );
    }
    
    // =====================================================
    // BUSINESS RULE / DUPLICATE ERROR
    // =====================================================

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>>
    handleIllegalArgumentException(
            IllegalArgumentException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(
                        Map.of(
                                "message",
                                ex.getMessage()
                        )
                );
    }

}
