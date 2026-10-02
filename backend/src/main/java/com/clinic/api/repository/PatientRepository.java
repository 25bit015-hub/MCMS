package com.clinic.api.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.clinic.api.entity.Patient;

public interface PatientRepository
        extends JpaRepository<Patient, Long> {

    Optional<Patient> findByPatientNumber(String patientNumber);

    boolean existsByPatientNumber(String patientNumber);

    boolean existsByPhone(String phone);

    boolean existsByEmail(String email);

    @Query("""
        SELECT p
        FROM Patient p
        WHERE LOWER(p.firstName) = LOWER(:firstName)
          AND LOWER(p.lastName) = LOWER(:lastName)
          AND p.dateOfBirth = :dateOfBirth
    """)
    List<Patient> findPossibleDuplicates(
            @Param("firstName") String firstName,
            @Param("lastName") String lastName,
            @Param("dateOfBirth") LocalDate dateOfBirth
    );

    long countByRegisteredAtGreaterThanEqualAndRegisteredAtLessThan(
            LocalDateTime start,
            LocalDateTime end
    );
}