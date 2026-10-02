package com.clinic.api.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "patient_queue")
public class PatientQueue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "queue_number",
            unique = true,
            nullable = false,
            length = 50
    )
    private String queueNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "patient_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_queue_patient"
            )
    )
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "visit_id",
            nullable = true,
            foreignKey = @ForeignKey(
                    name = "fk_queue_visit"
            )
    )
    private Visit visit;

    @Column(
            name = "queue_date",
            nullable = false
    )
    private LocalDate queueDate;

    @Column(
            name = "check_in_time",
            nullable = false
    )
    private LocalDateTime checkInTime;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 40
    )
    private QueueStatus status;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    private QueueService service;

    @Column(
            length = 2000
    )
    private String notes;

    @PrePersist
    public void prePersist() {

        if (queueDate == null) {
            queueDate = LocalDate.now();
        }

        if (checkInTime == null) {
            checkInTime = LocalDateTime.now();
        }

        if (status == null) {
            status = QueueStatus.WAITING;
        }

        if (service == null) {
            service = QueueService.NURSE;
        }
    }

    public enum QueueStatus {
        WAITING,
        IN_CONSULTATION,
        SENT_TO_DOCTOR,
        LAB_PENDING,
        LAB_COMPLETED,
        RETURNED_TO_DOCTOR,
        PHARMACY_PENDING,
        PHARMACY_COMPLETED,
        INJECTION_PENDING,
        INJECTION_COMPLETED,
        COMPLETED
    }

    public enum QueueService {
        RECEPTION,
        NURSE,
        DOCTOR,
        LABORATORY,
        PHARMACY,
        INJECTION,
        COMPLETED
    }

    public PatientQueue() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getQueueNumber() {
        return queueNumber;
    }

    public void setQueueNumber(String queueNumber) {
        this.queueNumber = queueNumber;
    }

    public Patient getPatient() {
        return patient;
    }

    public void setPatient(Patient patient) {
        this.patient = patient;
    }

    public Visit getVisit() {
        return visit;
    }

    public void setVisit(Visit visit) {
        this.visit = visit;
    }

    public LocalDate getQueueDate() {
        return queueDate;
    }

    public void setQueueDate(LocalDate queueDate) {
        this.queueDate = queueDate;
    }

    public LocalDateTime getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(LocalDateTime checkInTime) {
        this.checkInTime = checkInTime;
    }

    public QueueStatus getStatus() {
        return status;
    }

    public void setStatus(QueueStatus status) {
        this.status = status;
    }

    public QueueService getService() {
        return service;
    }

    public void setService(QueueService service) {
        this.service = service;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}