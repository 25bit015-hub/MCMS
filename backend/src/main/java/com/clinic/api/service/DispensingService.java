package com.clinic.api.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clinic.api.entity.Dispensing;
import com.clinic.api.entity.Dispensing.DispensingStatus;
import com.clinic.api.entity.DispensingItem;
import com.clinic.api.entity.MedicineBatch;
import com.clinic.api.entity.Patient;
import com.clinic.api.entity.PatientQueue;
import com.clinic.api.entity.PatientQueue.QueueStatus;
import com.clinic.api.entity.Prescription;
import com.clinic.api.entity.PrescriptionItem;
import com.clinic.api.entity.StockMovement.MovementType;
import com.clinic.api.entity.Visit;
import com.clinic.api.repository.DispensingItemRepository;
import com.clinic.api.repository.DispensingRepository;
import com.clinic.api.repository.MedicineBatchRepository;
import com.clinic.api.repository.PatientQueueRepository;
import com.clinic.api.repository.PatientRepository;
import com.clinic.api.repository.PrescriptionItemRepository;
import com.clinic.api.repository.PrescriptionRepository;
import com.clinic.api.repository.VisitRepository;

@Service
@Transactional
public class DispensingService {

    private final DispensingRepository dispensingRepository;
    private final DispensingItemRepository dispensingItemRepository;
    private final PatientRepository patientRepository;
    private final VisitRepository visitRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionItemRepository prescriptionItemRepository;
    private final MedicineBatchRepository medicineBatchRepository;
    private final PatientQueueRepository patientQueueRepository;
    private final PatientQueueService patientQueueService;
    private final StockMovementService stockMovementService;

    public DispensingService(
            DispensingRepository dispensingRepository,
            DispensingItemRepository dispensingItemRepository,
            PatientRepository patientRepository,
            VisitRepository visitRepository,
            PrescriptionRepository prescriptionRepository,
            PrescriptionItemRepository prescriptionItemRepository,
            MedicineBatchRepository medicineBatchRepository,
            PatientQueueRepository patientQueueRepository,
            PatientQueueService patientQueueService,
            StockMovementService stockMovementService) {

        this.dispensingRepository = dispensingRepository;
        this.dispensingItemRepository = dispensingItemRepository;
        this.patientRepository = patientRepository;
        this.visitRepository = visitRepository;
        this.prescriptionRepository = prescriptionRepository;
        this.prescriptionItemRepository = prescriptionItemRepository;
        this.medicineBatchRepository = medicineBatchRepository;
        this.patientQueueRepository = patientQueueRepository;
        this.patientQueueService = patientQueueService;
        this.stockMovementService = stockMovementService;
    }

    // =========================================================
    // GET DISPENSING
    // =========================================================

    @Transactional(readOnly = true)
    public Dispensing getDispensingById(Long id) {

        return dispensingRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Dispensing not found with id: " + id
                        )
                );
    }

    @Transactional(readOnly = true)
    public List<Dispensing> getAllDispensings() {

        return dispensingRepository.findAll();
    }

    // =========================================================
    // PATIENT HISTORY
    // =========================================================

    @Transactional(readOnly = true)
    public List<Dispensing> getPatientHistory(Long patientId) {

        patientRepository.findById(patientId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Patient not found with id: " + patientId
                        )
                );

        return dispensingRepository
                .findByPatientIdOrderByDispensedAtDesc(patientId);
    }

    // =========================================================
    // VISIT HISTORY
    // =========================================================

    @Transactional(readOnly = true)
    public List<Dispensing> getVisitHistory(Long visitId) {

        visitRepository.findById(visitId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Visit not found with id: " + visitId
                        )
                );

        return dispensingRepository
                .findByVisitIdOrderByDispensedAtDesc(visitId);
    }

    // =========================================================
    // PRESCRIPTION HISTORY
    // =========================================================

    @Transactional(readOnly = true)
    public List<Dispensing> getPrescriptionHistory(
            Long prescriptionId) {

        prescriptionRepository.findById(prescriptionId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Prescription not found with id: "
                                        + prescriptionId
                        )
                );

        return dispensingRepository
                .findByPrescriptionIdOrderByDispensedAtDesc(
                        prescriptionId
                );
    }

    // =========================================================
    // DATE RANGE
    // =========================================================

    @Transactional(readOnly = true)
    public List<Dispensing> getBetween(
            LocalDateTime startDate,
            LocalDateTime endDate) {

        validateDateRange(startDate, endDate);

        return dispensingRepository
                .findByDispensedAtBetweenOrderByDispensedAtDesc(
                        startDate,
                        endDate
                );
    }

    // =========================================================
    // PATIENT + DATE
    // =========================================================

    @Transactional(readOnly = true)
    public List<Dispensing> getPatientBetween(
            Long patientId,
            LocalDateTime startDate,
            LocalDateTime endDate) {

        validateDateRange(startDate, endDate);

        patientRepository.findById(patientId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Patient not found with id: " + patientId
                        )
                );

        return dispensingRepository
                .findByPatientIdAndDispensedAtBetweenOrderByDispensedAtDesc(
                        patientId,
                        startDate,
                        endDate
                );
    }

    // =========================================================
    // PAYMENT + DATE
    // =========================================================

    @Transactional(readOnly = true)
    public List<Dispensing> getByPaymentBetween(
            Dispensing.PaymentType paymentType,
            LocalDateTime startDate,
            LocalDateTime endDate) {

        validateDateRange(startDate, endDate);

        if (paymentType == null) {
            throw new IllegalArgumentException(
                    "Payment type is required"
            );
        }

        return dispensingRepository
                .findByPaymentTypeAndDispensedAtBetweenOrderByDispensedAtDesc(
                        paymentType,
                        startDate,
                        endDate
                );
    }

    // =========================================================
    // PATIENT + PAYMENT + DATE
    // =========================================================

    @Transactional(readOnly = true)
    public List<Dispensing> getPatientPaymentBetween(
            Long patientId,
            Dispensing.PaymentType paymentType,
            LocalDateTime startDate,
            LocalDateTime endDate) {

        validateDateRange(startDate, endDate);

        if (paymentType == null) {
            throw new IllegalArgumentException(
                    "Payment type is required"
            );
        }

        patientRepository.findById(patientId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Patient not found with id: " + patientId
                        )
                );

        return dispensingRepository
                .findByPatientIdAndPaymentTypeAndDispensedAtBetweenOrderByDispensedAtDesc(
                        patientId,
                        paymentType,
                        startDate,
                        endDate
                );
    }

    // =========================================================
    // GET DISPENSING ITEMS
    // =========================================================

    @Transactional(readOnly = true)
    public List<DispensingItem> getDispensingItems(
            Long dispensingId) {

        getDispensingById(dispensingId);

        return dispensingItemRepository
                .findByDispensingIdOrderByIdAsc(
                        dispensingId
                );
    }

    // =========================================================
    // CREATE DISPENSING
    // =========================================================

    public Dispensing createDispensing(
            Long patientId,
            Long visitId,
            Long prescriptionId,
            Dispensing.PaymentType paymentType,
            List<DispensingItemRequest> items,
            String notes) {

        validateCreateRequest(
                patientId,
                visitId,
                prescriptionId,
                paymentType,
                items
        );

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Patient not found with id: " + patientId
                        )
                );

        Visit visit = visitRepository.findById(visitId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Visit not found with id: " + visitId
                        )
                );

        // -----------------------------------------------------
        // VISIT MUST BELONG TO PATIENT
        // -----------------------------------------------------

        if (visit.getPatient() == null
                || !visit.getPatient().getId().equals(patientId)) {

            throw new IllegalArgumentException(
                    "Visit does not belong to this patient"
            );
        }

        Prescription prescription =
                prescriptionRepository.findById(prescriptionId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Prescription not found with id: "
                                                + prescriptionId
                                )
                        );

        // -----------------------------------------------------
        // PRESCRIPTION MUST BELONG TO PATIENT
        // -----------------------------------------------------

        if (prescription.getPatient() == null
                || !prescription.getPatient()
                        .getId()
                        .equals(patientId)) {

            throw new IllegalArgumentException(
                    "Prescription does not belong to this patient"
            );
        }

        // -----------------------------------------------------
        // PRESCRIPTION MUST BELONG TO VISIT
        // -----------------------------------------------------

        if (prescription.getVisit() == null
                || !prescription.getVisit()
                        .getId()
                        .equals(visitId)) {

            throw new IllegalArgumentException(
                    "Prescription does not belong to this visit"
            );
        }

        // -----------------------------------------------------
        // CANCELLED PRESCRIPTION
        // -----------------------------------------------------

        if (prescription.getStatus()
                == Prescription.PrescriptionStatus.CANCELLED) {

            throw new IllegalArgumentException(
                    "Cannot dispense a cancelled prescription"
            );
        }

        // -----------------------------------------------------
        // PAYMENT TYPE
        // -----------------------------------------------------

        if (prescription.getPaymentType() != null
                && !prescription.getPaymentType().name()
                        .equals(paymentType.name())) {

            throw new IllegalArgumentException(
                    "Payment type does not match the prescription"
            );
        }

        // -----------------------------------------------------
        // LOAD REAL PRESCRIPTION ITEMS
        // -----------------------------------------------------

        List<PrescriptionItem> prescriptionItems =
                prescriptionItemRepository
                        .findByPrescriptionIdOrderByIdAsc(
                                prescriptionId
                        );

        if (prescriptionItems.isEmpty()) {

            throw new IllegalArgumentException(
                    "Prescription has no medicine items"
            );
        }

        // -----------------------------------------------------
        // CREATE DISPENSING HEADER
        // -----------------------------------------------------

        Dispensing dispensing = new Dispensing();

        dispensing.setPatient(patient);
        dispensing.setVisit(visit);
        dispensing.setPrescription(prescription);
        dispensing.setPaymentType(paymentType);
        dispensing.setStatus(DispensingStatus.COMPLETED);
        dispensing.setNotes(notes);
        dispensing.setTotalAmount(BigDecimal.ZERO);

        Dispensing savedDispensing =
                dispensingRepository.save(dispensing);

        BigDecimal totalAmount = BigDecimal.ZERO;

        boolean hasPartialItem = false;

        // -----------------------------------------------------
        // PROCESS EACH REQUESTED ITEM
        // -----------------------------------------------------

        for (DispensingItemRequest itemRequest : items) {

            validateItemRequest(itemRequest);

            MedicineBatch batch =
                    medicineBatchRepository
                            .findById(itemRequest.getBatchId())
                            .orElseThrow(() ->
                                    new IllegalArgumentException(
                                            "Medicine batch not found with id: "
                                                    + itemRequest
                                                            .getBatchId()
                                    )
                            );

            if (batch.getMedicine() == null) {

                throw new IllegalArgumentException(
                        "Medicine batch has no medicine"
                );
            }

            String medicineName =
                    batch.getMedicine().getName();

            // -------------------------------------------------
            // FIND PRESCRIPTION ITEM
            // -------------------------------------------------

            PrescriptionItem prescriptionItem =
                    findPrescriptionItem(
                            prescriptionItems,
                            batch
                    );

            // -------------------------------------------------
            // REAL PRESCRIBED QUANTITY
            // -------------------------------------------------

            Integer prescriptionQuantity =
                    prescriptionItem.getQuantity();

            if (prescriptionQuantity == null
                    || prescriptionQuantity <= 0) {

                throw new IllegalArgumentException(
                        "Prescription quantity must be greater than zero for "
                                + medicineName
                );
            }

            int prescribedQuantity =
                    prescriptionQuantity;

            // -------------------------------------------------
            // ALREADY DISPENSED
            // -------------------------------------------------

            int alreadyDispensed =
                    getAlreadyDispensedQuantity(
                            prescriptionId,
                            prescriptionItem
                    );

            int remainingQuantity =
                    prescribedQuantity - alreadyDispensed;

            if (remainingQuantity <= 0) {

                throw new IllegalArgumentException(
                        "Prescription quantity already fully dispensed for "
                                + medicineName
                );
            }

            // -------------------------------------------------
            // ACTUAL DISPENSED QUANTITY
            // -------------------------------------------------

            int requestedDispensed =
                    itemRequest.getDispensedQuantity();

            if (requestedDispensed > remainingQuantity) {

                throw new IllegalArgumentException(
                        "Cannot dispense "
                                + requestedDispensed
                                + " of "
                                + medicineName
                                + ". Remaining prescription quantity: "
                                + remainingQuantity
                );
            }

            // -------------------------------------------------
            // BATCH / EXPIRY VALIDATION
            // -------------------------------------------------

            if (batch.getStatus()
                    == MedicineBatch.BatchStatus.EXPIRED) {

                throw new IllegalArgumentException(
                        "Cannot dispense from an expired batch"
                );
            }

            if (batch.getExpiryDate() != null
                    && batch.getExpiryDate()
                            .isBefore(LocalDate.now())) {

                throw new IllegalArgumentException(
                        "Cannot dispense expired medicine"
                );
            }

            int availableQuantity =
                    batch.getQuantity() == null
                            ? 0
                            : batch.getQuantity();

            if (requestedDispensed > availableQuantity) {

                throw new IllegalArgumentException(
                        "Insufficient stock for "
                                + medicineName
                                + ". Available: "
                                + availableQuantity
                );
            }

            // -------------------------------------------------
            // PRICE
            // -------------------------------------------------

            BigDecimal unitPrice =
                    itemRequest.getUnitPrice();

            if (unitPrice == null) {
                unitPrice =
                        prescriptionItem.getUnitPrice();
            }

            if (unitPrice == null) {
                unitPrice =
                        batch.getMedicine().getUnitPrice();
            }

            if (unitPrice == null) {
                unitPrice = BigDecimal.ZERO;
            }

            BigDecimal itemTotal =
                    unitPrice.multiply(
                            BigDecimal.valueOf(
                                    requestedDispensed
                            )
                    );

            // -------------------------------------------------
            // CREATE DISPENSING ITEM
            // -------------------------------------------------

            DispensingItem dispensingItem =
                    new DispensingItem();

            dispensingItem.setDispensing(
                    savedDispensing
            );

            dispensingItem.setBatch(batch);

            dispensingItem.setMedicineName(
                    medicineName
            );

            dispensingItem.setStrength(
                    batch.getMedicine().getStrength()
            );

            dispensingItem.setPrescribedQuantity(
                    prescribedQuantity
            );

            dispensingItem.setDispensedQuantity(
                    requestedDispensed
            );

            dispensingItem.setUnitPrice(
                    unitPrice
            );

            dispensingItem.setTotalPrice(
                    itemTotal
            );

            dispensingItem.setInstructions(
                    itemRequest.getInstructions() != null
                            ? itemRequest.getInstructions()
                            : prescriptionItem.getInstructions()
            );

            dispensingItemRepository.save(
                    dispensingItem
            );

            // -------------------------------------------------
            // UPDATE STOCK
            // -------------------------------------------------

            stockMovementService.createMovement(
                    batch.getId(),
                    MovementType.DISPENSED,
                    requestedDispensed,
                    "DISPENSING",
                    savedDispensing.getId(),
                    "Medicine dispensed to patient"
            );

            totalAmount =
                    totalAmount.add(itemTotal);

            // -------------------------------------------------
            // PARTIAL CHECK
            // -------------------------------------------------

            if (requestedDispensed < remainingQuantity) {
                hasPartialItem = true;
            }
        }

        // =====================================================
        // UPDATE DISPENSING STATUS
        // =====================================================

        if (hasPartialItem) {

            savedDispensing.setStatus(
                    DispensingStatus.PARTIAL
            );

        } else {

            savedDispensing.setStatus(
                    DispensingStatus.COMPLETED
            );
        }

        savedDispensing.setTotalAmount(
                totalAmount
        );

        // =====================================================
        // UPDATE PRESCRIPTION STATUS
        // =====================================================

        boolean prescriptionCompleted =
                isPrescriptionCompleted(
                        prescriptionItems,
                        prescriptionId
                );

        if (prescriptionCompleted) {

            prescription.setStatus(
                    Prescription.PrescriptionStatus.COMPLETED
            );

        } else {

            prescription.setStatus(
                    Prescription.PrescriptionStatus.DISPENSING
            );
        }

        prescriptionRepository.save(
                prescription
        );

        // =====================================================
        // UPDATE PATIENT QUEUE
        // =====================================================

        if (prescriptionCompleted) {

            updatePharmacyQueue(
                    patientId,
                    visitId
            );
        }

        // =====================================================
        // SAVE DISPENSING
        // =====================================================

        return dispensingRepository.save(
                savedDispensing
        );
    }

    // =========================================================
    // UPDATE PHARMACY QUEUE
    // =========================================================

    private void updatePharmacyQueue(
            Long patientId,
            Long visitId) {

        PatientQueue queue =
                patientQueueRepository
                        .findByPatientIdAndVisitId(
                                patientId,
                                visitId
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Queue not found for patient "
                                                + patientId
                                                + " and visit "
                                                + visitId
                                )
                        );

        if (queue.getStatus()
                == QueueStatus.PHARMACY_PENDING) {

            patientQueueService.updateStatus(
                    queue.getId(),
                    QueueStatus.PHARMACY_COMPLETED
            );
        }
    }

    // =========================================================
    // FIND PRESCRIPTION ITEM
    // =========================================================

    /**
     * Finds the prescription item that corresponds to the
     * selected medicine batch.
     *
     * Matching order:
     *
     * 1. Medicine name + strength
     * 2. Medicine name
     *
     * This allows cases such as:
     *
     * Prescription:
     *     Paracetamol 500mg
     *
     * Medicine:
     *     Paracetamol
     *
     * Batch:
     *     Paracetamol 500mg
     */
    private PrescriptionItem findPrescriptionItem(
            List<PrescriptionItem> prescriptionItems,
            MedicineBatch batch) {

        if (batch == null
                || batch.getMedicine() == null) {

            throw new IllegalArgumentException(
                    "Medicine batch has no medicine"
            );
        }

        String batchMedicineName =
                normalize(batch.getMedicine().getName());

        String batchStrength =
                normalize(batch.getMedicine().getStrength());

        // -----------------------------------------------------
        // FIRST: EXACT NAME + STRENGTH
        // -----------------------------------------------------

        PrescriptionItem exactMatch =
                prescriptionItems.stream()
                        .filter(item ->
                                matchesName(
                                        item.getMedicineName(),
                                        batchMedicineName
                                )
                        )
                        .filter(item ->
                                matchesStrength(
                                        item.getStrength(),
                                        batchStrength
                                )
                        )
                        .findFirst()
                        .orElse(null);

        if (exactMatch != null) {
            return exactMatch;
        }

        // -----------------------------------------------------
        // SECOND: NAME MATCH
        // -----------------------------------------------------

        PrescriptionItem nameMatch =
                prescriptionItems.stream()
                        .filter(item ->
                                matchesMedicineName(
                                        item.getMedicineName(),
                                        batchMedicineName
                                )
                        )
                        .findFirst()
                        .orElse(null);

        if (nameMatch != null) {
            return nameMatch;
        }

        // -----------------------------------------------------
        // NOT FOUND
        // -----------------------------------------------------

        throw new IllegalArgumentException(
                "Medicine "
                        + batch.getMedicine().getName()
                        + (
                            batch.getMedicine().getStrength() != null
                            && !batch.getMedicine().getStrength().isBlank()
                                ? " " + batch.getMedicine().getStrength()
                                : ""
                        )
                        + " is not part of this prescription"
        );
    }

    // =========================================================
    // NAME MATCH
    // =========================================================

    private boolean matchesName(
            String prescriptionName,
            String batchMedicineName) {

        if (prescriptionName == null
                || prescriptionName.isBlank()
                || batchMedicineName == null
                || batchMedicineName.isBlank()) {

            return false;
        }

        String prescription =
                normalize(prescriptionName);

        String batch =
                normalize(batchMedicineName);

        return prescription.equals(batch);
    }

    // =========================================================
    // MEDICINE NAME FLEXIBLE MATCH
    // =========================================================

    private boolean matchesMedicineName(
            String prescriptionName,
            String batchMedicineName) {

        if (prescriptionName == null
                || prescriptionName.isBlank()
                || batchMedicineName == null
                || batchMedicineName.isBlank()) {

            return false;
        }

        String prescription =
                normalize(prescriptionName);

        String batch =
                normalize(batchMedicineName);

        if (prescription.equals(batch)) {
            return true;
        }

        /*
         * Example:
         *
         * Prescription = Paracetamol 500mg
         * Batch        = Paracetamol
         */

        if (prescription.startsWith(batch + " ")) {
            return true;
        }

        if (batch.startsWith(prescription + " ")) {
            return true;
        }

        /*
         * Handles cases where the strength is included
         * in one side but not the other.
         */

        return prescription.contains(batch)
                || batch.contains(prescription);
    }

    // =========================================================
    // STRENGTH MATCH
    // =========================================================

    private boolean matchesStrength(
            String prescriptionStrength,
            String batchStrength) {

        if (prescriptionStrength == null
                || prescriptionStrength.isBlank()) {

            /*
             * If prescription did not store strength,
             * don't reject the medicine because of strength.
             */
            return true;
        }

        if (batchStrength == null
                || batchStrength.isBlank()) {

            return false;
        }

        return normalize(prescriptionStrength)
                .equals(normalize(batchStrength));
    }

    // =========================================================
    // NORMALIZE TEXT
    // =========================================================

    private String normalize(String value) {

        if (value == null) {
            return "";
        }

        return value
                .trim()
                .replaceAll("\\s+", " ")
                .toLowerCase();
    }

    // =========================================================
    // ALREADY DISPENSED QUANTITY
    // =========================================================

    private int getAlreadyDispensedQuantity(
            Long prescriptionId,
            PrescriptionItem prescriptionItem) {

        if (prescriptionItem == null
                || prescriptionItem.getMedicineName() == null) {

            return 0;
        }

        List<DispensingItem> previousItems =
                dispensingItemRepository
                        .findByDispensing_Prescription_IdAndMedicineNameIgnoreCase(
                                prescriptionId,
                                prescriptionItem.getMedicineName()
                        );

        /*
         * If the repository already contains dispensing records
         * under the same medicine name, sum them.
         */
        return previousItems.stream()
                .map(DispensingItem::getDispensedQuantity)
                .filter(quantity -> quantity != null)
                .mapToInt(Integer::intValue)
                .sum();
    }

    // =========================================================
    // CHECK WHOLE PRESCRIPTION
    // =========================================================

    private boolean isPrescriptionCompleted(
            List<PrescriptionItem> prescriptionItems,
            Long prescriptionId) {

        for (PrescriptionItem prescriptionItem
                : prescriptionItems) {

            if (prescriptionItem.getMedicineName() == null) {
                continue;
            }

            Integer prescribedQuantity =
                    prescriptionItem.getQuantity();

            if (prescribedQuantity == null
                    || prescribedQuantity <= 0) {

                return false;
            }

            int alreadyDispensed =
                    getAlreadyDispensedQuantity(
                            prescriptionId,
                            prescriptionItem
                    );

            if (alreadyDispensed < prescribedQuantity) {
                return false;
            }
        }

        return true;
    }

    // =========================================================
    // VALIDATE CREATE REQUEST
    // =========================================================

    private void validateCreateRequest(
            Long patientId,
            Long visitId,
            Long prescriptionId,
            Dispensing.PaymentType paymentType,
            List<DispensingItemRequest> items) {

        if (patientId == null) {

            throw new IllegalArgumentException(
                    "Patient ID is required"
            );
        }

        if (visitId == null) {

            throw new IllegalArgumentException(
                    "Visit ID is required"
            );
        }

        if (prescriptionId == null) {

            throw new IllegalArgumentException(
                    "Prescription ID is required"
            );
        }

        if (paymentType == null) {

            throw new IllegalArgumentException(
                    "Payment type is required"
            );
        }

        if (items == null || items.isEmpty()) {

            throw new IllegalArgumentException(
                    "At least one dispensing item is required"
            );
        }
    }

    // =========================================================
    // VALIDATE ITEM REQUEST
    // =========================================================

    private void validateItemRequest(
            DispensingItemRequest itemRequest) {

        if (itemRequest == null) {

            throw new IllegalArgumentException(
                    "Dispensing item cannot be null"
            );
        }

        if (itemRequest.getBatchId() == null) {

            throw new IllegalArgumentException(
                    "Batch ID is required"
            );
        }

        if (itemRequest.getDispensedQuantity() == null
                || itemRequest.getDispensedQuantity() <= 0) {

            throw new IllegalArgumentException(
                    "Dispensed quantity must be greater than zero"
            );
        }

        if (itemRequest.getUnitPrice() != null
                && itemRequest.getUnitPrice()
                        .compareTo(BigDecimal.ZERO) < 0) {

            throw new IllegalArgumentException(
                    "Unit price cannot be negative"
            );
        }
    }

    // =========================================================
    // DATE VALIDATION
    // =========================================================

    private void validateDateRange(
            LocalDateTime startDate,
            LocalDateTime endDate) {

        if (startDate == null
                || endDate == null) {

            throw new IllegalArgumentException(
                    "Start date and end date are required"
            );
        }

        if (endDate.isBefore(startDate)) {

            throw new IllegalArgumentException(
                    "End date cannot be before start date"
            );
        }
    }

    // =========================================================
    // REQUEST MODEL
    // =========================================================

    public static class DispensingItemRequest {

        private Long batchId;

        /*
         * Hatuamini field hii tena.
         *
         * Inabaki kwa backward compatibility na frontend,
         * lakini server inatumia PrescriptionItem.quantity.
         */
        private Integer prescribedQuantity;

        private Integer dispensedQuantity;

        private BigDecimal unitPrice;

        private String instructions;

        public DispensingItemRequest() {
        }

        public Long getBatchId() {
            return batchId;
        }

        public void setBatchId(Long batchId) {
            this.batchId = batchId;
        }

        public Integer getPrescribedQuantity() {
            return prescribedQuantity;
        }

        public void setPrescribedQuantity(
                Integer prescribedQuantity) {

            this.prescribedQuantity =
                    prescribedQuantity;
        }

        public Integer getDispensedQuantity() {
            return dispensedQuantity;
        }

        public void setDispensedQuantity(
                Integer dispensedQuantity) {

            this.dispensedQuantity =
                    dispensedQuantity;
        }

        public BigDecimal getUnitPrice() {
            return unitPrice;
        }

        public void setUnitPrice(
                BigDecimal unitPrice) {

            this.unitPrice =
                    unitPrice;
        }

        public String getInstructions() {
            return instructions;
        }

        public void setInstructions(
                String instructions) {

            this.instructions =
                    instructions;
        }
    }
}