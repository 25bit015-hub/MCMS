package com.clinic.api.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.clinic.api.entity.NewbornRecord;

public interface NewbornRecordRepository extends JpaRepository<NewbornRecord, Long> {

    List<NewbornRecord> findByLabourRecordIdOrderByDateOfBirthDesc(
            Long labourRecordId
    );

    List<NewbornRecord> findByLabourRecordIdAndRecordStatusOrderByDateOfBirthDesc(
            Long labourRecordId,
            String recordStatus
    );

    List<NewbornRecord> findByDateOfBirth(LocalDate dateOfBirth);

    List<NewbornRecord> findByDateOfBirthBetweenOrderByDateOfBirthDesc(
            LocalDate startDate,
            LocalDate endDate
    );

    long countByLabourRecordId(Long labourRecordId);

    long countByLabourRecordIdAndRecordStatus(
            Long labourRecordId,
            String recordStatus
    );

    boolean existsByLabourRecordIdAndRecordStatus(
            Long labourRecordId,
            String recordStatus
    );
}