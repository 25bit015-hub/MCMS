package com.clinic.api.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.clinic.api.entity.MedicineBatch;
import com.clinic.api.service.MedicineBatchService;

@RestController
@RequestMapping("/api/medicine-batches")
@CrossOrigin(origins = "http://localhost:5173")
public class MedicineBatchController {

    private final MedicineBatchService medicineBatchService;

    public MedicineBatchController(
            MedicineBatchService medicineBatchService) {

        this.medicineBatchService = medicineBatchService;
    }

    // =========================
    // ADD BATCH / STOCK
    // =========================
    @PostMapping("/medicine/{medicineId}")
    public ResponseEntity<MedicineBatch> createBatch(
            @PathVariable Long medicineId,
            @RequestBody MedicineBatch batch) {

        MedicineBatch savedBatch =
                medicineBatchService.createBatch(
                        medicineId,
                        batch
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedBatch);
    }

    // =========================
    // GET ALL BATCHES
    // =========================
    @GetMapping
    public ResponseEntity<List<MedicineBatch>> getAllBatches() {

        return ResponseEntity.ok(
                medicineBatchService.getAllBatches()
        );
    }

    // =========================
    // GET BATCH BY ID
    // =========================
    @GetMapping("/{id}")
    public ResponseEntity<MedicineBatch> getBatchById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                medicineBatchService.getBatchById(id)
        );
    }

    // =========================
    // GET BATCHES FOR MEDICINE
    // =========================
    @GetMapping("/medicine/{medicineId}")
    public ResponseEntity<List<MedicineBatch>> getBatchesByMedicine(
            @PathVariable Long medicineId) {

        return ResponseEntity.ok(
                medicineBatchService.getBatchesByMedicine(
                        medicineId
                )
        );
    }

    // =========================
    // AVAILABLE STOCK
    // =========================
    @GetMapping("/available")
    public ResponseEntity<List<MedicineBatch>> getAvailableBatches() {

        return ResponseEntity.ok(
                medicineBatchService.getAvailableBatches()
        );
    }

    // =========================
    // EXPIRED
    // =========================
    @GetMapping("/expired")
    public ResponseEntity<List<MedicineBatch>> getExpiredBatches() {

        return ResponseEntity.ok(
                medicineBatchService.getExpiredBatches()
        );
    }

    // =========================
    // EXPIRING SOON
    // =========================
    @GetMapping("/expiring-soon")
    public ResponseEntity<List<MedicineBatch>> getExpiringSoonBatches(
            @RequestParam(defaultValue = "30") int days) {

        return ResponseEntity.ok(
                medicineBatchService.getExpiringSoonBatches(
                        days
                )
        );
    }

    // =========================
    // UPDATE BATCH
    // =========================
    @PutMapping("/{id}")
    public ResponseEntity<MedicineBatch> updateBatch(
            @PathVariable Long id,
            @RequestBody MedicineBatch batch) {

        return ResponseEntity.ok(
                medicineBatchService.updateBatch(
                        id,
                        batch
                )
        );
    }

    // =========================
    // REFRESH EXPIRED STATUS
    // =========================
    @PatchMapping("/refresh-expired")
    public ResponseEntity<Void> updateExpiredStatuses() {

        medicineBatchService.updateExpiredStatuses();

        return ResponseEntity.noContent().build();
    }
}