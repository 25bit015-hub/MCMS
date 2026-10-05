import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Banknote,
  Building2,
  CreditCard,
  FileText,
  Receipt,
  ShieldCheck,
  Wallet,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../../services/api";

/* =========================
   HELPERS
========================= */

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatCurrency(value) {
  return `TZS ${toNumber(value).toLocaleString("en-TZ")}`;
}

function isToday(dateValue) {
  if (!dateValue) return false;

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function formatDate(dateValue) {
  if (!dateValue) return "-";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* =========================
   BILLING OPTIONS
========================= */

const billingOptions = [
  {
    title: "Cash Billing",
    description:
      "Create invoices, receive cash payments and issue receipts.",
    icon: Banknote,
    href: "/billing/cash",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    title: "Insurance Billing",
    description:
      "Manage insured patients, claims, approvals and co-payments.",
    icon: ShieldCheck,
    href: "/billing/insurance",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    title: "Invoices",
    description:
      "View, search and manage clinic invoices and outstanding balances.",
    icon: FileText,
    href: "/billing/invoices",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    title: "Payments",
    description:
      "Receive payments, record transactions and manage outstanding invoice balances.",
    icon: CreditCard,
    href: "/billing/payments",
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
  },
  {
    title: "Insurance Providers",
    description:
      "Manage insurance companies and their billing information.",
    icon: Building2,
    href: "/billing/insurance-providers",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  {
    title: "Insurance Claims",
    description:
      "Manage insurance claims, approvals, rejected claims and claim payments.",
    icon: FileText,
    href: "/billing/insurance-claims",
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
];

export default function BillingDashboard() {
  /* =========================
     STATE
  ========================= */

  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [claims, setClaims] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     LOAD BILLING DATA
  ========================= */

  const loadBillingData = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [invoiceResponse, paymentResponse, claimResponse] =
        await Promise.all([
          api.get("/invoices"),
          api.get("/payments"),
          api.get("/insurance-claims"),
        ]);

      setInvoices(
        Array.isArray(invoiceResponse.data)
          ? invoiceResponse.data
          : []
      );

      setPayments(
        Array.isArray(paymentResponse.data)
          ? paymentResponse.data
          : []
      );

      setClaims(
        Array.isArray(claimResponse.data)
          ? claimResponse.data
          : []
      );
    } catch (err) {
      console.error("Billing dashboard error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load billing dashboard data."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBillingData();
  }, []);

  /* =========================
     INVOICE MAP
  ========================= */

  const invoiceMap = useMemo(() => {
    const map = new Map();

    invoices.forEach((invoice) => {
      map.set(String(invoice.id), invoice);
    });

    return map;
  }, [invoices]);

  /* =========================
     TODAY'S PAYMENTS
  ========================= */

  const todaysPayments = useMemo(() => {
    return payments.filter((payment) => {
      return isToday(payment.paidAt || payment.createdAt);
    });
  }, [payments]);

  /* =========================
     TODAY'S REVENUE
  ========================= */

  const todaysRevenue = useMemo(() => {
    return todaysPayments.reduce((total, payment) => {
      return total + toNumber(payment.amount);
    }, 0);
  }, [todaysPayments]);

  /* =========================
     TODAY'S CASH PAYMENTS
  ========================= */

  const todaysCashPayments = useMemo(() => {
    return todaysPayments
      .filter(
        (payment) =>
          String(payment.paymentMethod || "").toUpperCase() === "CASH"
      )
      .reduce((total, payment) => {
        return total + toNumber(payment.amount);
      }, 0);
  }, [todaysPayments]);

  /* =========================
     INSURANCE CLAIM SUMMARY
  ========================= */

  const insuranceClaimSummary = useMemo(() => {
    const relevantClaims = claims.filter((claim) => {
      const status = String(claim.status || "").toUpperCase();

      return (
        status === "SUBMITTED" ||
        status === "APPROVED" ||
        status === "PAID"
      );
    });

    const amount = relevantClaims.reduce((total, claim) => {
      const status = String(claim.status || "").toUpperCase();

      /*
       * Approved/Paid claims use approvedAmount.
       * Submitted claims have not necessarily been approved,
       * so we use claimedAmount.
       */
      if (status === "APPROVED" || status === "PAID") {
        return total + toNumber(claim.approvedAmount);
      }

      return total + toNumber(claim.claimedAmount);
    }, 0);

    return {
      amount,
      count: relevantClaims.length,
    };
  }, [claims]);

  /* =========================
     PENDING BILLS
  ========================= */

  const pendingBills = useMemo(() => {
    return invoices.filter((invoice) => {
      const balance = toNumber(invoice.balanceAmount);
      const status = String(invoice.status || "").toUpperCase();

      return (
        balance > 0 &&
        status !== "CANCELLED"
      );
    });
  }, [invoices]);

  /* =========================
     RECENT TRANSACTIONS
  ========================= */

  const recentTransactions = useMemo(() => {
    return [...payments]
      .sort((a, b) => {
        const dateA = new Date(a.paidAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.paidAt || b.createdAt || 0).getTime();

        return dateB - dateA;
      })
      .slice(0, 5)
      .map((payment) => {
        const invoice = invoiceMap.get(String(payment.invoiceId));

        return {
          id: payment.id,
          patient: invoice?.patientName || "Unknown Patient",
          invoice:
            payment.invoiceNumber ||
            invoice?.invoiceNumber ||
            `#${payment.invoiceId || "-"}`,
          type:
            payment.paymentMethod === "INSURANCE"
              ? "Insurance"
              : payment.paymentMethod === "MOBILE_MONEY"
                ? "Mobile Money"
                : payment.paymentMethod === "CARD"
                  ? "Card"
                  : "Cash",
          amount: toNumber(payment.amount),
          status: "Paid",
          date: payment.paidAt || payment.createdAt,
        };
      });
  }, [payments, invoiceMap]);

  /* =========================
     SUMMARY CARDS
  ========================= */

  const summaryCards = [
    {
      title: "Today's Revenue",
      value: formatCurrency(todaysRevenue),
      description: `${todaysPayments.length} payment${
        todaysPayments.length === 1 ? "" : "s"
      } today`,
      icon: Wallet,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Cash Payments",
      value: formatCurrency(todaysCashPayments),
      description: "Today's cash collection",
      icon: Banknote,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Insurance Claims",
      value: formatCurrency(insuranceClaimSummary.amount),
      description: `${insuranceClaimSummary.count} submitted / approved claim${
        insuranceClaimSummary.count === 1 ? "" : "s"
      }`,
      icon: ShieldCheck,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      title: "Pending Bills",
      value: pendingBills.length.toLocaleString("en-TZ"),
      description: "Invoices awaiting payment",
      icon: Receipt,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <Receipt size={16} />
            Billing & Payments
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Billing Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage cash payments, insurance billing and clinic invoices.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => loadBillingData(true)}
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <Link
            to="/billing/invoices/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <FileText size={18} />
            Create Invoice
          </Link>
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />

          <div>
            <p className="text-sm font-semibold">
              Unable to load billing data
            </p>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* SUMMARY CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconBg}`}
              >
                <Icon size={21} className={card.iconColor} />
              </div>

              <div className="mt-5">
                <p className="text-sm font-medium text-slate-500">
                  {card.title}
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {loading ? "Loading..." : card.value}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* BILLING OPTIONS */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            Billing Services
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Choose a billing service to continue.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {billingOptions.map((option) => {
            const Icon = option.icon;

            return (
              <Link
                key={option.title}
                to={option.href}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${option.iconBg}`}
                  >
                    <Icon size={22} className={option.iconColor} />
                  </div>

                  <ArrowRight
                    size={19}
                    className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500"
                  />
                </div>

                <h3 className="mt-4 text-base font-bold text-slate-800">
                  {option.title}
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  {option.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-bold text-slate-900">
              Recent Transactions
            </h2>

            <p className="mt-0.5 text-xs text-slate-400">
              Latest payment transactions
            </p>
          </div>

          <Link
            to="/billing/payments"
            className="text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            View all
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Patient
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Invoice
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Payment Type
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Amount
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-10 text-center text-sm text-slate-400"
                  >
                    Loading transactions...
                  </td>
                </tr>
              ) : recentTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-10 text-center"
                  >
                    <div className="flex flex-col items-center">
                      <Receipt
                        size={30}
                        className="text-slate-300"
                      />

                      <p className="mt-3 text-sm font-semibold text-slate-600">
                        No payment transactions yet
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Recorded payments will appear here.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                recentTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-slate-800">
                        {transaction.patient}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-slate-600">
                        {transaction.invoice}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          transaction.type === "Cash"
                            ? "bg-emerald-50 text-emerald-600"
                            : transaction.type === "Insurance"
                              ? "bg-violet-50 text-violet-600"
                              : transaction.type === "Mobile Money"
                                ? "bg-blue-50 text-blue-600"
                                : "bg-cyan-50 text-cyan-600"
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm font-bold text-slate-800">
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-500">
                        {formatDate(transaction.date)}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}