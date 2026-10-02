import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  CheckCircle2,
  Filter,
  Loader2,
  Package,
  Pencil,
  Pill,
  Plus,
  RefreshCw,
  Search,
  X,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../../services/api";

function getTotalStock(medicine) {
  return (medicine.batches || []).reduce(
    (total, batch) => total + Number(batch.quantity || 0),
    0
  );
}

function getEarliestExpiry(medicine) {
  const validBatches = (medicine.batches || []).filter(
    (batch) => batch.expiryDate
  );

  if (!validBatches.length) return null;

  return validBatches.reduce((earliest, batch) => {
    if (!earliest) return batch.expiryDate;

    return new Date(batch.expiryDate) < new Date(earliest)
      ? batch.expiryDate
      : earliest;
  }, null);
}

function getExpiryStatus(expiryDate) {
  if (!expiryDate) {
    return {
      label: "No Date",
      className: "bg-slate-100 text-slate-600",
    };
  }

  const today = new Date();
  const expiry = new Date(expiryDate);

  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  const difference = Math.ceil(
    (expiry - today) / (1000 * 60 * 60 * 24)
  );

  if (difference < 0) {
    return {
      label: "Expired",
      className: "bg-red-100 text-red-700",
    };
  }

  if (difference <= 30) {
    return {
      label: "≤ 30 Days",
      className: "bg-orange-100 text-orange-700",
    };
  }

  if (difference <= 90) {
    return {
      label: "≤ 90 Days",
      className: "bg-yellow-100 text-yellow-700",
    };
  }

  return {
    label: "Good",
    className: "bg-emerald-100 text-emerald-700",
  };
}

function getStockStatus(medicine) {
  const totalStock = getTotalStock(medicine);

  if (totalStock <= 0) {
    return {
      label: "Out of Stock",
      className: "bg-red-100 text-red-700",
    };
  }

  if (totalStock <= Number(medicine.minimumStock || 0)) {
    return {
      label: "Low Stock",
      className: "bg-orange-100 text-orange-700",
    };
  }

  return {
    label: "Available",
    className: "bg-emerald-100 text-emerald-700",
  };
}

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-TZ").format(
    Number(amount || 0)
  );
}

export default function Medicines() {
  const [medicines, setMedicines] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [stockFilter, setStockFilter] = useState("All Stock");
  const [expiryFilter, setExpiryFilter] = useState("All Expiry");
  const [showFilters, setShowFilters] = useState(false);

  const loadMedicines = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const [medicinesResponse, batchesResponse] =
  await Promise.all([
    api.get("/medicines"),
    api.get("/medicine-batches"),
  ]);

      const backendMedicines = Array.isArray(
        medicinesResponse.data
      )
        ? medicinesResponse.data
        : [];

      const backendBatches = Array.isArray(
        batchesResponse.data
      )
        ? batchesResponse.data
        : [];

      const medicinesWithBatches = backendMedicines.map(
        (medicine) => {
          const medicineBatches = backendBatches.filter(
            (batch) =>
              Number(batch.medicine?.id) ===
              Number(medicine.id)
          );

          return {
            ...medicine,
            batches: medicineBatches,
          };
        }
      );

      setMedicines(medicinesWithBatches);
    } catch (err) {
      console.error("Failed to load medicines:", err);

      setError(
        err?.response?.data?.message ||
          "Imeshindikana kupata taarifa za dawa kutoka kwenye server."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        medicines
          .map((medicine) => medicine.category)
          .filter(Boolean)
      ),
    ].sort();

    return ["All Categories", ...uniqueCategories];
  }, [medicines]);

  const filteredMedicines = useMemo(() => {
    return medicines.filter((medicine) => {
      const query = search.toLowerCase().trim();

      const matchesSearch =
        !query ||
        String(medicine.name || "")
          .toLowerCase()
          .includes(query) ||
        String(medicine.genericName || "")
          .toLowerCase()
          .includes(query) ||
        String(medicine.category || "")
          .toLowerCase()
          .includes(query) ||
        String(medicine.manufacturer || "")
          .toLowerCase()
          .includes(query) ||
        String(medicine.medicineCode || "")
          .toLowerCase()
          .includes(query);

      const matchesCategory =
        category === "All Categories" ||
        medicine.category === category;

      const stockStatus = getStockStatus(medicine).label;

      const matchesStock =
        stockFilter === "All Stock" ||
        stockStatus === stockFilter;

      const expiryStatus = getExpiryStatus(
        getEarliestExpiry(medicine)
      ).label;

      let matchesExpiry = true;

      if (expiryFilter === "Expired") {
        matchesExpiry = expiryStatus === "Expired";
      }

      if (expiryFilter === "≤ 30 Days") {
        matchesExpiry = expiryStatus === "≤ 30 Days";
      }

      if (expiryFilter === "≤ 90 Days") {
        matchesExpiry =
          expiryStatus === "≤ 30 Days" ||
          expiryStatus === "≤ 90 Days";
      }

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStock &&
        matchesExpiry
      );
    });
  }, [
    medicines,
    search,
    category,
    stockFilter,
    expiryFilter,
  ]);

  const totalMedicines = medicines.length;

  const totalStock = medicines.reduce(
    (total, medicine) =>
      total + getTotalStock(medicine),
    0
  );

  const lowStock = medicines.filter(
    (medicine) =>
      getStockStatus(medicine).label === "Low Stock"
  ).length;

  const outOfStock = medicines.filter(
    (medicine) =>
      getStockStatus(medicine).label === "Out of Stock"
  ).length;

  const expired = medicines.filter(
    (medicine) =>
      getExpiryStatus(
        getEarliestExpiry(medicine)
      ).label === "Expired"
  ).length;

  const expiringSoon = medicines.filter((medicine) => {
    const status = getExpiryStatus(
      getEarliestExpiry(medicine)
    ).label;

    return (
      status === "≤ 30 Days" ||
      status === "≤ 90 Days"
    );
  }).length;

  const activeMedicines = medicines.filter(
    (medicine) => medicine.status === "ACTIVE"
  ).length;

  const inactiveMedicines = medicines.filter(
    (medicine) => medicine.status === "INACTIVE"
  ).length;

  const clearFilters = () => {
    setSearch("");
    setCategory("All Categories");
    setStockFilter("All Stock");
    setExpiryFilter("All Expiry");
  };

  const hasActiveFilters =
    search ||
    category !== "All Categories" ||
    stockFilter !== "All Stock" ||
    expiryFilter !== "All Expiry";

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <Pill size={16} className="text-blue-600" />
            <span>Pharmacy</span>
            <span>/</span>
            <span>Medicines</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Medicines
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage medicines, stock levels, batches and expiry dates.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => loadMedicines(true)}
            disabled={refreshing}
            className="
              inline-flex items-center justify-center gap-2
              rounded-xl border border-slate-200 bg-white
              px-4 py-3 text-sm font-semibold text-slate-700
              transition hover:bg-slate-50
              disabled:cursor-not-allowed disabled:opacity-60
            "
          >
            <RefreshCw
              size={18}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <Link
            to="/pharmacy/medicines/add"
            className="
              inline-flex items-center justify-center gap-2
              rounded-xl bg-gradient-to-r from-blue-600 to-blue-500
              px-5 py-3 text-sm font-semibold text-white
              shadow-lg shadow-blue-500/20
              transition-all duration-200
              hover:-translate-y-0.5
              hover:shadow-xl hover:shadow-blue-500/25
            "
          >
            <Plus size={19} />
            Add Medicine
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <AlertTriangle size={20} />
          </div>

          <div>
            <h3 className="font-bold text-red-800">
              Backend Error
            </h3>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadMedicines()}
              className="mt-3 text-sm font-bold text-red-700 underline"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          icon={Pill}
          label="Total Medicines"
          value={totalMedicines}
          iconClass="bg-blue-50 text-blue-600"
        />

        <SummaryCard
          icon={Package}
          label="Total Stock"
          value={totalStock.toLocaleString()}
          iconClass="bg-indigo-50 text-indigo-600"
        />

        <SummaryCard
          icon={AlertTriangle}
          label="Low Stock"
          value={lowStock}
          iconClass="bg-orange-50 text-orange-600"
        />

        <SummaryCard
          icon={Package}
          label="Out of Stock"
          value={outOfStock}
          iconClass="bg-red-50 text-red-600"
        />

        <SummaryCard
          icon={CalendarDays}
          label="Expiring Soon"
          value={expiringSoon}
          iconClass="bg-yellow-50 text-yellow-600"
        />
      </div>

      {/* Backend status */}
      {!loading && !error && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <div className="flex items-center gap-2">
            <CheckCircle2
              size={18}
              className="text-emerald-600"
            />

            <span className="text-sm font-semibold text-emerald-800">
              Backend Connected
            </span>
          </div>

          <span className="text-sm text-emerald-700">
            {activeMedicines} active
          </span>

          <span className="text-slate-300">•</span>

          <span className="text-sm text-slate-600">
            {inactiveMedicines} inactive
          </span>
        </div>
      )}

      {/* Search / Filters */}
      <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-3 xl:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search medicine, code, generic name, category..."
              className="
                h-12 w-full rounded-xl border border-slate-200
                bg-slate-50/70 pl-11 pr-4 text-sm text-slate-700
                outline-none transition-all
                placeholder:text-slate-400
                focus:border-blue-400 focus:bg-white
                focus:ring-4 focus:ring-blue-500/10
              "
            />
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            className="
              inline-flex h-12 items-center justify-center gap-2
              rounded-xl border border-slate-200 bg-white px-5
              text-sm font-semibold text-slate-700
              transition hover:bg-slate-50
            "
          >
            <Filter size={18} />
            Filters

            <ChevronDown
              size={16}
              className={`transition-transform ${
                showFilters ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 gap-3 border-t border-slate-100 pt-4 md:grid-cols-3">
            <FilterSelect
              label="Category"
              value={category}
              onChange={setCategory}
              options={categories}
            />

            <FilterSelect
              label="Stock Status"
              value={stockFilter}
              onChange={setStockFilter}
              options={[
                "All Stock",
                "Available",
                "Low Stock",
                "Out of Stock",
              ]}
            />

            <FilterSelect
              label="Expiry Status"
              value={expiryFilter}
              onChange={setExpiryFilter}
              options={[
                "All Expiry",
                "Expired",
                "≤ 30 Days",
                "≤ 90 Days",
              ]}
            />
          </div>
        )}

        {hasActiveFilters && (
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-800">
                {filteredMedicines.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-800">
                {medicines.length}
              </span>{" "}
              medicines
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              <X size={15} />
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Medicines table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Medicine Inventory
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {loading
                ? "Loading medicines..."
                : `${filteredMedicines.length} medicine${
                    filteredMedicines.length !== 1 ? "s" : ""
                  } found`}
            </p>
          </div>

          <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Available
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Loader2
                size={32}
                className="animate-spin text-blue-600"
              />

              <p className="text-sm font-medium">
                Loading medicines from backend...
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Medicine
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Category
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Form / Strength
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Stock
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Stock Status
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Expiry
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Unit Price
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredMedicines.map((medicine) => {
                  const totalStock =
                    getTotalStock(medicine);

                  const expiryDate =
                    getEarliestExpiry(medicine);

                  const stockStatus =
                    getStockStatus(medicine);

                  const expiryStatus =
                    getExpiryStatus(expiryDate);

                  return (
                    <tr
                      key={medicine.id}
                      className="transition-colors hover:bg-slate-50/70"
                    >
                      {/* Medicine */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Pill size={20} />
                          </div>

                          <div>
                            <p className="font-semibold text-slate-800">
                              {medicine.name}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              {medicine.genericName ||
                                "-"}
                            </p>

                            <p className="mt-0.5 text-[11px] text-slate-400">
                              {medicine.medicineCode ||
                                "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">
                          {medicine.category || "-"}
                        </span>
                      </td>

                      {/* Form */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-700">
                          {medicine.dosageForm || "-"}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {medicine.strength || "-"}
                        </p>
                      </td>

                      {/* Stock */}
                      <td className="px-6 py-4">
                        <p
                          className={`text-sm font-bold ${
                            totalStock === 0
                              ? "text-red-600"
                              : totalStock <=
                                Number(
                                  medicine.minimumStock || 0
                                )
                              ? "text-orange-600"
                              : "text-slate-800"
                          }`}
                        >
                          {totalStock.toLocaleString()}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          Min:{" "}
                          {Number(
                            medicine.minimumStock || 0
                          ).toLocaleString()}
                        </p>
                      </td>

                      {/* Stock status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${stockStatus.className}`}
                        >
                          {stockStatus.label}
                        </span>
                      </td>

                      {/* Expiry */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-700">
                          {formatDate(expiryDate)}
                        </p>

                        <span
                          className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${expiryStatus.className}`}
                        >
                          {expiryStatus.label}
                        </span>
                      </td>

                      {/* Unit Price */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-800">
                          TSh{" "}
                          {formatCurrency(
                            medicine.unitPrice
                          )}
                        </p>

                        <p className="text-[11px] text-slate-400">
                          backend unit price
                        </p>
                      </td>

                      {/* Backend status */}
                      <td className="px-6 py-4">
                        {medicine.status === "ACTIVE" ? (
                          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/pharmacy/medicines/${medicine.id}`}
                            title="View medicine"
                            className="
                              flex h-9 w-9 items-center justify-center
                              rounded-lg border border-slate-200
                              bg-white text-slate-500 transition
                              hover:border-blue-200 hover:bg-blue-50
                              hover:text-blue-600
                            "
                          >
                            <Eye size={17} />
                          </Link>

                          <Link
                            to={`/pharmacy/medicines/${medicine.id}/edit`}
                            title="Edit medicine"
                            className="
                              flex h-9 w-9 items-center justify-center
                              rounded-lg border border-slate-200
                              bg-white text-slate-500 transition
                              hover:border-slate-300 hover:bg-slate-50
                              hover:text-slate-800
                            "
                          >
                            <Pencil size={17} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredMedicines.length === 0 && (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Search size={28} />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-800">
              No medicines found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {medicines.length === 0
                ? "No medicines have been added to the backend yet."
                : "Try changing your search or filters."}
            </p>

            {medicines.length === 0 ? (
              <Link
                to="/pharmacy/medicines/add"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus size={17} />
                Add Medicine
              </Link>
            ) : (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Expiry warning */}
      {expired > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <AlertTriangle size={20} />
          </div>

          <div>
            <h3 className="font-bold text-red-800">
              Expired Medicines Alert
            </h3>

            <p className="mt-1 text-sm text-red-700">
              {expired} medicine
              {expired !== 1 ? "s have" : " has"} expired
              stock. Expired stock should not be dispensed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="
            h-11 w-full appearance-none rounded-xl
            border border-slate-200 bg-white px-4 pr-10
            text-sm font-medium text-slate-700 outline-none
            focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10
          "
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  );
}