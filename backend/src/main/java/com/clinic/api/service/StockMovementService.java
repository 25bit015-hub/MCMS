package com.clinic.api.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clinic.api.entity.MedicineBatch;
import com.clinic.api.entity.StockMovement;
import com.clinic.api.entity.StockMovement.MovementType;
import com.clinic.api.repository.MedicineBatchRepository;
import com.clinic.api.repository.StockMovementRepository;

@Service
@Transactional
public class StockMovementService {

    private final StockMovementRepository stockMovementRepository;
    private final MedicineBatchRepository medicineBatchRepository;

    public StockMovementService(
            StockMovementRepository stockMovementRepository,
            MedicineBatchRepository medicineBatchRepository) {

        this.stockMovementRepository = stockMovementRepository;
        this.medicineBatchRepository = medicineBatchRepository;
    }

    public StockMovement createMovement(
            Long batchId,
            MovementType movementType,
            Integer quantity,
            String referenceType,
            Long referenceId,
            String notes) {

        MedicineBatch batch = medicineBatchRepository.findById(batchId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Medicine batch not found with id: " + batchId));

        if (movementType == null) {
            throw new IllegalArgumentException(
                    "Movement type is required");
        }

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than zero");
        }

        int currentQuantity = batch.getQuantity() == null
                ? 0
                : batch.getQuantity();

        int newQuantity = calculateNewQuantity(
                currentQuantity,
                quantity,
                movementType
        );

        batch.setQuantity(newQuantity);

        updateBatchStatus(batch);

        batch.setUpdatedAt(LocalDateTime.now());

        medicineBatchRepository.save(batch);

        StockMovement movement = new StockMovement();

        movement.setMedicine(batch.getMedicine());
        movement.setBatch(batch);
        movement.setMovementType(movementType);
        movement.setQuantity(quantity);
        movement.setReferenceType(referenceType);
        movement.setReferenceId(referenceId);
        movement.setNotes(notes);

        return stockMovementRepository.save(movement);
    }

    private int calculateNewQuantity(
            int currentQuantity,
            int quantity,
            MovementType movementType) {

        return switch (movementType) {

            case STOCK_IN, RETURNED ->
                    currentQuantity + quantity;

            case DISPENSED, DAMAGED, EXPIRED -> {

                if (quantity > currentQuantity) {
                    throw new IllegalArgumentException(
                            "Insufficient stock. Available: "
                                    + currentQuantity
                                    + ", requested: "
                                    + quantity
                    );
                }

                yield currentQuantity - quantity;
            }

            case ADJUSTMENT -> quantity;
        };
    }

    private void updateBatchStatus(MedicineBatch batch) {

        LocalDateTime now = LocalDateTime.now();

        if (batch.getExpiryDate() != null
                && batch.getExpiryDate().isBefore(now.toLocalDate())) {

            batch.setStatus(
                    MedicineBatch.BatchStatus.EXPIRED
            );

            return;
        }

        if (batch.getQuantity() != null
                && batch.getQuantity() == 0) {

            batch.setStatus(
                    MedicineBatch.BatchStatus.DEPLETED
            );

            return;
        }

        batch.setStatus(
                MedicineBatch.BatchStatus.ACTIVE
        );
    }

    @Transactional(readOnly = true)
    public List<StockMovement> getAllMovements() {

        return stockMovementRepository
                .findAll();
    }

    @Transactional(readOnly = true)
    public StockMovement getMovementById(Long id) {

        return stockMovementRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Stock movement not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<StockMovement> getMovementsByMedicine(
            Long medicineId) {

        return stockMovementRepository
                .findByMedicineIdOrderByMovementDateDesc(
                        medicineId
                );
    }

    @Transactional(readOnly = true)
    public List<StockMovement> getMovementsByBatch(
            Long batchId) {

        return stockMovementRepository
                .findByBatchIdOrderByMovementDateDesc(
                        batchId
                );
    }

    @Transactional(readOnly = true)
    public List<StockMovement> getMovementsByType(
            MovementType movementType) {

        return stockMovementRepository
                .findByMovementTypeOrderByMovementDateDesc(
                        movementType
                );
    }

    @Transactional(readOnly = true)
    public List<StockMovement> getMovementsBetween(
            LocalDateTime startDate,
            LocalDateTime endDate) {

        return stockMovementRepository
                .findByMovementDateBetweenOrderByMovementDateDesc(
                        startDate,
                        endDate
                );
    }

    @Transactional(readOnly = true)
    public List<StockMovement> getMedicineMovementsBetween(
            Long medicineId,
            LocalDateTime startDate,
            LocalDateTime endDate) {

        return stockMovementRepository
                .findByMedicineIdAndMovementDateBetweenOrderByMovementDateDesc(
                        medicineId,
                        startDate,
                        endDate
                );
    }

    @Transactional(readOnly = true)
    public List<StockMovement> getMovementsByReference(
            String referenceType,
            Long referenceId) {

        return stockMovementRepository
                .findByReferenceTypeAndReferenceId(
                        referenceType,
                        referenceId
                );
    }
}