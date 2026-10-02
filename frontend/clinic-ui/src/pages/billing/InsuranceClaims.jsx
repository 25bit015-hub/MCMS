import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  FileText,
  CheckCircle2,
  Clock3,
  XCircle,
  Eye,
  Printer,
  X,
  RefreshCw,
  Loader2,
} from "lucide-react";

import api from "../../services/api";

/* =========================================================
   HELPERS
========================================================= */

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-TZ").format(
    Number(amount || 0)
  );
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusClass(status) {
  switch (status) {
    case "Approved":
      return "bg-emerald-50 text-emerald-700";

    case "Paid":
      return "bg-blue-50 text-blue-700";

    case "Submitted":
      return "bg-purple-50 text-purple-700";

    case "Rejected":
      return "bg-red-50 text-red-700";

    default:
      return "bg-amber-50 text-amber-700";
  }
}

function StatusIcon({ status }) {
  if (status === "Approved" || status === "Paid") {
    return <CheckCircle2 size={14} />;
  }

  if (status === "Rejected") {
    return <XCircle size={14} />;
  }

  return <Clock3 size={14} />;
}

/* =========================================================
   NORMALIZE CLAIM
========================================================= */

function normalizeClaim(claim) {
  return {
    id: claim.id,

    claimNumber:
      claim.claimNumber ||
      claim.claimNo ||
      "-",

    patientId:
      claim.patientId ||
      claim.patient?.id ||
      claim.invoice?.patientId ||
      "-",

    patientName:
      claim.patientName ||
      claim.patient?.name ||
      claim.invoice?.patientName ||
      "-",

    provider:
      claim.providerName ||
      claim.provider?.name ||
      claim.insuranceProvider?.name ||
      claim.insuranceProviderName ||
      (typeof claim.provider === "string"
        ? claim.provider
        : "-"),

    memberNumber:
      claim.memberNumber ||
      claim.insuranceNumber ||
      claim.memberNo ||
      "-",

    date:
      claim.claimDate ||
      claim.submissionDate ||
      claim.createdAt ||
      null,

    totalBill: Number(
      claim.totalBill ||
      claim.claimedAmount ||
      claim.invoice?.totalAmount ||
      0
    ),

    approvedAmount: Number(
      claim.approvedAmount || 0
    ),

    coPayment: Number(
      claim.coPayment ||
      claim.copayment ||
      claim.coPaymentAmount ||
      0
    ),

    insuranceBalance: Number(
      claim.insuranceBalance ||
      claim.remainingAmount ||
      claim.approvedAmount ||
      0
    ),

    status:
      claim.status ||
      "Pending",
  };
}
/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function InsuranceClaims() {
  const [claims, setClaims] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedClaim, setSelectedClaim] = useState(null);

  /* =======================================================
     FETCH CLAIMS
  ======================================================= */

  const fetchClaims = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get(
        "/insurance-claims"
      );

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      const normalizedClaims = data.map(
        normalizeClaim
      );

      setClaims(normalizedClaims);
    } catch (err) {
      console.error(
        "Failed to load insurance claims:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to load insurance claims. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    fetchClaims();
  }, []);

  /* =======================================================
     FILTER CLAIMS
  ======================================================= */

  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const searchText =
        search.toLowerCase().trim();

      const matchesSearch =
        claim.claimNumber
          .toLowerCase()
          .includes(searchText) ||
        claim.patientName
          .toLowerCase()
          .includes(searchText) ||
        claim.patientId
          .toLowerCase()
          .includes(searchText) ||
        claim.provider
          .toLowerCase()
          .includes(searchText) ||
        claim.memberNumber
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        claim.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    claims,
    search,
    statusFilter,
  ]);

  /* =======================================================
     SUMMARY
  ======================================================= */

  const pendingCount = claims.filter(
    (claim) => claim.status === "Pending"
  ).length;

  const submittedCount = claims.filter(
    (claim) => claim.status === "Submitted"
  ).length;

  const approvedCount = claims.filter(
    (claim) => claim.status === "Approved"
  ).length;

  const paidCount = claims.filter(
    (claim) => claim.status === "Paid"
  ).length;

  const totalClaimAmount = claims.reduce(
    (sum, claim) =>
      sum + Number(claim.insuranceBalance || 0),
    0
  );

  /* =======================================================
     PRINT
  ======================================================= */

  const handlePrint = (claim) => {
    setSelectedClaim(claim);

    setTimeout(() => {
      window.print();
    }, 100);
  };

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const closeModal = () => {
    setSelectedClaim(null);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between print:hidden">

          <div>
            <Link
              to="/billing"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
            >
              <ArrowLeft size={18} />

              Back to Billing
            </Link>

            <div className="flex items-center gap-3">

              <div className="rounded-xl bg-slate-900 p-3">
                <FileText
                  size={24}
                  className="text-white"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Insurance Claims
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage insurance claims and claim processing
                </p>
              </div>

            </div>
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={() => fetchClaims(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {refreshing ? (
                <Loader2
                  size={18}
                  className="animate-spin"
                />
              ) : (
                <RefreshCw size={18} />
              )}

              Refresh
            </button>

            <Link
              to="/billing/insurance"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <FileText size={18} />

              Create Insurance Claim
            </Link>

          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 print:hidden">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <p className="font-semibold text-red-700">
                  Failed to load insurance claims
                </p>

                <p className="mt-1 text-sm text-red-600">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() => fetchClaims(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                <RefreshCw size={16} />

                Try Again
              </button>

            </div>

          </div>
        )}

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5 print:hidden">

          {/* Total */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-slate-500">
              Total Claims
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {claims.length}
            </p>

          </div>

          {/* Pending */}

          <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-slate-500">
              Pending
            </p>

            <p className="mt-2 text-2xl font-bold text-amber-600">
              {pendingCount}
            </p>

          </div>

          {/* Submitted */}

          <div className="rounded-2xl border border-purple-100 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-slate-500">
              Submitted
            </p>

            <p className="mt-2 text-2xl font-bold text-purple-600">
              {submittedCount}
            </p>

          </div>

          {/* Approved */}

          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-slate-500">
              Approved
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {approvedCount}
            </p>

          </div>

          {/* Claim Value */}

          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">

            <p className="text-sm font-medium text-slate-500">
              Claim Value
            </p>

            <p className="mt-2 text-lg font-bold text-blue-600">
              TZS {formatCurrency(totalClaimAmount)}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Paid claims: {paidCount}
            </p>

          </div>

        </div>

        {/* =================================================
            FILTERS
        ================================================= */}

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:hidden">

          <div className="flex flex-col gap-4 md:flex-row">

            {/* Search */}

            <div className="relative flex-1">

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
                placeholder="Search claim, patient, provider or member number..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              />

            </div>

            {/* Status */}

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-slate-500"
            >
              <option value="All">
                All Status
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Submitted">
                Submitted
              </option>

              <option value="Approved">
                Approved
              </option>

              <option value="Rejected">
                Rejected
              </option>

              <option value="Paid">
                Paid
              </option>

            </select>

          </div>

        </div>

        {/* =================================================
            CLAIMS TABLE
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm print:hidden">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1200px]">

              <thead className="bg-slate-50">

                <tr className="border-b border-slate-200">

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Claim
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Patient
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Provider
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Member Number
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    Total Bill
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    Approved
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    Co-payment
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {/* Loading */}

                {loading ? (

                  <tr>

                    <td
                      colSpan="9"
                      className="px-6 py-16 text-center"
                    >

                      <Loader2
                        size={36}
                        className="mx-auto mb-3 animate-spin text-slate-400"
                      />

                      <p className="font-medium text-slate-600">
                        Loading insurance claims...
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Please wait.
                      </p>

                    </td>

                  </tr>

                ) : filteredClaims.length > 0 ? (

                  filteredClaims.map((claim) => (

                    <tr
                      key={claim.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >

                      {/* Claim */}

                      <td className="px-5 py-5">

                        <p className="font-semibold text-slate-900">
                          {claim.claimNumber}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(claim.date)}
                        </p>

                      </td>

                      {/* Patient */}

                      <td className="px-5 py-5">

                        <p className="font-semibold text-slate-900">
                          {claim.patientName}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {claim.patientId}
                        </p>

                      </td>

                      {/* Provider */}

                      <td className="px-5 py-5">

                        <p className="text-sm font-medium text-slate-700">
                          {claim.provider}
                        </p>

                      </td>

                      {/* Member */}

                      <td className="px-5 py-5">

                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {claim.memberNumber}
                        </span>

                      </td>

                      {/* Total */}

                      <td className="px-5 py-5 text-right">

                        <p className="text-sm font-semibold text-slate-900">
                          TZS {formatCurrency(claim.totalBill)}
                        </p>

                      </td>

                      {/* Approved */}

                      <td className="px-5 py-5 text-right">

                        <p className="text-sm font-semibold text-emerald-600">
                          TZS {formatCurrency(claim.approvedAmount)}
                        </p>

                      </td>

                      {/* Co-payment */}

                      <td className="px-5 py-5 text-right">

                        <p className="text-sm font-semibold text-slate-700">
                          TZS {formatCurrency(claim.coPayment)}
                        </p>

                      </td>

                      {/* Status */}

                      <td className="px-5 py-5 text-center">

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                            claim.status
                          )}`}
                        >

                          <StatusIcon
                            status={claim.status}
                          />

                          {claim.status}

                        </span>

                      </td>

                      {/* Actions */}

                      <td className="px-5 py-5">

                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedClaim(claim)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >

                            <Eye size={15} />

                            View

                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handlePrint(claim)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >

                            <Printer size={15} />

                            Print

                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan="9"
                      className="px-6 py-14 text-center"
                    >

                      <FileText
                        size={42}
                        className="mx-auto mb-3 text-slate-300"
                      />

                      <h3 className="font-semibold text-slate-900">
                        No claims found
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Try changing your search or status filter.
                      </p>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* =================================================
            CLAIM DETAILS MODAL
        ================================================= */}

        {selectedClaim && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 print:static print:bg-white">

            <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl print:max-w-none print:shadow-none">

              {/* Modal Header */}

              <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5 print:hidden">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Insurance Claim
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    {selectedClaim.claimNumber}
                  </h2>

                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={20} />
                </button>

              </div>

              {/* Claim Content */}

              <div className="p-6 sm:p-8">

                {/* Print Header */}

                <div className="mb-8 hidden print:block">

                  <h1 className="text-2xl font-bold text-slate-900">
                    INSURANCE CLAIM
                  </h1>

                  <p className="mt-2 text-sm text-slate-500">
                    Claim Number:{" "}
                    {selectedClaim.claimNumber}
                  </p>

                  <p className="text-sm text-slate-500">
                    Date:{" "}
                    {formatDate(selectedClaim.date)}
                  </p>

                </div>

                {/* Patient / Provider */}

                <div className="grid gap-6 sm:grid-cols-2">

                  <div>

                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Patient Information
                    </p>

                    <p className="font-bold text-slate-900">
                      {selectedClaim.patientName}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Patient ID:{" "}
                      {selectedClaim.patientId}
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Member Number:{" "}
                      {selectedClaim.memberNumber}
                    </p>

                  </div>

                  <div>

                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Insurance Provider
                    </p>

                    <p className="font-bold text-slate-900">
                      {selectedClaim.provider}
                    </p>

                    <p className="mt-2">

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                          selectedClaim.status
                        )}`}
                      >

                        <StatusIcon
                          status={selectedClaim.status}
                        />

                        {selectedClaim.status}

                      </span>

                    </p>

                  </div>

                </div>

                {/* Financial Summary */}

                <div className="mt-8 overflow-hidden rounded-xl border border-slate-200">

                  <div className="grid sm:grid-cols-2">

                    <div className="border-b border-slate-200 p-5 sm:border-r">

                      <p className="text-sm text-slate-500">
                        Total Bill
                      </p>

                      <p className="mt-1 text-xl font-bold text-slate-900">
                        TZS{" "}
                        {formatCurrency(
                          selectedClaim.totalBill
                        )}
                      </p>

                    </div>

                    <div className="border-b border-slate-200 p-5">

                      <p className="text-sm text-slate-500">
                        Approved Amount
                      </p>

                      <p className="mt-1 text-xl font-bold text-emerald-600">
                        TZS{" "}
                        {formatCurrency(
                          selectedClaim.approvedAmount
                        )}
                      </p>

                    </div>

                    <div className="border-b border-slate-200 p-5 sm:border-b-0 sm:border-r">

                      <p className="text-sm text-slate-500">
                        Patient Co-payment
                      </p>

                      <p className="mt-1 text-xl font-bold text-amber-600">
                        TZS{" "}
                        {formatCurrency(
                          selectedClaim.coPayment
                        )}
                      </p>

                    </div>

                    <div className="p-5">

                      <p className="text-sm text-slate-500">
                        Insurance Balance
                      </p>

                      <p className="mt-1 text-xl font-bold text-blue-600">
                        TZS{" "}
                        {formatCurrency(
                          selectedClaim.insuranceBalance
                        )}
                      </p>

                    </div>

                  </div>

                </div>

                {/* Claim Information */}

                <div className="mt-8">

                  <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
                    Claim Information
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">

                    <div className="rounded-lg bg-slate-50 p-4">

                      <p className="text-xs text-slate-500">
                        Claim Number
                      </p>

                      <p className="mt-1 font-semibold text-slate-900">
                        {selectedClaim.claimNumber}
                      </p>

                    </div>

                    <div className="rounded-lg bg-slate-50 p-4">

                      <p className="text-xs text-slate-500">
                        Submission Date
                      </p>

                      <p className="mt-1 font-semibold text-slate-900">
                        {formatDate(
                          selectedClaim.date
                        )}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* Footer */}

              <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4 print:hidden">

                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handlePrint(selectedClaim)
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
                >

                  <Printer size={17} />

                  Print Claim

                </button>

              </div>

            </div>

          </div>

        )}

      </div>
    </div>
  );
}