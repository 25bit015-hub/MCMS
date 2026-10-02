package com.clinic.api.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clinic.api.entity.Patient;
import com.clinic.api.entity.Prescription;
import com.clinic.api.entity.Prescription.PaymentType;
import com.clinic.api.entity.Prescription.PrescriptionStatus;
import com.clinic.api.entity.PrescriptionItem;
import com.clinic.api.entity.Visit;
import com.clinic.api.repository.PatientRepository;
import com.clinic.api.repository.PrescriptionItemRepository;
import com.clinic.api.repository.PrescriptionRepository;
import com.clinic.api.repository.VisitRepository;

@Service
@Transactional
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final PatientRepository patientRepository;
    private final VisitRepository visitRepository;

    public PrescriptionService(
            PrescriptionRepository prescriptionRepository,
            PrescriptionItemRepository prescriptionItemRepository,
            PatientRepository patientRepository,
            VisitRepository visitRepository) {

        this.prescriptionRepository = prescriptionRepository;
        this.prescriptionItemRepository = prescriptionItemRepository;
        this.patientRepository = patientRepository;
        this.visitRepository = visitRepository;
    }

    // ============================================================
    // CREATE PRESCRIPTION
    // ============================================================

    public Prescription createPrescription(
            Long patientId,
            Long visitId,
            PaymentType paymentType,
            String notes,
            List<PrescriptionItemRequest> items) {

        if (patientId == null) {
            throw new IllegalArgumentException("Patient ID is required");
        }

        if (visitId == null) {
            throw new IllegalArgumentException("Visit ID is required");
        }

        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException(
                    "At least one prescription item is required");
        }

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Patient not found: " + patientId));

        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Visit not found: " + visitId));

        // Muhimu:
        // Visit lazima iwe ya huyu patient.
        if (visit.getPatient() == null
                || !visit.getPatient().getId().equals(patientId)) {

            throw new IllegalArgumentException(
                    "Visit does not belong to the specified patient");
        }

        Prescription prescription = new Prescription();

        prescription.setPatient(patient);
        prescription.setVisit(visit);
        prescription.setPaymentType(
                paymentType != null ? paymentType : PaymentType.CASH);
        prescription.setNotes(notes);
        prescription.setStatus(PrescriptionStatus.PENDING);

        Prescription savedPrescription =
                prescriptionRepository.save(prescription);

        for (PrescriptionItemRequest request : items) {

            validateItem(request);

            PrescriptionItem item = new PrescriptionItem();

            item.setPrescription(savedPrescription);
            item.setMedicineName(request.getMedicineName());
            item.setStrength(request.getStrength());
            item.setDosage(request.getDosage());
            item.setFrequency(request.getFrequency());
            item.setDuration(request.getDuration());
            item.setQuantity(request.getQuantity());
            item.setInstructions(request.getInstructions());
            item.setUnitPrice(request.getUnitPrice());

            prescriptionItemRepository.save(item);
        }

        return savedPrescription;
    }

    // ============================================================
    // GET ALL
    // ============================================================

    @Transactional(readOnly = true)
    public List<Prescription> getAllPrescriptions() {
        return prescriptionRepository
                .findAll();
    }

    // ============================================================
    // GET BY ID
    // ============================================================

    @Transactional(readOnly = true)
    public Prescription getPrescriptionById(Long id) {

        return prescriptionRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Prescription not found: " + id));
    }

    // ============================================================
    // GET ITEMS
    // ============================================================

    @Transactional(readOnly = true)
    public List<PrescriptionItem> getPrescriptionItems(
            Long prescriptionId) {

        getPrescriptionById(prescriptionId);

        return prescriptionItemRepository
                .findByPrescriptionIdOrderByIdAsc(prescriptionId);
    }

    // ============================================================
    // PATIENT HISTORY
    // ============================================================

    @Transactional(readOnly = true)
    public List<Prescription> getPatientHistory(Long patientId) {

        if (!patientRepository.existsById(patientId)) {
            throw new IllegalArgumentException(
                    "Patient not found: " + patientId);
        }

        return prescriptionRepository
                .findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    // ============================================================
    // VISIT HISTORY
    // ============================================================

    @Transactional(readOnly = true)
    public List<Prescription> getVisitHistory(Long visitId) {

        if (!visitRepository.existsById(visitId)) {
            throw new IllegalArgumentException(
                    "Visit not found: " + visitId);
        }

        return prescriptionRepository
                .findByVisitIdOrderByCreatedAtDesc(visitId);
    }

    // ============================================================
    // STATUS
    // ============================================================

    @Transactional(readOnly = true)
    public List<Prescription> getByStatus(
            PrescriptionStatus status) {

        return prescriptionRepository
                .findByStatusOrderByCreatedAtDesc(status);
    }

    // ============================================================
    // PAYMENT TYPE
    // ============================================================

    @Transactional(readOnly = true)
    public List<Prescription> getByPaymentType(
            PaymentType paymentType) {

        return prescriptionRepository
                .findByPaymentTypeOrderByCreatedAtDesc(paymentType);
    }

    // ============================================================
    // DATE RANGE
    // ============================================================

    @Transactional(readOnly = true)
    public List<Prescription> getBetween(
            LocalDateTime startDate,
            LocalDateTime endDate) {

        return prescriptionRepository
                .findByCreatedAtBetweenOrderByCreatedAtDesc(
                        startDate,
                        endDate);
    }

    // ============================================================
    // PATIENT + DATE RANGE
    // ============================================================

    @Transactional(readOnly = true)
    public List<Prescription> getPatientBetween(
            Long patientId,
            LocalDateTime startDate,
            LocalDateTime endDate) {

        if (!patientRepository.existsById(patientId)) {
            throw new IllegalArgumentException(
                    "Patient not found: " + patientId);
        }

        return prescriptionRepository
                .findByPatientIdAndCreatedAtBetweenOrderByCreatedAtDesc(
                        patientId,
                        startDate,
                        endDate);
    }

    // ============================================================
    // PAYMENT + DATE RANGE
    // ============================================================

    @Transactional(readOnly = true)
    public List<Prescription> getPaymentBetween(
            PaymentType paymentType,
            LocalDateTime startDate,
            LocalDateTime endDate) {

        return prescriptionRepository
                .findByPaymentTypeAndCreatedAtBetweenOrderByCreatedAtDesc(
                        paymentType,
                        startDate,
                        endDate);
    }

    // ============================================================
    // PATIENT + PAYMENT + DATE RANGE
    // ============================================================

    @Transactional(readOnly = true)
    public List<Prescription> getPatientPaymentBetween(
            Long patientId,
            PaymentType paymentType,
            LocalDateTime startDate,
            LocalDateTime endDate) {

        if (!patientRepository.existsById(patientId)) {
            throw new IllegalArgumentException(
                    "Patient not found: " + patientId);
        }

        return prescriptionRepository
                .findByPatientIdAndPaymentTypeAndCreatedAtBetweenOrderByCreatedAtDesc(
                        patientId,
                        paymentType,
                        startDate,
                        endDate);
    }

    // ============================================================
    // UPDATE STATUS
    // ============================================================

    public Prescription updateStatus(
            Long prescriptionId,
            PrescriptionStatus status) {

        Prescription prescription =
                getPrescriptionById(prescriptionId);

        if (status == null) {
            throw new IllegalArgumentException(
                    "Prescription status is required");
        }

        prescription.setStatus(status);

        return prescriptionRepository.save(prescription);
    }

    // ============================================================
    // VALIDATE ITEM
    // ============================================================

    private void validateItem(PrescriptionItemRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Prescription item cannot be null");
        }

        if (request.getMedicineName() == null
                || request.getMedicineName().isBlank()) {

            throw new IllegalArgumentException(
                    "Medicine name is required");
        }

        if (request.getQuantity() == null
                || request.getQuantity() <= 0) {

            throw new IllegalArgumentException(
                    "Prescription quantity must be greater than zero");
        }
    }

    // ============================================================
    // REQUEST DTO
    // ============================================================

    public static class PrescriptionItemRequest {

        private String medicineName;
        private String strength;
        private String dosage;
        private String frequency;
        private String duration;
        private Integer quantity;
        private String instructions;
        private java.math.BigDecimal unitPrice;

        public PrescriptionItemRequest() {
        }

        public String getMedicineName() {
            return medicineName;
        }

        public void setMedicineName(String medicineName) {
            this.medicineName = medicineName;
        }

        public String getStrength() {
            return strength;
        }

        public void setStrength(String strength) {
            this.strength = strength;
        }

        public String getDosage() {
            return dosage;
        }

        public void setDosage(String dosage) {
            this.dosage = dosage;
        }

        public String getFrequency() {
            return frequency;
        }

        public void setFrequency(String frequency) {
            this.frequency = frequency;
        }

        public String getDuration() {
            return duration;
        }

        public void setDuration(String duration) {
            this.duration = duration;
        }

        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }

        public String getInstructions() {
            return instructions;
        }

        public void setInstructions(String instructions) {
            this.instructions = instructions;
        }

        public java.math.BigDecimal getUnitPrice() {
            return unitPrice;
        }

        public void setUnitPrice(java.math.BigDecimal unitPrice) {
            this.unitPrice = unitPrice;
        }
    }
}