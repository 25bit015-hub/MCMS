import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Search,
  Plus,
  Eye,
  Printer,
  FileText,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

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

function normalizeInvoice(invoice) {
  return {
    id: invoice.id,

    invoiceNo: invoice.invoiceNumber || `INV-${invoice.id}`,

    patientId:
      invoice.patient?.patientNumber ||
      invoice.patientId ||
      "-",

    patientName:
      invoice.patient
        ? `${invoice.patient.firstName || ""} ${
            invoice.patient.lastName || ""
          }`.trim()
        : invoice.patientName || "Unknown Patient",

    date: formatDate(invoice.createdAt),

    type:
      invoice.billingType === "INSURANCE"
        ? "Insurance"
        : "Cash",

    total: Number(invoice.totalAmount || 0),

    paid: Number(invoice.paidAmount || 0),

    balance: Number(invoice.balanceAmount || 0),

    status:
      invoice.status === "PAID"
        ? "Paid"
        : invoice.status === "PARTIALLY_PAID"
        ? "Partially Paid"
        : invoice.status === "CANCELLED"
        ? "Cancelled"
        : "Unpaid",
  };
}

function StatusBadge({ status }) {
  if (status === "Paid") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        <CheckCircle2 size={14} />
        Paid
      </span>
    );
  }

  if (status === "Partially Paid") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
        <Clock3 size={14} />
        Partially Paid
      </span>
    );
  }

  if (status === "Cancelled") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
        <AlertCircle size={14} />
        Cancelled
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
      <AlertCircle size={14} />
      Unpaid
    </span>
  );
}

export default function Invoices() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/invoices");

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setInvoices(data);
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

  useEffect(() => {
    fetchInvoices();
  }, []);

  const normalizedInvoices = useMemo(() => {
    return invoices.map(normalizeInvoice);
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return normalizedInvoices.filter((invoice) => {
      const matchesSearch =
        !keyword ||
        invoice.invoiceNo.toLowerCase().includes(keyword) ||
        invoice.patientName.toLowerCase().includes(keyword) ||
        invoice.patientId.toLowerCase().includes(keyword);

      const matchesType =
        typeFilter === "All" ||
        invoice.type === typeFilter;

      const matchesStatus =
        statusFilter === "All" ||
        invoice.status === statusFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    normalizedInvoices,
    search,
    typeFilter,
    statusFilter,
  ]);

  const totalInvoices = normalizedInvoices.length;

  const totalAmount = normalizedInvoices.reduce(
    (sum, invoice) => sum + invoice.total,
    0
  );

  const totalPaid = normalizedInvoices.reduce(
    (sum, invoice) => sum + invoice.paid,
    0
  );

  const totalOutstanding = normalizedInvoices.reduce(
    (sum, invoice) => sum + invoice.balance,
    0
  );

  const handlePrint = (invoice) => {
    console.log(
      "Printing invoice:",
      invoice.invoiceNo
    );

    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              to="/billing"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft size={17} />
              Back to Billing
            </Link>

            <h1 className="text-2xl font-bold text-slate-900">
              Invoices
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View and manage cash and insurance invoices.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchInvoices}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <Link
              to="/billing/invoices/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus size={18} />
              Create Invoice
            </Link>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
            <div>
              <p className="font-semibold text-red-700">
                Unable to load invoices
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={fetchInvoices}
              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Total Invoices
              </p>

              <FileText
                size={20}
                className="text-blue-600"
              />
            </div>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {totalInvoices}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Total Amount
              </p>

              <FileText
                size={20}
                className="text-purple-600"
              />
            </div>

            <p className="mt-2 text-xl font-bold text-slate-900">
              TZS {formatCurrency(totalAmount)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Total Paid
              </p>

              <CheckCircle2
                size={20}
                className="text-emerald-600"
              />
            </div>

            <p className="mt-2 text-xl font-bold text-emerald-700">
              TZS {formatCurrency(totalPaid)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">
                Outstanding
              </p>

              <AlertCircle
                size={20}
                className="text-red-600"
              />
            </div>

            <p className="mt-2 text-xl font-bold text-red-700">
              TZS {formatCurrency(totalOutstanding)}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

            {/* Search */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search invoice, patient name or ID..."
                className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Type */}
            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value)
              }
              className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">
                All Billing Types
              </option>

              <option value="Cash">
                Cash
              </option>

              <option value="Insurance">
                Insurance
              </option>
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option value="All">
                All Statuses
              </option>

              <option value="Paid">
                Paid
              </option>

              <option value="Partially Paid">
                Partially Paid
              </option>

              <option value="Unpaid">
                Unpaid
              </option>

              <option value="Cancelled">
                Cancelled
              </option>
            </select>
          </div>
        </div>

        {/* Invoice Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              Invoice List
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Showing {filteredInvoices.length} invoice
              {filteredInvoices.length !== 1
                ? "s"
                : ""}
            </p>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2
                size={38}
                className="animate-spin text-blue-600"
              />

              <p className="mt-4 font-medium text-slate-600">
                Loading invoices...
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Please wait while we fetch invoices from the server.
              </p>
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="py-16 text-center">
              <FileText
                size={40}
                className="mx-auto mb-3 text-slate-300"
              />

              <p className="font-medium text-slate-600">
                No invoices found
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Try changing your search or filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px]">

                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">

                    <th className="px-5 py-4">
                      Invoice
                    </th>

                    <th className="px-5 py-4">
                      Patient
                    </th>

                    <th className="px-5 py-4">
                      Date
                    </th>

                    <th className="px-5 py-4">
                      Type
                    </th>

                    <th className="px-5 py-4">
                      Total
                    </th>

                    <th className="px-5 py-4">
                      Paid
                    </th>

                    <th className="px-5 py-4">
                      Balance
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredInvoices.map((invoice) => (
                    <tr
                      key={invoice.id}
                      className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {invoice.invoiceNo}
                        </p>

                        <p className="text-xs text-slate-500">
                          #{invoice.id}
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

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {invoice.date}
                      </td>

                      <td className="px-5 py-4">
                        {invoice.type === "Cash" ? (
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            Cash
                          </span>
                        ) : (
                          <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                            Insurance
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                        TZS {formatCurrency(invoice.total)}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-emerald-700">
                        TZS {formatCurrency(invoice.paid)}
                      </td>

                      <td className="px-5 py-4 text-sm font-medium text-red-600">
                        TZS {formatCurrency(invoice.balance)}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          status={invoice.status}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/billing/invoices/${invoice.id}`
                              )
                            }
                            title="View Invoice"
                            className="rounded-lg p-2 text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handlePrint(invoice)
                            }
                            title="Print Invoice"
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Printer size={17} />
                          </button>

                        </div>
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