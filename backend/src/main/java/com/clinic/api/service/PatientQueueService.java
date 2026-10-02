package com.clinic.api.service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clinic.api.dto.PatientQueueRequest;
import com.clinic.api.dto.PatientQueueResponse;
import com.clinic.api.entity.Patient;
import com.clinic.api.entity.PatientQueue;
import com.clinic.api.entity.PatientQueue.QueueService;
import com.clinic.api.entity.PatientQueue.QueueStatus;
import com.clinic.api.entity.Visit;
import com.clinic.api.entity.Visit.VisitStatus;
import com.clinic.api.repository.PatientQueueRepository;
import com.clinic.api.repository.PatientRepository;
import com.clinic.api.repository.VisitRepository;

@Service
public class PatientQueueService {

    private final PatientQueueRepository patientQueueRepository;
    private final PatientRepository patientRepository;
    private final VisitRepository visitRepository;

    public PatientQueueService(
            PatientQueueRepository patientQueueRepository,
            PatientRepository patientRepository,
            VisitRepository visitRepository
    ) {
        this.patientQueueRepository = patientQueueRepository;
        this.patientRepository = patientRepository;
        this.visitRepository = visitRepository;
    }

    // =========================================================
    // CHECK IN PATIENT
    // =========================================================

    @Transactional
    public PatientQueueResponse checkInPatient(
            PatientQueueRequest request
    ) {

        Patient patient =
                patientRepository.findById(
                        request.getPatientId()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Patient not found with id: "
                                        + request.getPatientId()
                        )
                );

        LocalDate today = LocalDate.now();

        boolean alreadyInQueue =
                patientQueueRepository
                        .existsByPatientIdAndQueueDateAndStatusNot(
                                patient.getId(),
                                today,
                                QueueStatus.COMPLETED
                        );

        if (alreadyInQueue) {
            throw new RuntimeException(
                    "Patient is already in today's queue"
            );
        }

        // ==============================
        // CREATE VISIT
        // ==============================

        Visit visit = new Visit();

        visit.setPatient(patient);

        visit.setVisitDate(today);

        visit.setVisitType(
                Visit.VisitType.OUTPATIENT
        );

        visit.setStatus(
                VisitStatus.OPEN
        );

        visit.setReason(
                request.getNotes()
        );

        // Temporary number before ID is generated
        visit.setVisitNumber(
                "TEMP-" + UUID.randomUUID()
        );

        visit = visitRepository.save(visit);

        // Generate official Visit Number
        String visitNumber =
                String.format(
                        "VIS-%06d",
                        visit.getId()
                );

        visit.setVisitNumber(
                visitNumber
        );

        visit = visitRepository.save(visit);

        // ==============================
        // CREATE QUEUE
        // ==============================

        PatientQueue queue =
                new PatientQueue();

        queue.setPatient(patient);

        queue.setVisit(visit);

        queue.setQueueDate(today);

        queue.setStatus(
                QueueStatus.WAITING
        );

        queue.setService(
                QueueService.NURSE
        );

        queue.setNotes(
                request.getNotes()
        );

        // Temporary number before ID is generated
        queue.setQueueNumber(
                "TEMP-" + UUID.randomUUID()
        );

        queue =
                patientQueueRepository.save(
                        queue
                );

        // Generate official Queue Number
        String queueNumber =
                String.format(
                        "QUE-%06d",
                        queue.getId()
                );

        queue.setQueueNumber(
                queueNumber
        );

        queue =
                patientQueueRepository.save(
                        queue
                );

        return toResponse(queue);
    }

    // =========================================================
    // GET TODAY QUEUE
    // =========================================================

    @Transactional(readOnly = true)
    public List<PatientQueueResponse> getTodayQueue() {

        LocalDate today =
                LocalDate.now();

        return patientQueueRepository
                .findByQueueDateOrderByCheckInTimeAsc(
                        today
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // GET QUEUE BY DATE
    // =========================================================

    @Transactional(readOnly = true)
    public List<PatientQueueResponse> getQueueByDate(
            LocalDate date
    ) {

        return patientQueueRepository
                .findByQueueDateOrderByCheckInTimeAsc(
                        date
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // GET NURSE QUEUE - TODAY
    // =========================================================

    @Transactional(readOnly = true)
    public List<PatientQueueResponse> getTodayNurseQueue() {

        LocalDate today =
                LocalDate.now();

        return patientQueueRepository
                .findByQueueDateAndServiceOrderByCheckInTimeAsc(
                        today,
                        QueueService.NURSE
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // GET DOCTOR QUEUE - TODAY
    // =========================================================

    @Transactional(readOnly = true)
    public List<PatientQueueResponse> getTodayDoctorQueue() {

        LocalDate today =
                LocalDate.now();

        return patientQueueRepository
                .findByQueueDateAndServiceOrderByCheckInTimeAsc(
                        today,
                        QueueService.DOCTOR
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // GET QUEUE BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public PatientQueueResponse getQueueById(
            Long id
    ) {

        PatientQueue queue =
                patientQueueRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Queue record not found with id: "
                                                + id
                                )
                        );

        return toResponse(queue);
    }

    // =========================================================
    // GET QUEUE BY NUMBER
    // =========================================================

    @Transactional(readOnly = true)
    public PatientQueueResponse getQueueByNumber(
            String queueNumber
    ) {

        PatientQueue queue =
                patientQueueRepository
                        .findByQueueNumber(
                                queueNumber
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Queue not found with number: "
                                                + queueNumber
                                )
                        );

        return toResponse(queue);
    }

    // =========================================================
    // UPDATE QUEUE STATUS
    // =========================================================

    @Transactional
    public PatientQueueResponse updateStatus(
            Long id,
            QueueStatus status
    ) {

        PatientQueue queue =
                patientQueueRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Queue record not found with id: "
                                                + id
                                )
                        );

        queue.setStatus(status);

        queue.setService(
                getServiceForStatus(status)
        );

        Visit visit =
                queue.getVisit();

        if (visit != null) {

            if (status ==
                    QueueStatus.COMPLETED) {

                visit.setStatus(
                        VisitStatus.COMPLETED
                );

            } else {

                visit.setStatus(
                        VisitStatus.IN_PROGRESS
                );
            }

            visitRepository.save(visit);
        }

        queue =
                patientQueueRepository.save(
                        queue
                );

        return toResponse(queue);
    }

    // =========================================================
    // COUNT TODAY
    // =========================================================

    @Transactional(readOnly = true)
    public long countToday() {

        return patientQueueRepository
                .countByQueueDate(
                        LocalDate.now()
                );
    }

    // =========================================================
    // COUNT TODAY BY STATUS
    // =========================================================

    @Transactional(readOnly = true)
    public long countTodayByStatus(
            QueueStatus status
    ) {

        return patientQueueRepository
                .countByQueueDateAndStatus(
                        LocalDate.now(),
                        status
                );
    }

    // =========================================================
    // SERVICE BASED ON STATUS
    // =========================================================

    private QueueService getServiceForStatus(
            QueueStatus status
    ) {

        return switch (status) {

            case WAITING ->
                    QueueService.NURSE;

            case IN_CONSULTATION ->
                    QueueService.NURSE;

            case SENT_TO_DOCTOR ->
                    QueueService.DOCTOR;

            case LAB_PENDING ->
                    QueueService.LABORATORY;

            case LAB_COMPLETED ->
                    QueueService.LABORATORY;

            case RETURNED_TO_DOCTOR ->
                    QueueService.DOCTOR;

            case PHARMACY_PENDING ->
                    QueueService.PHARMACY;

            case PHARMACY_COMPLETED ->
                    QueueService.PHARMACY;

            case INJECTION_PENDING ->
                    QueueService.INJECTION;

            case INJECTION_COMPLETED ->
                    QueueService.INJECTION;

            case COMPLETED ->
                    QueueService.COMPLETED;
        };
    }

    // =========================================================
    // CONVERT ENTITY TO RESPONSE
    // =========================================================

    private PatientQueueResponse toResponse(
            PatientQueue queue
    ) {

        Patient patient =
                queue.getPatient();

        PatientQueueResponse response =
                new PatientQueueResponse();

        response.setId(
                queue.getId()
        );

        response.setQueueNumber(
                queue.getQueueNumber()
        );

        // ==============================
        // PATIENT INFORMATION
        // ==============================

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

        response.setGender(
                patient.getGender()
        );

        response.setDateOfBirth(
                patient.getDateOfBirth()
        );

        response.setPhone(
                patient.getPhone()
        );

        // ==============================
        // QUEUE INFORMATION
        // ==============================

        response.setQueueDate(
                queue.getQueueDate()
        );

        response.setCheckInTime(
                queue.getCheckInTime()
        );

        response.setStatus(
                queue.getStatus().name()
        );

        response.setService(
                queue.getService().name()
        );

        response.setNotes(
                queue.getNotes()
        );

        // ==============================
        // VISIT INFORMATION
        // ==============================

        Visit visit =
                queue.getVisit();

        if (visit != null) {

            response.setVisitId(
                    visit.getId()
            );

            response.setVisitNumber(
                    visit.getVisitNumber()
            );
        }

        return response;
    }
}