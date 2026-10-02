package com.clinic.api.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clinic.api.entity.Medicine;
import com.clinic.api.entity.MedicineBatch;
import com.clinic.api.entity.MedicineBatch.BatchStatus;
import com.clinic.api.entity.StockMovement.MovementType;
import com.clinic.api.repository.MedicineBatchRepository;
import com.clinic.api.repository.MedicineRepository;

@Service
@Transactional
public class MedicineBatchService {

    private final MedicineBatchRepository medicineBatchRepository;
    private final MedicineRepository medicineRepository;
    private final StockMovementService stockMovementService;

    public MedicineBatchService(
            MedicineBatchRepository medicineBatchRepository,
            MedicineRepository medicineRepository,
            StockMovementService stockMovementService) {

        this.medicineBatchRepository = medicineBatchRepository;
        this.medicineRepository = medicineRepository;
        this.stockMovementService = stockMovementService;
    }

    // =========================
    // CREATE NEW BATCH + INITIAL STOCK
    // =========================
    public MedicineBatch createBatch(
            Long medicineId,
            MedicineBatch batch) {

        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Medicine not found with id: " + medicineId
                        )
                );

        if (medicine.getStatus()
                == Medicine.MedicineStatus.INACTIVE) {

            throw new IllegalArgumentException(
                    "Cannot add stock to an inactive medicine"
            );
        }

        if (batch.getBatchNumber() == null
                || batch.getBatchNumber().isBlank()) {

            throw new IllegalArgumentException(
                    "Batch number is required"
            );
        }

        if (batch.getQuantity() == null
                || batch.getQuantity() < 0) {

            throw new IllegalArgumentException(
                    "Quantity cannot be negative"
            );
        }

        if (batch.getExpiryDate() == null) {

            throw new IllegalArgumentException(
                    "Expiry date is required"
            );
        }

        if (batch.getExpiryDate()
                .isBefore(LocalDate.now())) {

            throw new IllegalArgumentException(
                    "Cannot add an already expired batch"
            );
        }

        String batchNumber =
                batch.getBatchNumber().trim();

        if (medicineBatchRepository
                .existsByMedicineIdAndBatchNumber(
                        medicineId,
                        batchNumber)) {

            throw new IllegalArgumentException(
                    "This batch number already exists for this medicine"
            );
        }

        /*
         * IMPORTANT:
         *
         * The initial quantity will NOT be saved directly.
         * StockMovementService will create the STOCK_IN movement
         * and update the quantity.
         */
        Integer initialQuantity = batch.getQuantity();

        batch.setMedicine(medicine);
        batch.setBatchNumber(batchNumber);

        // Start from zero.
        batch.setQuantity(0);

        batch.setStatus(BatchStatus.ACTIVE);

        MedicineBatch savedBatch =
                medicineBatchRepository.save(batch);

        /*
         * Record the initial stock as a STOCK_IN movement.
         *
         * This keeps stock quantity changes in one place:
         * StockMovementService.
         */
        if (initialQuantity > 0) {

            stockMovementService.createMovement(
                    savedBatch.getId(),
                    MovementType.STOCK_IN,
                    initialQuantity,
                    "INITIAL_STOCK",
                    savedBatch.getId(),
                    "Initial stock received when batch was created"
            );
        }

        return savedBatch;
    }

    // =========================
    // GET BATCH BY ID
    // =========================
    @Transactional(readOnly = true)
    public MedicineBatch getBatchById(Long id) {

        return medicineBatchRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Medicine batch not found with id: " + id
                        )
                );
    }

    // =========================
    // GET ALL BATCHES
    // =========================
    @Transactional(readOnly = true)
    public List<MedicineBatch> getAllBatches() {

        return medicineBatchRepository.findAll();
    }

    // =========================
    // GET BATCHES FOR MEDICINE
    // =========================
    @Transactional(readOnly = true)
    public List<MedicineBatch> getBatchesByMedicine(
            Long medicineId) {

        medicineRepository.findById(medicineId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Medicine not found with id: " + medicineId
                        )
                );

        return medicineBatchRepository
                .findByMedicineIdOrderByExpiryDateAsc(
                        medicineId
                );
    }

    // =========================
    // AVAILABLE STOCK BATCHES
    // =========================
    @Transactional(readOnly = true)
    public List<MedicineBatch> getAvailableBatches() {

        return medicineBatchRepository
                .findByQuantityGreaterThanOrderByExpiryDateAsc(0);
    }

    // =========================
    // EXPIRED BATCHES
    // =========================
    @Transactional(readOnly = true)
    public List<MedicineBatch> getExpiredBatches() {

        return medicineBatchRepository
                .findByExpiryDateBeforeOrderByExpiryDateAsc(
                        LocalDate.now()
                );
    }

    // =========================
    // EXPIRING SOON
    // =========================
    @Transactional(readOnly = true)
    public List<MedicineBatch> getExpiringSoonBatches(
            int days) {

        if (days < 0) {
            throw new IllegalArgumentException(
                    "Days cannot be negative"
            );
        }

        LocalDate today = LocalDate.now();

        LocalDate endDate =
                today.plusDays(days);

        return medicineBatchRepository
                .findByExpiryDateBetweenOrderByExpiryDateAsc(
                        today,
                        endDate
                );
    }

    // =========================
    // UPDATE BATCH INFORMATION
    // =========================
    public MedicineBatch updateBatch(
            Long id,
            MedicineBatch updatedBatch) {

        MedicineBatch existingBatch =
                getBatchById(id);

        /*
         * Quantity is intentionally NOT updated here.
         *
         * Stock quantity must go through StockMovementService.
         */
        if (updatedBatch.getQuantity() != null) {

            throw new IllegalArgumentException(
                    "Batch quantity cannot be updated directly. "
                    + "Use StockMovementService for stock changes."
            );
        }

        if (updatedBatch.getExpiryDate() != null) {

            if (updatedBatch.getExpiryDate()
                    .isBefore(LocalDate.now())) {

                throw new IllegalArgumentException(
                        "Expiry date cannot be in the past"
                );
            }

            existingBatch.setExpiryDate(
                    updatedBatch.getExpiryDate()
            );
        }

        if (updatedBatch.getSupplier() != null) {

            existingBatch.setSupplier(
                    updatedBatch.getSupplier()
            );
        }

        if (updatedBatch.getPurchasePrice() != null) {

            existingBatch.setPurchasePrice(
                    updatedBatch.getPurchasePrice()
            );
        }

        /*
         * Status is based on the current batch state.
         * Quantity itself is not changed here.
         */
        updateBatchStatus(existingBatch);

        existingBatch.setUpdatedAt(
                LocalDateTime.now()
        );

        return medicineBatchRepository.save(
                existingBatch
        );
    }

    // =========================
    // UPDATE EXPIRED STATUSES
    // =========================
    public void updateExpiredStatuses() {

        List<MedicineBatch> expiredBatches =
                medicineBatchRepository
                        .findByExpiryDateBeforeOrderByExpiryDateAsc(
                                LocalDate.now()
                        );

        for (MedicineBatch batch : expiredBatches) {

            if (batch.getStatus()
                    != BatchStatus.EXPIRED) {

                batch.setStatus(
                        BatchStatus.EXPIRED
                );

                batch.setUpdatedAt(
                        LocalDateTime.now()
                );
            }
        }

        medicineBatchRepository.saveAll(
                expiredBatches
        );
    }

    // =========================
    // UPDATE BATCH STATUS
    // =========================
    private void updateBatchStatus(
            MedicineBatch batch) {

        if (batch.getExpiryDate() != null
                && batch.getExpiryDate()
                        .isBefore(LocalDate.now())) {

            batch.setStatus(
                    BatchStatus.EXPIRED
            );

            return;
        }

        if (batch.getQuantity() != null
                && batch.getQuantity() == 0) {

            batch.setStatus(
                    BatchStatus.DEPLETED
            );

            return;
        }

        batch.setStatus(
                BatchStatus.ACTIVE
        );
    }
}