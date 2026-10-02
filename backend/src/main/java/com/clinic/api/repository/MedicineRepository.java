package com.clinic.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinic.api.entity.Medicine;
import com.clinic.api.entity.Medicine.MedicineStatus;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    Optional<Medicine> findByMedicineCode(String medicineCode);

    boolean existsByMedicineCode(String medicineCode);

    List<Medicine> findByStatusOrderByNameAsc(MedicineStatus status);

    List<Medicine> findByNameContainingIgnoreCaseOrderByNameAsc(String name);

    List<Medicine> findByGenericNameContainingIgnoreCaseOrderByNameAsc(String genericName);

    List<Medicine> findByCategoryIgnoreCaseOrderByNameAsc(String category);

    List<Medicine> findByStatusAndNameContainingIgnoreCaseOrderByNameAsc(
            MedicineStatus status,
            String name
    );
}