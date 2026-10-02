package com.clinic.api.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clinic.api.dto.PatientRequest;
import com.clinic.api.dto.PatientResponse;
import com.clinic.api.entity.Patient;
import com.clinic.api.repository.PatientRepository;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    public PatientService(
            PatientRepository patientRepository
    ) {
        this.patientRepository = patientRepository;
    }

    // =====================================================
    // CREATE PATIENT
    // =====================================================

    @Transactional
    public PatientResponse createPatient(
            PatientRequest request
    ) {

        // -------------------------------------------------
        // HARD DUPLICATE CHECK: PHONE
        // -------------------------------------------------

        if (request.getPhone() != null
                && !request.getPhone().isBlank()
                && patientRepository.existsByPhone(
                        request.getPhone().trim()
                )) {

            throw new RuntimeException(
                    "Patient with this phone number already exists"
            );
        }

        // -------------------------------------------------
        // HARD DUPLICATE CHECK: EMAIL
        // -------------------------------------------------

        if (request.getEmail() != null
                && !request.getEmail().isBlank()
                && patientRepository.existsByEmail(
                        request.getEmail().trim()
                )) {

            throw new RuntimeException(
                    "Patient with this email already exists"
            );
        }

        // -------------------------------------------------
        // CREATE PATIENT
        // -------------------------------------------------

        Patient patient = new Patient();

        patient.setFirstName(
                request.getFirstName()
        );

        patient.setLastName(
                request.getLastName()
        );

        patient.setGender(
                request.getGender()
        );

        patient.setDateOfBirth(
                request.getDateOfBirth()
        );

        patient.setPhone(
                request.getPhone()
        );

        patient.setEmail(
                request.getEmail()
        );

        patient.setAddress(
                request.getAddress()
        );

        patient.setEmergencyContact(
                request.getEmergencyContact()
        );

        patient.setEmergencyPhone(
                request.getEmergencyPhone()
        );

        // -------------------------------------------------
        // SAVE PATIENT
        // ID WILL BE GENERATED HERE
        // -------------------------------------------------

        patient = patientRepository.save(patient);

        // -------------------------------------------------
        // GENERATE PATIENT NUMBER
        // Example: PAT-000014
        // -------------------------------------------------

        String patientNumber =
                String.format(
                        "PAT-%06d",
                        patient.getId()
                );

        patient.setPatientNumber(
                patientNumber
        );

        // -------------------------------------------------
        // SAVE AGAIN WITH PATIENT NUMBER
        // -------------------------------------------------

        patient = patientRepository.save(patient);

        // -------------------------------------------------
        // IMPORTANT
        //
        // DO NOT CREATE QUEUE HERE.
        //
        // Patient registration and clinic check-in
        // are separate processes.
        //
        // Queue will be created together with a Visit
        // during patient check-in.
        // -------------------------------------------------

        return toResponse(patient);
    }

    // =====================================================
    // GET ALL PATIENTS
    // =====================================================

    @Transactional(readOnly = true)
    public List<PatientResponse> getAllPatients() {

        return patientRepository
                .findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =====================================================
    // GET PATIENT BY ID
    // =====================================================

    @Transactional(readOnly = true)
    public PatientResponse getPatientById(
            Long id
    ) {

        Patient patient =
                patientRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Patient not found with id: "
                                                + id
                                )
                        );

        return toResponse(patient);
    }

    // =====================================================
    // GET PATIENT BY PATIENT NUMBER
    // =====================================================

    @Transactional(readOnly = true)
    public PatientResponse getByPatientNumber(
            String patientNumber
    ) {

        Patient patient =
                patientRepository
                        .findByPatientNumber(
                                patientNumber
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Patient not found with number: "
                                                + patientNumber
                                )
                        );

        return toResponse(patient);
    }

    // =====================================================
    // FIND POSSIBLE DUPLICATES
    // =====================================================

    @Transactional(readOnly = true)
    public List<PatientResponse> findPossibleDuplicates(
            String firstName,
            String lastName,
            LocalDate dateOfBirth
    ) {

        return patientRepository
                .findPossibleDuplicates(
                        firstName.trim(),
                        lastName.trim(),
                        dateOfBirth
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =====================================================
    // UPDATE PATIENT
    // =====================================================

    @Transactional
    public PatientResponse updatePatient(
            Long id,
            PatientRequest request
    ) {

        Patient patient =
                patientRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Patient not found with id: "
                                                + id
                                )
                        );

        // -------------------------------------------------
        // CHECK PHONE DUPLICATE
        // -------------------------------------------------

        if (request.getPhone() != null
                && !request.getPhone().isBlank()
                && !request.getPhone().equals(
                        patient.getPhone()
                )
                && patientRepository.existsByPhone(
                        request.getPhone().trim()
                )) {

            throw new RuntimeException(
                    "Another patient already uses this phone number"
            );
        }

        // -------------------------------------------------
        // CHECK EMAIL DUPLICATE
        // -------------------------------------------------

        if (request.getEmail() != null
                && !request.getEmail().isBlank()
                && !request.getEmail().equals(
                        patient.getEmail()
                )
                && patientRepository.existsByEmail(
                        request.getEmail().trim()
                )) {

            throw new RuntimeException(
                    "Another patient already uses this email"
            );
        }

        // -------------------------------------------------
        // UPDATE PATIENT
        // -------------------------------------------------

        patient.setFirstName(
                request.getFirstName()
        );

        patient.setLastName(
                request.getLastName()
        );

        patient.setGender(
                request.getGender()
        );

        patient.setDateOfBirth(
                request.getDateOfBirth()
        );

        patient.setPhone(
                request.getPhone()
        );

        patient.setEmail(
                request.getEmail()
        );

        patient.setAddress(
                request.getAddress()
        );

        patient.setEmergencyContact(
                request.getEmergencyContact()
        );

        patient.setEmergencyPhone(
                request.getEmergencyPhone()
        );

        patient =
                patientRepository.save(patient);

        return toResponse(patient);
    }

    // =====================================================
    // DELETE PATIENT
    // =====================================================

    @Transactional
    public void deletePatient(
            Long id
    ) {

        if (!patientRepository.existsById(id)) {

            throw new RuntimeException(
                    "Patient not found with id: "
                            + id
            );
        }

        patientRepository.deleteById(id);
    }

    // =====================================================
    // ENTITY -> RESPONSE
    // =====================================================

    private PatientResponse toResponse(
            Patient patient
    ) {

        PatientResponse response =
                new PatientResponse();

        response.setId(
                patient.getId()
        );

        response.setPatientNumber(
                patient.getPatientNumber()
        );

        response.setFirstName(
                patient.getFirstName()
        );

        response.setLastName(
                patient.getLastName()
        );

        response.setGender(
                patient.getGender()
        );

        response.setDateOfBirth(
                patient.getDateOfBirth()
        );

        response.setPhone(
                patient.getPhone()
        );

        response.setEmail(
                patient.getEmail()
        );

        response.setAddress(
                patient.getAddress()
        );

        response.setEmergencyContact(
                patient.getEmergencyContact()
        );

        response.setEmergencyPhone(
                patient.getEmergencyPhone()
        );

        response.setRegisteredAt(
                patient.getRegisteredAt()
        );

        return response;
    }
}