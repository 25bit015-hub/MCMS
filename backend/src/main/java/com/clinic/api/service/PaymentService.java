package com.clinic.api.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.clinic.api.dto.PaymentRequest;
import com.clinic.api.dto.PaymentResponse;
import com.clinic.api.entity.Invoice;
import com.clinic.api.entity.Payment;
import com.clinic.api.repository.InvoiceRepository;
import com.clinic.api.repository.PaymentRepository;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;

    public PaymentService(
            PaymentRepository paymentRepository,
            InvoiceRepository invoiceRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.invoiceRepository = invoiceRepository;
    }

    /**
     * Create payment for an invoice
     */
    @Transactional
    public PaymentResponse createPayment(PaymentRequest request) {

        // 1. Find invoice
        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
                .orElseThrow(() ->
                        new RuntimeException("Invoice not found")
                );

        // 2. Validate amount
        if (request.getAmount() == null ||
                request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {

            throw new RuntimeException(
                    "Payment amount must be greater than zero"
            );
        }

        // 3. Get invoice balance
        BigDecimal currentBalance = invoice.getBalanceAmount();

        if (currentBalance == null) {
            currentBalance = BigDecimal.ZERO;
        }

        // 4. Prevent overpayment
        if (request.getAmount().compareTo(currentBalance) > 0) {

            throw new RuntimeException(
                    "Payment amount cannot exceed invoice balance"
            );
        }

        // 5. Prevent payment on cancelled invoice
        if (invoice.getStatus() == Invoice.InvoiceStatus.CANCELLED) {

            throw new RuntimeException(
                    "Cannot make payment for a cancelled invoice"
            );
        }

        // 6. Create payment
        Payment payment = new Payment();

        payment.setInvoice(invoice);
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setAmount(request.getAmount());
        payment.setPaymentReference(request.getPaymentReference());
        payment.setNotes(request.getNotes());

        // 7. Save payment
        Payment savedPayment = paymentRepository.save(payment);

        // 8. Update invoice paid amount
        BigDecimal currentPaid = invoice.getPaidAmount();

        if (currentPaid == null) {
            currentPaid = BigDecimal.ZERO;
        }

        BigDecimal newPaidAmount =
                currentPaid.add(request.getAmount());

        // 9. Calculate new balance
        BigDecimal newBalance =
                invoice.getTotalAmount().subtract(newPaidAmount);

        if (newBalance.compareTo(BigDecimal.ZERO) < 0) {
            newBalance = BigDecimal.ZERO;
        }

        invoice.setPaidAmount(newPaidAmount);
        invoice.setBalanceAmount(newBalance);

        // 10. Update invoice status
        if (newBalance.compareTo(BigDecimal.ZERO) == 0) {

            invoice.setStatus(
                    Invoice.InvoiceStatus.PAID
            );

        } else if (newPaidAmount.compareTo(BigDecimal.ZERO) > 0) {

            invoice.setStatus(
                    Invoice.InvoiceStatus.PARTIALLY_PAID
            );

        } else {

            invoice.setStatus(
                    Invoice.InvoiceStatus.UNPAID
            );
        }

        // 11. Save updated invoice
        invoiceRepository.save(invoice);

        // 12. Return response
        return mapToResponse(savedPayment);
    }

    /**
     * Get payment by ID
     */
    public PaymentResponse getPaymentById(Long id) {

        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Payment not found")
                );

        return mapToResponse(payment);
    }

    /**
     * Get all payments
     */
    public List<PaymentResponse> getAllPayments() {

        return paymentRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get payments for specific invoice
     */
    public List<PaymentResponse> getPaymentsByInvoice(Long invoiceId) {

        if (!invoiceRepository.existsById(invoiceId)) {

            throw new RuntimeException(
                    "Invoice not found"
            );
        }

        return paymentRepository.findByInvoiceId(invoiceId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Convert Payment entity to response DTO
     */
    private PaymentResponse mapToResponse(Payment payment) {

        PaymentResponse response = new PaymentResponse();

        response.setId(payment.getId());

        if (payment.getInvoice() != null) {

            response.setInvoiceId(
                    payment.getInvoice().getId()
            );

            response.setInvoiceNumber(
                    payment.getInvoice().getInvoiceNumber()
            );
        }

        response.setPaymentMethod(
                payment.getPaymentMethod()
        );

        response.setAmount(
                payment.getAmount()
        );

        response.setPaymentReference(
                payment.getPaymentReference()
        );

        response.setNotes(
                payment.getNotes()
        );

        response.setPaidAt(
                payment.getPaidAt()
        );

        response.setCreatedAt(
                payment.getCreatedAt()
        );

        return response;
    }
}