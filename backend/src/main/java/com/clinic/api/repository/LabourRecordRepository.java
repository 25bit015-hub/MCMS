package com.clinic.api.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinic.api.entity.LabourRecord;

public interface LabourRecordRepository extends JpaRepository<LabourRecord, Long> {

    List<LabourRecord> findByPregnancyIdOrderByAdmissionDateDesc(Long pregnancyId);

    List<LabourRecord> findByPregnancyIdAndRecordStatusOrderByAdmissionDateDesc(
            Long pregnancyId,
            String recordStatus
    );

    List<LabourRecord> findByAdmissionDate(LocalDate admissionDate);

    List<LabourRecord> findByAdmissionDateBetweenOrderByAdmissionDateDesc(
            LocalDate startDate,
            LocalDate endDate
    );

    long countByPregnancyId(Long pregnancyId);

    long countByPregnancyIdAndRecordStatus(
            Long pregnancyId,
            String recordStatus
    );

    boolean existsByPregnancyIdAndRecordStatus(
            Long pregnancyId,
            String recordStatus
    );
}