package com.clinic.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinic.api.entity.PrescriptionItem;

public interface PrescriptionItemRepository
        extends JpaRepository<PrescriptionItem, Long> {

    List<PrescriptionItem> findByPrescriptionIdOrderByIdAsc(
            Long prescriptionId
    );

    List<PrescriptionItem> findByMedicineNameContainingIgnoreCaseOrderByIdDesc(
            String medicineName
    );

    List<PrescriptionItem> findByPrescriptionIdAndMedicineNameContainingIgnoreCase(
            Long prescriptionId,
            String medicineName
    );
}