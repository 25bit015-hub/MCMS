import { useEffect, useMemo, useState } from "react";

import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  PackagePlus,
  Save,
  Truck,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../services/api";

const suppliers = [
  "ABC Pharma",
  "MedSupply Ltd",
  "HealthCare Suppliers",
  "Tanzania Medical Store",
  "Other Supplier",
];

export default function StockIn() {
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [batches, setBatches] = useState([]);

  const [form, setForm] = useState({
    medicineId: "",
    supplier: "",
    invoiceNumber: "",
    batchNumber: "",
    quantity: "",
    purchasePrice: "",
    manufacturingDate: "",
    expiryDate: "",
    storageLocation: "",
    receivedBy: "Pharmacist",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD MEDICINES + BATCHES
  // =========================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

     const [medicinesResponse, batchesResponse] =
  await Promise.all([
    api.get("/medicines"),
    api.get("/medicine-batches"),
  ]);

      setMedicines(medicinesResponse.data || []);
      setBatches(batchesResponse.data || []);
    } catch (err) {
      console.error("Failed to load Stock In data:", err);

      setError(
        getErrorMessage(
          err,
          "Failed to load medicines and stock information."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================
  // SELECTED MEDICINE
  // =========================================================

  const selectedMedicine = useMemo(() => {
    return medicines.find(
      (medicine) =>
        String(medicine.id) === String(form.medicineId)
    );
  }, [medicines, form.medicineId]);

  // =========================================================
  // CURRENT STOCK
  // =========================================================

  const currentStock = useMemo(() => {
    if (!selectedMedicine) {
      return 0;
    }

    return batches
      .filter(
        (batch) =>
          batch.medicine?.id === selectedMedicine.id
      )
      .reduce(
        (total, batch) =>
          total + Number(batch.quantity || 0),
        0
      );
  }, [batches, selectedMedicine]);

  // =========================================================
  // SELECTED MEDICINE BATCHES
  // =========================================================

  const selectedMedicineBatches = useMemo(() => {
    if (!selectedMedicine) {
      return [];
    }

    return batches.filter(
      (batch) =>
        batch.medicine?.id === selectedMedicine.id
    );
  }, [batches, selectedMedicine]);

  // =========================================================
  // NEW STOCK CALCULATIONS
  // =========================================================

  const newStock = Number(form.quantity || 0);

  const newTotalStock = currentStock + newStock;

  const stockValue =
    newStock * Number(form.purchasePrice || 0);

  // =========================================================
  // CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setError("");
  };

  // =========================================================
  // MEDICINE CHANGE
  // =========================================================

  const handleMedicineChange = (e) => {
    const medicineId = e.target.value;

    const medicine = medicines.find(
      (item) =>
        String(item.id) === String(medicineId)
    );

    setForm((prev) => ({
      ...prev,
      medicineId,
      supplier: "",
      purchasePrice:
        medicine?.unitPrice != null
          ? medicine.unitPrice
          : "",
    }));

    setErrors((prev) => ({
      ...prev,
      medicineId: "",
      supplier: "",
      purchasePrice: "",
    }));

    setError("");
  };

  // =========================================================
  // VALIDATION
  // =========================================================

  const validate = () => {
    const newErrors = {};

    if (!form.medicineId) {
      newErrors.medicineId =
        "Please select a medicine";
    }

    if (!form.supplier.trim()) {
      newErrors.supplier =
        "Supplier is required";
    }

    if (!form.batchNumber.trim()) {
      newErrors.batchNumber =
        "Batch number is required";
    }

    if (
      !form.quantity ||
      Number(form.quantity) <= 0
    ) {
      newErrors.quantity =
        "Quantity must be greater than zero";
    }

    if (
      form.purchasePrice === "" ||
      Number(form.purchasePrice) < 0
    ) {
      newErrors.purchasePrice =
        "Purchase price is required";
    }

    if (!form.expiryDate) {
      newErrors.expiryDate =
        "Expiry date is required";
    }

    if (
      form.expiryDate &&
      new Date(form.expiryDate) < new Date()
    ) {
      newErrors.expiryDate =
        "Expiry date cannot be in the past";
    }

    if (
      form.manufacturingDate &&
      form.expiryDate &&
      form.expiryDate <= form.manufacturingDate
    ) {
      newErrors.expiryDate =
        "Expiry date must be after manufacturing date";
    }

    /*
     * Storage location is kept in the UI because it was
     * part of the original Stock In design.
     *
     * It is NOT sent to the current backend because
     * MedicineBatch does not have a storageLocation field.
     */
    if (!form.storageLocation.trim()) {
      newErrors.storageLocation =
        "Storage location is required";
    }

    // Check duplicate batch locally first
    if (form.medicineId && form.batchNumber.trim()) {
      const duplicateBatch =
        selectedMedicineBatches.some(
          (batch) =>
            String(batch.batchNumber).toLowerCase() ===
            form.batchNumber.trim().toLowerCase()
        );

      if (duplicateBatch) {
        newErrors.batchNumber =
          "This batch number already exists for this medicine";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================================================
  // SUBMIT STOCK IN
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    if (!selectedMedicine) {
      setError("Selected medicine was not found.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSaved(false);

      /*
       * IMPORTANT:
       *
       * We use the same backend endpoint already used by
       * AddMedicine:
       *
       * POST /medicine-batches/medicine/{medicineId}
       *
       * MedicineBatchService will:
       *
       * 1. create the batch
       * 2. create the initial stock quantity
       * 3. create STOCK_IN movement
       *
       * Therefore we do NOT call StockMovementService
       * separately from the frontend.
       */

      const batchPayload = {
        batchNumber: form.batchNumber.trim(),
        quantity: Number(form.quantity),
        expiryDate: form.expiryDate,
        supplier: form.supplier.trim() || null,
        purchasePrice:
          form.purchasePrice === ""
            ? null
            : Number(form.purchasePrice),
      };

      const response = await api.post(
  `/medicine-batches/medicine/${selectedMedicine.id}`,
  batchPayload
);

      console.log(
        "Stock In successful:",
        response.data
      );

      setSaved(true);

      /*
       * Reload backend data so the next screen has
       * the latest stock/batch information.
       */
      await loadData();

      setTimeout(() => {
        navigate("/pharmacy/medicines");
      }, 1200);
    } catch (err) {
      console.error(
        "Failed to receive stock:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to receive stock."
        )
      );

      setSaving(false);
      setSaved(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl py-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <RefreshCw
              size={28}
              className="animate-spin"
            />
          </div>

          <h2 className="mt-4 text-xl font-bold text-slate-800">
            Loading Stock In...
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Fetching medicines and current stock.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>
        <Link
          to="/pharmacy"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Back to Pharmacy
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20">
            <PackagePlus size={27} />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Stock In
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Receive new medicine stock into the
              pharmacy inventory.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <AlertCircle
            size={21}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <div>
            <p className="font-semibold text-red-800">
              Stock In failed
            </p>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          SUCCESS
      ===================================================== */}

      {saved && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2
            size={22}
            className="text-emerald-600"
          />

          <div>
            <p className="font-semibold text-emerald-800">
              Stock received successfully
            </p>

            <p className="text-sm text-emerald-700">
              New batch and stock movement have been
              recorded successfully.
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          FORM
      ===================================================== */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* ===================================================
            MEDICINE & SUPPLIER
        =================================================== */}

        <Section
          icon={PackagePlus}
          title="Medicine & Supplier"
          description="Select the medicine and supplier for this stock receipt."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Select
              label="Medicine"
              name="medicineId"
              value={form.medicineId}
              onChange={handleMedicineChange}
              error={errors.medicineId}
              required
              options={medicines
                .filter(
                  (medicine) =>
                    medicine.status !== "INACTIVE"
                )
                .map((medicine) => ({
                  value: medicine.id,
                  label: `${medicine.name} — ${
                    medicine.strength || "-"
                  }`,
                }))}
            />

            <Select
              label="Supplier"
              name="supplier"
              value={form.supplier}
              onChange={handleChange}
              error={errors.supplier}
              required
              options={getSupplierOptions(
                suppliers,
                batches
              )}
            />

            <Input
              label="Invoice / Reference Number"
              name="invoiceNumber"
              value={form.invoiceNumber}
              onChange={handleChange}
              placeholder="e.g. INV-2026-0045"
            />
          </div>

          {/* Medicine Information */}

          {selectedMedicine && (
            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-4">
                <Info
                  label="Current Stock"
                  value={`${currentStock.toLocaleString()} ${
                    selectedMedicine.dosageForm || ""
                  }`}
                />

                <Info
                  label="Minimum Stock"
                  value={`${Number(
                    selectedMedicine.minimumStock || 0
                  ).toLocaleString()}`}
                />

                <Info
                  label="Unit Price"
                  value={`TSh ${Number(
                    selectedMedicine.unitPrice || 0
                  ).toLocaleString()}`}
                />

                <Info
                  label="Medicine Code"
                  value={
                    selectedMedicine.medicineCode ||
                    "-"
                  }
                />
              </div>
            </div>
          )}
        </Section>

        {/* ===================================================
            BATCH INFORMATION
        =================================================== */}

        <Section
          icon={CalendarDays}
          title="Batch Information"
          description="Every stock receipt must have batch and expiry information."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Input
              label="Batch Number"
              name="batchNumber"
              value={form.batchNumber}
              onChange={handleChange}
              error={errors.batchNumber}
              required
              placeholder="e.g. PCM2026B"
            />

            <Input
              label="Quantity Received"
              name="quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={handleChange}
              error={errors.quantity}
              required
              placeholder="e.g. 500"
            />

            <Input
              label="Manufacturing Date"
              name="manufacturingDate"
              type="date"
              value={form.manufacturingDate}
              onChange={handleChange}
              error={errors.manufacturingDate}
            />

            <Input
              label="Expiry Date"
              name="expiryDate"
              type="date"
              value={form.expiryDate}
              onChange={handleChange}
              error={errors.expiryDate}
              required
            />

            <Input
              label="Storage Location"
              name="storageLocation"
              value={form.storageLocation}
              onChange={handleChange}
              error={errors.storageLocation}
              required
              placeholder="e.g. Shelf A-01"
            />
          </div>

          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs leading-5 text-amber-800">
              Batch Number, Quantity, Expiry Date, Supplier
              and Purchase Price are stored in the current
              pharmacy backend. Manufacturing Date and Storage
              Location are currently kept on this form but are
              not yet database fields.
            </p>
          </div>
        </Section>

        {/* ===================================================
            PURCHASE INFORMATION
        =================================================== */}

        <Section
          icon={Truck}
          title="Purchase Information"
          description="Record the actual purchase cost of this stock."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Input
              label="Purchase Price Per Unit"
              name="purchasePrice"
              type="number"
              min="0"
              value={form.purchasePrice}
              onChange={handleChange}
              error={errors.purchasePrice}
              required
              placeholder="e.g. 150"
              prefix="TSh"
            />

            <Input
              label="Received By"
              name="receivedBy"
              value={form.receivedBy}
              onChange={handleChange}
              placeholder="e.g. Pharmacist"
            />
          </div>

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Notes
            </label>

            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={4}
              placeholder="Optional notes about this stock receipt..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </Section>

        {/* ===================================================
            STOCK SUMMARY
        =================================================== */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            Stock Receipt Summary
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <SummaryCard
              label="Stock Received"
              value={
                selectedMedicine && newStock
                  ? `${newStock.toLocaleString()} ${
                      selectedMedicine.dosageForm ||
                      ""
                    }`
                  : "0"
              }
            />

            <SummaryCard
              label="New Total Stock"
              value={
                selectedMedicine
                  ? `${newTotalStock.toLocaleString()} ${
                      selectedMedicine.dosageForm ||
                      ""
                    }`
                  : "0"
              }
            />

            <SummaryCard
              label="Stock Value"
              value={`TSh ${stockValue.toLocaleString()}`}
            />
          </div>
        </section>

        {/* ===================================================
            ACTIONS
        =================================================== */}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
          <Link
            to="/pharmacy"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving || saved}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-7 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <RefreshCw
                size={18}
                className="animate-spin"
              />
            ) : (
              <Save size={18} />
            )}

            {saving
              ? "Receiving..."
              : "Receive Stock"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* =========================================================
   SECTION
========================================================= */

function Section({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl">
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Icon size={19} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {children}
      </div>
    </section>
  );
}

/* =========================================================
   INPUT
========================================================= */

function Input({
  label,
  name,
  value,
  onChange,
  error,
  required,
  type = "text",
  placeholder,
  min,
  prefix,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
            {prefix}
          </span>
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          min={min}
          placeholder={placeholder}
          className={`
            h-11 w-full rounded-xl border bg-white
            ${prefix ? "pl-12" : "px-4"}
            pr-4 text-sm text-slate-700 outline-none
            transition-all placeholder:text-slate-400
            ${
              error
                ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-500/10"
                : "border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            }
          `}
        />
      </div>

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   SELECT
========================================================= */

function Select({
  label,
  name,
  value,
  onChange,
  error,
  required,
  options,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`
          h-11 w-full rounded-xl border bg-white px-4
          text-sm text-slate-700 outline-none transition-all
          ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-500/10"
              : "border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
          }
        `}
      >
        <option value="">
          Select {label.toLowerCase()}
        </option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

/* =========================================================
   INFO
========================================================= */

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-blue-900">
        {value || "-"}
      </p>
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   SUPPLIER OPTIONS
========================================================= */

function getSupplierOptions(defaultSuppliers, batches) {
  const names = new Set(defaultSuppliers);

  batches.forEach((batch) => {
    if (batch.supplier) {
      names.add(batch.supplier);
    }
  });

  return Array.from(names).map((supplier) => ({
    value: supplier,
    label: supplier,
  }));
}

/* =========================================================
   ERROR MESSAGE
========================================================= */

function getErrorMessage(err, fallback) {
  const responseData = err?.response?.data;

  if (typeof responseData === "string") {
    return responseData;
  }

  if (responseData?.message) {
    return responseData.message;
  }

  if (responseData?.error) {
    return responseData.error;
  }

  if (responseData?.detail) {
    return responseData.detail;
  }

  if (err?.message) {
    return err.message;
  }

  return fallback;
}