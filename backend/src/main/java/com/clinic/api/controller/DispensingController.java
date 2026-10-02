package com.clinic.api.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.clinic.api.entity.Dispensing;
import com.clinic.api.service.DispensingService;
import com.clinic.api.service.DispensingService.DispensingItemRequest;

@RestController
@RequestMapping("/api/dispensings")
@CrossOrigin(origins = "http://localhost:5173")
public class DispensingController {

    private final DispensingService dispensingService;

    public DispensingController(
            DispensingService dispensingService) {

        this.dispensingService = dispensingService;
    }

    // =========================
    // CREATE DISPENSING
    // =========================
    @PostMapping
    public ResponseEntity<Dispensing> createDispensing(
            @RequestParam Long patientId,
            @RequestParam Long visitId,
            @RequestParam Long prescriptionId,
            @RequestParam Dispensing.PaymentType paymentType,
            @RequestBody List<DispensingItemRequest> items,
            @RequestParam(required = false) String notes) {

        return ResponseEntity.ok(
                dispensingService.createDispensing(
                        patientId,
                        visitId,
                        prescriptionId,
                        paymentType,
                        items,
                        notes
                )
        );
    }

    // =========================
    // GET ALL
    // =========================
    @GetMapping
    public ResponseEntity<List<Dispensing>>
    getAllDispensings() {

        return ResponseEntity.ok(
                dispensingService.getAllDispensings()
        );
    }

    // =========================
    // GET BY ID
    // =========================
    @GetMapping("/{id}")
    public ResponseEntity<Dispensing>
    getDispensingById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                dispensingService.getDispensingById(id)
        );
    }

    // =========================
    // GET ITEMS
    // =========================
    @GetMapping("/{id}/items")
    public ResponseEntity<List<com.clinic.api.entity.DispensingItem>>
    getDispensingItems(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                dispensingService.getDispensingItems(id)
        );
    }

    // =========================
    // PATIENT HISTORY
    // =========================
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Dispensing>>
    getPatientHistory(
            @PathVariable Long patientId) {

        return ResponseEntity.ok(
                dispensingService.getPatientHistory(
                        patientId
                )
        );
    }

    // =========================
    // VISIT HISTORY
    // =========================
    @GetMapping("/visit/{visitId}")
    public ResponseEntity<List<Dispensing>>
    getVisitHistory(
            @PathVariable Long visitId) {

        return ResponseEntity.ok(
                dispensingService.getVisitHistory(
                        visitId
                )
        );
    }

    // =========================
    // PRESCRIPTION HISTORY
    // =========================
    @GetMapping("/prescription/{prescriptionId}")
    public ResponseEntity<List<Dispensing>>
    getPrescriptionHistory(
            @PathVariable Long prescriptionId) {

        return ResponseEntity.ok(
                dispensingService.getPrescriptionHistory(
                        prescriptionId
                )
        );
    }

    // =========================
    // DATE RANGE
    // DAILY / MONTHLY
    // =========================
    @GetMapping("/date-range")
    public ResponseEntity<List<Dispensing>>
    getBetween(

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME
            )
            LocalDateTime startDate,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME
            )
            LocalDateTime endDate) {

        return ResponseEntity.ok(
                dispensingService.getBetween(
                        startDate,
                        endDate
                )
        );
    }

    // =========================
    // PATIENT + DATE RANGE
    // =========================
    @GetMapping("/patient/{patientId}/date-range")
    public ResponseEntity<List<Dispensing>>
    getPatientBetween(

            @PathVariable Long patientId,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME
            )
            LocalDateTime startDate,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME
            )
            LocalDateTime endDate) {

        return ResponseEntity.ok(
                dispensingService.getPatientBetween(
                        patientId,
                        startDate,
                        endDate
                )
        );
    }

    // =========================
    // PAYMENT + DATE RANGE
    // =========================
    @GetMapping("/payment/{paymentType}/date-range")
    public ResponseEntity<List<Dispensing>>
    getByPaymentBetween(

            @PathVariable
            Dispensing.PaymentType paymentType,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME
            )
            LocalDateTime startDate,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME
            )
            LocalDateTime endDate) {

        return ResponseEntity.ok(
                dispensingService.getByPaymentBetween(
                        paymentType,
                        startDate,
                        endDate
                )
        );
    }

    // =========================
    // PATIENT + PAYMENT + DATE
    // =========================
    @GetMapping(
            "/patient/{patientId}/payment/{paymentType}/date-range"
    )
    public ResponseEntity<List<Dispensing>>
    getPatientPaymentBetween(

            @PathVariable Long patientId,

            @PathVariable
            Dispensing.PaymentType paymentType,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME
            )
            LocalDateTime startDate,

            @RequestParam
            @DateTimeFormat(
                    iso = DateTimeFormat.ISO.DATE_TIME
            )
            LocalDateTime endDate) {

        return ResponseEntity.ok(
                dispensingService.getPatientPaymentBetween(
                        patientId,
                        paymentType,
                        startDate,
                        endDate
                )
        );
    }
}