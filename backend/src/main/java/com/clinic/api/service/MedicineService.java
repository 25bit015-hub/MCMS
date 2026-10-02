package com.clinic.api.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clinic.api.entity.Medicine;
import com.clinic.api.entity.Medicine.MedicineStatus;
import com.clinic.api.repository.MedicineRepository;

@Service
@Transactional
public class MedicineService {

    private final MedicineRepository medicineRepository;

    public MedicineService(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }

    // =========================
    // ADD MEDICINE
    // =========================
    public Medicine createMedicine(Medicine medicine) {

        if (medicine.getMedicineCode() == null
                || medicine.getMedicineCode().isBlank()) {
            throw new IllegalArgumentException(
                    "Medicine code is required"
            );
        }

        if (medicine.getName() == null
                || medicine.getName().isBlank()) {
            throw new IllegalArgumentException(
                    "Medicine name is required"
            );
        }

        if (medicineRepository.existsByMedicineCode(
                medicine.getMedicineCode().trim())) {

            throw new IllegalArgumentException(
                    "Medicine code already exists"
            );
        }

        medicine.setMedicineCode(
                medicine.getMedicineCode().trim()
        );

        medicine.setName(
                medicine.getName().trim()
        );

        if (medicine.getStatus() == null) {
            medicine.setStatus(MedicineStatus.ACTIVE);
        }

        if (medicine.getMinimumStock() == null) {
            medicine.setMinimumStock(0);
        }

        return medicineRepository.save(medicine);
    }

    // =========================
    // GET MEDICINE BY ID
    // =========================
    @Transactional(readOnly = true)
    public Medicine getMedicineById(Long id) {

        return medicineRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Medicine not found with id: " + id
                        )
                );
    }

    // =========================
    // GET ALL MEDICINES
    // =========================
    @Transactional(readOnly = true)
    public List<Medicine> getAllMedicines() {

        return medicineRepository.findAll();
    }

    // =========================
    // GET ACTIVE MEDICINES
    // =========================
    @Transactional(readOnly = true)
    public List<Medicine> getActiveMedicines() {

        return medicineRepository
                .findByStatusOrderByNameAsc(
                        MedicineStatus.ACTIVE
                );
    }

    // =========================
    // SEARCH BY NAME
    // =========================
    @Transactional(readOnly = true)
    public List<Medicine> searchByName(String name) {

        if (name == null || name.isBlank()) {
            return getActiveMedicines();
        }

        return medicineRepository
                .findByNameContainingIgnoreCaseOrderByNameAsc(
                        name.trim()
                );
    }

    // =========================
    // UPDATE MEDICINE
    // =========================
    public Medicine updateMedicine(
            Long id,
            Medicine updatedMedicine
    ) {

        Medicine existingMedicine = getMedicineById(id);

        if (updatedMedicine.getName() == null
                || updatedMedicine.getName().isBlank()) {

            throw new IllegalArgumentException(
                    "Medicine name is required"
            );
        }

        /*
         * Medicine code should remain unique.
         * If a new code is supplied, make sure
         * it does not belong to another medicine.
         */
        if (updatedMedicine.getMedicineCode() != null
                && !updatedMedicine.getMedicineCode()
                    .isBlank()
                && !updatedMedicine.getMedicineCode()
                    .equals(existingMedicine.getMedicineCode())) {

            if (medicineRepository.existsByMedicineCode(
                    updatedMedicine.getMedicineCode().trim())) {

                throw new IllegalArgumentException(
                        "Medicine code already exists"
                );
            }

            existingMedicine.setMedicineCode(
                    updatedMedicine.getMedicineCode().trim()
            );
        }

        existingMedicine.setName(
                updatedMedicine.getName().trim()
        );

        existingMedicine.setGenericName(
                updatedMedicine.getGenericName()
        );

        existingMedicine.setCategory(
                updatedMedicine.getCategory()
        );

        existingMedicine.setStrength(
                updatedMedicine.getStrength()
        );

        existingMedicine.setDosageForm(
                updatedMedicine.getDosageForm()
        );

        existingMedicine.setManufacturer(
                updatedMedicine.getManufacturer()
        );

        existingMedicine.setMinimumStock(
                updatedMedicine.getMinimumStock() != null
                        ? updatedMedicine.getMinimumStock()
                        : 0
        );

        existingMedicine.setUnitPrice(
                updatedMedicine.getUnitPrice()
        );

        if (updatedMedicine.getStatus() != null) {
            existingMedicine.setStatus(
                    updatedMedicine.getStatus()
            );
        }

        existingMedicine.setUpdatedAt(
                java.time.LocalDateTime.now()
        );

        return medicineRepository.save(existingMedicine);
    }

    // =========================
    // DROP / DEACTIVATE
    // =========================
    public Medicine deactivateMedicine(Long id) {

        Medicine medicine = getMedicineById(id);

        medicine.setStatus(MedicineStatus.INACTIVE);

        medicine.setUpdatedAt(
                java.time.LocalDateTime.now()
        );

        return medicineRepository.save(medicine);
    }

    // =========================
    // ACTIVATE AGAIN
    // =========================
    public Medicine activateMedicine(Long id) {

        Medicine medicine = getMedicineById(id);

        medicine.setStatus(MedicineStatus.ACTIVE);

        medicine.setUpdatedAt(
                java.time.LocalDateTime.now()
        );

        return medicineRepository.save(medicine);
    }
}