package com.clinic.api.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.clinic.api.dto.PatientRequest;
import com.clinic.api.dto.PatientResponse;
import com.clinic.api.service.PatientService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = "http://localhost:5173")
public class PatientController {

    private final PatientService patientService;

    public PatientController(
            PatientService patientService
    ) {
        this.patientService = patientService;
    }

    /* =====================================================
       GET ALL PATIENTS
    ====================================================== */

    @GetMapping
    public ResponseEntity<List<PatientResponse>> getAllPatients() {

        return ResponseEntity.ok(
                patientService.getAllPatients()
        );
    }

    /* =====================================================
       GET POSSIBLE DUPLICATE PATIENTS
    ====================================================== */

    @GetMapping("/possible-duplicates")
    public ResponseEntity<List<PatientResponse>> findPossibleDuplicates(
            @RequestParam String firstName,
            @RequestParam String lastName,
            @RequestParam LocalDate dateOfBirth
    ) {

        return ResponseEntity.ok(
                patientService.findPossibleDuplicates(
                        firstName,
                        lastName,
                        dateOfBirth
                )
        );
    }

    /* =====================================================
       GET PATIENT BY PATIENT NUMBER
    ====================================================== */

    @GetMapping("/number")
    public ResponseEntity<PatientResponse> getByPatientNumber(
            @RequestParam String patientNumber
    ) {

        return ResponseEntity.ok(
                patientService.getByPatientNumber(
                        patientNumber
                )
        );
    }

    /* =====================================================
       GET PATIENT BY ID
    ====================================================== */

    @GetMapping("/{id}")
    public ResponseEntity<PatientResponse> getPatientById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                patientService.getPatientById(id)
        );
    }

    /* =====================================================
       CREATE PATIENT
    ====================================================== */

    @PostMapping
    public ResponseEntity<PatientResponse> createPatient(
            @Valid @RequestBody PatientRequest request
    ) {

        PatientResponse createdPatient =
                patientService.createPatient(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdPatient);
    }

    /* =====================================================
       UPDATE PATIENT
    ====================================================== */

    @PutMapping("/{id}")
    public ResponseEntity<PatientResponse> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody PatientRequest request
    ) {

        return ResponseEntity.ok(
                patientService.updatePatient(
                        id,
                        request
                )
        );
    }

    /* =====================================================
       DELETE PATIENT
    ====================================================== */

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(
            @PathVariable Long id
    ) {

        patientService.deletePatient(id);

        return ResponseEntity
                .noContent()
                .build();
    }
}