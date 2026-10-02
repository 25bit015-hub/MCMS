import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Search,
  ShieldCheck,
  User,
  CreditCard,
  Plus,
  Trash2,
  Receipt,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const samplePatients = [
  {
    id: "P-001",
    name: "Amina Hassan",
    phone: "0712345678",
    insurance: "NHIF",
    memberNumber: "NHIF-458921",
  },
  {
    id: "P-002",
    name: "Mohamed Ali",
    phone: "0756789123",
    insurance: "Jubilee Health",
    memberNumber: "JUB-782341",
  },
  {
    id: "P-003",
    name: "Fatma Salum",
    phone: "0765432109",
    insurance: "Strategis",
    memberNumber: "STR-214589",
  },
];

const insuranceProviders = [
  "NHIF",
  "Jubilee Health",
  "Strategis",
  "AAR Insurance",
  "Britam",
];

const serviceOptions = [
  { id: 1, name: "Consultation", price: 20000 },
  { id: 2, name: "Laboratory Test", price: 15000 },
  { id: 3, name: "Injection", price: 5000 },
  { id: 4, name: "Registration", price: 5000 },
  { id: 5, name: "Medicine", price: 25000 },
];

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-TZ").format(amount);
}

export default function InsuranceBilling() {
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [memberNumber, setMemberNumber] = useState("");

  const [selectedService, setSelectedService] = useState("");
  const [items, setItems] = useState([]);

  const [approvedAmount, setApprovedAmount] = useState("");
  const [claimCreated, setClaimCreated] = useState(false);

  const filteredPatients = useMemo(() => {
    if (!search.trim()) return [];

    const keyword = search.toLowerCase();

    return samplePatients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(keyword) ||
        patient.id.toLowerCase().includes(keyword) ||
        patient.phone.includes(keyword) ||
        patient.memberNumber.toLowerCase().includes(keyword)
    );
  }, [search]);

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const approved = Number(approvedAmount) || 0;

  const patientCopayment = Math.max(subtotal - approved, 0);

  const insuranceBalance = Math.min(approved, subtotal);

  const selectPatient = (patient) => {
    setSelectedPatient(patient);
    setSearch("");
    setInsuranceProvider(patient.insurance || "");
    setMemberNumber(patient.memberNumber || "");
  };

  const addService = () => {
    if (!selectedService) return;

    const service = serviceOptions.find(
      (item) => item.id === Number(selectedService)
    );

    if (!service) return;

    const existingItem = items.find((item) => item.id === service.id);

    if (existingItem) {
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

  const handleCreateClaim = () => {
    if (!selectedPatient) {
      alert("Please select a patient first.");
      return;
    }

    if (!insuranceProvider) {
      alert("Please select an insurance provider.");
      return;
    }

    if (!memberNumber.trim()) {
      alert("Please enter member/card number.");
      return;
    }

    if (items.length === 0) {
      alert("Please add at least one service.");
      return;
    }

    if (approved <= 0) {
      alert("Please enter approved insurance amount.");
      return;
    }

    setClaimCreated(true);
  };

  const resetClaim = () => {
    setSelectedPatient(null);
    setSearch("");
    setInsuranceProvider("");
    setMemberNumber("");
    setItems([]);
    setApprovedAmount("");
    setClaimCreated(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              to="/billing"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft size={17} />
              Back to Billing
            </Link>

            <h1 className="text-2xl font-bold text-slate-900">
              Insurance / Bima Billing
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create insurance claim and calculate patient co-payment.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <ShieldCheck className="text-blue-600" size={22} />

            <div>
              <p className="text-xs text-blue-600">Billing Type</p>
              <p className="font-semibold text-blue-900">Insurance</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {claimCreated && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2
                className="mt-0.5 text-emerald-600"
                size={22}
              />

              <div className="flex-1">
                <h3 className="font-semibold text-emerald-900">
                  Insurance Claim Created Successfully
                </h3>

                <p className="mt-1 text-sm text-emerald-700">
                  Claim <strong>CLM-00126</strong> has been created for{" "}
                  <strong>{selectedPatient?.name}</strong>.
                </p>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-lg bg-white p-3">
                    <p className="text-xs text-slate-500">Total Bill</p>
                    <p className="font-bold text-slate-900">
                      TZS {formatCurrency(subtotal)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-3">
                    <p className="text-xs text-slate-500">
                      Insurance Amount
                    </p>
                    <p className="font-bold text-emerald-700">
                      TZS {formatCurrency(insuranceBalance)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-3">
                    <p className="text-xs text-slate-500">
                      Patient Co-payment
                    </p>
                    <p className="font-bold text-orange-600">
                      TZS {formatCurrency(patientCopayment)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    <Receipt size={17} />
                    Print Claim
                  </button>

                  <button
                    onClick={resetClaim}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Create Another Claim
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left */}
          <div className="space-y-6 lg:col-span-2">
            {/* Patient */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-2">
                  <User className="text-blue-600" size={20} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Patient Information
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
                  placeholder="Search patient by name, ID, phone or member number..."
                  className="w-full rounded-xl border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

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
                            {patient.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            {patient.id} • {patient.phone}
                          </p>
                        </div>

                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                          {patient.insurance}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedPatient && (
                <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {selectedPatient.name}
                      </p>

                      <p className="text-sm text-slate-600">
                        {selectedPatient.id} • {selectedPatient.phone}
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedPatient(null)}
                      className="text-sm font-medium text-blue-700 hover:text-blue-900"
                    >
                      Change Patient
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Insurance */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-emerald-50 p-2">
                  <CreditCard className="text-emerald-600" size={20} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Insurance Information
                  </h2>

                  <p className="text-xs text-slate-500">
                    Provider and member details
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
                    onChange={(e) => setInsuranceProvider(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select provider</option>

                    {insuranceProviders.map((provider) => (
                      <option key={provider} value={provider}>
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
                    onChange={(e) => setMemberNumber(e.target.value)}
                    placeholder="Enter member/card number"
                    className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Services / Charges
                  </h2>

                  <p className="text-xs text-slate-500">
                    Add services to this insurance bill
                  </p>
                </div>

                <div className="flex gap-2">
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="">Select service</option>

                    {serviceOptions.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - TZS {formatCurrency(service.price)}
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
                    No services added
                  </p>

                  <p className="text-xs text-slate-400">
                    Select a service above to add it to the bill.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500">
                        <th className="pb-3">Service</th>
                        <th className="pb-3">Unit Price</th>
                        <th className="pb-3">Quantity</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3 text-right">Action</th>
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
                                onClick={() => decreaseQuantity(item.id)}
                                className="h-7 w-7 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
                              >
                                -
                              </button>

                              <span className="w-6 text-center text-sm font-medium">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() => increaseQuantity(item.id)}
                                className="h-7 w-7 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          <td className="py-4 text-sm font-semibold text-slate-900">
                            TZS {formatCurrency(item.price * item.quantity)}
                          </td>

                          <td className="py-4 text-right">
                            <button
                              onClick={() => removeItem(item.id)}
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

          {/* Right Summary */}
          <div>
            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-5 font-semibold text-slate-900">
                Claim Summary
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    Total Bill
                  </span>

                  <span className="font-semibold text-slate-900">
                    TZS {formatCurrency(subtotal)}
                  </span>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Approved Insurance Amount
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={approvedAmount}
                    onChange={(e) => setApprovedAmount(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="rounded-xl bg-emerald-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-emerald-700">
                      Insurance Balance
                    </span>

                    <span className="font-bold text-emerald-800">
                      TZS {formatCurrency(insuranceBalance)}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl bg-orange-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-orange-700">
                      Patient Co-payment
                    </span>

                    <span className="font-bold text-orange-800">
                      TZS {formatCurrency(patientCopayment)}
                    </span>
                  </div>
                </div>

                {approved > subtotal && (
                  <div className="flex gap-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
                    <AlertCircle size={16} className="shrink-0" />

                    <span>
                      Approved amount cannot be higher than the total bill.
                    </span>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-4">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Claim Status
                    </span>

                    <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                      Pending
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCreateClaim}
                  disabled={claimCreated || approved > subtotal}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {claimCreated ? "Claim Created" : "Create Insurance Claim"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}