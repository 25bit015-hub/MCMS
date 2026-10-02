package com.clinic.api.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinic.api.entity.StockMovement;
import com.clinic.api.entity.StockMovement.MovementType;

public interface StockMovementRepository
        extends JpaRepository<StockMovement, Long> {

    List<StockMovement> findByMedicineIdOrderByMovementDateDesc(
            Long medicineId
    );

    List<StockMovement> findByBatchIdOrderByMovementDateDesc(
            Long batchId
    );

    List<StockMovement> findByMovementTypeOrderByMovementDateDesc(
            MovementType movementType
    );

    List<StockMovement> findByMovementDateBetweenOrderByMovementDateDesc(
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    List<StockMovement> findByMedicineIdAndMovementDateBetweenOrderByMovementDateDesc(
            Long medicineId,
            LocalDateTime startDate,
            LocalDateTime endDate
    );

    List<StockMovement> findByReferenceTypeAndReferenceId(
            String referenceType,
            Long referenceId
    );
}