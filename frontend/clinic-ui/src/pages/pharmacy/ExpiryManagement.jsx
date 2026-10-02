import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  Search,
  CalendarClock,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Package,
  RefreshCw,
} from "lucide-react";

import { Link } from "react-router-dom";

import api from "../../services/api";

/* =========================
   DATE HELPERS
========================= */

function getDaysRemaining(expiryDate) {
  if (!expiryDate) {
    return 0;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const difference =
    expiry.getTime() - today.getTime();

  return Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );
}

function getExpiryStatus(daysRemaining) {
  if (daysRemaining < 0) {
    return "Expired";
  }

  if (daysRemaining <= 7) {
    return "Critical";
  }

  if (daysRemaining <= 30) {
    return "Urgent";
  }

  if (daysRemaining <= 60) {
    return "Warning";
  }

  if (daysRemaining <= 90) {
    return "Upcoming";
  }

  return "Safe";
}

function formatExpiryDate(date) {
  if (!date) {
    return "—";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* =========================
   COMPONENT
========================= */

export default function ExpiryManagement() {
  const [batches, setBatches] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("90");
  const [statusFilter, setStatusFilter] =
    useState("All");

  /* =========================
     LOAD BATCHES
  ========================= */

  async function loadBatches(showRefreshing = false) {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      /*
       * First refresh expired statuses
       * in the backend.
       */
      await api.patch(
        "/medicine-batches/refresh-expired"
      );

      /*
       * Then load all medicine batches
       * from MySQL through Spring Boot.
       */
      const response = await api.get(
        "/medicine-batches"
      );

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setBatches(data);
    } catch (err) {
      console.error(
        "Failed to load medicine batches:",
        err
      );

      const serverMessage =
        err?.response?.data?.message ||
        err?.response?.data;

      setError(
        typeof serverMessage === "string"
          ? serverMessage
          : "Imeshindikana kupata medicine batches kutoka server."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadBatches();
  }, []);

  /* =========================
     PREPARE EXPIRY DATA
  ========================= */

  const expiryData = useMemo(() => {
    return batches
      .map((batch) => {
        const daysRemaining =
          getDaysRemaining(
            batch.expiryDate
          );

        return {
          ...batch,

          /*
           * Medicine is a nested object
           * inside MedicineBatch.
           */
          medicineName:
            batch.medicine?.name ||
            "Unknown Medicine",

          medicineCode:
            batch.medicine?.medicineCode ||
            "",

          genericName:
            batch.medicine?.genericName ||
            "",

          strength:
            batch.medicine?.strength ||
            "",

          dosageForm:
            batch.medicine?.dosageForm ||
            "",

          manufacturer:
            batch.medicine?.manufacturer ||
            "",

          unitPrice:
            batch.medicine?.unitPrice ||
            null,

          supplier:
            batch.supplier ||
            "—",

          daysRemaining,

          expiryStatus:
            getExpiryStatus(
              daysRemaining
            ),
        };
      })
      .sort(
        (a, b) =>
          a.daysRemaining -
          b.daysRemaining
      );
  }, [batches]);

  /* =========================
     STATS
  ========================= */

  const expired = expiryData.filter(
    (item) =>
      item.daysRemaining < 0
  );

  const expiring7Days =
    expiryData.filter(
      (item) =>
        item.daysRemaining >= 0 &&
        item.daysRemaining <= 7
    );

  const expiring30Days =
    expiryData.filter(
      (item) =>
        item.daysRemaining >= 0 &&
        item.daysRemaining <= 30
    );

  const expiring60Days =
    expiryData.filter(
      (item) =>
        item.daysRemaining >= 0 &&
        item.daysRemaining <= 60
    );

  const expiring90Days =
    expiryData.filter(
      (item) =>
        item.daysRemaining >= 0 &&
        item.daysRemaining <= 90
    );

  /* =========================
     FILTER DATA
  ========================= */

  const filteredData =
    expiryData.filter((item) => {
      const searchValue =
        search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        item.medicineName
          .toLowerCase()
          .includes(searchValue) ||
        item.medicineCode
          .toLowerCase()
          .includes(searchValue) ||
        String(
          item.batchNumber || ""
        )
          .toLowerCase()
          .includes(searchValue) ||
        String(
          item.supplier || ""
        )
          .toLowerCase()
          .includes(searchValue);

      let matchesPeriod = true;

      if (period !== "all") {
        const days = Number(period);

        /*
         * Expired medicines remain visible
         * regardless of selected period.
         */
        if (item.daysRemaining < 0) {
          matchesPeriod = true;
        } else {
          matchesPeriod =
            item.daysRemaining <= days;
        }
      }

      let matchesStatus = true;

      if (statusFilter === "Expired") {
        matchesStatus =
          item.daysRemaining < 0;
      }

      if (statusFilter === "Critical") {
        matchesStatus =
          item.daysRemaining >= 0 &&
          item.daysRemaining <= 7;
      }

      if (statusFilter === "Urgent") {
        matchesStatus =
          item.daysRemaining > 7 &&
          item.daysRemaining <= 30;
      }

      if (statusFilter === "Warning") {
        matchesStatus =
          item.daysRemaining > 30 &&
          item.daysRemaining <= 60;
      }

      if (statusFilter === "Upcoming") {
        matchesStatus =
          item.daysRemaining > 60 &&
          item.daysRemaining <= 90;
      }

      return (
        matchesSearch &&
        matchesPeriod &&
        matchesStatus
      );
    });

  /* =========================
     STATUS CONFIG
  ========================= */

  const statusConfig = {
    Expired: {
      label: "Expired",
      className:
        "border-red-200 bg-red-50 text-red-700",
      icon: XCircle,
    },

    Critical: {
      label: "Critical",
      className:
        "border-red-200 bg-red-50 text-red-700",
      icon: AlertTriangle,
    },

    Urgent: {
      label: "Urgent",
      className:
        "border-orange-200 bg-orange-50 text-orange-700",
      icon: AlertTriangle,
    },

    Warning: {
      label: "Warning",
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
      icon: CalendarClock,
    },

    Upcoming: {
      label: "Upcoming",
      className:
        "border-blue-200 bg-blue-50 text-blue-700",
      icon: CalendarClock,
    },

    Safe: {
      label: "Safe",
      className:
        "border-emerald-200 bg-emerald-50 text-emerald-700",
      icon: CheckCircle2,
    },
  };

  /* =========================
     RETURN
  ========================= */

  return (
    <div className="mx-auto max-w-7xl space-y-6">

      {/* =========================
          HEADER
      ========================= */}

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

        <div>
          <Link
            to="/pharmacy"
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={17} />
            Back to Pharmacy
          </Link>

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50">
              <CalendarClock
                size={25}
                className="text-orange-600"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Expiry Management
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Monitor medicine batches before they expire.
              </p>
            </div>

          </div>
        </div>

        <div className="flex flex-wrap gap-3">

          <button
            type="button"
            onClick={() =>
              loadBatches(true)
            }
            disabled={
              loading || refreshing
            }
            className="
              inline-flex h-11 items-center
              justify-center gap-2 rounded-xl
              border border-slate-200
              bg-white px-5 text-sm
              font-semibold text-slate-700
              shadow-sm transition
              hover:bg-slate-50
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <RefreshCw
              size={18}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

          <Link
            to="/pharmacy/stock-in"
            className="
              inline-flex h-11 items-center
              justify-center gap-2 rounded-xl
              border border-slate-200
              bg-white px-5 text-sm
              font-semibold text-slate-700
              shadow-sm transition
              hover:bg-slate-50
            "
          >
            <Package size={18} />
            Receive Stock
          </Link>

        </div>
      </div>

      {/* =========================
          LOADING
      ========================= */}

      {loading && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex items-center gap-3">

            <RefreshCw
              size={20}
              className="animate-spin text-blue-600"
            />

            <div>
              <p className="font-bold text-blue-800">
                Inapakia medicine batches...
              </p>

              <p className="mt-1 text-sm text-blue-700">
                Tunapata taarifa kutoka Pharmacy
                inventory database.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* =========================
          ERROR
      ========================= */}

      {error && !loading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">

          <div className="flex gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100">
              <XCircle
                size={23}
                className="text-red-600"
              />
            </div>

            <div>
              <h2 className="font-bold text-red-800">
                Imeshindikana kupakia batches
              </h2>

              <p className="mt-1 text-sm leading-6 text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  loadBatches(true)
                }
                className="
                  mt-3 inline-flex
                  items-center gap-2
                  rounded-lg bg-red-600
                  px-4 py-2 text-sm
                  font-semibold text-white
                  transition hover:bg-red-700
                "
              >
                <RefreshCw size={16} />
                Jaribu tena
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================
          EXPIRED ALERT
      ========================= */}

      {!loading &&
        expired.length > 0 && (
          <div className="flex gap-4 rounded-2xl border border-red-200 bg-red-50 p-5">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100">
              <XCircle
                size={23}
                className="text-red-600"
              />
            </div>

            <div>
              <h2 className="font-bold text-red-800">
                Expired Medicines Detected
              </h2>

              <p className="mt-1 text-sm leading-6 text-red-700">
                Kuna{" "}
                <strong>
                  {expired.length}
                </strong>{" "}
                batch(s) ambazo zime-expire.
                Dawa hizi hazipaswi ku-dispense.
              </p>
            </div>

          </div>
        )}

      {/* =========================
          STATS
      ========================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

        {/* Expired */}
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">

          <div className="flex items-center justify-between">

            <p className="text-sm font-medium text-red-700">
              Expired
            </p>

            <XCircle
              size={20}
              className="text-red-600"
            />

          </div>

          <p className="mt-3 text-2xl font-bold text-red-800">
            {expired.length}
          </p>

        </div>

        {/* 7 Days */}
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5">

          <div className="flex items-center justify-between">

            <p className="text-sm font-medium text-orange-700">
              Within 7 Days
            </p>

            <AlertTriangle
              size={20}
              className="text-orange-600"
            />

          </div>

          <p className="mt-3 text-2xl font-bold text-orange-800">
            {expiring7Days.length}
          </p>

        </div>

        {/* 30 Days */}
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">

          <div className="flex items-center justify-between">

            <p className="text-sm font-medium text-amber-700">
              Within 30 Days
            </p>

            <CalendarClock
              size={20}
              className="text-amber-600"
            />

          </div>

          <p className="mt-3 text-2xl font-bold text-amber-800">
            {expiring30Days.length}
          </p>

        </div>

        {/* 60 Days */}
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">

          <div className="flex items-center justify-between">

            <p className="text-sm font-medium text-blue-700">
              Within 60 Days
            </p>

            <CalendarClock
              size={20}
              className="text-blue-600"
            />

          </div>

          <p className="mt-3 text-2xl font-bold text-blue-800">
            {expiring60Days.length}
          </p>

        </div>

        {/* 90 Days */}
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">

          <div className="flex items-center justify-between">

            <p className="text-sm font-medium text-indigo-700">
              Within 90 Days
            </p>

            <CalendarClock
              size={20}
              className="text-indigo-600"
            />

          </div>

          <p className="mt-3 text-2xl font-bold text-indigo-800">
            {expiring90Days.length}
          </p>

        </div>

      </div>

      {/* =========================
          FILTERS
      ========================= */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="grid gap-4 md:grid-cols-3">

          {/* Search */}
          <div className="relative md:col-span-2">

            <Search
              size={18}
              className="
                absolute left-4 top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search medicine, batch or supplier..."
              className="
                h-11 w-full rounded-xl border
                border-slate-200 bg-white
                pl-11 pr-4 text-sm
                outline-none
                focus:border-blue-400
                focus:ring-4
                focus:ring-blue-500/10
              "
            />

          </div>

          {/* Period */}
          <select
            value={period}
            onChange={(e) =>
              setPeriod(e.target.value)
            }
            className="
              h-11 rounded-xl
              border border-slate-200
              bg-white px-4 text-sm
              font-medium text-slate-700
              outline-none
              focus:border-blue-400
            "
          >
            <option value="all">
              All Expiry Dates
            </option>

            <option value="7">
              Next 7 Days
            </option>

            <option value="30">
              Next 30 Days
            </option>

            <option value="60">
              Next 60 Days
            </option>

            <option value="90">
              Next 90 Days
            </option>
          </select>

        </div>

        {/* Status filters */}
        <div className="mt-4 flex flex-wrap gap-2">

          {[
            "All",
            "Expired",
            "Critical",
            "Urgent",
            "Warning",
            "Upcoming",
          ].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() =>
                setStatusFilter(status)
              }
              className={`
                rounded-xl px-4 py-2
                text-xs font-bold
                transition
                ${
                  statusFilter === status
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }
              `}
            >
              {status}
            </button>
          ))}

        </div>

      </div>

      {/* =========================
          TABLE
      ========================= */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1200px]">

            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Medicine
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Batch
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Quantity
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Expiry Date
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Remaining
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Supplier
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Backend Status
                </th>

                <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Expiry Status
                </th>

              </tr>
            </thead>

            <tbody>

              {filteredData.map((item) => {

                const config =
                  statusConfig[
                    item.expiryStatus
                  ] ||
                  statusConfig.Safe;

                const StatusIcon =
                  config.icon;

                return (
                  <tr
                    key={item.id}
                    className="
                      border-b border-slate-100
                      transition
                      hover:bg-slate-50
                    "
                  >

                    {/* Medicine */}
                    <td className="px-5 py-4">

                      <p className="font-semibold text-slate-800">
                        {item.medicineName}
                      </p>

                      <div className="mt-1 flex flex-wrap gap-2">

                        {item.medicineCode && (
                          <span className="text-xs text-slate-400">
                            {item.medicineCode}
                          </span>
                        )}

                        {item.strength && (
                          <span className="text-xs text-slate-400">
                            • {item.strength}
                          </span>
                        )}

                      </div>

                      {item.dosageForm && (
                        <p className="mt-1 text-xs text-slate-400">
                          {item.dosageForm}
                        </p>
                      )}

                    </td>

                    {/* Batch */}
                    <td className="px-5 py-4">

                      <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
                        {item.batchNumber}
                      </span>

                    </td>

                    {/* Quantity */}
                    <td className="px-5 py-4">

                      <p className="font-bold text-slate-800">
                        {Number(
                          item.quantity || 0
                        ).toLocaleString()}
                      </p>

                      <p className="text-xs text-slate-400">
                        units
                      </p>

                    </td>

                    {/* Expiry Date */}
                    <td className="px-5 py-4">

                      <p className="text-sm font-semibold text-slate-700">
                        {formatExpiryDate(
                          item.expiryDate
                        )}
                      </p>

                    </td>

                    {/* Remaining */}
                    <td className="px-5 py-4">

                      {item.daysRemaining < 0 ? (
                        <div>

                          <p className="font-bold text-red-600">
                            {Math.abs(
                              item.daysRemaining
                            )}{" "}
                            days ago
                          </p>

                        </div>
                      ) : (
                        <div>

                          <p
                            className={`
                              font-bold
                              ${
                                item.daysRemaining <=
                                7
                                  ? "text-red-600"
                                  : item.daysRemaining <=
                                    30
                                  ? "text-orange-600"
                                  : "text-slate-700"
                              }
                            `}
                          >
                            {item.daysRemaining} days
                          </p>

                          <p className="text-xs text-slate-400">
                            remaining
                          </p>

                        </div>
                      )}

                    </td>

                    {/* Supplier */}
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.supplier}
                    </td>

                    {/* Backend Status */}
                    <td className="px-5 py-4">

                      <span
                        className={`
                          inline-flex rounded-full
                          px-3 py-1.5
                          text-xs font-bold
                          ${
                            item.status ===
                            "EXPIRED"
                              ? "bg-red-100 text-red-700"
                              : item.status ===
                                "DEPLETED"
                              ? "bg-slate-100 text-slate-600"
                              : item.status ===
                                "INACTIVE"
                              ? "bg-gray-100 text-gray-600"
                              : "bg-emerald-100 text-emerald-700"
                          }
                        `}
                      >
                        {item.status ||
                          "UNKNOWN"}
                      </span>

                    </td>

                    {/* Expiry Status */}
                    <td className="px-5 py-4">

                      <span
                        className={`
                          inline-flex items-center
                          gap-1.5 rounded-full
                          border px-3 py-1.5
                          text-xs font-bold
                          ${config.className}
                        `}
                      >

                        <StatusIcon size={14} />

                        {config.label}

                      </span>

                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

        {/* Empty state */}
        {!loading &&
          filteredData.length === 0 && (
            <div className="px-6 py-14 text-center">

              <CheckCircle2
                size={42}
                className="mx-auto text-emerald-400"
              />

              <h3 className="mt-4 font-bold text-slate-700">
                No expiry alerts found
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Hakuna batch inayolingana na
                filters ulizochagua.
              </p>

            </div>
          )}

      </div>

      {/* =========================
          FOOTER INFO
      ========================= */}

      {!loading &&
        !error &&
        batches.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

            <p className="text-sm text-slate-600">

              Showing{" "}
              <span className="font-bold text-slate-800">
                {filteredData.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-800">
                {batches.length}
              </span>{" "}
              medicine batches from
              Pharmacy inventory.

            </p>

          </div>
        )}

    </div>
  );
}