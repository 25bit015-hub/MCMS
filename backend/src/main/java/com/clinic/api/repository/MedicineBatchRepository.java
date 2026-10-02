package com.clinic.api.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinic.api.entity.MedicineBatch;
import com.clinic.api.entity.MedicineBatch.BatchStatus;

public interface MedicineBatchRepository
        extends JpaRepository<MedicineBatch, Long> {

    Optional<MedicineBatch> findByMedicineIdAndBatchNumber(
            Long medicineId,
            String batchNumber
    );

    boolean existsByMedicineIdAndBatchNumber(
            Long medicineId,
            String batchNumber
    );

    List<MedicineBatch> findByMedicineIdOrderByExpiryDateAsc(
            Long medicineId
    );

    List<MedicineBatch> findByStatusOrderByExpiryDateAsc(
            BatchStatus status
    );

    List<MedicineBatch> findByQuantityGreaterThanOrderByExpiryDateAsc(
            Integer quantity
    );

    List<MedicineBatch> findByMedicineIdAndQuantityGreaterThanOrderByExpiryDateAsc(
            Long medicineId,
            Integer quantity
    );

    List<MedicineBatch> findByExpiryDateBeforeOrderByExpiryDateAsc(
            LocalDate date
    );

    List<MedicineBatch> findByExpiryDateBetweenOrderByExpiryDateAsc(
            LocalDate startDate,
            LocalDate endDate
    );

    List<MedicineBatch> findByMedicineIdAndExpiryDateBeforeOrderByExpiryDateAsc(
            Long medicineId,
            LocalDate date
    );

    List<MedicineBatch> findByMedicineIdAndExpiryDateBetweenOrderByExpiryDateAsc(
            Long medicineId,
            LocalDate startDate,
            LocalDate endDate
    );

    List<MedicineBatch> findByMedicineNameContainingIgnoreCaseOrderByExpiryDateAsc(
            String name
    );
}