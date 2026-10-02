import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  CalendarDays,
  Edit3,
  Package,
  Pill,
  Truck,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

const API_URL = "http://localhost:8080/api";

function getTotalStock(batches) {
  return (batches || []).reduce(
    (total, batch) => total + Number(batch.quantity || 0),
    0
  );
}

function getStockStatus(medicine, batches) {
  const stock = getTotalStock(batches);

  if (stock <= 0) {
    return {
      label: "Out of Stock",
      className: "bg-red-100 text-red-700",
    };
  }

  if (stock <= Number(medicine?.minimumStock || 0)) {
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

function formatCurrency(value) {
  return new Intl.NumberFormat("en-TZ").format(value || 0);
}

function getBatchExpiryStatus(expiryDate) {
  if (!expiryDate) {
    return {
      label: "No expiry",
      className: "text-slate-500",
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const difference =
    Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

  if (difference < 0) {
    return {
      label: "Expired",
      className: "text-red-600",
    };
  }

  if (difference === 0) {
    return {
      label: "Expires today",
      className: "text-red-600",
    };
  }

  if (difference <= 7) {
    return {
      label: `${difference} day${difference === 1 ? "" : "s"} left`,
      className: "text-red-600",
    };
  }

  if (difference <= 30) {
    return {
      label: `${difference} days left`,
      className: "text-orange-600",
    };
  }

  return {
    label: `${difference} days left`,
    className: "text-emerald-600",
  };
}

export default function MedicineDetails() {
  const { id } = useParams();

  const [medicine, setMedicine] = useState(null);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadMedicineDetails = async () => {
    try {
      setError("");

      const [medicineResponse, batchesResponse] =
        await Promise.all([
          axios.get(`${API_URL}/medicines/${id}`),
          axios.get(`${API_URL}/medicine-batches/medicine/${id}`),
        ]);

      setMedicine(medicineResponse.data);
      setBatches(batchesResponse.data || []);
    } catch (err) {
      console.error("Failed to load medicine details:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load medicine details."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!id) {
      setError("Medicine ID is missing.");
      setLoading(false);
      return;
    }

    loadMedicineDetails();
  }, [id]);

  const totalStock = useMemo(
    () => getTotalStock(batches),
    [batches]
  );

  const stockStatus = useMemo(
    () => getStockStatus(medicine, batches),
    [medicine, batches]
  );

  const activeStatus = medicine?.status === "ACTIVE";

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMedicineDetails();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <RefreshCw
              size={28}
              className="animate-spin"
            />
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-800">
            Loading medicine...
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Fetching medicine information and batches.
          </p>
        </div>
      </div>
    );
  }

  if (error || !medicine) {
    return (
      <div className="mx-auto max-w-4xl py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <AlertCircle size={28} />
        </div>

        <h2 className="mt-4 text-xl font-bold text-slate-800">
          Medicine not found
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {error || "The medicine you are looking for does not exist."}
        </p>

        <div className="mt-5 flex justify-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <RefreshCw size={16} />
            Try Again
          </button>

          <Link
            to="/pharmacy/medicines"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Back to Medicines
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      {/* Header */}
      <div>
        <Link
          to="/pharmacy/medicines"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Back to Medicines
        </Link>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Pill size={27} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900">
                  {medicine.name}
                </h1>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${stockStatus.className}`}
                >
                  {stockStatus.label}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    activeStatus
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {activeStatus ? "Active" : "Inactive"}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                {medicine.genericName || "-"} ·{" "}
                {medicine.strength || "-"}
              </p>

              <p className="mt-1 text-xs font-medium text-slate-400">
                Code: {medicine.medicineCode || "-"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing ? "animate-spin" : ""
                }
              />
              Refresh
            </button>

            <Link
              to={`/pharmacy/medicines/${medicine.id}/edit`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700"
            >
              <Edit3 size={18} />
              Edit Medicine
            </Link>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <div>
            <p className="font-semibold">
              Failed to refresh medicine data
            </p>

            <p className="mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Summary
          icon={Package}
          label="Current Stock"
          value={totalStock.toLocaleString()}
          description={`Minimum: ${medicine.minimumStock ?? 0}`}
        />

        <Summary
          icon={Pill}
          label="Dosage Form"
          value={medicine.dosageForm || "-"}
          description={medicine.strength || "-"}
        />

        <Summary
          icon={Truck}
          label="Supplier"
          value={batches[0]?.supplier || "-"}
          description="Latest batch supplier"
        />

        <Summary
          icon={CalendarDays}
          label="Batches"
          value={batches.length}
          description="Registered batches"
        />
      </div>

      {/* Medicine information */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h2 className="text-lg font-bold text-slate-900">
            Medicine Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            General information about this medicine.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-6 p-6 md:grid-cols-2 lg:grid-cols-3">
          <Info
            label="Medicine Code"
            value={medicine.medicineCode}
          />

          <Info
            label="Medicine Name"
            value={medicine.name}
          />

          <Info
            label="Generic Name"
            value={medicine.genericName}
          />

          <Info
            label="Category"
            value={medicine.category}
          />

          <Info
            label="Dosage Form"
            value={medicine.dosageForm}
          />

          <Info
            label="Strength"
            value={medicine.strength}
          />

          <Info
            label="Manufacturer"
            value={medicine.manufacturer}
          />

          <Info
            label="Minimum Stock Level"
            value={medicine.minimumStock ?? 0}
          />

          <Info
            label="Unit Price"
            value={`TSh ${formatCurrency(
              medicine.unitPrice
            )}`}
          />

          <Info
            label="Status"
            value={
              medicine.status === "ACTIVE"
                ? "Active"
                : "Inactive"
            }
          />

          <Info
            label="Created At"
            value={formatDateTime(medicine.createdAt)}
          />

          <Info
            label="Updated At"
            value={formatDateTime(medicine.updatedAt)}
          />
        </div>
      </section>

      {/* Batches */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Medicine Batches
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Stock quantity and expiry information by batch.
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 px-4 py-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Stock
            </p>

            <p className="text-lg font-bold text-slate-900">
              {totalStock.toLocaleString()}
            </p>
          </div>
        </div>

        {batches.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Package size={25} />
            </div>

            <h3 className="mt-4 font-bold text-slate-800">
              No batches found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              This medicine does not have any registered
              batches yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Batch Number
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Quantity
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Received
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Expiry
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Supplier
                  </th>

                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Purchase Price
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {batches.map((batch) => {
                  const expiryStatus =
                    getBatchExpiryStatus(
                      batch.expiryDate
                    );

                  const quantity =
                    Number(batch.quantity || 0);

                  return (
                    <tr
                      key={batch.id}
                      className="hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800">
                          {batch.batchNumber}
                        </span>

                        <p className="mt-1 text-xs text-slate-400">
                          ID: {batch.id}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-800">
                          {quantity.toLocaleString()}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDate(batch.receivedDate)}
                      </td>

                      <td className="px-6 py-4">
                        <p
                          className={`text-sm font-semibold ${
                            expiryStatus.className
                          }`}
                        >
                          {formatDate(
                            batch.expiryDate
                          )}
                        </p>

                        <span
                          className={`text-xs font-semibold ${expiryStatus.className}`}
                        >
                          {expiryStatus.label}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {batch.supplier || "-"}
                      </td>

                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                        TSh{" "}
                        {formatCurrency(
                          batch.purchasePrice
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Inventory note */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <div className="flex gap-3">
          <Package
            className="mt-0.5 shrink-0 text-blue-600"
            size={20}
          />

          <div>
            <h3 className="font-bold text-blue-900">
              Inventory Management
            </h3>

            <p className="mt-1 text-sm leading-6 text-blue-800">
              Stock should be increased through Stock In and
              decreased through dispensing or approved stock
              adjustments. Batch numbers and expiry dates remain
              available for audit and FEFO dispensing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDateTime(dateTime) {
  if (!dateTime) return "-";

  return new Date(dateTime).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Summary({
  icon: Icon,
  label,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-2 truncate text-xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 truncate text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className="ml-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800">
        {value || "-"}
      </p>
    </div>
  );
}