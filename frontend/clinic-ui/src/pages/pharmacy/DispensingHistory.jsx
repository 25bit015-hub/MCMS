import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock3,
  CreditCard,
  FileText,
  Filter,
  History,
  Package,
  Pill,
  RefreshCw,
  Search,
  TrendingDown,
  UserRound,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

const API_BASE_URL = "http://localhost:8080/api";

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-TZ", {
    style: "currency",
    currency: "TZS",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getMonthKey(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function formatMonth(monthKey) {
  if (!monthKey) return "—";

  const [year, month] = monthKey.split("-");

  const date = new Date(
    Number(year),
    Number(month) - 1,
    1
  );

  return date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

function getPatientName(dispensing) {
  const patient = dispensing?.patient;

  if (!patient) {
    return "Unknown patient";
  }

  const fullName = [
    patient.firstName,
    patient.middleName,
    patient.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return fullName || `Patient #${patient.id || "—"}`;
}

function getPatientNumber(dispensing) {
  return (
    dispensing?.patient?.patientNumber ||
    dispensing?.patient?.id ||
    "—"
  );
}

function getMedicineName(item) {
  return (
    item?.medicineName ||
    item?.batch?.medicine?.name ||
    "Unknown medicine"
  );
}

function getBatchNumber(item) {
  return item?.batch?.batchNumber || "—";
}

function getMedicineStrength(item) {
  return (
    item?.strength ||
    item?.batch?.medicine?.strength ||
    ""
  );
}

function getDispensedQuantity(item) {
  return Number(item?.dispensedQuantity || 0);
}

function getStatusClasses(status) {
  switch (status) {
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";

    case "PARTIAL":
      return "bg-amber-50 text-amber-700 border-amber-200";

    case "CANCELLED":
      return "bg-red-50 text-red-700 border-red-200";

    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

function getPaymentClasses(paymentType) {
  switch (paymentType) {
    case "INSURANCE":
      return "bg-blue-50 text-blue-700 border-blue-200";

    case "CASH":
      return "bg-violet-50 text-violet-700 border-violet-200";

    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

function normalizeSearch(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export default function DispensingHistory() {
  const [dispensings, setDispensings] = useState([]);
  const [dispensingItems, setDispensingItems] = useState({});

  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  const [period, setPeriod] = useState("ALL");

  const [expandedId, setExpandedId] = useState(null);

  const [activeTab, setActiveTab] = useState("daily");

  const [selectedMedicine, setSelectedMedicine] =
    useState("ALL");

  const [selectedStatus, setSelectedStatus] =
    useState("ALL");

  const [selectedPayment, setSelectedPayment] =
    useState("ALL");

  useEffect(() => {
    loadDispensingHistory();
  }, []);

  async function loadDispensingHistory() {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_BASE_URL}/dispensings`
      );

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setDispensings(data);

      await loadAllDispensingItems(data);
    } catch (err) {
      console.error(
        "Failed to load dispensing history:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load dispensing history."
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadAllDispensingItems(records) {
    if (!records.length) {
      setDispensingItems({});
      return;
    }

    try {
      setItemsLoading(true);

      const results = await Promise.all(
        records.map(async (dispensing) => {
          try {
            const response = await axios.get(
              `${API_BASE_URL}/dispensings/${dispensing.id}/items`
            );

            return {
              id: dispensing.id,
              items: Array.isArray(response.data)
                ? response.data
                : [],
            };
          } catch (err) {
            console.error(
              `Failed to load items for dispensing ${dispensing.id}`,
              err
            );

            return {
              id: dispensing.id,
              items: [],
            };
          }
        })
      );

      const mapped = {};

      results.forEach((result) => {
        mapped[result.id] = result.items;
      });

      setDispensingItems(mapped);
    } finally {
      setItemsLoading(false);
    }
  }

  function getItemsForDispensing(dispensingId) {
    return dispensingItems[dispensingId] || [];
  }

  function getRecordDate(dispensing) {
    return dispensing?.dispensedAt || dispensing?.createdAt;
  }

  function isWithinPeriod(dispensing) {
    const value = getRecordDate(dispensing);

    if (!value) return false;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return false;
    }

    const now = new Date();

    if (period === "ALL") {
      return true;
    }

    if (period === "TODAY") {
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
      );
    }

    if (period === "MONTH") {
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );
    }

    if (period === "YEAR") {
      return date.getFullYear() === now.getFullYear();
    }

    return true;
  }

  const availableMedicines = useMemo(() => {
    const medicineMap = new Map();

    dispensings.forEach((dispensing) => {
      const items = getItemsForDispensing(
        dispensing.id
      );

      items.forEach((item) => {
        const name = getMedicineName(item);

        if (name && name !== "Unknown medicine") {
          medicineMap.set(
            normalizeSearch(name),
            name
          );
        }
      });
    });

    return Array.from(medicineMap.values()).sort(
      (a, b) => a.localeCompare(b)
    );
  }, [dispensings, dispensingItems]);

  const filteredDispensings = useMemo(() => {
    const search = normalizeSearch(searchTerm);

    return dispensings
      .filter((dispensing) => {
        if (!isWithinPeriod(dispensing)) {
          return false;
        }

        if (
          selectedStatus !== "ALL" &&
          dispensing.status !== selectedStatus
        ) {
          return false;
        }

        if (
          selectedPayment !== "ALL" &&
          dispensing.paymentType !== selectedPayment
        ) {
          return false;
        }

        const items = getItemsForDispensing(
          dispensing.id
        );

        if (selectedMedicine !== "ALL") {
          const medicineFound = items.some(
            (item) =>
              normalizeSearch(
                getMedicineName(item)
              ) === normalizeSearch(selectedMedicine)
          );

          if (!medicineFound) {
            return false;
          }
        }

        if (!search) {
          return true;
        }

        const patientName = normalizeSearch(
          getPatientName(dispensing)
        );

        const patientNumber = normalizeSearch(
          getPatientNumber(dispensing)
        );

        const prescriptionId = normalizeSearch(
          dispensing?.prescription?.id
        );

        const visitId = normalizeSearch(
          dispensing?.visit?.id
        );

        const dispensingId = normalizeSearch(
          dispensing?.id
        );

        const medicineText = items
          .map((item) =>
            normalizeSearch(getMedicineName(item))
          )
          .join(" ");

        const batchText = items
          .map((item) =>
            normalizeSearch(getBatchNumber(item))
          )
          .join(" ");

        return (
          patientName.includes(search) ||
          patientNumber.includes(search) ||
          prescriptionId.includes(search) ||
          visitId.includes(search) ||
          dispensingId.includes(search) ||
          medicineText.includes(search) ||
          batchText.includes(search)
        );
      })
      .sort((a, b) => {
        const dateA = new Date(
          getRecordDate(a) || 0
        ).getTime();

        const dateB = new Date(
          getRecordDate(b) || 0
        ).getTime();

        return dateB - dateA;
      });
  }, [
    dispensings,
    dispensingItems,
    searchTerm,
    period,
    selectedMedicine,
    selectedStatus,
    selectedPayment,
  ]);

  const usageRows = useMemo(() => {
    const rows = [];

    filteredDispensings.forEach((dispensing) => {
      const items = getItemsForDispensing(
        dispensing.id
      );

      items.forEach((item) => {
        rows.push({
          dispensingId: dispensing.id,
          date: getRecordDate(dispensing),
          patientName: getPatientName(dispensing),
          patientNumber: getPatientNumber(dispensing),
          medicineName: getMedicineName(item),
          strength: getMedicineStrength(item),
          batchNumber: getBatchNumber(item),
          quantity: getDispensedQuantity(item),
          totalPrice: Number(item?.totalPrice || 0),
          paymentType: dispensing?.paymentType,
          status: dispensing?.status,
        });
      });
    });

    return rows;
  }, [
    filteredDispensings,
    dispensingItems,
  ]);

  const dailyUsage = useMemo(() => {
    const grouped = {};

    usageRows.forEach((row) => {
      const date = row.date
        ? new Date(row.date)
        : null;

      if (!date || Number.isNaN(date.getTime())) {
        return;
      }

      const dateKey = date
        .toISOString()
        .slice(0, 10);

      const key = `${dateKey}__${normalizeSearch(
        row.medicineName
      )}`;

      if (!grouped[key]) {
        grouped[key] = {
          dateKey,
          date: row.date,
          medicineName: row.medicineName,
          strength: row.strength,
          quantity: 0,
          amount: 0,
          dispensingCount: 0,
          patients: new Set(),
        };
      }

      grouped[key].quantity += row.quantity;
      grouped[key].amount += row.totalPrice;
      grouped[key].dispensingCount += 1;

      if (row.patientNumber) {
        grouped[key].patients.add(
          String(row.patientNumber)
        );
      }
    });

    return Object.values(grouped)
      .map((row) => ({
        ...row,
        patientsCount: row.patients.size,
      }))
      .sort((a, b) => {
        if (a.dateKey !== b.dateKey) {
          return b.dateKey.localeCompare(a.dateKey);
        }

        return a.medicineName.localeCompare(
          b.medicineName
        );
      });
  }, [usageRows]);

  const monthlyUsage = useMemo(() => {
    const grouped = {};

    usageRows.forEach((row) => {
      const monthKey = getMonthKey(row.date);

      if (!monthKey) {
        return;
      }

      const key = `${monthKey}__${normalizeSearch(
        row.medicineName
      )}`;

      if (!grouped[key]) {
        grouped[key] = {
          monthKey,
          medicineName: row.medicineName,
          strength: row.strength,
          quantity: 0,
          amount: 0,
          dispensingCount: 0,
          patients: new Set(),
        };
      }

      grouped[key].quantity += row.quantity;
      grouped[key].amount += row.totalPrice;
      grouped[key].dispensingCount += 1;

      if (row.patientNumber) {
        grouped[key].patients.add(
          String(row.patientNumber)
        );
      }
    });

    return Object.values(grouped)
      .map((row) => ({
        ...row,
        patientsCount: row.patients.size,
      }))
      .sort((a, b) => {
        if (a.monthKey !== b.monthKey) {
          return b.monthKey.localeCompare(a.monthKey);
        }

        return a.medicineName.localeCompare(
          b.medicineName
        );
      });
  }, [usageRows]);

  const summary = useMemo(() => {
    const totalDispensing =
      filteredDispensings.length;

    const totalItems = usageRows.length;

    const totalQuantity = usageRows.reduce(
      (sum, row) => sum + row.quantity,
      0
    );

    const totalAmount = usageRows.reduce(
      (sum, row) => sum + row.totalPrice,
      0
    );

    const uniquePatients = new Set(
      usageRows
        .map((row) => row.patientNumber)
        .filter(Boolean)
        .map(String)
    );

    const uniqueMedicines = new Set(
      usageRows
        .map((row) => normalizeSearch(row.medicineName))
        .filter(Boolean)
    );

    return {
      totalDispensing,
      totalItems,
      totalQuantity,
      totalAmount,
      uniquePatients: uniquePatients.size,
      uniqueMedicines: uniqueMedicines.size,
    };
  }, [filteredDispensings, usageRows]);

  function clearFilters() {
    setSearchTerm("");
    setPeriod("ALL");
    setSelectedMedicine("ALL");
    setSelectedStatus("ALL");
    setSelectedPayment("ALL");
  }

  const hasFilters =
    searchTerm ||
    period !== "ALL" ||
    selectedMedicine !== "ALL" ||
    selectedStatus !== "ALL" ||
    selectedPayment !== "ALL";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10">
                <History className="h-7 w-7" />
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-300/20">
                    Pharmacy Records
                  </span>

                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-300">
                    Dispensing History
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Historia ya Dawa Zilizotolewa
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Fuatilia matumizi ya kila dawa kwa siku,
                  mwezi na historia ya kila dispensing.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/pharmacy"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                <ArrowLeft className="h-4 w-4" />
                Pharmacy
              </Link>

              <button
                type="button"
                onClick={loadDispensingHistory}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loading ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="font-semibold">
              Imeshindikana kupakia dispensing history.
            </div>

            <div className="mt-1">{error}</div>
          </div>
        )}

        {/* SUMMARY CARDS */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <SummaryCard
            icon={History}
            label="Dispensing"
            value={summary.totalDispensing}
            description="Records zilizopatikana"
            iconClass="bg-indigo-50 text-indigo-600"
          />

          <SummaryCard
            icon={Pill}
            label="Dawa Zilizotolewa"
            value={summary.totalQuantity}
            description={`${summary.uniqueMedicines} medicines`}
            iconClass="bg-emerald-50 text-emerald-600"
          />

          <SummaryCard
            icon={UserRound}
            label="Wagonjwa"
            value={summary.uniquePatients}
            description="Unique patients"
            iconClass="bg-blue-50 text-blue-600"
          />

          <SummaryCard
            icon={CreditCard}
            label="Total Amount"
            value={formatCurrency(
              summary.totalAmount
            )}
            description={`${summary.totalItems} dispensing items`}
            iconClass="bg-violet-50 text-violet-600"
          />
        </div>

        {/* FILTER PANEL */}
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-2">
                <Filter className="h-5 w-5 text-slate-700" />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Filters & Search
                </h2>

                <p className="text-xs text-slate-500">
                  Tafuta dispensing records kwa urahisi
                </p>
              </div>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                <X className="h-4 w-4" />
                Clear filters
              </button>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-12">

            {/* SEARCH */}
            <div className="lg:col-span-5">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Search
              </label>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Patient, medicine, batch, visit..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* PERIOD */}
            <FilterSelect
              label="Period"
              value={period}
              onChange={setPeriod}
              options={[
                ["ALL", "All time"],
                ["TODAY", "Today"],
                ["MONTH", "This month"],
                ["YEAR", "This year"],
              ]}
            />

            {/* MEDICINE */}
            <FilterSelect
              label="Medicine"
              value={selectedMedicine}
              onChange={setSelectedMedicine}
              options={[
                ["ALL", "All medicines"],
                ...availableMedicines.map(
                  (medicine) => [medicine, medicine]
                ),
              ]}
            />

            {/* STATUS */}
            <FilterSelect
              label="Status"
              value={selectedStatus}
              onChange={setSelectedStatus}
              options={[
                ["ALL", "All status"],
                ["COMPLETED", "Completed"],
                ["PARTIAL", "Partial"],
                ["CANCELLED", "Cancelled"],
              ]}
            />

            {/* PAYMENT */}
            <FilterSelect
              label="Payment"
              value={selectedPayment}
              onChange={setSelectedPayment}
              options={[
                ["ALL", "All payments"],
                ["CASH", "Cash"],
                ["INSURANCE", "Insurance"],
              ]}
            />
          </div>
        </section>

        {/* USAGE TABS */}
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Medicine Usage
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Matumizi ya dawa yaliyohesabiwa kutoka
                kwenye dispensing records.
              </p>
            </div>

            <div className="inline-flex rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("daily")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  activeTab === "daily"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Daily Usage
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("monthly")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  activeTab === "monthly"
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Monthly Usage
              </button>
            </div>
          </div>

          {activeTab === "daily" ? (
            <DailyUsageTable rows={dailyUsage} />
          ) : (
            <MonthlyUsageTable rows={monthlyUsage} />
          )}
        </section>

        {/* DETAILED RECORDS */}
        <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Detailed Dispensing Records
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Kumbukumbu kamili ya kila dispensing.
                </p>
              </div>

              <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                {filteredDispensings.length} records
              </div>
            </div>
          </div>

          {loading ? (
            <LoadingState />
          ) : filteredDispensings.length === 0 ? (
            <EmptyState
              title="Hakuna dispensing records"
              description="Hakuna records zinazolingana na filters ulizochagua."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredDispensings.map((dispensing) => (
                <DispensingRecord
                  key={dispensing.id}
                  dispensing={dispensing}
                  items={getItemsForDispensing(
                    dispensing.id
                  )}
                  expanded={
                    expandedId === dispensing.id
                  }
                  onToggle={() =>
                    setExpandedId(
                      expandedId === dispensing.id
                        ? null
                        : dispensing.id
                    )
                  }
                  itemsLoading={itemsLoading}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon: Icon,
  label,
  value,
  description,
  iconClass,
}) {
  return (
    <div className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div
          className={`rounded-2xl p-3 ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 h-1 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-1/2 rounded-full bg-indigo-500 opacity-80 transition-all duration-500 group-hover:w-3/4" />
      </div>
    </div>
  );
}

/* =========================================================
   FILTER SELECT
========================================================= */

function FilterSelect({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <div className="lg:col-span-2">
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option
            key={optionValue}
            value={optionValue}
          >
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}

/* =========================================================
   DAILY USAGE
========================================================= */

function DailyUsageTable({ rows }) {
  if (!rows.length) {
    return (
      <EmptyState
        title="Hakuna daily usage"
        description="Hakuna matumizi ya dawa yaliyopatikana kwa kipindi hiki."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px]">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/80 text-left">
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
              Date
            </th>

            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
              Medicine
            </th>

            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
              Batch
            </th>

            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
              Quantity
            </th>

            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
              Patients
            </th>

            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
              Amount
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr
              key={`${row.dateKey}-${row.medicineName}-${index}`}
              className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 font-semibold text-slate-800">
                  <CalendarDays className="h-4 w-4 text-indigo-500" />
                  {formatDate(row.date)}
                </div>
              </td>

              <td className="px-6 py-4">
                <div className="font-semibold text-slate-900">
                  {row.medicineName}
                </div>

                {row.strength && (
                  <div className="mt-0.5 text-xs text-slate-500">
                    {row.strength}
                  </div>
                )}
              </td>

              <td className="px-6 py-4 text-sm text-slate-600">
                —
              </td>

              <td className="px-6 py-4 text-right">
                <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-sm font-bold text-emerald-700">
                  {row.quantity}
                </span>
              </td>

              <td className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                {row.patientsCount}
              </td>

              <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                {formatCurrency(row.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================
   MONTHLY USAGE
========================================================= */

function MonthlyUsageTable({ rows }) {
  if (!rows.length) {
    return (
      <EmptyState
        title="Hakuna monthly usage"
        description="Hakuna monthly medicine usage iliyopatikana."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[850px]">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/80 text-left">
            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
              Month
            </th>

            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
              Medicine
            </th>

            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
              Quantity Used
            </th>

            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
              Dispensing
            </th>

            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
              Patients
            </th>

            <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
              Amount
            </th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr
              key={`${row.monthKey}-${row.medicineName}-${index}`}
              className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 font-semibold text-slate-800">
                  <CalendarDays className="h-4 w-4 text-indigo-500" />
                  {formatMonth(row.monthKey)}
                </div>
              </td>

              <td className="px-6 py-4">
                <div className="font-semibold text-slate-900">
                  {row.medicineName}
                </div>

                {row.strength && (
                  <div className="mt-0.5 text-xs text-slate-500">
                    {row.strength}
                  </div>
                )}
              </td>

              <td className="px-6 py-4 text-right">
                <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-sm font-bold text-indigo-700">
                  {row.quantity}
                </span>
              </td>

              <td className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                {row.dispensingCount}
              </td>

              <td className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                {row.patientsCount}
              </td>

              <td className="px-6 py-4 text-right text-sm font-bold text-slate-900">
                {formatCurrency(row.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* =========================================================
   DISPENSING RECORD
========================================================= */

function DispensingRecord({
  dispensing,
  items,
  expanded,
  onToggle,
  itemsLoading,
}) {
  const totalQuantity = items.reduce(
    (sum, item) =>
      sum + getDispensedQuantity(item),
    0
  );

  return (
    <div className="p-4 sm:p-5">
      <div className="rounded-2xl border border-slate-200 bg-white transition hover:border-indigo-200 hover:shadow-sm">

        <button
          type="button"
          onClick={onToggle}
          className="w-full p-4 text-left sm:p-5"
        >
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

            {/* PATIENT */}
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                <UserRound className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <div className="truncate font-bold text-slate-900">
                  {getPatientName(dispensing)}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>
                    Patient #{getPatientNumber(dispensing)}
                  </span>

                  <span className="text-slate-300">
                    •
                  </span>

                  <span>
                    Dispensing #{dispensing.id}
                  </span>
                </div>
              </div>
            </div>

            {/* INFO */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 xl:min-w-[600px]">

              <RecordInfo
                icon={Clock3}
                label="Date"
                value={formatDateTime(
                  dispensing.dispensedAt
                )}
              />

              <RecordInfo
                icon={FileText}
                label="Visit"
                value={
                  dispensing?.visit?.id
                    ? `Visit #${dispensing.visit.id}`
                    : "—"
                }
              />

              <RecordInfo
                icon={Package}
                label="Quantity"
                value={totalQuantity}
              />

              <RecordInfo
                icon={TrendingDown}
                label="Amount"
                value={formatCurrency(
                  dispensing.totalAmount
                )}
              />
            </div>

            {/* BADGES */}
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusClasses(
                  dispensing.status
                )}`}
              >
                {dispensing.status || "—"}
              </span>

              <span
                className={`rounded-full border px-3 py-1.5 text-xs font-bold ${getPaymentClasses(
                  dispensing.paymentType
                )}`}
              >
                {dispensing.paymentType || "—"}
              </span>

              <div className="ml-1 rounded-xl bg-slate-100 p-2 text-slate-500">
                {expanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </div>
          </div>
        </button>

        {/* EXPANDED DETAILS */}
        {expanded && (
          <div className="border-t border-slate-100 bg-slate-50/70 p-4 sm:p-5">

            <div className="mb-4 grid gap-3 sm:grid-cols-3">

              <MiniDetail
                label="Prescription"
                value={
                  dispensing?.prescription?.id
                    ? `Prescription #${dispensing.prescription.id}`
                    : "—"
                }
              />

              <MiniDetail
                label="Visit"
                value={
                  dispensing?.visit?.id
                    ? `Visit #${dispensing.visit.id}`
                    : "—"
                }
              />

              <MiniDetail
                label="Dispensed At"
                value={formatDateTime(
                  dispensing.dispensedAt
                )}
              />
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-indigo-600" />

                  <h3 className="text-sm font-bold text-slate-900">
                    Dawa Zilizotolewa
                  </h3>
                </div>
              </div>

              {itemsLoading && !items.length ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  Loading medicines...
                </div>
              ) : items.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">
                  Hakuna dispensing items zilizopatikana.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[750px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                          Medicine
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                          Batch
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                          Prescribed
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                          Dispensed
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                          Unit Price
                        </th>

                        <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                          Total
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {items.map((item, index) => (
                        <tr
                          key={
                            item.id ||
                            `${dispensing.id}-${index}`
                          }
                          className="border-b border-slate-100 last:border-0"
                        >
                          <td className="px-4 py-4">
                            <div className="font-semibold text-slate-900">
                              {getMedicineName(item)}
                            </div>

                            {getMedicineStrength(
                              item
                            ) && (
                              <div className="mt-0.5 text-xs text-slate-500">
                                {getMedicineStrength(
                                  item
                                )}
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-600">
                            {getBatchNumber(item)}
                          </td>

                          <td className="px-4 py-4 text-right text-sm font-semibold text-slate-700">
                            {item.prescribedQuantity ??
                              "—"}
                          </td>

                          <td className="px-4 py-4 text-right">
                            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-sm font-bold text-emerald-700">
                              {getDispensedQuantity(
                                item
                              )}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-right text-sm text-slate-700">
                            {formatCurrency(
                              item.unitPrice
                            )}
                          </td>

                          <td className="px-4 py-4 text-right text-sm font-bold text-slate-900">
                            {formatCurrency(
                              item.totalPrice
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {dispensing.notes && (
              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="text-xs font-bold uppercase tracking-wide text-amber-700">
                  Notes
                </div>

                <p className="mt-1 text-sm text-amber-900">
                  {dispensing.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   RECORD INFO
========================================================= */

function RecordInfo({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>

      <div className="mt-1 truncate text-sm font-semibold text-slate-700">
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   MINI DETAIL
========================================================= */

function MiniDetail({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </div>

      <div className="mt-1 text-sm font-semibold text-slate-800">
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingState() {
  return (
    <div className="grid gap-4 p-5 sm:p-6">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="animate-pulse rounded-2xl border border-slate-200 p-5"
        >
          <div className="h-5 w-48 rounded bg-slate-200" />
          <div className="mt-3 h-4 w-72 rounded bg-slate-100" />
          <div className="mt-5 h-12 w-full rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   EMPTY
========================================================= */

function EmptyState({
  title,
  description,
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="rounded-2xl bg-slate-100 p-4">
        <History className="h-8 w-8 text-slate-400" />
      </div>

      <h3 className="mt-4 font-bold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  );
}