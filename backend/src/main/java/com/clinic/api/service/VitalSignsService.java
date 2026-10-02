package com.clinic.api.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clinic.api.dto.VitalSignsRequest;
import com.clinic.api.dto.VitalSignsResponse;
import com.clinic.api.entity.Patient;
import com.clinic.api.entity.Visit;
import com.clinic.api.entity.VitalSigns;
import com.clinic.api.repository.PatientRepository;
import com.clinic.api.repository.VisitRepository;
import com.clinic.api.repository.VitalSignsRepository;

@Service
public class VitalSignsService {

    private final VitalSignsRepository vitalSignsRepository;
    private final PatientRepository patientRepository;
    private final VisitRepository visitRepository;

    public VitalSignsService(
            VitalSignsRepository vitalSignsRepository,
            PatientRepository patientRepository,
            VisitRepository visitRepository
    ) {
        this.vitalSignsRepository = vitalSignsRepository;
        this.patientRepository = patientRepository;
        this.visitRepository = visitRepository;
    }

    // ==========================================
    // CREATE VITALS
    // ==========================================

    @Transactional
    public VitalSignsResponse createVitals(
            Long patientId,
            VitalSignsRequest request
    ) {

        Patient patient =
                patientRepository.findById(patientId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Patient not found with id: "
                                                + patientId
                                )
                        );

        Visit visit =
                visitRepository.findById(
                        request.getVisitId()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Visit not found with id: "
                                        + request.getVisitId()
                        )
                );

        /*
         * Hakikisha visit hii ni ya patient
         * tunayemuwekea vital signs.
         */
        if (!visit.getPatient().getId()
                .equals(patient.getId())) {

            throw new RuntimeException(
                    "Visit does not belong to this patient"
            );
        }

        VitalSigns vitals =
                new VitalSigns();

        vitals.setPatient(patient);

        vitals.setVisit(visit);

        vitals.setBloodPressure(
                request.getBloodPressure()
        );

        vitals.setPulseRate(
                request.getPulseRate()
        );

        vitals.setTemperature(
                request.getTemperature()
        );

        vitals.setRespiratoryRate(
                request.getRespiratoryRate()
        );

        vitals.setOxygenSaturation(
                request.getOxygenSaturation()
        );

        vitals.setWeight(
                request.getWeight()
        );

        vitals.setHeight(
                request.getHeight()
        );

        /*
         * BMI inahesabiwa automatically
         * kwa kutumia weight na height.
         */
        vitals.setBmi(
                calculateBmi(
                        request.getWeight(),
                        request.getHeight()
                )
        );

        vitals.setNotes(
                request.getNotes()
        );

        vitals =
                vitalSignsRepository.save(
                        vitals
                );

        return toResponse(vitals);
    }

    // ==========================================
    // GET ALL PATIENT VITALS
    // ==========================================

    @Transactional(readOnly = true)
    public List<VitalSignsResponse> getPatientVitals(
            Long patientId
    ) {

        if (!patientRepository.existsById(
                patientId
        )) {

            throw new RuntimeException(
                    "Patient not found with id: "
                            + patientId
            );
        }

        return vitalSignsRepository
                .findByPatientIdOrderByRecordedAtDesc(
                        patientId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ==========================================
    // GET VITALS BY VISIT
    // ==========================================

    @Transactional(readOnly = true)
    public List<VitalSignsResponse> getVisitVitals(
            Long visitId
    ) {

        Visit visit =
                visitRepository.findById(
                        visitId
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Visit not found with id: "
                                        + visitId
                        )
                );

        return vitalSignsRepository
                .findByVisitIdOrderByRecordedAtDesc(
                        visit.getId()
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // ==========================================
    // GET LATEST PATIENT VITALS
    // ==========================================

    @Transactional(readOnly = true)
    public VitalSignsResponse getLatestVitals(
            Long patientId
    ) {

        if (!patientRepository.existsById(
                patientId
        )) {

            throw new RuntimeException(
                    "Patient not found with id: "
                            + patientId
            );
        }

        /*
         * Patient anaweza kuwepo lakini bado
         * hajapimwa vital signs.
         *
         * Kwa hiyo tunarudisha null.
         */
        return vitalSignsRepository
                .findFirstByPatientIdOrderByRecordedAtDesc(
                        patientId
                )
                .map(this::toResponse)
                .orElse(null);
    }

    // ==========================================
    // GET LATEST VITALS FOR VISIT
    // ==========================================

    @Transactional(readOnly = true)
    public VitalSignsResponse getLatestVisitVitals(
            Long visitId
    ) {

        if (!visitRepository.existsById(
                visitId
        )) {

            throw new RuntimeException(
                    "Visit not found with id: "
                            + visitId
            );
        }

        return vitalSignsRepository
                .findFirstByVisitIdOrderByRecordedAtDesc(
                        visitId
                )
                .map(this::toResponse)
                .orElse(null);
    }

    // ==========================================
    // CALCULATE BMI
    // ==========================================

    private BigDecimal calculateBmi(
            BigDecimal weight,
            BigDecimal height
    ) {

        if (weight == null
                || height == null
                || height.compareTo(
                        BigDecimal.ZERO
                ) <= 0) {

            return null;
        }

        /*
         * Height in centimeters -> meters.
         */
        BigDecimal heightInMeters =
                height.divide(
                        BigDecimal.valueOf(100),
                        4,
                        RoundingMode.HALF_UP
                );

        BigDecimal heightSquared =
                heightInMeters.multiply(
                        heightInMeters
                );

        return weight.divide(
                heightSquared,
                2,
                RoundingMode.HALF_UP
        );
    }

    // ==========================================
    // CONVERT ENTITY -> RESPONSE
    // ==========================================

    private VitalSignsResponse toResponse(
            VitalSigns vitals
    ) {

        VitalSignsResponse response =
                new VitalSignsResponse();

        Patient patient =
                vitals.getPatient();

        Visit visit =
                vitals.getVisit();

        response.setId(
                vitals.getId()
        );

        // --------------------------------------
        // PATIENT INFORMATION
        // --------------------------------------

        if (patient != null) {

            response.setPatientId(
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
        }

        // --------------------------------------
        // VISIT INFORMATION
        // --------------------------------------

        if (visit != null) {

            response.setVisitId(
                    visit.getId()
            );

            response.setVisitNumber(
                    visit.getVisitNumber()
            );
        }

        // --------------------------------------
        // VITAL SIGNS
        // --------------------------------------

        response.setBloodPressure(
                vitals.getBloodPressure()
        );

        response.setPulseRate(
                vitals.getPulseRate()
        );

        response.setTemperature(
                vitals.getTemperature()
        );

        response.setRespiratoryRate(
                vitals.getRespiratoryRate()
        );

        response.setOxygenSaturation(
                vitals.getOxygenSaturation()
        );

        response.setWeight(
                vitals.getWeight()
        );

        response.setHeight(
                vitals.getHeight()
        );

        response.setBmi(
                vitals.getBmi()
        );

        response.setNotes(
                vitals.getNotes()
        );

        response.setRecordedAt(
                vitals.getRecordedAt()
        );

        return response;
    }
}