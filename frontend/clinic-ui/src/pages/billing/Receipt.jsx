import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  Receipt as ReceiptIcon,
  User,
  CalendarDays,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Building2,
  Phone,
  Mail,
} from "lucide-react";

import api from "../../services/api";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-TZ").format(
    Number(amount || 0)
  );
}

function formatDate(date) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(date) {
  if (!date) return "-";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusLabel(status) {
  const value = String(status || "").toUpperCase();

  if (value === "PAID") {
    return "PAID";
  }

  if (value === "PARTIALLY_PAID") {
    return "PARTIALLY PAID";
  }

  if (value === "CANCELLED") {
    return "CANCELLED";
  }

  return "UNPAID";
}

function getStatusClass(status) {
  const value = String(status || "").toUpperCase();

  if (value === "PAID") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (value === "PARTIALLY_PAID") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (value === "CANCELLED") {
    return "border-slate-200 bg-slate-100 text-slate-600";
  }

  return "border-red-200 bg-red-50 text-red-700";
}

function getPaymentMethodLabel(method) {
  const value = String(method || "").toUpperCase();

  const methods = {
    CASH: "Cash",
    MOBILE_MONEY: "Mobile Money",
    CARD: "Card",
    INSURANCE: "Insurance",
  };

  return methods[value] || method || "-";
}

function getPaymentId(payment) {
  return (
    payment?.id ||
    payment?.paymentId ||
    payment?.payment?.id ||
    null
  );
}

function getInvoiceId(payment) {
  return (
    payment?.invoiceId ||
    payment?.invoice?.id ||
    payment?.invoice?.invoiceId ||
    null
  );
}

function normalizeInvoice(invoice) {
  const patient = invoice?.patient || null;

  const firstName = patient?.firstName || "";
  const middleName = patient?.middleName || "";
  const lastName = patient?.lastName || "";

  const generatedPatientName =
    `${firstName} ${middleName} ${lastName}`
      .replace(/\s+/g, " ")
      .trim();

  const items = Array.isArray(invoice?.items)
    ? invoice.items
    : [];

  return {
    id: invoice?.id ?? null,

    invoiceNumber:
      invoice?.invoiceNumber ||
      invoice?.invoiceNo ||
      `INV-${invoice?.id || "-"}`,

    patientId:
      invoice?.patientId ||
      patient?.id ||
      "-",

    patientName:
      invoice?.patientName ||
      generatedPatientName ||
      "Unknown Patient",

    phone:
      invoice?.phone ||
      patient?.phone ||
      patient?.phoneNumber ||
      "-",

    email:
      invoice?.email ||
      patient?.email ||
      "-",

    address:
      invoice?.address ||
      patient?.address ||
      patient?.city ||
      "-",

    billingType:
      invoice?.billingType ||
      "CASH",

    notes:
      invoice?.notes ||
      "",

    invoiceDate:
      invoice?.invoiceDate ||
      invoice?.createdAt ||
      invoice?.date ||
      null,

    totalAmount: Number(
      invoice?.totalAmount ??
        invoice?.total ??
        0
    ),

    paidAmount: Number(
      invoice?.paidAmount ??
        invoice?.paid ??
        0
    ),

    balanceAmount: Number(
      invoice?.balanceAmount ??
        invoice?.balance ??
        0
    ),

    status:
      invoice?.status ||
      "UNPAID",

    items: items.map((item, index) => ({
      id:
        item?.id ||
        `${invoice?.id || "invoice"}-${index}`,

      description:
        item?.description ||
        item?.serviceName ||
        item?.name ||
        "Service",

      quantity: Number(
        item?.quantity || 1
      ),

      unitPrice: Number(
        item?.unitPrice ??
          item?.price ??
          0
      ),

      total:
        Number(
          item?.total ??
            item?.lineTotal ??
            (
              Number(item?.quantity || 1) *
              Number(
                item?.unitPrice ??
                  item?.price ??
                  0
              )
            )
        ),
    })),
  };
}

function normalizePayment(payment) {
  return {
    id: getPaymentId(payment),

    invoiceId: getInvoiceId(payment),

    paymentMethod:
      payment?.paymentMethod ||
      payment?.method ||
      "CASH",

    amount: Number(
      payment?.amount || 0
    ),

    paymentReference:
      payment?.paymentReference ||
      payment?.reference ||
      "-",

    notes:
      payment?.notes ||
      "",

    paidAt:
      payment?.paidAt ||
      payment?.paymentDate ||
      payment?.createdAt ||
      null,
  };
}

export default function Receipt() {
  const { paymentId } = useParams();

  const [payment, setPayment] = useState(null);
  const [invoice, setInvoice] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReceipt = async () => {
    try {
      setLoading(true);
      setError("");

      if (!paymentId) {
        throw new Error(
          "Payment ID haipo kwenye URL."
        );
      }

      console.log(
        "Loading receipt for payment ID:",
        paymentId
      );

      // -------------------------------------------------
      // 1. LOAD PAYMENT
      // -------------------------------------------------

      const paymentResponse = await api.get(
        `/payments/${paymentId}`
      );

      console.log(
        "Payment response:",
        paymentResponse.data
      );

      const paymentData =
        paymentResponse?.data;

      if (!paymentData) {
        throw new Error(
          "Payment haikupatikana."
        );
      }

      const normalizedPayment =
        normalizePayment(paymentData);

      setPayment(normalizedPayment);

      // -------------------------------------------------
      // 2. GET INVOICE ID
      // -------------------------------------------------

      const invoiceId =
        getInvoiceId(paymentData);

      console.log(
        "Invoice ID from payment:",
        invoiceId
      );

      if (!invoiceId) {
        throw new Error(
          "Payment imepatikana lakini Invoice ID haikurudi kutoka server."
        );
      }

      // -------------------------------------------------
      // 3. LOAD INVOICE
      // -------------------------------------------------

      const invoiceResponse =
        await api.get(
          `/invoices/${invoiceId}`
        );

      console.log(
        "Invoice response:",
        invoiceResponse.data
      );

      if (!invoiceResponse?.data) {
        throw new Error(
          "Invoice haikupatikana."
        );
      }

      setInvoice(
        normalizeInvoice(
          invoiceResponse.data
        )
      );
    } catch (err) {
      console.error(
        "Failed to load receipt:",
        err
      );

      console.error(
        "Receipt error response:",
        err?.response?.data
      );

      setError(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Imeshindikana kupakia receipt."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipt();
  }, [paymentId]);

  const handlePrint = () => {
    window.print();
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-5xl">

          <Link
            to="/billing/payments"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-cyan-700"
          >
            <ArrowLeft size={18} />
            Back to Payments
          </Link>

          <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm">

            <Loader2
              size={46}
              className="mx-auto animate-spin text-cyan-600"
            />

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Loading Receipt...
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Tafadhali subiri tunapopakia taarifa za malipo.
            </p>

          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !payment || !invoice) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="mx-auto max-w-3xl">

          <Link
            to="/billing/payments"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-cyan-700"
          >
            <ArrowLeft size={18} />
            Back to Payments
          </Link>

          <div className="rounded-3xl border border-red-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <AlertCircle
                size={34}
                className="text-red-500"
              />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-900">
              Receipt Haikupatikana
            </h2>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
              {error ||
                "Taarifa za payment au invoice hazikupatikana."}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">

              <button
                type="button"
                onClick={fetchReceipt}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCw size={17} />
                Retry
              </button>

              <Link
                to="/billing/payments"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <CreditCard size={17} />
                Payments
              </Link>

            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Debug Information
              </p>

              <p className="mt-2 text-sm text-slate-600">
                Payment ID:
                <span className="ml-2 font-bold text-slate-900">
                  {paymentId || "-"}
                </span>
              </p>

            </div>

          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // RECEIPT
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">

      {/* PRINT CSS */}
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 10mm;
            }

            html,
            body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
            }

            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .print-hidden {
              display: none !important;
            }

            .receipt-page {
              width: 100% !important;
              max-width: none !important;
              margin: 0 !important;
              box-shadow: none !important;
              border: none !important;
            }
          }
        `}
      </style>

      <div className="mx-auto max-w-5xl">

        {/* TOP ACTIONS */}

        <div className="print-hidden mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <Link
            to="/billing/payments"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-cyan-700"
          >
            <ArrowLeft size={18} />
            Back to Payments
          </Link>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Printer size={18} />
            Print Receipt
          </button>

        </div>

        {/* RECEIPT */}

        <div
          className="receipt-page overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl"
        >

          {/* HEADER */}

          <div className="border-b border-slate-200 bg-gradient-to-r from-cyan-700 to-cyan-600 px-6 py-7 text-white md:px-10">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

              <div className="flex items-start gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                  <Building2 size={28} />
                </div>

                <div>

                  <h1 className="text-2xl font-bold">
                    CityCare Medical Clinic
                  </h1>

                  <p className="mt-1 text-sm text-cyan-100">
                    Clinic Management System
                  </p>

                  <div className="mt-3 space-y-1 text-xs text-cyan-100">

                    <p className="flex items-center gap-2">
                      <Phone size={13} />
                      +255 XXX XXX XXX
                    </p>

                    <p className="flex items-center gap-2">
                      <Mail size={13} />
                      info@citycareclinic.com
                    </p>

                  </div>

                </div>

              </div>

              <div className="sm:text-right">

                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
                  <ReceiptIcon size={16} />
                  PAYMENT RECEIPT
                </div>

                <p className="mt-3 text-xs text-cyan-100">
                  Receipt Payment ID
                </p>

                <p className="text-lg font-bold">
                  #{payment.id}
                </p>

              </div>

            </div>

          </div>

          {/* RECEIPT BODY */}

          <div className="p-6 md:p-10">

            {/* INVOICE + DATE */}

            <div className="grid grid-cols-1 gap-5 border-b border-slate-200 pb-7 sm:grid-cols-3">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Invoice Number
                </p>

                <p className="mt-2 text-lg font-bold text-slate-900">
                  {invoice.invoiceNumber}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Invoice Date
                </p>

                <p className="mt-2 flex items-center gap-2 font-semibold text-slate-800">
                  <CalendarDays
                    size={17}
                    className="text-cyan-600"
                  />
                  {formatDate(invoice.invoiceDate)}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Payment Date
                </p>

                <p className="mt-2 font-semibold text-slate-800">
                  {formatDateTime(payment.paidAt)}
                </p>
              </div>

            </div>

            {/* PATIENT */}

            <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">

              <div className="flex items-start gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-600 shadow-sm">
                  <User size={22} />
                </div>

                <div className="min-w-0 flex-1">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Patient
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-slate-900">
                    {invoice.patientName}
                  </h2>

                  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">

                    <span>
                      Patient ID:{" "}
                      <strong className="text-slate-700">
                        {invoice.patientId}
                      </strong>
                    </span>

                    {invoice.phone !== "-" && (
                      <span>
                        Phone:{" "}
                        <strong className="text-slate-700">
                          {invoice.phone}
                        </strong>
                      </span>
                    )}

                  </div>

                </div>

              </div>

            </div>

            {/* ITEMS */}

            <div className="mt-8">

              <h3 className="mb-4 text-lg font-bold text-slate-900">
                Invoice Items
              </h3>

              <div className="overflow-hidden rounded-2xl border border-slate-200">

                <table className="w-full">

                  <thead>

                    <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">

                      <th className="px-5 py-4">
                        Description
                      </th>

                      <th className="px-5 py-4 text-center">
                        Qty
                      </th>

                      <th className="px-5 py-4 text-right">
                        Unit Price
                      </th>

                      <th className="px-5 py-4 text-right">
                        Total
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {invoice.items.length > 0 ? (
                      invoice.items.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-slate-100 last:border-0"
                        >

                          <td className="px-5 py-4 font-medium text-slate-800">
                            {item.description}
                          </td>

                          <td className="px-5 py-4 text-center text-slate-600">
                            {item.quantity}
                          </td>

                          <td className="px-5 py-4 text-right text-slate-600">
                            TZS{" "}
                            {formatCurrency(
                              item.unitPrice
                            )}
                          </td>

                          <td className="px-5 py-4 text-right font-semibold text-slate-900">
                            TZS{" "}
                            {formatCurrency(
                              item.total
                            )}
                          </td>

                        </tr>
                      ))
                    ) : (
                      <tr>

                        <td
                          colSpan="4"
                          className="px-5 py-8 text-center text-sm text-slate-400"
                        >
                          No invoice items available.
                        </td>

                      </tr>
                    )}

                  </tbody>

                </table>

              </div>

            </div>

            {/* PAYMENT SUMMARY */}

            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                <h3 className="font-bold text-slate-900">
                  Payment Information
                </h3>

                <div className="mt-4 space-y-3">

                  <div className="flex items-center justify-between gap-4">

                    <span className="text-sm text-slate-500">
                      Payment Method
                    </span>

                    <span className="flex items-center gap-2 font-semibold text-slate-800">
                      <CreditCard
                        size={17}
                        className="text-cyan-600"
                      />

                      {getPaymentMethodLabel(
                        payment.paymentMethod
                      )}
                    </span>

                  </div>

                  <div className="flex items-center justify-between gap-4">

                    <span className="text-sm text-slate-500">
                      Reference
                    </span>

                    <span className="max-w-[220px] break-all text-right text-sm font-semibold text-slate-800">
                      {payment.paymentReference || "-"}
                    </span>

                  </div>

                  {payment.notes && (
                    <div className="border-t border-slate-200 pt-3">

                      <p className="text-xs text-slate-400">
                        Notes
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {payment.notes}
                      </p>

                    </div>
                  )}

                </div>

              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">

                <div className="space-y-3">

                  <div className="flex items-center justify-between">

                    <span className="text-sm text-slate-500">
                      Invoice Total
                    </span>

                    <span className="font-semibold text-slate-800">
                      TZS{" "}
                      {formatCurrency(
                        invoice.totalAmount
                      )}
                    </span>

                  </div>

                  <div className="flex items-center justify-between">

                    <span className="text-sm text-slate-500">
                      Total Paid
                    </span>

                    <span className="font-semibold text-emerald-600">
                      TZS{" "}
                      {formatCurrency(
                        invoice.paidAmount
                      )}
                    </span>

                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200 pt-4">

                    <span className="font-bold text-slate-800">
                      Balance
                    </span>

                    <span className="text-xl font-bold text-slate-900">
                      TZS{" "}
                      {formatCurrency(
                        invoice.balanceAmount
                      )}
                    </span>

                  </div>

                  <div className="pt-2">

                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold ${getStatusClass(
                        invoice.status
                      )}`}
                    >
                      <CheckCircle2 size={15} />
                      {getStatusLabel(
                        invoice.status
                      )}
                    </span>

                  </div>

                </div>

              </div>

            </div>

            {/* PAYMENT AMOUNT */}

            <div className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-sm font-medium text-emerald-700">
                    Amount Received
                  </p>

                  <p className="mt-1 text-3xl font-bold text-emerald-800">
                    TZS{" "}
                    {formatCurrency(
                      payment.amount
                    )}
                  </p>

                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                  <CheckCircle2 size={30} />
                </div>

              </div>

            </div>

            {/* FOOTER */}

            <div className="mt-10 border-t border-slate-200 pt-7 text-center">

              <p className="font-semibold text-slate-700">
                Thank you for your payment.
              </p>

              <p className="mt-1 text-sm text-slate-400">
                This is a computer-generated receipt.
              </p>

              <p className="mt-4 text-xs text-slate-400">
                CityCare Medical Clinic • Clinic Management System
              </p>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}