package com.clinic.api.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class PatientQueueResponse {

    private Long id;
    private String queueNumber;

    // =====================================================
    // VISIT INFORMATION
    // =====================================================

    private Long visitId;
    private String visitNumber;

    // =====================================================
    // PATIENT INFORMATION
    // =====================================================

    private Long patientId;
    private String patientNumber;
    private String firstName;
    private String lastName;
    private String gender;
    private LocalDate dateOfBirth;
    private String phone;

    // =====================================================
    // QUEUE INFORMATION
    // =====================================================

    private LocalDate queueDate;
    private LocalDateTime checkInTime;

    private String status;
    private String service;

    private String notes;

    public PatientQueueResponse() {
    }

    // =====================================================
    // QUEUE ID
    // =====================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    // =====================================================
    // QUEUE NUMBER
    // =====================================================

    public String getQueueNumber() {
        return queueNumber;
    }

    public void setQueueNumber(String queueNumber) {
        this.queueNumber = queueNumber;
    }

    // =====================================================
    // VISIT ID
    // =====================================================

    public Long getVisitId() {
        return visitId;
    }

    public void setVisitId(Long visitId) {
        this.visitId = visitId;
    }

    // =====================================================
    // VISIT NUMBER
    // =====================================================

    public String getVisitNumber() {
        return visitNumber;
    }

    public void setVisitNumber(String visitNumber) {
        this.visitNumber = visitNumber;
    }

    // =====================================================
    // PATIENT ID
    // =====================================================

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    // =====================================================
    // PATIENT NUMBER
    // =====================================================

    public String getPatientNumber() {
        return patientNumber;
    }

    public void setPatientNumber(String patientNumber) {
        this.patientNumber = patientNumber;
    }

    // =====================================================
    // FIRST NAME
    // =====================================================

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    // =====================================================
    // LAST NAME
    // =====================================================

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    // =====================================================
    // GENDER
    // =====================================================

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    // =====================================================
    // DATE OF BIRTH
    // =====================================================

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    // =====================================================
    // PHONE
    // =====================================================

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    // =====================================================
    // QUEUE DATE
    // =====================================================

    public LocalDate getQueueDate() {
        return queueDate;
    }

    public void setQueueDate(LocalDate queueDate) {
        this.queueDate = queueDate;
    }

    // =====================================================
    // CHECK-IN TIME
    // =====================================================

    public LocalDateTime getCheckInTime() {
        return checkInTime;
    }

    public void setCheckInTime(LocalDateTime checkInTime) {
        this.checkInTime = checkInTime;
    }

    // =====================================================
    // STATUS
    // =====================================================

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    // =====================================================
    // SERVICE
    // =====================================================

    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }

    // =====================================================
    // NOTES
    // =====================================================

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}