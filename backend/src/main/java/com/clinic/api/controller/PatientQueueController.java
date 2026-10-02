package com.clinic.api.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.clinic.api.dto.PatientQueueRequest;
import com.clinic.api.dto.PatientQueueResponse;
import com.clinic.api.entity.PatientQueue.QueueStatus;
import com.clinic.api.service.PatientQueueService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/patient-queue")
public class PatientQueueController {

    private final PatientQueueService patientQueueService;

    public PatientQueueController(
            PatientQueueService patientQueueService
    ) {
        this.patientQueueService =
                patientQueueService;
    }

    // =========================================================
    // CHECK IN PATIENT
    // =========================================================

    @PostMapping
    public ResponseEntity<PatientQueueResponse> checkInPatient(
            @Valid @RequestBody PatientQueueRequest request
    ) {

        PatientQueueResponse response =
                patientQueueService.checkInPatient(
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // =========================================================
    // GET TODAY QUEUE
    // =========================================================

    @GetMapping
    public ResponseEntity<List<PatientQueueResponse>> getTodayQueue() {

        return ResponseEntity.ok(
                patientQueueService.getTodayQueue()
        );
    }

    // =========================================================
    // GET TODAY NURSE QUEUE
    // =========================================================

    @GetMapping("/nurse")
    public ResponseEntity<List<PatientQueueResponse>> getTodayNurseQueue() {

        return ResponseEntity.ok(
                patientQueueService.getTodayNurseQueue()
        );
    }

    // =========================================================
    // GET TODAY DOCTOR QUEUE
    // =========================================================

    @GetMapping("/doctor")
    public ResponseEntity<List<PatientQueueResponse>> getTodayDoctorQueue() {

        return ResponseEntity.ok(
                patientQueueService.getTodayDoctorQueue()
        );
    }

    // =========================================================
    // GET QUEUE BY DATE
    // =========================================================

    @GetMapping("/date")
    public ResponseEntity<List<PatientQueueResponse>> getQueueByDate(
            @RequestParam LocalDate date
    ) {

        return ResponseEntity.ok(
                patientQueueService.getQueueByDate(
                        date
                )
        );
    }

    // =========================================================
    // GET QUEUE BY ID
    // =========================================================

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<PatientQueueResponse> getQueueById(
            @PathVariable Long id
    ) {

        return ResponseEntity.ok(
                patientQueueService.getQueueById(
                        id
                )
        );
    }

    // =========================================================
    // GET QUEUE BY NUMBER
    // =========================================================

    @GetMapping("/number")
    public ResponseEntity<PatientQueueResponse> getQueueByNumber(
            @RequestParam String queueNumber
    ) {

        return ResponseEntity.ok(
                patientQueueService.getQueueByNumber(
                        queueNumber
                )
        );
    }

    // =========================================================
    // UPDATE QUEUE STATUS
    // =========================================================

    @PatchMapping("/{id}/status")
    public ResponseEntity<PatientQueueResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam QueueStatus status
    ) {

        return ResponseEntity.ok(
                patientQueueService.updateStatus(
                        id,
                        status
                )
        );
    }

    // =========================================================
    // TODAY QUEUE STATISTICS
    // =========================================================

    @GetMapping("/stats/today")
    public ResponseEntity<QueueStatsResponse> getTodayStats() {

        long total =
                patientQueueService.countToday();

        long waiting =
                patientQueueService.countTodayByStatus(
                        QueueStatus.WAITING
                );

        long inConsultation =
                patientQueueService.countTodayByStatus(
                        QueueStatus.IN_CONSULTATION
                );

        long completed =
                patientQueueService.countTodayByStatus(
                        QueueStatus.COMPLETED
                );

        QueueStatsResponse response =
                new QueueStatsResponse();

        response.setTotal(total);

        response.setWaiting(
                waiting
        );

        response.setInConsultation(
                inConsultation
        );

        response.setCompleted(
                completed
        );

        return ResponseEntity.ok(
                response
        );
    }

    // =========================================================
    // QUEUE STATISTICS RESPONSE
    // =========================================================

    public static class QueueStatsResponse {

        private long total;

        private long waiting;

        private long inConsultation;

        private long completed;

        public QueueStatsResponse() {
        }

        public long getTotal() {
            return total;
        }

        public void setTotal(
                long total
        ) {
            this.total = total;
        }

        public long getWaiting() {
            return waiting;
        }

        public void setWaiting(
                long waiting
        ) {
            this.waiting = waiting;
        }

        public long getInConsultation() {
            return inConsultation;
        }

        public void setInConsultation(
                long inConsultation
        ) {
            this.inConsultation =
                    inConsultation;
        }

        public long getCompleted() {
            return completed;
        }

        public void setCompleted(
                long completed
        ) {
            this.completed =
                    completed;
        }
    }
}