package com.clinic.api.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
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

import com.clinic.api.entity.Prescription;
import com.clinic.api.entity.Prescription.PaymentType;
import com.clinic.api.entity.Prescription.PrescriptionStatus;
import com.clinic.api.entity.PrescriptionItem;
import com.clinic.api.service.PrescriptionService;
import com.clinic.api.service.PrescriptionService.PrescriptionItemRequest;

@RestController
@RequestMapping("/api/prescriptions")
@CrossOrigin(origins = "http://localhost:5173")
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    public PrescriptionController(
            PrescriptionService prescriptionService) {
        this.prescriptionService = prescriptionService;
    }

    // ============================================================
    // CREATE PRESCRIPTION
    // ============================================================

    @PostMapping
    public ResponseEntity<Prescription> createPrescription(
            @RequestParam Long patientId,
            @RequestParam Long visitId,
            @RequestParam PaymentType paymentType,
            @RequestParam(required = false) String notes,
            @RequestBody List<PrescriptionItemRequest> items) {

        return ResponseEntity.ok(
                prescriptionService.createPrescription(
                        patientId,
                        visitId,
                        paymentType,
                        notes,
                        items
                )
        );
    }

    // ============================================================
    // GET ALL PRESCRIPTIONS
    // ============================================================

    @GetMapping
    public ResponseEntity<List<Prescription>> getAllPrescriptions() {
        return ResponseEntity.ok(
                prescriptionService.getAllPrescriptions()
        );
    }

    // ============================================================
    // GET PRESCRIPTION BY ID
    // ============================================================

    @GetMapping("/{id}")
    public ResponseEntity<Prescription> getPrescriptionById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                prescriptionService.getPrescriptionById(id)
        );
    }

    // ============================================================
    // GET PRESCRIPTION ITEMS
    // ============================================================

    @GetMapping("/{id}/items")
    public ResponseEntity<List<PrescriptionItem>>
    getPrescriptionItems(@PathVariable Long id) {

        return ResponseEntity.ok(
                prescriptionService.getPrescriptionItems(id)
        );
    }

    // ============================================================
    // PATIENT HISTORY
    // ============================================================

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Prescription>>
    getPatientHistory(@PathVariable Long patientId) {

        return ResponseEntity.ok(
                prescriptionService.getPatientHistory(patientId)
        );
    }

    // ============================================================
    // VISIT HISTORY
    // ============================================================

    @GetMapping("/visit/{visitId}")
    public ResponseEntity<List<Prescription>>
    getVisitHistory(@PathVariable Long visitId) {

        return ResponseEntity.ok(
                prescriptionService.getVisitHistory(visitId)
        );
    }

    // ============================================================
    // FILTER BY STATUS
    // ============================================================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Prescription>>
    getByStatus(@PathVariable PrescriptionStatus status) {

        return ResponseEntity.ok(
                prescriptionService.getByStatus(status)
        );
    }

    // ============================================================
    // FILTER BY PAYMENT TYPE
    // ============================================================

    @GetMapping("/payment/{paymentType}")
    public ResponseEntity<List<Prescription>>
    getByPaymentType(@PathVariable PaymentType paymentType) {

        return ResponseEntity.ok(
                prescriptionService.getByPaymentType(paymentType)
        );
    }

    // ============================================================
    // DATE RANGE
    // ============================================================

    @GetMapping("/date-range")
    public ResponseEntity<List<Prescription>>
    getBetween(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime startDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime endDate) {

        return ResponseEntity.ok(
                prescriptionService.getBetween(
                        startDate,
                        endDate
                )
        );
    }

    // ============================================================
    // PATIENT + DATE RANGE
    // ============================================================

    @GetMapping("/patient/{patientId}/date-range")
    public ResponseEntity<List<Prescription>>
    getPatientBetween(
            @PathVariable Long patientId,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime startDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime endDate) {

        return ResponseEntity.ok(
                prescriptionService.getPatientBetween(
                        patientId,
                        startDate,
                        endDate
                )
        );
    }

    // ============================================================
    // PAYMENT + DATE RANGE
    // ============================================================

    @GetMapping("/payment/{paymentType}/date-range")
    public ResponseEntity<List<Prescription>>
    getPaymentBetween(
            @PathVariable PaymentType paymentType,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime startDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime endDate) {

        return ResponseEntity.ok(
                prescriptionService.getPaymentBetween(
                        paymentType,
                        startDate,
                        endDate
                )
        );
    }

    // ============================================================
    // PATIENT + PAYMENT + DATE RANGE
    // ============================================================

    @GetMapping("/patient/{patientId}/payment/{paymentType}/date-range")
    public ResponseEntity<List<Prescription>>
    getPatientPaymentBetween(
            @PathVariable Long patientId,
            @PathVariable PaymentType paymentType,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime startDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime endDate) {

        return ResponseEntity.ok(
                prescriptionService.getPatientPaymentBetween(
                        patientId,
                        paymentType,
                        startDate,
                        endDate
                )
        );
    }

    // ============================================================
    // UPDATE STATUS
    // ============================================================

    @PatchMapping("/{id}/status")
    public ResponseEntity<Prescription>
    updateStatus(
            @PathVariable Long id,
            @RequestParam PrescriptionStatus status) {

        return ResponseEntity.ok(
                prescriptionService.updateStatus(
                        id,
                        status
                )
        );
    }
}