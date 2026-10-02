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

import com.clinic.api.entity.Medicine;
import com.clinic.api.service.MedicineService;

@RestController
@RequestMapping("/api/medicines")
@CrossOrigin(origins = "http://localhost:5173")
public class MedicineController {

    private final MedicineService medicineService;

    public MedicineController(MedicineService medicineService) {
        this.medicineService = medicineService;
    }

    // =========================
    // ADD MEDICINE
    // =========================
    @PostMapping
    public ResponseEntity<Medicine> createMedicine(
            @RequestBody Medicine medicine) {

        Medicine savedMedicine =
                medicineService.createMedicine(medicine);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedMedicine);
    }

    // =========================
    // GET ALL MEDICINES
    // =========================
    @GetMapping
    public ResponseEntity<List<Medicine>> getAllMedicines() {

        return ResponseEntity.ok(
                medicineService.getAllMedicines()
        );
    }

    // =========================
    // GET ACTIVE MEDICINES
    // =========================
    @GetMapping("/active")
    public ResponseEntity<List<Medicine>> getActiveMedicines() {

        return ResponseEntity.ok(
                medicineService.getActiveMedicines()
        );
    }

    // =========================
    // SEARCH BY NAME
    // =========================
    @GetMapping("/search")
    public ResponseEntity<List<Medicine>> searchMedicines(
            @RequestParam String name) {

        return ResponseEntity.ok(
                medicineService.searchByName(name)
        );
    }

    // =========================
    // GET MEDICINE BY ID
    // =========================
    @GetMapping("/{id}")
    public ResponseEntity<Medicine> getMedicineById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                medicineService.getMedicineById(id)
        );
    }

    // =========================
    // UPDATE MEDICINE
    // =========================
    @PutMapping("/{id}")
    public ResponseEntity<Medicine> updateMedicine(
            @PathVariable Long id,
            @RequestBody Medicine medicine) {

        return ResponseEntity.ok(
                medicineService.updateMedicine(
                        id,
                        medicine
                )
        );
    }

    // =========================
    // DROP / DEACTIVATE
    // =========================
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Medicine> deactivateMedicine(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                medicineService.deactivateMedicine(id)
        );
    }

    // =========================
    // ACTIVATE
    // =========================
    @PatchMapping("/{id}/activate")
    public ResponseEntity<Medicine> activateMedicine(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                medicineService.activateMedicine(id)
        );
    }
}