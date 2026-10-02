package com.clinic.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinic.api.entity.DispensingItem;

public interface DispensingItemRepository
        extends JpaRepository<DispensingItem, Long> {

    // =========================
    // ITEMS FOR ONE DISPENSING
    // =========================
    List<DispensingItem> findByDispensingIdOrderByIdAsc(
            Long dispensingId
    );

    // =========================
    // ITEMS FOR ONE BATCH
    // =========================
    List<DispensingItem> findByBatchIdOrderByIdDesc(
            Long batchId
    );

    // =========================
    // MEDICINE HISTORY
    // =========================
    List<DispensingItem> findByMedicineNameContainingIgnoreCaseOrderByIdDesc(
            String medicineName
    );

    // =========================
    // DISPENSING + BATCH
    // =========================
    List<DispensingItem> findByDispensingIdAndBatchId(
            Long dispensingId,
            Long batchId
    );

    // =========================
    // DISPENSED ITEMS FOR ONE PRESCRIPTION + MEDICINE
    // =========================
    List<DispensingItem>
    findByDispensing_Prescription_IdAndMedicineNameIgnoreCase(
            Long prescriptionId,
            String medicineName
    );
}