package com.clinic.api.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clinic.api.dto.CreateInvoiceRequest;
import com.clinic.api.dto.InvoiceResponse;
import com.clinic.api.entity.Invoice;
import com.clinic.api.entity.InvoiceItem;
import com.clinic.api.entity.Patient;
import com.clinic.api.repository.InvoiceRepository;
import com.clinic.api.repository.PatientRepository;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final PatientRepository patientRepository;

    public InvoiceService(
            InvoiceRepository invoiceRepository,
            PatientRepository patientRepository) {

        this.invoiceRepository = invoiceRepository;
        this.patientRepository = patientRepository;
    }

    @Transactional
    public InvoiceResponse createInvoice(CreateInvoiceRequest request) {

        // 1. Find patient
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() ->
                        new RuntimeException("Patient not found"));

        // 2. Create invoice
        Invoice invoice = new Invoice();

        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setPatient(patient);
        invoice.setBillingType(request.getBillingType());
        invoice.setNotes(request.getNotes());

        // 3. Add invoice items
        BigDecimal subtotal = BigDecimal.ZERO;

        for (CreateInvoiceRequest.InvoiceItemRequest itemRequest
                : request.getItems()) {

            validateItem(itemRequest);

            InvoiceItem item = new InvoiceItem();

            item.setDescription(itemRequest.getDescription());
            item.setQuantity(itemRequest.getQuantity());
            item.setUnitPrice(itemRequest.getUnitPrice());

            item.calculateTotal();

            invoice.addItem(item);

            subtotal = subtotal.add(item.getTotalPrice());
        }

        // 4. Calculate invoice amounts
        invoice.setSubtotal(subtotal);
        invoice.setTotalAmount(subtotal);
        invoice.setPaidAmount(BigDecimal.ZERO);
        invoice.setBalanceAmount(subtotal);
        invoice.setStatus(Invoice.InvoiceStatus.UNPAID);

        // 5. Save invoice
        Invoice savedInvoice = invoiceRepository.save(invoice);

        // 6. Return response
        return mapToResponse(savedInvoice);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(Long id) {

        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Invoice not found"));

        return mapToResponse(invoice);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceByNumber(String invoiceNumber) {

        Invoice invoice = invoiceRepository
                .findByInvoiceNumber(invoiceNumber)
                .orElseThrow(() ->
                        new RuntimeException("Invoice not found"));

        return mapToResponse(invoice);
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getAllInvoices() {

        return invoiceRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private void validateItem(
            CreateInvoiceRequest.InvoiceItemRequest item) {

        if (item.getDescription() == null
                || item.getDescription().isBlank()) {

            throw new RuntimeException(
                    "Item description is required");
        }

        if (item.getQuantity() == null
                || item.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Item quantity must be greater than zero");
        }

        if (item.getUnitPrice() == null
                || item.getUnitPrice().compareTo(BigDecimal.ZERO) < 0) {

            throw new RuntimeException(
                    "Item unit price cannot be negative");
        }
    }

    private String generateInvoiceNumber() {

        long nextNumber = invoiceRepository.count() + 1;

        String invoiceNumber;

        do {
            invoiceNumber = String.format(
                    "INV-%05d",
                    nextNumber
            );

            nextNumber++;

        } while (invoiceRepository.existsByInvoiceNumber(invoiceNumber));

        return invoiceNumber;
    }

    private InvoiceResponse mapToResponse(Invoice invoice) {

        InvoiceResponse response = new InvoiceResponse();

        response.setId(invoice.getId());
        response.setInvoiceNumber(invoice.getInvoiceNumber());

        response.setPatientId(invoice.getPatient().getId());

        /*
         * Patient entity yako inaweza kuwa na getFullName().
         * Tuta-confirm baada ya compile kama IDE inaleta error hapa.
         */
        response.setPatientName(invoice.getPatient().getFirstName());

        response.setBillingType(invoice.getBillingType());

        response.setSubtotal(invoice.getSubtotal());
        response.setTotalAmount(invoice.getTotalAmount());
        response.setPaidAmount(invoice.getPaidAmount());
        response.setBalanceAmount(invoice.getBalanceAmount());

        response.setStatus(invoice.getStatus());
        response.setNotes(invoice.getNotes());

        response.setCreatedAt(invoice.getCreatedAt());
        response.setUpdatedAt(invoice.getUpdatedAt());

        List<InvoiceResponse.InvoiceItemResponse> items =
                invoice.getItems()
                        .stream()
                        .map(item -> {

                            InvoiceResponse.InvoiceItemResponse itemResponse =
                                    new InvoiceResponse.InvoiceItemResponse();

                            itemResponse.setId(item.getId());
                            itemResponse.setDescription(item.getDescription());
                            itemResponse.setQuantity(item.getQuantity());
                            itemResponse.setUnitPrice(item.getUnitPrice());
                            itemResponse.setTotalPrice(item.getTotalPrice());

                            return itemResponse;
                        })
                        .toList();

        response.setItems(items);

        return response;
    }
}