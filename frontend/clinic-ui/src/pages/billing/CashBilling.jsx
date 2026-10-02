import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  FileText,
  Plus,
  Receipt,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";

const patients = [
  {
    id: "PT-00124",
    name: "John Michael",
    phone: "0712 345 678",
  },
  {
    id: "PT-00123",
    name: "Asha Salum",
    phone: "0755 222 111",
  },
  {
    id: "PT-00122",
    name: "Mohamed Ali",
    phone: "0744 888 222",
  },
  {
    id: "PT-00121",
    name: "Fatma Hassan",
    phone: "0766 333 444",
  },
];

const serviceOptions = [
  {
    name: "Consultation",
    price: 20000,
  },
  {
    name: "Laboratory Test",
    price: 15000,
  },
  {
    name: "Injection",
    price: 5000,
  },
  {
    name: "Registration",
    price: 5000,
  },
];

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-TZ").format(amount);
}

export default function CashBilling() {
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [items, setItems] = useState([
    {
      id: 1,
      name: "Consultation",
      quantity: 1,
      price: 20000,
    },
  ]);

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [invoiceCreated, setInvoiceCreated] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const filteredPatients = useMemo(() => {
    if (!search.trim()) return patients;

    const query = search.toLowerCase();

    return patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(query) ||
        patient.id.toLowerCase().includes(query) ||
        patient.phone.includes(query)
    );
  }, [search]);

  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const amountPaid = Number(paymentAmount) || 0;

  const balance = Math.max(subtotal - amountPaid, 0);

  const change = Math.max(amountPaid - subtotal, 0);

  const addService = (service) => {
    setItems((current) => {
      const existing = current.find(
        (item) => item.name === service.name
      );

      if (existing) {
        return current.map((item) =>
          item.name === service.name
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...current,
        {
          id: Date.now(),
          name: service.name,
          quantity: 1,
          price: service.price,
        },
      ];
    });
  };

  const updateQuantity = (id, quantity) => {
    const value = Math.max(Number(quantity) || 1, 1);

    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: value,
            }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setItems((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  const handleCreateInvoice = () => {
    if (!selectedPatient) {
      alert("Please select a patient first.");
      return;
    }

    if (items.length === 0) {
      alert("Please add at least one service.");
      return;
    }

    setInvoiceCreated(true);
  };

  const handlePayment = () => {
    if (!invoiceCreated) {
      alert("Please create the invoice first.");
      return;
    }

    if (amountPaid <= 0) {
      alert("Please enter payment amount.");
      return;
    }

    setPaymentCompleted(true);
  };

  return (
    <div className="space-y-6">
      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link
            to="/billing"
            className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
          >
            <ArrowLeft size={16} />
            Back to Billing
          </Link>

          <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
            <Banknote size={16} />
            Cash Billing
          </div>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Cash Invoice
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Create an invoice and receive payment from a cash-paying patient.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Receipt size={18} className="text-emerald-600" />

          <div>
            <p className="text-[11px] font-medium text-slate-400">
              Invoice
            </p>

            <p className="text-sm font-bold text-slate-700">
              {invoiceCreated ? "INV-00125" : "Draft"}
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          PATIENT SELECTION
      ====================================================== */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <User size={19} className="text-blue-600" />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Patient
            </h2>

            <p className="text-xs text-slate-400">
              Select the patient for this invoice.
            </p>
          </div>
        </div>

        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search patient by name, ID or phone..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        {!selectedPatient && (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {filteredPatients.map((patient) => (
              <button
                key={patient.id}
                type="button"
                onClick={() => {
                  setSelectedPatient(patient);
                  setSearch("");
                }}
                className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-left transition hover:border-blue-200 hover:bg-blue-50/50"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {patient.name}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {patient.id} • {patient.phone}
                  </p>
                </div>

                <Plus
                  size={18}
                  className="text-slate-400"
                />
              </button>
            ))}
          </div>
        )}

        {selectedPatient && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {selectedPatient.name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)}
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800">
                  {selectedPatient.name}
                </p>

                <p className="text-xs text-slate-500">
                  {selectedPatient.id} • {selectedPatient.phone}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedPatient(null)}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Change
            </button>
          </div>
        )}
      </div>

      {/* =====================================================
          INVOICE + PAYMENT
      ====================================================== */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Invoice Items */}
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="font-bold text-slate-900">
                Invoice Items
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                Add services or charges to the invoice.
              </p>
            </div>
          </div>

          <div className="p-5">
            {/* Add Services */}
            <div className="mb-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Add Service
              </p>

              <div className="flex flex-wrap gap-2">
                {serviceOptions.map((service) => (
                  <button
                    key={service.name}
                    type="button"
                    onClick={() => addService(service)}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Plus size={15} />
                    {service.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Service
                    </th>

                    <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Qty
                    </th>

                    <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Unit Price
                    </th>

                    <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Total
                    </th>

                    <th />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="py-4">
                        <p className="text-sm font-semibold text-slate-800">
                          {item.name}
                        </p>
                      </td>

                      <td className="py-4">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) =>
                            updateQuantity(
                              item.id,
                              event.target.value
                            )
                          }
                          className="h-9 w-20 rounded-lg border border-slate-200 px-2 text-sm outline-none focus:border-blue-400"
                        />
                      </td>

                      <td className="py-4 text-sm text-slate-600">
                        TZS {formatCurrency(item.price)}
                      </td>

                      <td className="py-4 text-right text-sm font-bold text-slate-800">
                        TZS{" "}
                        {formatCurrency(
                          item.price * item.quantity
                        )}
                      </td>

                      <td className="py-4 text-right">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {items.length === 0 && (
              <div className="py-8 text-center text-sm text-slate-400">
                No services added yet.
              </div>
            )}
          </div>
        </div>

        {/* Payment */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-bold text-slate-900">
              Payment
            </h2>

            <p className="mt-0.5 text-xs text-slate-400">
              Receive payment for this invoice.
            </p>
          </div>

          <div className="space-y-5 p-5">
            {/* Summary */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  Subtotal
                </span>

                <span className="font-semibold text-slate-800">
                  TZS {formatCurrency(subtotal)}
                </span>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <span className="font-bold text-slate-800">
                    Total
                  </span>

                  <span className="text-xl font-bold text-slate-900">
                    TZS {formatCurrency(subtotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Payment Method
              </label>

              <select
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(event.target.value)
                }
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-400"
              >
                <option>Cash</option>
                <option>Mobile Money</option>
                <option>Card</option>
              </select>
            </div>

            {/* Amount Paid */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Amount Paid
              </label>

              <input
                type="number"
                min="0"
                value={paymentAmount}
                onChange={(event) =>
                  setPaymentAmount(event.target.value)
                }
                placeholder="Enter amount"
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-700 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            {/* Balance / Change */}
            {amountPaid > 0 && (
              <div
                className={`rounded-xl p-4 ${
                  change > 0
                    ? "bg-blue-50"
                    : balance > 0
                      ? "bg-amber-50"
                      : "bg-emerald-50"
                }`}
              >
                {change > 0 ? (
                  <>
                    <p className="text-xs font-medium text-blue-600">
                      Change
                    </p>

                    <p className="mt-1 text-xl font-bold text-blue-700">
                      TZS {formatCurrency(change)}
                    </p>
                  </>
                ) : balance > 0 ? (
                  <>
                    <p className="text-xs font-medium text-amber-600">
                      Outstanding Balance
                    </p>

                    <p className="mt-1 text-xl font-bold text-amber-700">
                      TZS {formatCurrency(balance)}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-medium text-emerald-600">
                      Payment Status
                    </p>

                    <p className="mt-1 text-xl font-bold text-emerald-700">
                      Fully Paid
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Create Invoice */}
            {!invoiceCreated && (
              <button
                type="button"
                onClick={handleCreateInvoice}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
              >
                <FileText size={18} />
                Create Invoice
              </button>
            )}

            {/* Pay */}
            {invoiceCreated && !paymentCompleted && (
              <button
                type="button"
                onClick={handlePayment}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
              >
                <Banknote size={18} />
                Receive Payment
              </button>
            )}

            {/* Completed */}
            {paymentCompleted && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4">
                  <CheckCircle2
                    size={22}
                    className="text-emerald-600"
                  />

                  <div>
                    <p className="text-sm font-bold text-emerald-700">
                      Payment Recorded
                    </p>

                    <p className="text-xs text-emerald-600">
                      {paymentMethod} payment received successfully.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Receipt size={18} />
                  Print Receipt
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}