package com.clinic.api.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clinic.api.dto.ANCVisitRequest;
import com.clinic.api.dto.ANCVisitResponse;
import com.clinic.api.entity.ANCVisit;
import com.clinic.api.entity.Patient;
import com.clinic.api.entity.Pregnancy;
import com.clinic.api.repository.ANCVisitRepository;
import com.clinic.api.repository.PregnancyRepository;

@Service
@Transactional
public class ANCVisitService {

    private final ANCVisitRepository ancVisitRepository;
    private final PregnancyRepository pregnancyRepository;

    public ANCVisitService(
            ANCVisitRepository ancVisitRepository,
            PregnancyRepository pregnancyRepository
    ) {
        this.ancVisitRepository = ancVisitRepository;
        this.pregnancyRepository = pregnancyRepository;
    }

    // ============================================================
    // GET ALL VISITS
    // ============================================================

    @Transactional(readOnly = true)
    public List<ANCVisitResponse> getAllVisits() {

        return ancVisitRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ============================================================
    // GET VISIT BY ID
    // ============================================================

    @Transactional(readOnly = true)
    public ANCVisitResponse getVisitById(Long id) {

        ANCVisit visit = ancVisitRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "ANC Visit not found with id: " + id
                        )
                );

        return toResponse(visit);
    }

    // ============================================================
    // GET VISITS BY PREGNANCY
    // ============================================================

    @Transactional(readOnly = true)
    public List<ANCVisitResponse> getVisitsByPregnancy(Long pregnancyId) {

        pregnancyRepository.findById(pregnancyId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Pregnancy not found with id: "
                                        + pregnancyId
                        )
                );

        return ancVisitRepository
                .findByPregnancyIdOrderByVisitDateDesc(pregnancyId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ============================================================
    // GET ACTIVE VISITS BY PREGNANCY
    // ============================================================

    @Transactional(readOnly = true)
    public List<ANCVisitResponse> getActiveVisitsByPregnancy(
            Long pregnancyId
    ) {

        pregnancyRepository.findById(pregnancyId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Pregnancy not found with id: "
                                        + pregnancyId
                        )
                );

        return ancVisitRepository
                .findByPregnancyIdAndRecordStatusOrderByVisitDateDesc(
                        pregnancyId,
                        "ACTIVE"
                )
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ============================================================
    // GET VISITS BY DATE
    // ============================================================

    @Transactional(readOnly = true)
    public List<ANCVisitResponse> getVisitsByDate(
            LocalDate visitDate
    ) {

        return ancVisitRepository
                .findByVisitDate(visitDate)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ============================================================
    // GET VISITS BETWEEN DATES
    // ============================================================

    @Transactional(readOnly = true)
    public List<ANCVisitResponse> getVisitsBetweenDates(
            LocalDate startDate,
            LocalDate endDate
    ) {

        return ancVisitRepository
                .findByVisitDateBetweenOrderByVisitDateDesc(
                        startDate,
                        endDate
                )
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ============================================================
    // CREATE ANC VISIT
    // ============================================================

    public ANCVisitResponse createVisit(ANCVisitRequest request) {

        // --------------------------------------------------------
        // Validate pregnancy ID
        // --------------------------------------------------------

        if (request.getPregnancyId() == null) {

            throw new IllegalArgumentException(
                    "Pregnancy ID is required."
            );
        }

        // --------------------------------------------------------
        // Validate pregnancy
        // --------------------------------------------------------

        Pregnancy pregnancy = pregnancyRepository.findById(
                request.getPregnancyId()
        ).orElseThrow(() ->
                new RuntimeException(
                        "Pregnancy not found with id: "
                                + request.getPregnancyId()
                )
        );

        // --------------------------------------------------------
        // IMPORTANT:
        // New ANC visits can only be created for an ACTIVE
        // pregnancy.
        //
        // An ARCHIVED pregnancy is historical and must not receive
        // new clinical visits.
        // --------------------------------------------------------

        if (!"ACTIVE".equalsIgnoreCase(
                pregnancy.getStatus()
        )) {

            throw new IllegalArgumentException(
                    "Cannot create an ANC visit for an archived or inactive pregnancy."
            );
        }

        // --------------------------------------------------------
        // Validate required visit information
        // --------------------------------------------------------

        if (request.getVisitDate() == null) {

            throw new IllegalArgumentException(
                    "ANC visit date is required."
            );
        }

        if (request.getVisitType() == null
                || request.getVisitType().isBlank()) {

            throw new IllegalArgumentException(
                    "ANC visit type is required."
            );
        }

        String visitType = normalizeVisitType(
                request.getVisitType()
        );

        // --------------------------------------------------------
        // Prevent duplicate ACTIVE ANC visit
        // --------------------------------------------------------

        boolean duplicateExists =
                ancVisitRepository
                        .existsByPregnancyIdAndVisitDateAndVisitTypeAndRecordStatus(
                                request.getPregnancyId(),
                                request.getVisitDate(),
                                visitType,
                                "ACTIVE"
                        );

        if (duplicateExists) {

            throw new IllegalArgumentException(
                    "ANC visit already exists for this pregnancy, date and visit type."
            );
        }

        ANCVisit visit = new ANCVisit();

        // --------------------------------------------------------
        // Relationship
        // --------------------------------------------------------

        visit.setPregnancy(pregnancy);

        // --------------------------------------------------------
        // Visit information
        // --------------------------------------------------------

        visit.setVisitDate(request.getVisitDate());
        visit.setVisitType(visitType);

        visit.setGestationalWeeks(
                request.getGestationalWeeks()
        );

        visit.setGestationalDays(
                request.getGestationalDays()
        );

        // --------------------------------------------------------
        // Maternal assessment
        // --------------------------------------------------------

        visit.setWeight(request.getWeight());

        visit.setBloodPressureSystolic(
                request.getBloodPressureSystolic()
        );

        visit.setBloodPressureDiastolic(
                request.getBloodPressureDiastolic()
        );

        visit.setPulse(request.getPulse());
        visit.setTemperature(request.getTemperature());
        visit.setRespiratoryRate(
                request.getRespiratoryRate()
        );

        visit.setGeneralCondition(
                request.getGeneralCondition()
        );

        visit.setOedema(request.getOedema());
        visit.setPallor(request.getPallor());
        visit.setSymptoms(request.getSymptoms());

        // --------------------------------------------------------
        // Pregnancy / fetal assessment
        // --------------------------------------------------------

        visit.setFundalHeight(
                request.getFundalHeight()
        );

        visit.setFetalHeartRate(
                request.getFetalHeartRate()
        );

        visit.setFetalMovement(
                request.getFetalMovement()
        );

        visit.setPresentation(
                request.getPresentation()
        );

        visit.setLie(request.getLie());
        visit.setPosition(request.getPosition());

        // --------------------------------------------------------
        // Investigations
        // --------------------------------------------------------

        visit.setHaemoglobin(
                request.getHaemoglobin()
        );

        visit.setBloodGroup(
                request.getBloodGroup()
        );

        visit.setRhesus(
                request.getRhesus()
        );

        visit.setUrinalysis(
                request.getUrinalysis()
        );

        visit.setBloodSugar(
                request.getBloodSugar()
        );

        visit.setHivResult(
                request.getHivResult()
        );

        visit.setSyphilisResult(
                request.getSyphilisResult()
        );

        visit.setHepatitisBResult(
                request.getHepatitisBResult()
        );

        visit.setUltrasound(
                request.getUltrasound()
        );

        visit.setOtherInvestigations(
                request.getOtherInvestigations()
        );

        // --------------------------------------------------------
        // Clinical management
        // --------------------------------------------------------

        visit.setAssessment(
                request.getAssessment()
        );

        visit.setRiskAssessment(
                request.getRiskAssessment()
        );

        visit.setDiagnosis(
                request.getDiagnosis()
        );

        visit.setTreatment(
                request.getTreatment()
        );

        visit.setMedication(
                request.getMedication()
        );

        visit.setAdvice(
                request.getAdvice()
        );

        visit.setHealthEducation(
                request.getHealthEducation()
        );

        visit.setReferral(
                request.getReferral()
        );

        // --------------------------------------------------------
        // Follow-up
        // --------------------------------------------------------

        visit.setNextVisitDate(
                request.getNextVisitDate()
        );

        visit.setNotes(
                request.getNotes()
        );

        // --------------------------------------------------------
        // Record control
        // --------------------------------------------------------
        //
        // New ANC visits are always ACTIVE.
        //
        // We do not allow a client/frontend to create an arbitrary
        // ARCHIVED record directly. Archiving must happen through
        // archiveVisit().
        // --------------------------------------------------------

        visit.setRecordStatus("ACTIVE");
        visit.setArchiveReason(null);

        // --------------------------------------------------------
        // IMPORTANT:
        //
        // Save creates a NEW ANC visit record.
        // It does not modify previous visits.
        // --------------------------------------------------------

        ANCVisit savedVisit =
                ancVisitRepository.save(visit);

        return toResponse(savedVisit);
    }

    // ============================================================
    // UPDATE ANC VISIT
    // ============================================================

    public ANCVisitResponse updateVisit(
            Long id,
            ANCVisitRequest request
    ) {

        ANCVisit visit = ancVisitRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "ANC Visit not found with id: " + id
                        )
                );

        // --------------------------------------------------------
        // HISTORY PROTECTION
        // --------------------------------------------------------
        //
        // Archived clinical records are historical records.
        // They must not be changed through normal UPDATE.
        // --------------------------------------------------------

        if ("ARCHIVED".equalsIgnoreCase(
                visit.getRecordStatus()
        )) {

            throw new IllegalArgumentException(
                    "Archived ANC visits are historical records and cannot be edited."
            );
        }

        Pregnancy existingPregnancy =
                visit.getPregnancy();

        if (existingPregnancy == null) {

            throw new IllegalStateException(
                    "ANC Visit is not linked to a pregnancy."
            );
        }

        // --------------------------------------------------------
        // IMPORTANT HISTORY PROTECTION
        // --------------------------------------------------------
        //
        // An existing ANC visit must NEVER be moved from one
        // pregnancy to another.
        //
        // The pregnancy relationship belongs to the original
        // clinical event.
        // --------------------------------------------------------

        if (request.getPregnancyId() == null) {

            throw new IllegalArgumentException(
                    "Pregnancy ID is required when updating an ANC visit."
            );
        }

        if (!existingPregnancy.getId().equals(
                request.getPregnancyId()
        )) {

            throw new IllegalArgumentException(
                    "ANC visit cannot be moved to another pregnancy. "
                            + "The original pregnancy relationship must be preserved."
            );
        }

        // --------------------------------------------------------
        // Validate pregnancy still exists
        // --------------------------------------------------------

        Pregnancy pregnancy = pregnancyRepository.findById(
                existingPregnancy.getId()
        ).orElseThrow(() ->
                new RuntimeException(
                        "Pregnancy not found with id: "
                                + existingPregnancy.getId()
                )
        );

        // --------------------------------------------------------
        // Validate date/type
        // --------------------------------------------------------

        if (request.getVisitDate() == null) {

            throw new IllegalArgumentException(
                    "ANC visit date is required."
            );
        }

        if (request.getVisitType() == null
                || request.getVisitType().isBlank()) {

            throw new IllegalArgumentException(
                    "ANC visit type is required."
            );
        }

        String visitType = normalizeVisitType(
                request.getVisitType()
        );

        // --------------------------------------------------------
        // Prevent duplicate ACTIVE ANC visit
        // --------------------------------------------------------

        boolean duplicateExists =
                ancVisitRepository
                        .existsByPregnancyIdAndVisitDateAndVisitTypeAndRecordStatusAndIdNot(
                                existingPregnancy.getId(),
                                request.getVisitDate(),
                                visitType,
                                "ACTIVE",
                                id
                        );

        if (duplicateExists) {

            throw new IllegalArgumentException(
                    "Another active ANC visit already exists for this pregnancy, date and visit type."
            );
        }

        // --------------------------------------------------------
        // Relationship
        // --------------------------------------------------------
        //
        // IMPORTANT:
        // Always keep the original pregnancy.
        // Do not assign another pregnancy here.
        // --------------------------------------------------------

        visit.setPregnancy(pregnancy);

        // --------------------------------------------------------
        // Visit information
        // --------------------------------------------------------

        visit.setVisitDate(request.getVisitDate());
        visit.setVisitType(visitType);

        visit.setGestationalWeeks(
                request.getGestationalWeeks()
        );

        visit.setGestationalDays(
                request.getGestationalDays()
        );

        // --------------------------------------------------------
        // Maternal assessment
        // --------------------------------------------------------

        visit.setWeight(request.getWeight());

        visit.setBloodPressureSystolic(
                request.getBloodPressureSystolic()
        );

        visit.setBloodPressureDiastolic(
                request.getBloodPressureDiastolic()
        );

        visit.setPulse(request.getPulse());
        visit.setTemperature(request.getTemperature());
        visit.setRespiratoryRate(
                request.getRespiratoryRate()
        );

        visit.setGeneralCondition(
                request.getGeneralCondition()
        );

        visit.setOedema(request.getOedema());
        visit.setPallor(request.getPallor());
        visit.setSymptoms(request.getSymptoms());

        // --------------------------------------------------------
        // Pregnancy / fetal assessment
        // --------------------------------------------------------

        visit.setFundalHeight(
                request.getFundalHeight()
        );

        visit.setFetalHeartRate(
                request.getFetalHeartRate()
        );

        visit.setFetalMovement(
                request.getFetalMovement()
        );

        visit.setPresentation(
                request.getPresentation()
        );

        visit.setLie(request.getLie());
        visit.setPosition(request.getPosition());

        // --------------------------------------------------------
        // Investigations
        // --------------------------------------------------------

        visit.setHaemoglobin(
                request.getHaemoglobin()
        );

        visit.setBloodGroup(
                request.getBloodGroup()
        );

        visit.setRhesus(
                request.getRhesus()
        );

        visit.setUrinalysis(
                request.getUrinalysis()
        );

        visit.setBloodSugar(
                request.getBloodSugar()
        );

        visit.setHivResult(
                request.getHivResult()
        );

        visit.setSyphilisResult(
                request.getSyphilisResult()
        );

        visit.setHepatitisBResult(
                request.getHepatitisBResult()
        );

        visit.setUltrasound(
                request.getUltrasound()
        );

        visit.setOtherInvestigations(
                request.getOtherInvestigations()
        );

        // --------------------------------------------------------
        // Clinical management
        // --------------------------------------------------------

        visit.setAssessment(
                request.getAssessment()
        );

        visit.setRiskAssessment(
                request.getRiskAssessment()
        );

        visit.setDiagnosis(
                request.getDiagnosis()
        );

        visit.setTreatment(
                request.getTreatment()
        );

        visit.setMedication(
                request.getMedication()
        );

        visit.setAdvice(
                request.getAdvice()
        );

        visit.setHealthEducation(
                request.getHealthEducation()
        );

        visit.setReferral(
                request.getReferral()
        );

        // --------------------------------------------------------
        // Follow-up
        // --------------------------------------------------------

        visit.setNextVisitDate(
                request.getNextVisitDate()
        );

        visit.setNotes(
                request.getNotes()
        );

        // --------------------------------------------------------
        // Record control
        // --------------------------------------------------------
        //
        // Normal update cannot change record status.
        // The existing ACTIVE status remains ACTIVE.
        // --------------------------------------------------------

        if (visit.getRecordStatus() == null
                || visit.getRecordStatus().isBlank()) {

            visit.setRecordStatus("ACTIVE");
        }

        ANCVisit updatedVisit =
                ancVisitRepository.save(visit);

        return toResponse(updatedVisit);
    }

    // ============================================================
    // ARCHIVE ANC VISIT
    // ============================================================

    public ANCVisitResponse archiveVisit(
            Long id,
            String archiveReason
    ) {

        ANCVisit visit = ancVisitRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "ANC Visit not found with id: " + id
                        )
                );

        // --------------------------------------------------------
        // Prevent repeated archive operation.
        // --------------------------------------------------------

        if ("ARCHIVED".equalsIgnoreCase(
                visit.getRecordStatus()
        )) {

            throw new IllegalArgumentException(
                    "ANC Visit is already archived."
            );
        }

        // --------------------------------------------------------
        // Do not physically delete the clinical record.
        // --------------------------------------------------------

        visit.setRecordStatus("ARCHIVED");

        visit.setArchiveReason(
                archiveReason
        );

        ANCVisit archivedVisit =
                ancVisitRepository.save(visit);

        return toResponse(archivedVisit);
    }

    // ============================================================
    // COUNT VISITS FOR PREGNANCY
    // ============================================================

    @Transactional(readOnly = true)
    public long countVisitsByPregnancy(
            Long pregnancyId
    ) {

        return ancVisitRepository.countByPregnancyId(
                pregnancyId
        );
    }

    // ============================================================
    // COUNT ACTIVE VISITS FOR PREGNANCY
    // ============================================================

    @Transactional(readOnly = true)
    public long countActiveVisitsByPregnancy(
            Long pregnancyId
    ) {

        return ancVisitRepository.countByPregnancyIdAndRecordStatus(
                pregnancyId,
                "ACTIVE"
        );
    }

    // ============================================================
    // NORMALIZE VISIT TYPE
    // ============================================================

    private String normalizeVisitType(
            String visitType
    ) {

        return visitType
                .trim()
                .toUpperCase();
    }

    // ============================================================
    // ENTITY → RESPONSE
    // ============================================================

    private ANCVisitResponse toResponse(
            ANCVisit visit
    ) {

        ANCVisitResponse response =
                new ANCVisitResponse();

        response.setId(visit.getId());

        Pregnancy pregnancy =
                visit.getPregnancy();

        response.setPregnancyId(
                pregnancy.getId()
        );

        Patient patient =
                pregnancy.getPatient();

        if (patient != null) {

            response.setPatientId(
                    patient.getId()
            );

            response.setPatientNumber(
                    patient.getPatientNumber()
            );

            String firstName =
                    patient.getFirstName() == null
                            ? ""
                            : patient.getFirstName();

            String lastName =
                    patient.getLastName() == null
                            ? ""
                            : patient.getLastName();

            response.setPatientName(
                    (firstName + " " + lastName).trim()
            );
        }

        response.setVisitDate(
                visit.getVisitDate()
        );

        response.setVisitType(
                visit.getVisitType()
        );

        response.setGestationalWeeks(
                visit.getGestationalWeeks()
        );

        response.setGestationalDays(
                visit.getGestationalDays()
        );

        // --------------------------------------------------------
        // Maternal assessment
        // --------------------------------------------------------

        response.setWeight(
                visit.getWeight()
        );

        response.setBloodPressureSystolic(
                visit.getBloodPressureSystolic()
        );

        response.setBloodPressureDiastolic(
                visit.getBloodPressureDiastolic()
        );

        response.setPulse(
                visit.getPulse()
        );

        response.setTemperature(
                visit.getTemperature()
        );

        response.setRespiratoryRate(
                visit.getRespiratoryRate()
        );

        response.setGeneralCondition(
                visit.getGeneralCondition()
        );

        response.setOedema(
                visit.getOedema()
        );

        response.setPallor(
                visit.getPallor()
        );

        response.setSymptoms(
                visit.getSymptoms()
        );

        // --------------------------------------------------------
        // Pregnancy / fetal assessment
        // --------------------------------------------------------

        response.setFundalHeight(
                visit.getFundalHeight()
        );

        response.setFetalHeartRate(
                visit.getFetalHeartRate()
        );

        response.setFetalMovement(
                visit.getFetalMovement()
        );

        response.setPresentation(
                visit.getPresentation()
        );

        response.setLie(
                visit.getLie()
        );

        response.setPosition(
                visit.getPosition()
        );

        // --------------------------------------------------------
        // Investigations
        // --------------------------------------------------------

        response.setHaemoglobin(
                visit.getHaemoglobin()
        );

        response.setBloodGroup(
                visit.getBloodGroup()
        );

        response.setRhesus(
                visit.getRhesus()
        );

        response.setUrinalysis(
                visit.getUrinalysis()
        );

        response.setBloodSugar(
                visit.getBloodSugar()
        );

        response.setHivResult(
                visit.getHivResult()
        );

        response.setSyphilisResult(
                visit.getSyphilisResult()
        );

        response.setHepatitisBResult(
                visit.getHepatitisBResult()
        );

        response.setUltrasound(
                visit.getUltrasound()
        );

        response.setOtherInvestigations(
                visit.getOtherInvestigations()
        );

        // --------------------------------------------------------
        // Clinical management
        // --------------------------------------------------------

        response.setAssessment(
                visit.getAssessment()
        );

        response.setRiskAssessment(
                visit.getRiskAssessment()
        );

        response.setDiagnosis(
                visit.getDiagnosis()
        );

        response.setTreatment(
                visit.getTreatment()
        );

        response.setMedication(
                visit.getMedication()
        );

        response.setAdvice(
                visit.getAdvice()
        );

        response.setHealthEducation(
                visit.getHealthEducation()
        );

        response.setReferral(
                visit.getReferral()
        );

        // --------------------------------------------------------
        // Follow-up
        // --------------------------------------------------------

        response.setNextVisitDate(
                visit.getNextVisitDate()
        );

        response.setNotes(
                visit.getNotes()
        );

        // --------------------------------------------------------
        // Record control
        // --------------------------------------------------------

        response.setRecordStatus(
                visit.getRecordStatus()
        );

        response.setArchiveReason(
                visit.getArchiveReason()
        );

        response.setCreatedAt(
                visit.getCreatedAt()
        );

        response.setUpdatedAt(
                visit.getUpdatedAt()
        );

        return response;
    }
}