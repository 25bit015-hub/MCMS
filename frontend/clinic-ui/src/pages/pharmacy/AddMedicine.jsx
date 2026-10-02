import { useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Package,
  Pill,
  Save,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";



const initialForm = {
  name: "",
  genericName: "",
  brandName: "",
  category: "",
  dosageForm: "",
  strength: "",
  unit: "",
  manufacturer: "",
  supplier: "",
  batchNumber: "",
  quantity: "",
  minimumStockLevel: "",
  purchasePrice: "",
  sellingPrice: "",
  manufacturingDate: "",
  expiryDate: "",
  storageLocation: "",
};

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

const units = [
  "Tablet",
  "Capsule",
  "Bottle",
  "Vial",
  "Ampoule",
  "Tube",
  "Box",
  "Pack",
  "Piece",
];

export default function AddMedicine() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

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

    setServerError("");
  };

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

    if (!form.unit) {
      newErrors.unit = "Unit is required";
    }

    if (!form.batchNumber.trim()) {
      newErrors.batchNumber = "Batch number is required";
    }

    if (form.quantity === "") {
      newErrors.quantity = "Quantity is required";
    } else if (Number(form.quantity) < 0) {
      newErrors.quantity = "Quantity cannot be negative";
    }

    if (form.minimumStockLevel === "") {
      newErrors.minimumStockLevel =
        "Minimum stock level is required";
    } else if (Number(form.minimumStockLevel) < 0) {
      newErrors.minimumStockLevel =
        "Minimum stock level cannot be negative";
    }

    if (form.purchasePrice === "") {
      newErrors.purchasePrice = "Purchase price is required";
    } else if (Number(form.purchasePrice) < 0) {
      newErrors.purchasePrice =
        "Purchase price cannot be negative";
    }

    if (form.sellingPrice === "") {
      newErrors.sellingPrice = "Selling price is required";
    } else if (Number(form.sellingPrice) < 0) {
      newErrors.sellingPrice =
        "Selling price cannot be negative";
    }

    if (!form.expiryDate) {
      newErrors.expiryDate = "Expiry date is required";
    } else {
      const expiry = new Date(form.expiryDate);
      const today = new Date();

      today.setHours(0, 0, 0, 0);

      if (expiry < today) {
        newErrors.expiryDate =
          "Expiry date cannot be in the past";
      }
    }

    if (
      form.manufacturingDate &&
      form.expiryDate &&
      new Date(form.expiryDate) <=
        new Date(form.manufacturingDate)
    ) {
      newErrors.expiryDate =
        "Expiry date must be after manufacturing date";
    }

    if (
      form.purchasePrice !== "" &&
      form.sellingPrice !== "" &&
      Number(form.sellingPrice) < Number(form.purchasePrice)
    ) {
      newErrors.sellingPrice =
        "Selling price should not be below purchase price";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const getServerError = (error) => {
    if (error?.response?.data) {
      if (typeof error.response.data === "string") {
        return error.response.data;
      }

      if (error.response.data.message) {
        return error.response.data.message;
      }

      if (error.response.data.error) {
        return error.response.data.error;
      }
    }

    if (error?.message) {
      return error.message;
    }

    return "Something went wrong. Please try again.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) {
      return;
    }

    setServerError("");
    setSaved(false);

    if (!validate()) {
      return;
    }

    setSaving(true);

    let createdMedicine = null;

    try {
      /*
       * =========================================================
       * STEP 1: CREATE MEDICINE
       * =========================================================
       *
       * Medicine entity requires medicineCode.
       * The UI does not ask the user to type one, so we generate
       * a unique application-side code.
       */
      const medicineCode = `MED-${Date.now()}`;

      const medicinePayload = {
        medicineCode,
        name: form.name.trim(),
        genericName: form.genericName.trim(),
        category: form.category,
        strength: form.strength.trim(),
        dosageForm: form.dosageForm,
        manufacturer: form.manufacturer.trim() || null,
        minimumStock: Number(form.minimumStockLevel),
        unitPrice: Number(form.purchasePrice),
        status: "ACTIVE",
      };

      const medicineResponse = await api.post(
  "/medicines",
  medicinePayload
);

      createdMedicine = medicineResponse.data;

      if (!createdMedicine?.id) {
        throw new Error(
          "Medicine was created but no medicine ID was returned."
        );
      }

      /*
       * =========================================================
       * STEP 2: CREATE FIRST MEDICINE BATCH
       * =========================================================
       *
       * The batch belongs to the medicine created above.
       */
      const batchPayload = {
        batchNumber: form.batchNumber.trim(),
        quantity: Number(form.quantity),
        expiryDate: form.expiryDate,
        supplier: form.supplier.trim() || null,
        purchasePrice: Number(form.purchasePrice),
      };

      await api.post(
  `/medicine-batches/medicine/${createdMedicine.id}`,
  batchPayload
);
      /*
       * =========================================================
       * SUCCESS
       * =========================================================
       */
      setSaved(true);

      setTimeout(() => {
        navigate("/pharmacy/medicines");
      }, 1200);
    } catch (error) {
      console.error("Add medicine error:", error);

      /*
       * Important:
       * If Medicine was created but Batch creation failed,
       * the medicine already exists in the database.
       */
      if (createdMedicine?.id) {
        setServerError(
          `Medicine was created successfully, but the first stock batch could not be saved. Medicine ID: ${createdMedicine.id}. Please check the batch information and add the stock batch from Stock In.`
        );
      } else {
        setServerError(getServerError(error));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      {/* Header */}
      <div>
        <Link
          to="/pharmacy/medicines"
          className="
            mb-4 inline-flex items-center gap-2 text-sm
            font-semibold text-slate-500 transition
            hover:text-blue-600
          "
        >
          <ArrowLeft size={17} />
          Back to Medicines
        </Link>

        <div className="flex items-center gap-4">
          <div
            className="
              flex h-14 w-14 items-center justify-center rounded-2xl
              bg-gradient-to-br from-blue-500 to-blue-600
              text-white shadow-lg shadow-blue-500/20
            "
          >
            <Pill size={27} />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Add Medicine
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Add a new medicine and its first stock batch.
            </p>
          </div>
        </div>
      </div>

      {/* Server Error */}
      {serverError && (
        <div
          className="
            flex items-start gap-3 rounded-2xl border
            border-red-200 bg-red-50 p-4
          "
        >
          <AlertCircle
            size={21}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <div>
            <p className="font-semibold text-red-800">
              Unable to complete medicine registration
            </p>

            <p className="mt-1 text-sm leading-6 text-red-700">
              {serverError}
            </p>
          </div>
        </div>
      )}

      {/* Success */}
      {saved && (
        <div
          className="
            flex items-center gap-3 rounded-2xl border
            border-emerald-200 bg-emerald-50 p-4
          "
        >
          <CheckCircle2
            size={21}
            className="text-emerald-600"
          />

          <div>
            <p className="font-semibold text-emerald-800">
              Medicine added successfully
            </p>

            <p className="text-sm text-emerald-700">
              Medicine and first stock batch have been saved.
              Redirecting to Medicine Inventory...
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic information */}
        <Section
          icon={Pill}
          title="Medicine Information"
          description="Basic information about the medicine."
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

            <Input
              label="Brand Name"
              name="brandName"
              value={form.brandName}
              onChange={handleChange}
              placeholder="e.g. Panadol"
            />

            <Select
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
              error={errors.category}
              required
              options={categories}
              placeholder="Select category"
            />

            <Select
              label="Dosage Form"
              name="dosageForm"
              value={form.dosageForm}
              onChange={handleChange}
              error={errors.dosageForm}
              required
              options={dosageForms}
              placeholder="Select dosage form"
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

            <Select
              label="Unit"
              name="unit"
              value={form.unit}
              onChange={handleChange}
              error={errors.unit}
              required
              options={units}
              placeholder="Select unit"
            />

            <Input
              label="Manufacturer"
              name="manufacturer"
              value={form.manufacturer}
              onChange={handleChange}
              placeholder="e.g. Shelys"
            />

            <Input
              label="Supplier"
              name="supplier"
              value={form.supplier}
              onChange={handleChange}
              placeholder="e.g. ABC Pharma"
            />
          </div>
        </Section>

        {/* Batch / Stock */}
        <Section
          icon={Package}
          title="Initial Stock & Batch"
          description="Record the first batch received for this medicine."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Input
              label="Batch Number"
              name="batchNumber"
              value={form.batchNumber}
              onChange={handleChange}
              error={errors.batchNumber}
              required
              placeholder="e.g. PCM2026A"
            />

            <Input
              label="Quantity"
              name="quantity"
              type="number"
              min="0"
              value={form.quantity}
              onChange={handleChange}
              error={errors.quantity}
              required
              placeholder="e.g. 500"
            />

            <Input
              label="Minimum Stock Level"
              name="minimumStockLevel"
              type="number"
              min="0"
              value={form.minimumStockLevel}
              onChange={handleChange}
              error={errors.minimumStockLevel}
              required
              placeholder="e.g. 100"
            />

            <Input
              label="Storage Location"
              name="storageLocation"
              value={form.storageLocation}
              onChange={handleChange}
              placeholder="e.g. Shelf A-02"
            />
          </div>
        </Section>

        {/* Dates */}
        <Section
          icon={CalendarDays}
          title="Batch Dates"
          description="Manufacturing and expiry information for this batch."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Input
              label="Manufacturing Date"
              name="manufacturingDate"
              type="date"
              value={form.manufacturingDate}
              onChange={handleChange}
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
          </div>
        </Section>

        {/* Pricing */}
        <Section
          icon={Package}
          title="Pricing"
          description="Purchase and selling prices for the medicine."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Input
              label="Purchase Price"
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
              label="Selling Price"
              name="sellingPrice"
              type="number"
              min="0"
              value={form.sellingPrice}
              onChange={handleChange}
              error={errors.sellingPrice}
              required
              placeholder="e.g. 200"
              prefix="TSh"
            />
          </div>
        </Section>

        {/* Actions */}
        <div
          className="
            flex flex-col-reverse gap-3 border-t border-slate-200
            pt-6 sm:flex-row sm:justify-end
          "
        >
          <Link
            to="/pharmacy/medicines"
            className="
              inline-flex h-12 items-center justify-center
              rounded-xl border border-slate-200 bg-white px-6
              text-sm font-semibold text-slate-700
              transition hover:bg-slate-50
            "
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving || saved}
            className="
              inline-flex h-12 items-center justify-center gap-2
              rounded-xl bg-gradient-to-r from-blue-600 to-blue-500
              px-7 text-sm font-semibold text-white
              shadow-lg shadow-blue-500/20
              transition-all hover:-translate-y-0.5
              hover:shadow-xl
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {saving ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Medicine
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ---------------- Components ---------------- */

function Section({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <section
      className="
        overflow-hidden rounded-2xl border border-slate-200/80
        bg-white/90 shadow-sm backdrop-blur-xl
      "
    >
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex items-start gap-3">
          <div
            className="
              flex h-10 w-10 items-center justify-center
              rounded-xl bg-blue-50 text-blue-600
            "
          >
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

      <div className="p-6">{children}</div>
    </section>
  );
}

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
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <div className="relative">
        {prefix && (
          <span
            className="
              absolute left-3 top-1/2 -translate-y-1/2
              text-xs font-bold text-slate-400
            "
          >
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

function Select({
  label,
  name,
  value,
  onChange,
  error,
  required,
  options,
  placeholder,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`
          h-11 w-full rounded-xl border bg-white
          px-4 text-sm text-slate-700 outline-none
          transition-all
          ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-500/10"
              : "border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
          }
        `}
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option} value={option}>
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