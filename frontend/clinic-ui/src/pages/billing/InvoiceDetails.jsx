import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Printer,
  FileText,
  User,
  CalendarDays,
  CreditCard,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Loader2,
  RefreshCw,
  HeartPulse,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
} from "lucide-react";

import api from "../../services/api";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-TZ").format(
    Number(amount || 0)
  );
}

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusLabel(status) {
  if (status === "PAID") {
    return "PAID";
  }

  if (status === "PARTIALLY_PAID") {
    return "PARTIALLY PAID";
  }

  if (status === "CANCELLED") {
    return "CANCELLED";
  }

  return "UNPAID";
}

function getStatusClass(status) {
  if (status === "PAID") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  if (status === "PARTIALLY_PAID") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }

  if (status === "CANCELLED") {
    return "bg-slate-100 text-slate-600 border-slate-200";
  }

  return "bg-red-50 text-red-700 border-red-200";
}

function normalizeInvoice(invoice) {
  return {
    id: invoice.id,

    invoiceNumber:
      invoice.invoiceNumber ||
      `INV-${invoice.id}`,

    patientId:
      invoice.patientId ||
      invoice.patient?.id ||
      "-",

    patientName:
      invoice.patientName ||
      (
        invoice.patient
          ? `${invoice.patient.firstName || ""} ${
              invoice.patient.lastName || ""
            }`.trim()
          : "Unknown Patient"
      ),

    phone:
      invoice.patient?.phone ||
      invoice.phone ||
      "-",

    type:
      invoice.billingType === "INSURANCE"
        ? "Insurance"
        : "Cash",

    date: formatDate(invoice.createdAt),

    services: Array.isArray(invoice.items)
      ? invoice.items.map((item) => ({
          id: item.id,
          name:
            item.description ||
            "Service / Item",
          quantity: Number(
            item.quantity || 0
          ),
          price: Number(
            item.unitPrice || 0
          ),
          totalPrice: Number(
            item.totalPrice ||
              Number(item.quantity || 0) *
                Number(item.unitPrice || 0)
          ),
        }))
      : [],

    total: Number(
      invoice.totalAmount || 0
    ),

    paid: Number(
      invoice.paidAmount || 0
    ),

    balance: Number(
      invoice.balanceAmount || 0
    ),

    status:
      invoice.status || "UNPAID",

    insuranceProvider:
      invoice.insuranceProvider?.name ||
      invoice.insuranceProviderName ||
      "-",

    memberNumber:
      invoice.memberNumber ||
      "-",

    notes:
      invoice.notes || "",
  };
}

export default function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoiceData, setInvoiceData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/invoices/${id}`
      );

      setInvoiceData(response.data);
    } catch (err) {
      console.error(
        "Failed to load invoice:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load invoice. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchInvoice();
    }
  }, [id]);

  const invoice = useMemo(() => {
    if (!invoiceData) {
      return null;
    }

    return normalizeInvoice(invoiceData);
  }, [invoiceData]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl">

          <Link
            to="/billing/invoices"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={18} />
            Back to Invoices
          </Link>

          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">

            <Loader2
              size={42}
              className="mx-auto animate-spin text-blue-600"
            />

            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Loading Invoice...
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Please wait while invoice details are being loaded.
            </p>

          </div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl">

          <Link
            to="/billing/invoices"
            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={18} />
            Back to Invoices
          </Link>

          <div className="rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">

            <FileText
              size={48}
              className="mx-auto mb-4 text-red-300"
            />

            <h2 className="text-xl font-bold text-slate-900">
              Invoice Not Found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error ||
                "The invoice you are looking for does not exist."}
            </p>

            <div className="mt-6 flex justify-center gap-3">

              <button
                type="button"
                onClick={fetchInvoice}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw size={16} />
                Retry
              </button>

              <Link
                to="/billing/invoices"
                className="inline-flex rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                View Invoices
              </Link>

            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* PRINT STYLES */}
      {/*<style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }

          html,
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-hidden {
            display: none !important;
          }

          .print-page {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .invoice-paper {
            width: 100% !important;
            max-width: none !important;
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }

          .avoid-break {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          table {
            page-break-inside: auto;
          }

          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}</style>*/}
      <style>{`
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

    body * {
      visibility: hidden !important;
    }

    .invoice-paper,
    .invoice-paper * {
      visibility: visible !important;
    }

    .invoice-paper {
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;

      width: 100% !important;
      max-width: none !important;

      margin: 0 !important;
      padding: 0 !important;

      border: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;

      background: white !important;
    }

    .print-hidden {
      display: none !important;
      visibility: hidden !important;
    }

    .avoid-break {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    table {
      width: 100% !important;
      page-break-inside: auto !important;
    }

    tr {
      page-break-inside: avoid !important;
      page-break-after: auto !important;
    }

    thead {
      display: table-header-group;
    }

    tfoot {
      display: table-footer-group;
    }

    button,
    nav,
    aside,
    header,
    footer {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
`}</style>

      {/*<div className="min-h-screen bg-slate-100 p-4 md:p-6 print:bg-white print:p-0">*/}
      <div className="invoice-screen min-h-screen bg-slate-100 p-4 md:p-6 print:bg-white print:p-0">

        <div className="print-page mx-auto max-w-6xl">

          {/* SCREEN HEADER */}
          <div className="print-hidden mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <Link
                to="/billing/invoices"
                className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft size={18} />
                Back to Invoices
              </Link>

              <h1 className="text-2xl font-bold text-slate-900">
                Invoice Details
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                View invoice information and payment details
              </p>

            </div>

            <div className="flex gap-3">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/billing/payments?invoice=${invoice.id}`
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <CreditCard size={18} />
                Receive Payment
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              >
                <Printer size={18} />
                Print Invoice
              </button>

            </div>
          </div>

          {/* PROFESSIONAL INVOICE */}
          <div className="invoice-paper overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

            {/* CLINIC HEADER */}
            <div className="border-b-4 border-blue-600 px-6 py-6 sm:px-10 sm:py-8">

              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

                {/* LOGO + CLINIC */}
                <div className="flex items-center gap-4">

                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-600 shadow-sm">
                    <HeartPulse
                      size={36}
                      strokeWidth={2.5}
                      className="text-white"
                    />
                  </div>

                  <div>

                    <h1 className="text-2xl font-extrabold tracking-tight text-blue-900 sm:text-3xl">
                      CityCare Medical Clinic
                    </h1>

                    <p className="mt-1 text-sm font-medium text-blue-600">
                      Your Health, Our Priority
                    </p>

                  </div>

                </div>

                {/* CONTACT */}
                <div className="space-y-2 text-sm text-slate-600">

                  <div className="flex items-center gap-2">
                    <MapPin
                      size={15}
                      className="text-blue-600"
                    />
                    <span>
                      123 Mwenge Road, Dar es Salaam
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone
                      size={15}
                      className="text-blue-600"
                    />
                    <span>
                      +255 712 345 678
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail
                      size={15}
                      className="text-blue-600"
                    />
                    <span>
                      info@citycareclinic.co.tz
                    </span>
                  </div>

                </div>

              </div>
            </div>

            {/* INVOICE TITLE + META */}
            <div className="px-6 py-7 sm:px-10">

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                    Professional Healthcare Services
                  </p>

                  <h2 className="mt-1 text-4xl font-extrabold tracking-tight text-slate-900">
                    INVOICE
                  </h2>

                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:min-w-[330px]">

                  <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-2 text-sm">

                    <span className="text-slate-500">
                      Invoice No:
                    </span>

                    <span className="font-bold text-slate-900">
                      {invoice.invoiceNumber}
                    </span>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(
                        invoice.status
                      )}`}
                    >
                      {getStatusLabel(
                        invoice.status
                      )}
                    </span>

                    <span className="text-slate-500">
                      Date:
                    </span>

                    <span className="font-semibold text-slate-900">
                      {invoice.date}
                    </span>

                    <span />

                  </div>

                </div>

              </div>
            </div>

            {/* PATIENT + BILLING */}
            <div className="grid gap-5 px-6 pb-7 sm:grid-cols-2 sm:px-10">

              {/* PATIENT CARD */}
              <div className="avoid-break overflow-hidden rounded-xl border border-blue-100">

                <div className="flex items-center gap-2 border-b border-blue-100 bg-blue-50 px-5 py-3">

                  <User
                    size={18}
                    className="text-blue-700"
                  />

                  <h3 className="text-sm font-bold uppercase tracking-wide text-blue-900">
                    Patient Information
                  </h3>

                </div>

                <div className="space-y-3 p-5">

                  <p className="text-lg font-bold text-slate-900">
                    {invoice.patientName}
                  </p>

                  <div className="grid grid-cols-[100px_1fr] gap-y-2 text-sm">

                    <span className="text-slate-500">
                      Patient ID:
                    </span>

                    <span className="font-semibold text-slate-800">
                      {invoice.patientId}
                    </span>

                    <span className="text-slate-500">
                      Phone:
                    </span>

                    <span className="font-semibold text-slate-800">
                      {invoice.phone}
                    </span>

                    <span className="text-slate-500">
                      Billing:
                    </span>

                    <span className="font-semibold text-slate-800">
                      {invoice.type}
                    </span>

                  </div>

                </div>
              </div>

              {/* BILLING CARD */}
              <div className="avoid-break overflow-hidden rounded-xl border border-blue-100">

                <div className="flex items-center gap-2 border-b border-blue-100 bg-blue-50 px-5 py-3">

                  <CreditCard
                    size={18}
                    className="text-blue-700"
                  />

                  <h3 className="text-sm font-bold uppercase tracking-wide text-blue-900">
                    Billing Information
                  </h3>

                </div>

                <div className="space-y-3 p-5">

                  <div className="grid grid-cols-[140px_1fr] gap-y-2 text-sm">

                    <span className="text-slate-500">
                      Billing Type:
                    </span>

                    <span className="font-semibold text-slate-900">
                      {invoice.type}
                    </span>

                    {invoice.type === "Insurance" && (
                      <>
                        <span className="text-slate-500">
                          Provider:
                        </span>

                        <span className="font-semibold text-slate-900">
                          {invoice.insuranceProvider}
                        </span>

                        <span className="text-slate-500">
                          Member No:
                        </span>

                        <span className="font-semibold text-slate-900">
                          {invoice.memberNumber}
                        </span>
                      </>
                    )}

                    <span className="text-slate-500">
                      Status:
                    </span>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${getStatusClass(
                        invoice.status
                      )}`}
                    >
                      {getStatusLabel(
                        invoice.status
                      )}
                    </span>

                  </div>

                </div>
              </div>

            </div>

            {/* SERVICES */}
            <div className="px-6 pb-7 sm:px-10">

              <div className="mb-4 flex items-center gap-2">

                <FileText
                  size={20}
                  className="text-blue-700"
                />

                <h3 className="text-lg font-bold text-slate-900">
                  Services / Items
                </h3>

              </div>

              <div className="overflow-hidden rounded-xl border border-blue-100">

                <table className="w-full">

                  <thead>

                    <tr className="border-b border-blue-100 bg-blue-50">

                      <th className="w-12 px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-blue-900">
                        #
                      </th>

                      <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-blue-900">
                        Item / Service
                      </th>

                      <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wide text-blue-900">
                        Qty
                      </th>

                      <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-blue-900">
                        Unit Price
                      </th>

                      <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-blue-900">
                        Amount
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {invoice.services.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-5 py-8 text-center text-sm text-slate-500"
                        >
                          No invoice items found.
                        </td>
                      </tr>
                    ) : (
                      invoice.services.map(
                        (service, index) => (
                          <tr
                            key={
                              service.id ||
                              index
                            }
                            className="border-b border-slate-100 last:border-0"
                          >

                            <td className="px-4 py-3 text-center text-sm text-slate-500">
                              {index + 1}
                            </td>

                            <td className="px-4 py-3 text-sm font-medium text-slate-900">
                              {service.name}
                            </td>

                            <td className="px-4 py-3 text-center text-sm text-slate-600">
                              {service.quantity}
                            </td>

                            <td className="px-4 py-3 text-right text-sm text-slate-600">
                              TZS{" "}
                              {formatCurrency(
                                service.price
                              )}
                            </td>

                            <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                              TZS{" "}
                              {formatCurrency(
                                service.totalPrice
                              )}
                            </td>

                          </tr>
                        )
                      )
                    )}

                  </tbody>

                </table>
              </div>
            </div>

            {/* PAYMENT + TOTAL */}
            <div className="grid gap-6 px-6 pb-8 sm:grid-cols-2 sm:px-10">

              {/* PAYMENT SUMMARY */}
              <div className="avoid-break">

                <div className="mb-3 flex items-center gap-2">

                  <CreditCard
                    size={19}
                    className="text-blue-700"
                  />

                  <h3 className="font-bold text-slate-900">
                    Payment Summary
                  </h3>

                </div>

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">

                  <div className="space-y-3 text-sm">

                    <div className="flex justify-between gap-4">

                      <span className="text-slate-500">
                        Billing Type
                      </span>

                      <span className="font-semibold text-slate-900">
                        {invoice.type}
                      </span>

                    </div>

                    <div className="flex justify-between gap-4">

                      <span className="text-slate-500">
                        Amount Paid
                      </span>

                      <span className="font-semibold text-emerald-700">
                        TZS{" "}
                        {formatCurrency(
                          invoice.paid
                        )}
                      </span>

                    </div>

                    <div className="flex justify-between gap-4">

                      <span className="text-slate-500">
                        Payment Status
                      </span>

                      <span className="font-semibold text-slate-900">
                        {getStatusLabel(
                          invoice.status
                        )}
                      </span>

                    </div>

                  </div>

                </div>
              </div>

              {/* TOTAL SUMMARY */}
              <div className="avoid-break rounded-xl bg-blue-50 p-5">

                <div className="space-y-3">

                  <div className="flex items-center justify-between text-sm">

                    <span className="text-slate-600">
                      Total Amount
                    </span>

                    <span className="font-bold text-slate-900">
                      TZS{" "}
                      {formatCurrency(
                        invoice.total
                      )}
                    </span>

                  </div>

                  <div className="flex items-center justify-between text-sm">

                    <span className="text-slate-600">
                      Amount Paid
                    </span>

                    <span className="font-bold text-emerald-700">
                      TZS{" "}
                      {formatCurrency(
                        invoice.paid
                      )}
                    </span>

                  </div>

                  <div className="border-t border-blue-200 pt-4">

                    <div className="flex items-center justify-between">

                      <span className="font-extrabold text-slate-900">
                        Outstanding Balance
                      </span>

                      <span
                        className={`text-xl font-extrabold ${
                          invoice.balance > 0
                            ? "text-red-600"
                            : "text-emerald-600"
                        }`}
                      >
                        TZS{" "}
                        {formatCurrency(
                          invoice.balance
                        )}
                      </span>

                    </div>

                  </div>

                </div>
              </div>

            </div>

            {/* NOTES */}
            {invoice.notes && (
              <div className="px-6 pb-8 sm:px-10">

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Notes
                  </p>

                  <p className="mt-1 text-sm text-slate-700">
                    {invoice.notes}
                  </p>

                </div>

              </div>
            )}

            {/* THANK YOU + SIGNATURE */}
            <div className="grid gap-8 border-t border-blue-100 px-6 py-8 sm:grid-cols-2 sm:px-10">

              <div>

                <p className="font-semibold italic text-blue-700">
                  Thank you for choosing CityCare Medical Clinic.
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  We are committed to providing you
                  with quality healthcare services.
                </p>

              </div>

              <div className="text-center sm:text-right">

                <div className="ml-auto w-56 border-t border-slate-400 pt-2">

                  <p className="text-sm font-semibold text-slate-800">
                    Authorized Signature
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    CityCare Medical Clinic
                  </p>

                </div>

              </div>

            </div>

            {/* FOOTER */}
            <div className="border-t-4 border-blue-600 bg-slate-50 px-6 py-5 sm:px-10">

              <div className="grid gap-4 text-center sm:grid-cols-3">

                <div className="flex items-center justify-center gap-2">

                  <ShieldCheck
                    size={22}
                    className="text-blue-600"
                  />

                  <div className="text-left">

                    <p className="text-xs font-bold text-blue-900">
                      Quality Care
                    </p>

                    <p className="text-[10px] text-slate-500">
                      Better Health for a Brighter Future
                    </p>

                  </div>

                </div>

                <div className="flex items-center justify-center gap-2">

                  <HeartPulse
                    size={22}
                    className="text-blue-600"
                  />

                  <div className="text-left">

                    <p className="text-xs font-bold text-blue-900">
                      Professional Care
                    </p>

                    <p className="text-[10px] text-slate-500">
                      Your Health Matters
                    </p>

                  </div>

                </div>

                <div className="flex items-center justify-center gap-2">

                  <CheckCircle2
                    size={22}
                    className="text-blue-600"
                  />

                  <div className="text-left">

                    <p className="text-xs font-bold text-blue-900">
                      Trusted Service
                    </p>

                    <p className="text-[10px] text-slate-500">
                      Always Here for You
                    </p>

                  </div>

                </div>

              </div>

              <p className="mt-5 text-center text-[10px] text-slate-400">
                This invoice is generated by the Clinic Management System.
              </p>

            </div>

          </div>
        </div>
      </div>
    </>
  );
}