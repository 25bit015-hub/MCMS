import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Search,
  User,
  Receipt,
  Plus,
  Trash2,
  Save,
  ShieldCheck,
  Banknote,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

const services = [
  { id: 1, name: "Consultation", price: 20000 },
  { id: 2, name: "Laboratory Test", price: 15000 },
  { id: 3, name: "Injection", price: 5000 },
  { id: 4, name: "Registration", price: 5000 },
  { id: 5, name: "Medicine", price: 25000 },
];

const insuranceProviders = [
  "NHIF",
  "Jubilee Health",
  "Strategis",
  "AAR Insurance",
  "Britam",
];

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-TZ").format(amount);
}

export default function CreateInvoice() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [billingType, setBillingType] = useState("Cash");

  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [memberNumber, setMemberNumber] = useState("");

  const [selectedService, setSelectedService] = useState("");
  const [items, setItems] = useState([]);

  const [amountPaid, setAmountPaid] = useState("");

  const [invoiceCreated, setInvoiceCreated] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadPatients = async () => {
      try {
        setLoadingPatients(true);
        const response = await api.get("/patients");
        if (mounted) setPatients(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Failed to load patients", error);
        if (mounted) setErrorMessage("Failed to load patients from the server.");
      } finally {
        if (mounted) setLoadingPatients(false);
      }
    };

    loadPatients();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredPatients = useMemo(() => {
    if (!search.trim()) return [];

    const keyword = search.toLowerCase();

    return patients.filter((patient) => {
      const fullName = `${patient.firstName || ""} ${patient.lastName || ""}`.trim();
      const patientNumber = patient.patientNumber || "";
      const phone = patient.phone || "";

      return (
        fullName.toLowerCase().includes(keyword) ||
        patientNumber.toLowerCase().includes(keyword) ||
        phone.includes(keyword)
      );
    });
  }, [search]);

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const paid = Number(amountPaid) || 0;

  const balance = Math.max(subtotal - paid, 0);

  const change = Math.max(paid - subtotal, 0);

  const selectPatient = (patient) => {
    setSelectedPatient(patient);
    setSearch("");
  };

  const addService = () => {
    if (!selectedService) return;

    const service = services.find(
      (item) => item.id === Number(selectedService)
    );

    if (!service) return;

    const existing = items.find((item) => item.id === service.id);

    if (existing) {
      setItems(
        items.map((item) =>
          item.id === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setItems([
        ...items,
        {
          ...service,
          quantity: 1,
        },
      ]);
    }

    setSelectedService("");
  };

  const increaseQuantity = (id) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setItems(
      items
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleCreateInvoice = async () => {
    setErrorMessage("");

    if (!selectedPatient) {
      setErrorMessage("Please select a patient.");
      return;
    }

    if (items.length === 0) {
      setErrorMessage("Please add at least one service.");
      return;
    }

    if (billingType === "Insurance") {
      if (!insuranceProvider) {
        setErrorMessage("Please select an insurance provider.");
        return;
      }

      if (!memberNumber.trim()) {
        setErrorMessage("Please enter member/card number.");
        return;
      }
    }

    try {
      const notes =
        billingType === "Insurance"
          ? `Insurance Provider: ${insuranceProvider}; Member Number: ${memberNumber.trim()}`
          : null;

      const payload = {
        patientId: Number(selectedPatient.id),
        billingType: billingType.toUpperCase(),
        items: items.map((item) => ({
          description: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
        notes,
      };

      const response = await api.post("/invoices", payload);
      setInvoiceCreated(response.data);
    } catch (error) {
      console.error("Failed to create invoice", error);
      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to create invoice. Please try again.";
      setErrorMessage(message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/billing/invoices"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft size={17} />
              Back to Invoices
            </Link>

            <h1 className="text-2xl font-bold text-slate-900">
              Create Invoice
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create a new cash or insurance invoice.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <Receipt size={21} className="text-blue-600" />

            <div>
              <p className="text-xs text-blue-600">
                New Invoice
              </p>

              <p className="font-semibold text-blue-900">
                {invoiceCreated?.invoiceNumber || "New Invoice"}
              </p>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Success */}
        {invoiceCreated && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <Save
                size={21}
                className="mt-0.5 text-emerald-600"
              />

              <div>
                <h3 className="font-semibold text-emerald-900">
                  Invoice Created Successfully
                </h3>

                <p className="mt-1 text-sm text-emerald-700">
                  Invoice <strong>{invoiceCreated.invoiceNumber}</strong> has been
                  created successfully and saved to the database.
                </p>

                <button
                  onClick={() => navigate("/billing/invoices")}
                  className="mt-3 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  View Invoices
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Main */}
          <div className="space-y-6 lg:col-span-2">

            {/* Billing Type */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-semibold text-slate-900">
                Billing Type
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <button
                  onClick={() => setBillingType("Cash")}
                  className={`rounded-xl border p-4 text-left transition ${
                    billingType === "Cash"
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2">
                      <Banknote
                        size={21}
                        className="text-blue-600"
                      />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        Cash Billing
                      </p>

                      <p className="text-xs text-slate-500">
                        Patient pays directly
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setBillingType("Insurance")}
                  className={`rounded-xl border p-4 text-left transition ${
                    billingType === "Insurance"
                      ? "border-purple-500 bg-purple-50 ring-2 ring-purple-100"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-purple-100 p-2">
                      <ShieldCheck
                        size={21}
                        className="text-purple-600"
                      />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        Insurance / Bima
                      </p>

                      <p className="text-xs text-slate-500">
                        Bill through insurance
                      </p>
                    </div>
                  </div>
                </button>

              </div>
            </div>

            {/* Patient */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-2">
                  <User size={20} className="text-blue-600" />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Patient
                  </h2>

                  <p className="text-xs text-slate-500">
                    Search and select patient
                  </p>
                </div>
              </div>

              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search patient by name, ID or phone..."
                  className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                {loadingPatients && search.trim() && (
                  <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-lg">
                    Searching patients...
                  </div>
                )}

                {!loadingPatients && search.trim() && filteredPatients.length === 0 && (
                  <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-lg">
                    No patient found.
                  </div>
                )}

                {filteredPatients.length > 0 && (
                  <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
                    {filteredPatients.map((patient) => (
                      <button
                        key={patient.id}
                        onClick={() => selectPatient(patient)}
                        className="flex w-full items-center justify-between border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {`${patient.firstName || ""} ${patient.lastName || ""}`.trim()}
                          </p>

                          <p className="text-xs text-slate-500">
                            {patient.patientNumber || `ID-${patient.id}`} • {patient.phone || "No phone"}
                          </p>
                        </div>


                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedPatient && (
                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {`${selectedPatient.firstName || ""} ${selectedPatient.lastName || ""}`.trim()}
                      </p>

                      <p className="text-sm text-slate-600">
                        {selectedPatient.patientNumber || `ID-${selectedPatient.id}`} •{" "}
                        {selectedPatient.phone || "No phone"}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedPatient(null)}
                      className="text-sm font-medium text-blue-700 hover:text-blue-900"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Insurance */}
            {billingType === "Insurance" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-lg bg-purple-50 p-2">
                    <ShieldCheck
                      size={20}
                      className="text-purple-600"
                    />
                  </div>

                  <div>
                    <h2 className="font-semibold text-slate-900">
                      Insurance Information
                    </h2>

                    <p className="text-xs text-slate-500">
                      Insurance provider and member details
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Insurance Provider
                    </label>

                    <select
                      value={insuranceProvider}
                      onChange={(e) =>
                        setInsuranceProvider(e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    >
                      <option value="">
                        Select provider
                      </option>

                      {insuranceProviders.map((provider) => (
                        <option
                          key={provider}
                          value={provider}
                        >
                          {provider}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      Member / Card Number
                    </label>

                    <input
                      type="text"
                      value={memberNumber}
                      onChange={(e) =>
                        setMemberNumber(e.target.value)
                      }
                      placeholder="Enter member number"
                      className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                    />
                  </div>

                </div>
              </div>
            )}

            {/* Services */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Invoice Items
                  </h2>

                  <p className="text-xs text-slate-500">
                    Add services or charges
                  </p>
                </div>

                <div className="flex gap-2">
                  <select
                    value={selectedService}
                    onChange={(e) =>
                      setSelectedService(e.target.value)
                    }
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="">
                      Select service
                    </option>

                    {services.map((service) => (
                      <option
                        key={service.id}
                        value={service.id}
                      >
                        {service.name} - TZS{" "}
                        {formatCurrency(service.price)}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={addService}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    <Plus size={17} />
                    Add
                  </button>
                </div>
              </div>

              {items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center">
                  <Receipt
                    size={32}
                    className="mx-auto mb-2 text-slate-300"
                  />

                  <p className="text-sm font-medium text-slate-600">
                    No invoice items
                  </p>

                  <p className="text-xs text-slate-400">
                    Add services using the selector above.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                        <th className="pb-3">Service</th>
                        <th className="pb-3">Price</th>
                        <th className="pb-3">Quantity</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3 text-right">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {items.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-slate-100"
                        >
                          <td className="py-4 font-medium text-slate-900">
                            {item.name}
                          </td>

                          <td className="py-4 text-sm text-slate-600">
                            TZS {formatCurrency(item.price)}
                          </td>

                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  decreaseQuantity(item.id)
                                }
                                className="h-7 w-7 rounded-md border border-slate-300"
                              >
                                -
                              </button>

                              <span className="w-6 text-center text-sm font-medium">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() =>
                                  increaseQuantity(item.id)
                                }
                                className="h-7 w-7 rounded-md border border-slate-300"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          <td className="py-4 text-sm font-semibold text-slate-900">
                            TZS{" "}
                            {formatCurrency(
                              item.price * item.quantity
                            )}
                          </td>

                          <td className="py-4 text-right">
                            <button
                              onClick={() =>
                                removeItem(item.id)
                              }
                              className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                            >
                              <Trash2 size={17} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <h2 className="mb-5 font-semibold text-slate-900">
                Invoice Summary
              </h2>

              <div className="space-y-4">

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Billing Type
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      billingType === "Cash"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-purple-50 text-purple-700"
                    }`}
                  >
                    {billingType}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Subtotal
                  </span>

                  <span className="font-semibold text-slate-900">
                    TZS {formatCurrency(subtotal)}
                  </span>
                </div>

                {billingType === "Cash" && (
                  <div className="rounded-xl bg-blue-50 p-4">
                    <p className="text-xs font-medium text-blue-600">
                      Payment
                    </p>
                    <p className="mt-1 text-sm font-semibold text-blue-900">
                      Invoice will be created first. Payment will be recorded from the Payments module.
                    </p>
                  </div>
                )}

                {billingType === "Insurance" && (
                  <div className="rounded-xl bg-purple-50 p-4">
                    <p className="text-xs text-purple-600">
                      Insurance Claim
                    </p>

                    <p className="mt-1 font-semibold text-purple-900">
                      Amount will be submitted to insurance.
                    </p>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900">
                      Total
                    </span>

                    <span className="text-xl font-bold text-blue-700">
                      TZS {formatCurrency(subtotal)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCreateInvoice}
                  disabled={!!invoiceCreated}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  <Save size={18} />

                  {invoiceCreated
                    ? "Invoice Created"
                    : "Create Invoice"}
                </button>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}