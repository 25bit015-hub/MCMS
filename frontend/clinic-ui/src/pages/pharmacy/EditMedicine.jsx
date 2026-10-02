import { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Package,
  Pill,
  Save,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:8080/api";

const categories = [
  "Antibiotic",
  "Painkiller",
  "Antimalarial",
  "Gastrointestinal",
  "Antihistamine",
  "Antifungal",
  "Antiviral",
  "Cardiovascular",
  "Diabetes",
  "Vitamins",
  "Injection",
  "Other",
];

const dosageForms = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Suspension",
  "Injection",
  "Cream",
  "Ointment",
  "Drops",
  "Inhaler",
  "Suppository",
  "Powder",
  "Other",
];

export default function EditMedicine() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [medicine, setMedicine] = useState(null);
  const [batches, setBatches] = useState([]);

  const [form, setForm] = useState({
    name: "",
    genericName: "",
    category: "",
    dosageForm: "",
    strength: "",
    manufacturer: "",
    minimumStock: "",
    unitPrice: "",
  });

  const [batchForm, setBatchForm] = useState({
    supplier: "",
    purchasePrice: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // LOAD MEDICINE
  // =========================
  const loadMedicine = async () => {
    try {
      setLoading(true);
      setError("");

      const [medicineResponse, batchesResponse] =
        await Promise.all([
          axios.get(`${API_URL}/medicines/${id}`),
          axios.get(
            `${API_URL}/medicine-batches/medicine/${id}`
          ),
        ]);

      const medicineData = medicineResponse.data;
      const batchData = batchesResponse.data || [];

      setMedicine(medicineData);
      setBatches(batchData);

      setForm({
        name: medicineData.name || "",
        genericName: medicineData.genericName || "",
        category: medicineData.category || "",
        dosageForm: medicineData.dosageForm || "",
        strength: medicineData.strength || "",
        manufacturer: medicineData.manufacturer || "",
        minimumStock: medicineData.minimumStock ?? "",
        unitPrice: medicineData.unitPrice ?? "",
      });

      const firstBatch = batchData[0];

      setBatchForm({
        supplier: firstBatch?.supplier || "",
        purchasePrice: firstBatch?.purchasePrice ?? "",
      });
    } catch (err) {
      console.error("Failed to load medicine:", err);

      setError(getErrorMessage(err, "Failed to load medicine."));
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    if (!id) {
      setError("Medicine ID is missing.");
      setLoading(false);
      return;
    }

    loadMedicine();
  }, [id]);

  // =========================
  // MEDICINE FORM CHANGE
  // =========================
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
  };

  // =========================
  // BATCH FORM CHANGE
  // =========================
  const handleBatchChange = (e) => {
    const { name, value } = e.target;

    setBatchForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // =========================
  // VALIDATION
  // =========================
  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Medicine name is required";
    }

    if (!form.genericName.trim()) {
      newErrors.genericName = "Generic name is required";
    }

    if (!form.category) {
      newErrors.category = "Category is required";
    }

    if (!form.dosageForm) {
      newErrors.dosageForm = "Dosage form is required";
    }

    if (!form.strength.trim()) {
      newErrors.strength = "Strength is required";
    }

    if (
      form.minimumStock === "" ||
      Number(form.minimumStock) < 0
    ) {
      newErrors.minimumStock =
        "Minimum stock level is required";
    }

    if (
      form.unitPrice === "" ||
      Number(form.unitPrice) < 0
    ) {
      newErrors.unitPrice = "Unit price is required";
    }

    if (
      batchForm.purchasePrice !== "" &&
      Number(batchForm.purchasePrice) < 0
    ) {
      newErrors.purchasePrice =
        "Purchase price cannot be negative";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================
  // SAVE CHANGES
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSaved(false);

      // =========================
      // UPDATE MEDICINE
      // =========================
      const medicinePayload = {
        medicineCode: medicine.medicineCode,
        name: form.name.trim(),
        genericName: form.genericName.trim(),
        category: form.category,
        strength: form.strength.trim(),
        dosageForm: form.dosageForm,
        manufacturer:
          form.manufacturer.trim() || null,
        minimumStock: Number(form.minimumStock),
        unitPrice: Number(form.unitPrice),
        status: medicine.status,
      };

      await axios.put(
        `${API_URL}/medicines/${medicine.id}`,
        medicinePayload
      );

      // =========================
      // UPDATE FIRST BATCH
      // =========================
      const firstBatch = batches[0];

      if (firstBatch) {
        /*
         * IMPORTANT:
         *
         * Do NOT send:
         * - quantity
         * - batchNumber
         * - receivedDate
         * - status
         *
         * MedicineBatchService intentionally prevents
         * quantity changes through this endpoint.
         *
         * Stock changes must go through:
         * Stock In / Stock Adjustment / StockMovementService.
         */

        const batchPayload = {
          supplier:
            batchForm.supplier.trim() || null,

          purchasePrice:
            batchForm.purchasePrice === ""
              ? null
              : Number(batchForm.purchasePrice),
        };

        await axios.put(
          `${API_URL}/medicine-batches/${firstBatch.id}`,
          batchPayload
        );
      }

      // =========================
      // SUCCESS
      // =========================
      setSaved(true);
      setSaving(false);

      setTimeout(() => {
        navigate(
          `/pharmacy/medicines/${medicine.id}`
        );
      }, 1000);
    } catch (err) {
      console.error(
        "Failed to update medicine:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Failed to update medicine."
        )
      );

      setSaving(false);
      setSaved(false);
    }
  };

  // =========================
  // LOADING
  // =========================
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
            Fetching medicine information.
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // MEDICINE NOT FOUND
  // =========================
  if (!medicine) {
    return (
      <div className="mx-auto max-w-4xl py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <Pill size={28} />
        </div>

        <h2 className="mt-4 text-xl font-bold text-slate-800">
          Medicine not found
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {error ||
            "The medicine you are trying to edit does not exist."}
        </p>

        <Link
          to="/pharmacy/medicines"
          className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600"
        >
          <ArrowLeft size={16} />
          Back to Medicines
        </Link>
      </div>
    );
  }

  const firstBatch = batches[0];

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      {/* =========================
          HEADER
      ========================= */}
      <div>
        <Link
          to={`/pharmacy/medicines/${medicine.id}`}
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Back to Medicine
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20">
            <Pill size={27} />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Edit Medicine
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Update information for{" "}
              <span className="font-semibold text-slate-700">
                {medicine.name}
              </span>
            </p>

            <p className="mt-1 text-xs font-medium text-slate-400">
              Medicine Code:{" "}
              {medicine.medicineCode || "-"}
            </p>
          </div>
        </div>
      </div>

      {/* =========================
          ERROR
      ========================= */}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <AlertCircle
            size={21}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <div>
            <p className="font-semibold text-red-800">
              Update failed
            </p>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* =========================
          SUCCESS
      ========================= */}
      {saved && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2
            size={21}
            className="text-emerald-600"
          />

          <div>
            <p className="font-semibold text-emerald-800">
              Medicine updated successfully
            </p>

            <p className="text-sm text-emerald-700">
              Redirecting to medicine details...
            </p>
          </div>
        </div>
      )}

      {/* =========================
          FORM
      ========================= */}
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* =========================
            MEDICINE INFORMATION
        ========================= */}
        <Section
          icon={Pill}
          title="Medicine Information"
          description="Update the basic information of this medicine."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Input
              label="Medicine Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
              required
              placeholder="e.g. Paracetamol"
            />

            <Input
              label="Generic Name"
              name="genericName"
              value={form.genericName}
              onChange={handleChange}
              error={errors.genericName}
              required
              placeholder="e.g. Paracetamol"
            />

            <Select
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
              error={errors.category}
              required
              options={categories}
            />

            <Select
              label="Dosage Form"
              name="dosageForm"
              value={form.dosageForm}
              onChange={handleChange}
              error={errors.dosageForm}
              required
              options={dosageForms}
            />

            <Input
              label="Strength"
              name="strength"
              value={form.strength}
              onChange={handleChange}
              error={errors.strength}
              required
              placeholder="e.g. 500mg"
            />

            <Input
              label="Manufacturer"
              name="manufacturer"
              value={form.manufacturer}
              onChange={handleChange}
              placeholder="e.g. Shelys"
            />
          </div>
        </Section>

        {/* =========================
            INVENTORY
        ========================= */}
        <Section
          icon={Package}
          title="Inventory Settings"
          description="Update stock control settings. Current stock is managed separately."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Input
              label="Minimum Stock Level"
              name="minimumStock"
              type="number"
              min="0"
              value={form.minimumStock}
              onChange={handleChange}
              error={errors.minimumStock}
              required
              placeholder="e.g. 100"
            />

            <Input
              label="Unit Price"
              name="unitPrice"
              type="number"
              min="0"
              value={form.unitPrice}
              onChange={handleChange}
              error={errors.unitPrice}
              required
              placeholder="e.g. 150"
              prefix="TSh"
            />
          </div>

          {/* Current Stock */}
          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                  Current Stock
                </p>

                <p className="mt-1 text-xl font-bold text-blue-900">
                  {Number(
                    firstBatch?.quantity || 0
                  ).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                  Batches
                </p>

                <p className="mt-1 text-sm font-bold text-blue-900">
                  {batches.length}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
                  Status
                </p>

                <p className="mt-1 text-sm font-bold text-blue-900">
                  {medicine.status || "-"}
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs text-blue-700">
              Stock quantity, batch number and expiry should be
              changed through Stock In or Stock Adjustment, not
              here.
            </p>
          </div>
        </Section>

        {/* =========================
            BATCH INFORMATION
        ========================= */}
        <Section
          icon={Package}
          title="Batch Information"
          description="Update supplier and purchase price for the current batch."
        >
          {!firstBatch ? (
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
              This medicine has no registered batch yet. Add
              stock through Stock In before editing batch
              information.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Input
                  label="Supplier"
                  name="supplier"
                  value={batchForm.supplier}
                  onChange={handleBatchChange}
                  placeholder="e.g. ABC Pharma"
                />

                <Input
                  label="Purchase Price"
                  name="purchasePrice"
                  type="number"
                  min="0"
                  value={batchForm.purchasePrice}
                  onChange={handleBatchChange}
                  error={errors.purchasePrice}
                  placeholder="e.g. 150"
                  prefix="TSh"
                />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                <ReadOnly
                  label="Batch Number"
                  value={firstBatch.batchNumber}
                />

                <ReadOnly
                  label="Quantity"
                  value={Number(
                    firstBatch.quantity || 0
                  ).toLocaleString()}
                />

                <ReadOnly
                  label="Received Date"
                  value={formatDate(
                    firstBatch.receivedDate
                  )}
                />

                <ReadOnly
                  label="Expiry Date"
                  value={formatDate(
                    firstBatch.expiryDate
                  )}
                />
              </div>
            </>
          )}
        </Section>

        {/* =========================
            OTHER BATCHES
        ========================= */}
        {batches.length > 1 && (
          <Section
            icon={CalendarDays}
            title="Other Batches"
            description="Other registered batches are shown here for reference."
          >
            <div className="space-y-3">
              {batches.slice(1).map((batch) => (
                <div
                  key={batch.id}
                  className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-4"
                >
                  <ReadOnly
                    label="Batch Number"
                    value={batch.batchNumber}
                  />

                  <ReadOnly
                    label="Quantity"
                    value={Number(
                      batch.quantity || 0
                    ).toLocaleString()}
                  />

                  <ReadOnly
                    label="Supplier"
                    value={batch.supplier}
                  />

                  <ReadOnly
                    label="Expiry Date"
                    value={formatDate(
                      batch.expiryDate
                    )}
                  />
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* =========================
            BUTTONS
        ========================= */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
          <Link
            to={`/pharmacy/medicines/${medicine.id}`}
            className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving || saved}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-7 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
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
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* =========================================================
   REUSABLE SECTION
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
            key={option}
            value={option}
          >
            {option}
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
   READ ONLY
========================================================= */

function ReadOnly({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
        {value || "-"}
      </div>
    </div>
  );
}

/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(date) {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* =========================================================
   ERROR HANDLER
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