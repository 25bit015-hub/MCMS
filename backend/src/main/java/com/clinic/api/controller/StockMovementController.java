package com.clinic.api.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.clinic.api.entity.StockMovement;
import com.clinic.api.entity.StockMovement.MovementType;
import com.clinic.api.service.StockMovementService;

@RestController
@RequestMapping("/api/stock-movements")
@CrossOrigin(origins = "http://localhost:5173")
public class StockMovementController {

    private final StockMovementService stockMovementService;

    public StockMovementController(
            StockMovementService stockMovementService) {

        this.stockMovementService = stockMovementService;
    }

    // =========================
    // GET ALL MOVEMENTS
    // =========================
    @GetMapping
    public ResponseEntity<List<StockMovement>> getAllMovements() {

        return ResponseEntity.ok(
                stockMovementService.getAllMovements()
        );
    }

    // =========================
    // GET MOVEMENT BY ID
    // =========================
    @GetMapping("/{id}")
    public ResponseEntity<StockMovement> getMovementById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                stockMovementService.getMovementById(id)
        );
    }

    // =========================
    // GET BY MEDICINE
    // =========================
    @GetMapping("/medicine/{medicineId}")
    public ResponseEntity<List<StockMovement>> getByMedicine(
            @PathVariable Long medicineId) {

        return ResponseEntity.ok(
                stockMovementService
                        .getMovementsByMedicine(medicineId)
            );
    }

    // =========================
    // GET BY BATCH
    // =========================
    @GetMapping("/batch/{batchId}")
    public ResponseEntity<List<StockMovement>> getByBatch(
            @PathVariable Long batchId) {

        return ResponseEntity.ok(
                stockMovementService
                        .getMovementsByBatch(batchId)
            );
    }

    // =========================
    // GET BY MOVEMENT TYPE
    // =========================
    @GetMapping("/type/{movementType}")
    public ResponseEntity<List<StockMovement>> getByMovementType(
            @PathVariable MovementType movementType) {

        return ResponseEntity.ok(
                stockMovementService
                        .getMovementsByType(movementType)
            );
    }

    // =========================
    // GET BY DATE RANGE
    // =========================
    @GetMapping("/date-range")
    public ResponseEntity<List<StockMovement>> getBetween(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime startDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime endDate) {

        return ResponseEntity.ok(
                stockMovementService
                        .getMovementsBetween(
                                startDate,
                                endDate
                        )
            );
    }

    // =========================
    // GET MEDICINE + DATE RANGE
    // =========================
    @GetMapping("/medicine/{medicineId}/date-range")
    public ResponseEntity<List<StockMovement>>
    getMedicineMovementsBetween(

            @PathVariable Long medicineId,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime startDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime endDate) {

        return ResponseEntity.ok(
                stockMovementService
                        .getMedicineMovementsBetween(
                                medicineId,
                                startDate,
                                endDate
                        )
            );
    }

    // =========================
    // GET BY REFERENCE
    // =========================
    @GetMapping("/reference")
    public ResponseEntity<List<StockMovement>>
    getByReference(

            @RequestParam String referenceType,

            @RequestParam Long referenceId) {

        return ResponseEntity.ok(
                stockMovementService
                        .getMovementsByReference(
                                referenceType,
                                referenceId
                        )
            );
    }
}