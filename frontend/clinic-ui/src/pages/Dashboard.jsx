import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  CalendarDays,
  ClipboardList,
  FlaskConical,
  HeartPulse,
  Loader2,
  Package,
  Pill,
  Receipt,
  RefreshCw,
  Stethoscope,
  Users,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../services/api";

/* =========================================================
   HELPERS
========================================================= */

function formatCurrency(amount) {
  return `TZS ${Number(amount || 0).toLocaleString("en-TZ")}`;
}

function getToday() {
  return new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* =========================================================
   MODULES
========================================================= */

const modules = [
  {
    title: "Reception",
    description: "Patients, registration and queue",
    icon: Users,
    href: "/reception",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    title: "Nurse",
    description: "Vitals and patient preparation",
    icon: HeartPulse,
    href: "/nurse",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-600",
  },
  {
    title: "Doctor",
    description: "Consultations and diagnosis",
    icon: Stethoscope,
    href: "/doctor",
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
  },
  {
    title: "Laboratory",
    description: "Tests and laboratory results",
    icon: FlaskConical,
    href: "/laboratory",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    title: "Pharmacy",
    description: "Medicines and stock management",
    icon: Pill,
    href: "/pharmacy",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    title: "Billing",
    description: "Payments, invoices and claims",
    icon: Receipt,
    href: "/billing",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
];

/* =========================================================
   RECENT ACTIVITY
========================================================= */

const activities = [
  {
    title: "Patient activity",
    description: "Patient registration activity",
    time: "Overview",
    icon: Users,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    title: "Billing activity",
    description: "Payment and invoice activity",
    time: "Overview",
    icon: Wallet,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    title: "Insurance activity",
    description: "Insurance claim activity",
    time: "Overview",
    icon: Receipt,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  {
    title: "Pharmacy",
    description: "Pharmacy activity will appear here",
    time: "Coming soon",
    icon: Package,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
];

/* =========================================================
   DEFAULT DASHBOARD DATA
========================================================= */

const defaultDashboard = {
  patientsToday: 0,
  totalPatients: 0,
  revenueToday: 0,
  pendingBills: 0,
  totalInvoices: 0,
  pendingInsuranceClaims: 0,
  totalPayments: 0,
};

/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {

  /* =======================================================
     CURRENT USER / ROLE
  ======================================================== */

  const storedUser = localStorage.getItem("clinic_user");

  let currentUser = null;

  try {
    currentUser = storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch (error) {
    console.error("Failed to read clinic_user:", error);
    currentUser = null;
  }

  const role = String(
    currentUser?.role || ""
  )
    .trim()
    .toUpperCase();

  const isAdmin = role === "ADMIN";
  const isDoctor = role === "DOCTOR";

  /* =======================================================
     STATE
  ======================================================== */

  const [dashboard, setDashboard] =
    useState(defaultDashboard);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  /* =======================================================
     FETCH DASHBOARD DATA
  ======================================================== */

  const fetchDashboard = async (showRefresh = false) => {

    try {

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response =
        await api.get("/dashboard/stats");

      console.log(
        "DASHBOARD DATA:",
        response.data
      );

      const data =
        response.data || {};

      setDashboard({
        patientsToday:
          Number(data.patientsToday || 0),

        totalPatients:
          Number(data.totalPatients || 0),

        revenueToday:
          Number(data.revenueToday || 0),

        pendingBills:
          Number(data.pendingBills || 0),

        totalInvoices:
          Number(data.totalInvoices || 0),

        pendingInsuranceClaims:
          Number(
            data.pendingInsuranceClaims || 0
          ),

        totalPayments:
          Number(data.totalPayments || 0),
      });

    } catch (err) {

      console.error(
        "DASHBOARD ERROR:",
        err
      );

      console.error(
        "STATUS:",
        err.response?.status
      );

      console.error(
        "DATA:",
        err.response?.data
      );

      console.error(
        "URL:",
        err.config?.url
      );

      setError(
        err.response?.status
          ? `Dashboard error: ${err.response.status}`
          : "Imeshindikana kupata taarifa za dashboard kutoka server."
      );

    } finally {

      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================== */

  useEffect(() => {
    fetchDashboard();
  }, []);

  /* =======================================================
     ADMIN STATS
  ======================================================== */

  const adminStats = [
    {
      title: "Patients Today",
      value: dashboard.patientsToday,
      change: "Live",
      icon: Users,
      description: "Registered today",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      changeBg: "bg-blue-50",
      changeColor: "text-blue-600",
    },
    {
      title: "Total Patients",
      value: dashboard.totalPatients,
      change: "Total",
      icon: ClipboardList,
      description: "Patients in system",
      iconBg: "bg-cyan-50",
      iconColor: "text-cyan-600",
      changeBg: "bg-cyan-50",
      changeColor: "text-cyan-600",
    },
    {
      title: "Revenue Today",
      value: formatCurrency(
        dashboard.revenueToday
      ),
      change: "Live",
      icon: Wallet,
      description: "Payments received today",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      changeBg: "bg-emerald-50",
      changeColor: "text-emerald-600",
    },
    {
      title: "Pending Bills",
      value: dashboard.pendingBills,
      change: "Action",
      icon: Receipt,
      description: "Unpaid & partially paid",
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
      changeBg: "bg-orange-50",
      changeColor: "text-orange-600",
    },
    {
      title: "Total Invoices",
      value: dashboard.totalInvoices,
      change: "Total",
      icon: Receipt,
      description: "Invoices in system",
      iconBg: "bg-violet-50",
      iconColor: "text-violet-600",
      changeBg: "bg-violet-50",
      changeColor: "text-violet-600",
    },
    {
      title: "Pending Claims",
      value:
        dashboard.pendingInsuranceClaims,
      change: "Action",
      icon: ClipboardList,
      description: "Insurance claims pending",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      changeBg: "bg-amber-50",
      changeColor: "text-amber-600",
    },
  ];

  /* =======================================================
     DOCTOR STATS
     
     Doctor only sees clinical/patient information.
     No financial information.
  ======================================================== */

  const doctorStats = [
    {
      title: "Patients Today",
      value: dashboard.patientsToday,
      change: "Live",
      icon: Users,
      description: "Patients registered today",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      changeBg: "bg-blue-50",
      changeColor: "text-blue-600",
    },
    {
      title: "Total Patients",
      value: dashboard.totalPatients,
      change: "Total",
      icon: ClipboardList,
      description: "Patients in system",
      iconBg: "bg-cyan-50",
      iconColor: "text-cyan-600",
      changeBg: "bg-cyan-50",
      changeColor: "text-cyan-600",
    },
  ];

  /* =======================================================
     SELECT STATS
  ======================================================== */

  const stats =
    isDoctor
      ? doctorStats
      : adminStats;

  /* =======================================================
     RENDER
  ======================================================== */

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">

            <Activity size={16} />

            {isDoctor
              ? "Doctor Dashboard"
              : "MCMS Overview"}

          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">

            {isDoctor
              ? "Doctor Dashboard"
              : "Main Dashboard"}

          </h1>

          <p className="mt-1 text-sm text-slate-500">

            {isDoctor
              ? "Monitor patient activity and clinical information."
              : "Monitor your clinic operations from one place."}

          </p>

        </div>

        <div className="flex items-center gap-3">

          {/* Refresh */}

          <button
            type="button"
            onClick={() =>
              fetchDashboard(true)
            }
            disabled={refreshing}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            title="Refresh dashboard"
          >

            {refreshing ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <RefreshCw size={18} />
            )}

          </button>

          {/* Date */}

          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">

            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">

              <CalendarDays
                size={18}
                className="text-blue-600"
              />

            </div>

            <div>

              <p className="text-xs font-medium text-slate-400">
                Today
              </p>

              <p className="text-sm font-bold text-slate-700">
                {getToday()}
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (

        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">

          <div className="flex items-start gap-3">

            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100">

              <Activity
                size={18}
                className="text-red-600"
              />

            </div>

            <div>

              <p className="text-sm font-bold text-red-800">
                Dashboard data error
              </p>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>

            </div>

          </div>

        </div>

      )}

      {/* =====================================================
          STATS
      ====================================================== */}

      <div
        className={
          isDoctor
            ? "grid gap-4 sm:grid-cols-2"
            : "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        }
      >

        {stats.map((stat) => {

          const Icon = stat.icon;

          return (

            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >

              <div className="flex items-start justify-between">

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.iconBg}`}
                >

                  <Icon
                    size={21}
                    className={stat.iconColor}
                  />

                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${stat.changeBg} ${stat.changeColor}`}
                >
                  {stat.change}
                </span>

              </div>

              <div className="mt-5">

                <p className="text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">

                  {loading ? (
                    <span className="inline-block h-7 w-20 animate-pulse rounded bg-slate-200" />
                  ) : (
                    stat.value
                  )}

                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {stat.description}
                </p>

              </div>

            </div>

          );
        })}

      </div>

      {/* =====================================================
          ADMIN ONLY CONTENT
          
          Doctor hatakiwi kuona:
          - Recent Activity
          - Attention Required
          - Payments
          - Invoices
          - Clinic Modules
      ====================================================== */}

      {isAdmin && (

        <>

          {/* ===================================================
              MAIN CONTENT
          ==================================================== */}

          <div className="grid gap-6 xl:grid-cols-3">

            {/* =================================================
                RECENT ACTIVITY
            ================================================== */}

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">

              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                <div>

                  <h2 className="font-bold text-slate-900">
                    Recent Activity
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Clinic activity overview
                  </p>

                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                  System
                </span>

              </div>

              <div className="divide-y divide-slate-100">

                {activities.map((activity) => {

                  const Icon = activity.icon;

                  return (

                    <div
                      key={activity.title}
                      className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50"
                    >

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${activity.iconBg}`}
                      >

                        <Icon
                          size={18}
                          className={activity.iconColor}
                        />

                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="text-sm font-semibold text-slate-800">
                          {activity.title}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {activity.description}
                        </p>

                      </div>

                      <span className="shrink-0 text-xs font-medium text-slate-400">
                        {activity.time}
                      </span>

                    </div>

                  );
                })}

              </div>

            </div>

            {/* =================================================
                ATTENTION REQUIRED
            ================================================== */}

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 px-5 py-4">

                <h2 className="font-bold text-slate-900">
                  Attention Required
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  Items that need your attention
                </p>

              </div>

              <div className="space-y-3 p-4">

                {/* Pending Bills */}

                <Link
                  to="/billing/invoices"
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-blue-200 hover:bg-slate-50"
                >

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">

                    <Receipt
                      size={18}
                      className="text-blue-600"
                    />

                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-sm font-bold text-slate-800">
                      Pending Bills
                    </p>

                    <p className="text-xs font-semibold text-slate-600">

                      {loading
                        ? "Loading..."
                        : `${dashboard.pendingBills} invoices`}

                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Awaiting payment
                    </p>

                  </div>

                  <ArrowRight
                    size={16}
                    className="text-slate-300"
                  />

                </Link>

                {/* Pending Insurance Claims */}

                <Link
                  to="/billing/insurance-claims"
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-amber-200 hover:bg-slate-50"
                >

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">

                    <ClipboardList
                      size={18}
                      className="text-amber-600"
                    />

                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-sm font-bold text-slate-800">
                      Pending Claims
                    </p>

                    <p className="text-xs font-semibold text-slate-600">

                      {loading
                        ? "Loading..."
                        : `${dashboard.pendingInsuranceClaims} claims`}

                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Insurance claims pending
                    </p>

                  </div>

                  <ArrowRight
                    size={16}
                    className="text-slate-300"
                  />

                </Link>

                {/* Pharmacy */}

                <Link
                  to="/pharmacy"
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-emerald-200 hover:bg-slate-50"
                >

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">

                    <Package
                      size={18}
                      className="text-emerald-600"
                    />

                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-sm font-bold text-slate-800">
                      Pharmacy Alerts
                    </p>

                    <p className="text-xs font-semibold text-slate-600">
                      Coming soon
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Low stock & expiry monitoring
                    </p>

                  </div>

                  <ArrowRight
                    size={16}
                    className="text-slate-300"
                  />

                </Link>

              </div>

            </div>

          </div>

          {/* =====================================================
              SYSTEM SUMMARY
          ====================================================== */}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

            {/* Payments */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">

                  <Wallet
                    size={21}
                    className="text-emerald-600"
                  />

                </div>

                <div>

                  <p className="text-xs font-medium text-slate-400">
                    Payments Recorded
                  </p>

                  <p className="text-xl font-bold text-slate-900">

                    {loading
                      ? "..."
                      : dashboard.totalPayments}

                  </p>

                </div>

              </div>

            </div>

            {/* Invoices */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50">

                  <Receipt
                    size={21}
                    className="text-violet-600"
                  />

                </div>

                <div>

                  <p className="text-xs font-medium text-slate-400">
                    Total Invoices
                  </p>

                  <p className="text-xl font-bold text-slate-900">

                    {loading
                      ? "..."
                      : dashboard.totalInvoices}

                  </p>

                </div>

              </div>

            </div>

            {/* Patients */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">

                  <Users
                    size={21}
                    className="text-blue-600"
                  />

                </div>

                <div>

                  <p className="text-xs font-medium text-slate-400">
                    Total Patients
                  </p>

                  <p className="text-xl font-bold text-slate-900">

                    {loading
                      ? "..."
                      : dashboard.totalPatients}

                  </p>

                </div>

              </div>

            </div>

          </div>

          {/* =====================================================
              CLINIC MODULES
          ====================================================== */}

          <div>

            <div className="mb-4">

              <h2 className="text-lg font-bold text-slate-900">
                Clinic Modules
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Quick access to different clinic departments.
              </p>

            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

              {modules.map((module) => {

                const Icon = module.icon;

                return (

                  <Link
                    key={module.title}
                    to={module.href}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                  >

                    <div className="flex items-start justify-between">

                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-xl ${module.iconBg}`}
                      >

                        <Icon
                          size={21}
                          className={module.iconColor}
                        />

                      </div>

                      <ArrowRight
                        size={18}
                        className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500"
                      />

                    </div>

                    <h3 className="mt-4 text-sm font-bold text-slate-800">
                      {module.title}
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      {module.description}
                    </p>

                  </Link>

                );
              })}

            </div>

          </div>

        </>

      )}

    </div>
  );
}