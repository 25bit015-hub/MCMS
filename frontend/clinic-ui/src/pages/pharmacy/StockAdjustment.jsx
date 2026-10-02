import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  ClipboardEdit,
  Save,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const medicines = [
  {
    id: 1,
    name: "Paracetamol",
    strength: "500mg",
    unit: "Tablet",
    currentStock: 850,
  },
  {
    id: 2,
    name: "Amoxicillin",
    strength: "500mg",
    unit: "Capsule",
    currentStock: 95,
  },
  {
    id: 3,
    name: "Metronidazole",
    strength: "400mg",
    unit: "Tablet",
    currentStock: 45,
  },
  {
    id: 4,
    name: "Artemether/Lumefantrine",
    strength: "20/120mg",
    unit: "Tablet",
    currentStock: 320,
  },
  {
    id: 5,
    name: "Ibuprofen",
    strength: "400mg",
    unit: "Tablet",
    currentStock: 0,
  },
];

const adjustmentReasons = [
  {
    value: "Damaged",
    label: "Damaged",
    description: "Medicine damaged or broken.",
  },
  {
    value: "Expired",
    label: "Expired",
    description: "Medicine has passed its expiry date.",
  },
  {
    value: "Lost",
    label: "Lost",
    description: "Medicine is missing or cannot be located.",
  },
  {
    value: "Stock Count Correction",
    label: "Stock Count Correction",
    description: "Physical count differs from system stock.",
  },
  {
    value: "Returned",
    label: "Returned",
    description: "Stock returned to pharmacy.",
  },
  {
    value: "Other",
    label: "Other",
    description: "Other approved stock adjustment.",
  },
];

export default function StockAdjustment() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    medicineId: "",
    adjustmentType: "Decrease",
    quantity: "",
    reason: "",
    batchNumber: "",
    notes: "",
    adjustedBy: "Pharmacist",
  });

  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);

  const selectedMedicine = useMemo(
    () =>
      medicines.find(
        (medicine) =>
          String(medicine.id) === String(form.medicineId)
      ),
    [form.medicineId]
  );

  const quantity = Number(form.quantity || 0);

  const currentStock = Number(
    selectedMedicine?.currentStock || 0
  );

  const newStock =
    form.adjustmentType === "Increase"
      ? currentStock + quantity
      : currentStock - quantity;

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

  const handleMedicineChange = (e) => {
    setForm((prev) => ({
      ...prev,
      medicineId: e.target.value,
    }));

    setErrors((prev) => ({
      ...prev,
      medicineId: "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.medicineId) {
      newErrors.medicineId = "Please select a medicine";
    }

    if (!form.adjustmentType) {
      newErrors.adjustmentType =
        "Adjustment type is required";
    }

    if (!form.quantity || Number(form.quantity) <= 0) {
      newErrors.quantity =
        "Quantity must be greater than zero";
    }

    if (
      form.adjustmentType === "Decrease" &&
      quantity > currentStock
    ) {
      newErrors.quantity =
        "Decrease quantity cannot be greater than current stock";
    }

    if (!form.reason) {
      newErrors.reason = "Adjustment reason is required";
    }

    if (!form.notes.trim()) {
      newErrors.notes =
        "Please explain why this adjustment is being made";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const transaction = {
      id: `ADJ-${Date.now()}`,
      medicineId: Number(form.medicineId),
      medicineName: selectedMedicine.name,
      batchNumber: form.batchNumber.trim(),
      adjustmentType: form.adjustmentType,
      quantity,
      reason: form.reason,
      notes: form.notes.trim(),
      adjustedBy: form.adjustedBy.trim(),
      stockBefore: currentStock,
      stockAfter: newStock,
      createdAt: new Date().toISOString(),
    };

    console.log("Stock Adjustment:", transaction);

    setSaved(true);

    setTimeout(() => {
      navigate("/pharmacy");
    }, 1400);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      {/* Header */}
      <div>
        <Link
          to="/pharmacy"
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Back to Pharmacy
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20">
            <ClipboardEdit size={27} />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Stock Adjustment
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Correct pharmacy stock using a controlled adjustment.
            </p>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <AlertTriangle
          size={21}
          className="mt-0.5 shrink-0 text-amber-600"
        />

        <div>
          <p className="font-semibold text-amber-800">
            Stock adjustment should be used carefully
          </p>

          <p className="mt-1 text-sm leading-6 text-amber-700">
            Use this page only when there is an approved reason
            for changing the recorded stock. Normal incoming stock
            should be recorded through Stock In, while dispensing
            should reduce stock through the dispensing workflow.
          </p>
        </div>
      </div>

      {/* Success */}
      {saved && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2
            size={22}
            className="text-emerald-600"
          />

          <div>
            <p className="font-semibold text-emerald-800">
              Stock adjustment recorded successfully
            </p>

            <p className="text-sm text-emerald-700">
              Returning to Pharmacy...
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Medicine */}
        <Section
          icon={ClipboardEdit}
          title="Medicine"
          description="Select the medicine whose stock needs adjustment."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Select
              label="Medicine"
              name="medicineId"
              value={form.medicineId}
              onChange={handleMedicineChange}
              error={errors.medicineId}
              required
              options={medicines.map((medicine) => ({
                value: medicine.id,
                label: `${medicine.name} — ${medicine.strength}`,
              }))}
            />

            <Input
              label="Batch Number"
              name="batchNumber"
              value={form.batchNumber}
              onChange={handleChange}
              placeholder="e.g. PCM2026A"
            />
          </div>

          {selectedMedicine && (
            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                <Info
                  label="Medicine"
                  value={selectedMedicine.name}
                />

                <Info
                  label="Current Stock"
                  value={`${currentStock.toLocaleString()} ${selectedMedicine.unit}`}
                />

                <Info
                  label="Unit"
                  value={selectedMedicine.unit}
                />
              </div>
            </div>
          )}
        </Section>

        {/* Adjustment */}
        <Section
          icon={form.adjustmentType === "Increase" ? ArrowUp : ArrowDown}
          title="Adjustment"
          description="Choose whether stock should increase or decrease."
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Adjustment Type
                <span className="ml-1 text-red-500">*</span>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <TypeButton
                  active={form.adjustmentType === "Decrease"}
                  type="Decrease"
                  icon={ArrowDown}
                  title="Decrease"
                  description="Remove stock"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      adjustmentType: "Decrease",
                    }))
                  }
                />

                <TypeButton
                  active={form.adjustmentType === "Increase"}
                  type="Increase"
                  icon={ArrowUp}
                  title="Increase"
                  description="Add stock"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      adjustmentType: "Increase",
                    }))
                  }
                />
              </div>

              {errors.adjustmentType && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                  {errors.adjustmentType}
                </p>
              )}
            </div>

            <Input
              label="Adjustment Quantity"
              name="quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={handleChange}
              error={errors.quantity}
              required
              placeholder="e.g. 20"
            />
          </div>

          {/* Stock calculation */}
          {selectedMedicine && (
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
              <StockBox
                label="Stock Before"
                value={`${currentStock.toLocaleString()} ${selectedMedicine.unit}`}
              />

              <StockBox
                label="Adjustment"
                value={`${
                  form.adjustmentType === "Increase"
                    ? "+"
                    : "-"
                }${quantity.toLocaleString()} ${
                  selectedMedicine.unit
                }`}
              />

              <StockBox
                label="Stock After"
                value={`${Math.max(
                  0,
                  newStock
                ).toLocaleString()} ${
                  selectedMedicine.unit
                }`}
                highlight
              />
            </div>
          )}
        </Section>

        {/* Reason */}
        <Section
          icon={AlertTriangle}
          title="Reason & Notes"
          description="Record why the stock is being adjusted."
        >
          <div className="space-y-5">
            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-700">
                Adjustment Reason
                <span className="ml-1 text-red-500">*</span>
              </label>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {adjustmentReasons.map((reason) => {
                  const active =
                    form.reason === reason.value;

                  return (
                    <button
                      key={reason.value}
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          reason: reason.value,
                        }));

                        setErrors((prev) => ({
                          ...prev,
                          reason: "",
                        }));
                      }}
                      className={`
                        rounded-xl border p-4 text-left
                        transition-all duration-200
                        ${
                          active
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/10"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }
                      `}
                    >
                      <p
                        className={`text-sm font-bold ${
                          active
                            ? "text-blue-700"
                            : "text-slate-800"
                        }`}
                      >
                        {reason.label}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {reason.description}
                      </p>
                    </button>
                  );
                })}
              </div>

              {errors.reason && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                  {errors.reason}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Explanation
                <span className="ml-1 text-red-500">*</span>
              </label>

              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Explain why this adjustment is required..."
                className={`
                  w-full resize-none rounded-xl border
                  bg-white px-4 py-3 text-sm text-slate-700
                  outline-none transition placeholder:text-slate-400
                  ${
                    errors.notes
                      ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-500/10"
                      : "border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
                  }
                `}
              />

              {errors.notes && (
                <p className="mt-1.5 text-xs font-medium text-red-600">
                  {errors.notes}
                </p>
              )}
            </div>

            <Input
              label="Adjusted By"
              name="adjustedBy"
              value={form.adjustedBy}
              onChange={handleChange}
              placeholder="e.g. Pharmacist"
            />
          </div>
        </Section>

        {/* Final summary */}
        {selectedMedicine && form.quantity && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Adjustment Summary
            </h2>

            <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
              <div className="grid grid-cols-2 border-b border-slate-200">
                <div className="bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
                  Medicine
                </div>

                <div className="px-4 py-3 text-sm font-bold text-slate-800">
                  {selectedMedicine.name}
                </div>
              </div>

              <div className="grid grid-cols-2 border-b border-slate-200">
                <div className="bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
                  Adjustment
                </div>

                <div className="px-4 py-3 text-sm font-bold text-slate-800">
                  {form.adjustmentType}{" "}
                  {quantity.toLocaleString()}{" "}
                  {selectedMedicine.unit}
                </div>
              </div>

              <div className="grid grid-cols-2 border-b border-slate-200">
                <div className="bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
                  Reason
                </div>

                <div className="px-4 py-3 text-sm font-bold text-slate-800">
                  {form.reason || "—"}
                </div>
              </div>

              <div className="grid grid-cols-2">
                <div className="bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
                  New Stock
                </div>

                <div className="px-4 py-3 text-sm font-bold text-blue-700">
                  {Math.max(
                    0,
                    newStock
                  ).toLocaleString()}{" "}
                  {selectedMedicine.unit}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end">
          <Link
            to="/pharmacy"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saved}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-7 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save size={18} />
            Save Adjustment
          </button>
        </div>
      </form>
    </div>
  );
}

/* =========================
   Components
========================= */

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
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        min={min}
        placeholder={placeholder}
        className={`
          h-11 w-full rounded-xl border bg-white px-4
          text-sm text-slate-700 outline-none transition
          placeholder:text-slate-400
          ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-500/10"
              : "border-slate-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
          }
        `}
      />

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
          h-11 w-full rounded-xl border bg-white px-4
          text-sm text-slate-700 outline-none transition
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

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-blue-900">
        {value}
      </p>
    </div>
  );
}

function TypeButton({
  active,
  type,
  icon: Icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        rounded-xl border p-4 text-left transition-all
        ${
          active
            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/10"
            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
        }
      `}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg ${
          active
            ? "bg-blue-600 text-white"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        <Icon size={18} />
      </div>

      <p
        className={`mt-3 text-sm font-bold ${
          active ? "text-blue-700" : "text-slate-800"
        }`}
      >
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </button>
  );
}

function StockBox({
  label,
  value,
  highlight = false,
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight
          ? "border-blue-200 bg-blue-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 text-lg font-bold ${
          highlight
            ? "text-blue-700"
            : "text-slate-800"
        }`}
      >
        {value}
      </p>
    </div>
  );
}