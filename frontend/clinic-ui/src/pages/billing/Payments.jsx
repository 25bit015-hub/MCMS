import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Search,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  Clock3,
  Receipt,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

import api from "../../services/api";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-TZ").format(Number(amount || 0));
}

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function PaymentMethodIcon({ method }) {
  if (method === "Mobile Money") {
    return <Smartphone size={18} />;
  }

  if (method === "Card") {
    return <CreditCard size={18} />;
  }

  return <Banknote size={18} />;
}

function normalizeInvoice(invoice) {
  return {
    id: invoice.id,
    invoiceNo: invoice.invoiceNumber || invoice.invoiceNo || "-",
    patientId: invoice.patientId || "-",
    patientName: invoice.patientName || "-",
    type: invoice.billingType === "INSURANCE" ? "Insurance" : "Cash",
    total: Number(invoice.totalAmount || 0),
    paid: Number(invoice.paidAmount || 0),
    balance: Number(invoice.balanceAmount || 0),
    status: invoice.status || "UNPAID",
  };
}

function normalizePayment(payment) {
  const methodMap = {
    CASH: "Cash",
    MOBILE_MONEY: "Mobile Money",
    CARD: "Card",
    INSURANCE: "Insurance",
  };

  return {
    id: payment.id,
    invoiceId: payment.invoiceId ?? payment.invoice?.id ?? null,
    invoiceNo:
      payment.invoiceNumber ||
      payment.invoiceNo ||
      payment.invoice?.invoiceNumber ||
      "-",
    patientName:
      payment.patientName ||
      payment.invoice?.patientName ||
      "-",
    method:
      methodMap[payment.paymentMethod] ||
      payment.paymentMethod ||
      payment.method ||
      "-",
    amount: Number(payment.amount || 0),
    reference:
      payment.paymentReference ||
      payment.reference ||
      "-",
    paidAt: payment.paidAt || payment.createdAt || null,
  };
}

export default function Payments() {
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [lastPaymentId, setLastPaymentId] = useState(null);

  const [searchParams] = useSearchParams();
  const invoiceIdFromUrl = searchParams.get("invoice");

  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");

  // =====================================================
  // LOAD INVOICES
  // =====================================================

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/invoices");

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      const normalized = data.map(normalizeInvoice);

      setInvoices(normalized);

      if (selectedInvoice) {
        const updatedSelected = normalized.find(
          (invoice) => invoice.id === selectedInvoice.id
        );

        if (updatedSelected) {
          setSelectedInvoice(updatedSelected);
        }
      }
    } catch (err) {
      console.error("Failed to load invoices:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load invoices. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD PAYMENT HISTORY
  // =====================================================

  const fetchPayments = async () => {
    try {
      setPaymentsLoading(true);

      const response = await api.get("/payments");

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setPayments(data.map(normalizePayment));
    } catch (err) {
      console.error("Failed to load payments:", err);
    } finally {
      setPaymentsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchPayments();
  }, []);

  useEffect(() => {
    if (!invoiceIdFromUrl || invoices.length === 0) return;

    const invoice = invoices.find(
      (item) => String(item.id) === String(invoiceIdFromUrl)
    );

    if (invoice) {
      setSelectedInvoice(invoice);
      setAmount("");
      setReference("");
      setSuccessMessage("");
      setError("");
    }
  }, [invoiceIdFromUrl, invoices]);

  // =====================================================
  // FILTER OUTSTANDING INVOICES
  // =====================================================

  const filteredInvoices = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return invoices.filter((invoice) => {
      const matchesSearch =
        !keyword ||
        invoice.invoiceNo.toLowerCase().includes(keyword) ||
        invoice.patientName.toLowerCase().includes(keyword) ||
        String(invoice.patientId).toLowerCase().includes(keyword);

      const matchesType =
        typeFilter === "All" || invoice.type === typeFilter;

      return (
        matchesSearch &&
        matchesType &&
        invoice.balance > 0 &&
        invoice.status !== "CANCELLED"
      );
    });
  }, [invoices, search, typeFilter]);

  // =====================================================
  // FILTER PAYMENT HISTORY
  // =====================================================

  const paymentHistory = useMemo(() => {
  return payments.map((payment) => {
    const invoice = invoices.find(
      (inv) => Number(inv.id) === Number(payment.invoiceId)
    );

    return {
      ...payment,
      patientName:
        payment.patientName && payment.patientName !== "-"
          ? payment.patientName
          : invoice?.patientName || "-",
    };
  });
}, [payments, invoices]);

const filteredPayments = useMemo(() => {
  return paymentHistory.filter((payment) => {
    const search = paymentSearch.toLowerCase();

    const matchesSearch =
      payment.invoiceNo.toLowerCase().includes(search) ||
      payment.patientName.toLowerCase().includes(search) ||
      payment.reference.toLowerCase().includes(search);

    const matchesMethod =
      paymentMethodFilter === "All" ||
      payment.method === paymentMethodFilter;

    return matchesSearch && matchesMethod;
  });
}, [paymentHistory, paymentSearch, paymentMethodFilter]);

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalOutstanding = invoices.reduce(
    (sum, invoice) => sum + invoice.balance,
    0
  );

  const totalPendingInvoices = invoices.filter(
    (invoice) =>
      invoice.balance > 0 &&
      invoice.status !== "CANCELLED"
  ).length;

  const totalRecordedPayments = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  );

  // =====================================================
  // SELECT INVOICE
  // =====================================================

  const handleSelectInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setLastPaymentId(null);
    setAmount("");
    setReference("");
    setSuccessMessage("");
    setError("");
  };

  // =====================================================
  // RECORD PAYMENT
  // =====================================================

  const handleRecordPayment = async () => {
    if (!selectedInvoice) {
      setError("Please select an invoice.");
      return;
    }

    const paymentAmount = Number(amount) || 0;

    if (paymentAmount <= 0) {
      setError("Payment amount must be greater than zero.");
      return;
    }

    if (paymentAmount > selectedInvoice.balance) {
      setError(
        "Payment amount cannot be greater than invoice balance."
      );
      return;
    }

    if (
      (paymentMethod === "Mobile Money" ||
        paymentMethod === "Card") &&
      !reference.trim()
    ) {
      setError("Please enter payment reference.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccessMessage("");

      const methodMap = {
        Cash: "CASH",
        "Mobile Money": "MOBILE_MONEY",
        Card: "CARD",
      };

      const paymentData = {
        invoiceId: selectedInvoice.id,
        paymentMethod: methodMap[paymentMethod],
        amount: paymentAmount,
        paymentReference: reference.trim() || null,
        notes: `Payment for ${selectedInvoice.invoiceNo}`,
      };

      const response = await api.post("/payments", paymentData);

      console.log("Payment created:", response.data);

      setLastPaymentId(response.data.id);

      setSuccessMessage(
        `Payment of TZS ${formatCurrency(
          paymentAmount
        )} recorded successfully.`
      );

      setAmount("");
      setReference("");

      await fetchInvoices();
      await fetchPayments();

      const refreshedResponse = await api.get("/invoices");

      const refreshedData = Array.isArray(
        refreshedResponse.data
      )
        ? refreshedResponse.data
        : [];

      const refreshedInvoices =
        refreshedData.map(normalizeInvoice);

      setInvoices(refreshedInvoices);

      const updatedInvoice = refreshedInvoices.find(
        (invoice) => invoice.id === selectedInvoice.id
      );

      if (updatedInvoice) {
        setSelectedInvoice(updatedInvoice);
      }
    } catch (err) {
      console.error("Failed to record payment:", err);

      setError(
        err.response?.data?.message ||
          "Failed to record payment. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // CLOSE PAYMENT
  // =====================================================

  const closePayment = () => {
    setSelectedInvoice(null);
    setLastPaymentId(null);
    setAmount("");
    setReference("");
    setSuccessMessage("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-cyan-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/billing"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-cyan-700"
            >
              <ArrowLeft size={17} />
              Back to Billing
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-600 text-white shadow-lg shadow-cyan-200">
                <CreditCard size={24} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Payments
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Record and manage outstanding invoice payments.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                fetchInvoices();
                fetchPayments();
              }}
              disabled={loading || paymentsLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={
                  loading || paymentsLoading
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh
            </button>

            <div className="flex items-center gap-3 rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 shadow-sm">
              <CreditCard
                size={21}
                className="text-cyan-600"
              />

              <div>
                <p className="text-xs text-cyan-600">
                  Outstanding
                </p>

                <p className="font-semibold text-cyan-900">
                  TZS {formatCurrency(totalOutstanding)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 shadow-sm">
            <p className="font-semibold text-red-700">
              Payment Error
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>
          </div>
        )}

        {/* SUCCESS */}
        {successMessage && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={20}
                  className="text-emerald-600"
                />

                <p className="font-semibold text-emerald-700">
                  {successMessage}
                </p>
              </div>

              {lastPaymentId && (
                <Link
                  to={`/billing/receipt/${lastPaymentId}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  <Receipt size={17} />
                  View Receipt
                </Link>
              )}
            </div>
          </div>
        )}

        {/* SUMMARY */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm text-slate-500">
              Pending Invoices
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {totalPendingInvoices}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Invoices awaiting payment
            </p>
          </div>

          <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm text-slate-500">
              Outstanding Balance
            </p>

            <p className="mt-2 text-xl font-bold text-red-600">
              TZS {formatCurrency(totalOutstanding)}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Amount still to be collected
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm text-slate-500">
              Recorded Payments
            </p>

            <p className="mt-2 text-xl font-bold text-emerald-600">
              TZS {formatCurrency(totalRecordedPayments)}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Payments in payment history
            </p>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <p className="text-sm text-slate-500">
              Payment Status
            </p>

            <p className="mt-2 flex items-center gap-2 font-semibold text-amber-700">
              <Clock3 size={18} />
              Awaiting Payment
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Based on outstanding invoices
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="font-semibold text-slate-900">
              Find Outstanding Invoice
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Search by invoice number, patient name or patient ID.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice or patient..."
                className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100"
            >
              <option value="All">All Billing Types</option>
              <option value="Cash">Cash</option>
              <option value="Insurance">Insurance</option>
            </select>
          </div>
        </div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* INVOICE LIST */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
            <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
              <h2 className="font-semibold text-slate-900">
                Outstanding Invoices
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Select an invoice to record payment.
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2
                  size={38}
                  className="animate-spin text-cyan-600"
                />

                <p className="mt-4 font-medium text-slate-600">
                  Loading invoices...
                </p>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="py-16 text-center">
                <CheckCircle2
                  size={40}
                  className="mx-auto mb-3 text-emerald-300"
                />

                <p className="font-medium text-slate-600">
                  No outstanding invoices
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  All invoices are currently paid.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-5 py-4">Invoice</th>
                      <th className="px-5 py-4">Patient</th>
                      <th className="px-5 py-4">Type</th>
                      <th className="px-5 py-4">Total</th>
                      <th className="px-5 py-4">Balance</th>
                      <th className="px-5 py-4 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredInvoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        className="border-b border-slate-100 last:border-b-0 hover:bg-cyan-50/40"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">
                            {invoice.invoiceNo}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-900">
                            {invoice.patientName}
                          </p>

                          <p className="text-xs text-slate-500">
                            {invoice.patientId}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              invoice.type === "Cash"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-purple-50 text-purple-700"
                            }`}
                          >
                            {invoice.type}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-slate-700">
                          TZS {formatCurrency(invoice.total)}
                        </td>

                        <td className="px-5 py-4 text-sm font-bold text-red-600">
                          TZS {formatCurrency(invoice.balance)}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleSelectInvoice(invoice)}
                            className="rounded-lg bg-cyan-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-cyan-700"
                          >
                            Pay
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* PAYMENT FORM */}
          <div>
            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              {!selectedInvoice ? (
                <div className="py-10 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-500">
                    <Receipt size={30} />
                  </div>

                  <h3 className="font-semibold text-slate-700">
                    Select Invoice
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Select an outstanding invoice from the list to record a payment.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Invoice</p>

                      <h2 className="font-bold text-slate-900">
                        {selectedInvoice.invoiceNo}
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={closePayment}
                      className="text-sm font-medium text-slate-500 hover:text-slate-900"
                    >
                      Close
                    </button>
                  </div>

                  <div className="mb-5 rounded-xl border border-cyan-100 bg-cyan-50 p-4">
                    <p className="text-xs text-cyan-700">
                      Patient
                    </p>

                    <p className="mt-1 font-semibold text-slate-900">
                      {selectedInvoice.patientName}
                    </p>

                    <p className="text-xs text-slate-500">
                      {selectedInvoice.patientId}
                    </p>
                  </div>

                  <div className="space-y-3 border-b border-slate-200 pb-5">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">
                        Invoice Total
                      </span>

                      <span className="font-semibold text-slate-800">
                        TZS {formatCurrency(selectedInvoice.total)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500">
                        Already Paid
                      </span>

                      <span className="font-semibold text-emerald-700">
                        TZS {formatCurrency(selectedInvoice.paid)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        Balance
                      </span>

                      <span className="font-bold text-red-600">
                        TZS {formatCurrency(selectedInvoice.balance)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Payment Method
                    </label>

                    <div className="grid grid-cols-3 gap-2">
                      {["Cash", "Mobile Money", "Card"].map((method) => (
                        <button
                          type="button"
                          key={method}
                          onClick={() => setPaymentMethod(method)}
                          className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-medium transition ${
                            paymentMethod === method
                              ? "border-cyan-500 bg-cyan-50 text-cyan-700 shadow-sm"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <PaymentMethodIcon method={method} />
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Payment Amount
                    </label>

                    <input
                      type="number"
                      min="1"
                      max={selectedInvoice.balance}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      disabled={submitting}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100"
                    />

                    <p className="mt-1 text-xs text-slate-400">
                      Maximum: TZS {formatCurrency(selectedInvoice.balance)}
                    </p>
                  </div>

                  {(paymentMethod === "Mobile Money" ||
                    paymentMethod === "Card") && (
                    <div className="mt-4">
                      <label className="mb-1 block text-sm font-medium text-slate-700">
                        Payment Reference
                      </label>

                      <input
                        type="text"
                        value={reference}
                        onChange={(e) => setReference(e.target.value)}
                        placeholder="Transaction / reference number"
                        disabled={submitting}
                        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100"
                      />
                    </div>
                  )}

                  {selectedInvoice.balance > 0 && (
                    <button
                      type="button"
                      onClick={handleRecordPayment}
                      disabled={submitting}
                      className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <Loader2
                            size={18}
                            className="animate-spin"
                          />
                          Processing Payment...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={18} />
                          Record Payment
                        </>
                      )}
                    </button>
                  )}

                  {selectedInvoice.balance === 0 && (
                    <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                      <CheckCircle2
                        size={25}
                        className="mx-auto mb-2 text-emerald-600"
                      />

                      <p className="font-semibold text-emerald-800">
                        Invoice Fully Paid
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* PAYMENT HISTORY */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Payment History
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  View payments already recorded in the system.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={paymentSearch}
                    onChange={(e) => setPaymentSearch(e.target.value)}
                    placeholder="Search payment, invoice or patient..."
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 sm:w-72"
                  />
                </div>

                <select
                  value={paymentMethodFilter}
                  onChange={(e) =>
                    setPaymentMethodFilter(e.target.value)
                  }
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                >
                  <option value="All">All Methods</option>
                  <option value="Cash">Cash</option>
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Card">Card</option>
                  <option value="Insurance">Insurance</option>
                </select>

                <button
                  type="button"
                  onClick={fetchPayments}
                  disabled={paymentsLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                >
                  <RefreshCw
                    size={16}
                    className={
                      paymentsLoading ? "animate-spin" : ""
                    }
                  />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {paymentsLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2
                size={34}
                className="animate-spin text-cyan-600"
              />

              <p className="mt-3 text-sm font-medium text-slate-600">
                Loading payment history...
              </p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="py-16 text-center">
              <Receipt
                size={40}
                className="mx-auto mb-3 text-slate-300"
              />

              <p className="font-medium text-slate-600">
                No payment records found
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Recorded payments will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-4">Payment</th>
                    <th className="px-5 py-4">Invoice</th>
                    <th className="px-5 py-4">Patient</th>
                    <th className="px-5 py-4">Method</th>
                    <th className="px-5 py-4">Amount</th>
                    <th className="px-5 py-4">Reference</th>
                    <th className="px-5 py-4">Paid At</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-cyan-50/40"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
                            <CreditCard size={17} />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-900">
                              Payment #{payment.id}
                            </p>

                            {payment.invoiceId && (
                              <p className="text-xs text-slate-400">
                                Invoice ID: {payment.invoiceId}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-medium text-slate-700">
                          {payment.invoiceNo}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-medium text-slate-800">
                          {payment.patientName}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                            payment.method === "Cash"
                              ? "bg-emerald-50 text-emerald-700"
                              : payment.method === "Mobile Money"
                                ? "bg-blue-50 text-blue-700"
                                : payment.method === "Card"
                                  ? "bg-violet-50 text-violet-700"
                                  : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          <PaymentMethodIcon method={payment.method} />
                          {payment.method}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-900">
                          TZS {formatCurrency(payment.amount)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">
                          {payment.reference}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">
                          {formatDate(payment.paidAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
