import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  User,
  Phone,
  Plus,
  Minus,
  Trash2,
  FileText,
  CreditCard,
  Smartphone,
  Banknote,
  Loader2,
  CheckCircle2,
  Printer,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import api from "../../services/api";

const serviceOptions = [
  {
    id: "consultation",
    name: "Consultation",
    price: 20000,
  },
  {
    id: "laboratory",
    name: "Laboratory Test",
    price: 15000,
  },
  {
    id: "injection",
    name: "Injection",
    price: 5000,
  },
  {
    id: "registration",
    name: "Registration",
    price: 5000,
  },
];

const paymentMethods = [
  {
    label: "Cash",
    value: "CASH",
    icon: Banknote,
  },
  {
    label: "Mobile Money",
    value: "MOBILE_MONEY",
    icon: Smartphone,
  },
  {
    label: "Card",
    value: "CARD",
    icon: CreditCard,
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat("en-TZ").format(Number(value || 0));
}

function getPatientName(patient) {
  const fullName = [
    patient?.firstName,
    patient?.middleName,
    patient?.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    patient?.fullName ||
    patient?.name ||
    fullName ||
    "Unknown Patient"
  );
}

function getPatientNumber(patient) {
  return (
    patient?.patientNumber ||
    patient?.patientNo ||
    patient?.registrationNumber ||
    patient?.number ||
    `#${patient?.id ?? "-"}`
  );
}

function getPatientPhone(patient) {
  return (
    patient?.phone ||
    patient?.mobileNumber ||
    patient?.mobile ||
    "-"
  );
}

function normalizePatients(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.patients)) {
    return data.patients;
  }

  return [];
}

export default function CashBilling() {
  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);

  const [items, setItems] = useState([
    {
      id: "consultation",
      name: "Consultation",
      quantity: 1,
      unitPrice: 20000,
    },
  ]);

  const [invoice, setInvoice] = useState(null);

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentReference, setPaymentReference] = useState("");

  const [loadingPatients, setLoadingPatients] = useState(true);
  const [creatingInvoice, setCreatingInvoice] = useState(false);
  const [recordingPayment, setRecordingPayment] = useState(false);

  const [paymentId, setPaymentId] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  /*
   * ============================
   * LOAD PATIENTS
   * ============================
   */

  const fetchPatients = async () => {
    try {
      setLoadingPatients(true);
      setError("");

      const response = await api.get("/patients");

      setPatients(normalizePatients(response.data));
    } catch (err) {
      console.error("Failed to load patients:", err);

      setError(
        err.response?.data?.message ||
          "Imeshindikana kupata taarifa za wagonjwa."
      );
    } finally {
      setLoadingPatients(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  /*
   * ============================
   * FILTER PATIENTS
   * ============================
   */

  const filteredPatients = useMemo(() => {
    const keyword = patientSearch.toLowerCase().trim();

    if (!keyword) {
      return patients.slice(0, 10);
    }

    return patients
      .filter((patient) => {
        const name = getPatientName(patient).toLowerCase();
        const number = getPatientNumber(patient).toLowerCase();
        const phone = getPatientPhone(patient).toLowerCase();

        return (
          name.includes(keyword) ||
          number.includes(keyword) ||
          phone.includes(keyword)
        );
      })
      .slice(0, 10);
  }, [patients, patientSearch]);

  /*
   * ============================
   * CALCULATE SUBTOTAL
   * ============================
   */

  const subtotal = useMemo(() => {
    return items.reduce(
      (sum, item) =>
        sum +
        Number(item.quantity || 0) *
          Number(item.unitPrice || 0),
      0
    );
  }, [items]);

  const amountPaid = Number(paymentAmount || 0);

  const currentBalance = Math.max(
    Number(invoice?.balanceAmount ?? subtotal) -
      amountPaid,
    0
  );

  const change = Math.max(
    amountPaid -
      Number(invoice?.balanceAmount ?? subtotal),
    0
  );

  /*
   * ============================
   * ADD SERVICE
   * ============================
   */

  const addService = (service) => {
    setError("");
    setSuccessMessage("");

    setItems((current) => {
      const existing = current.find(
        (item) => item.id === service.id
      );

      if (existing) {
        return current.map((item) =>
          item.id === service.id
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
          id: service.id,
          name: service.name,
          quantity: 1,
          unitPrice: service.price,
        },
      ];
    });
  };

  /*
   * ============================
   * INCREASE QUANTITY
   * ============================
   */

  const increaseQuantity = (id) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  /*
   * ============================
   * DECREASE QUANTITY
   * ============================
   */

  const decreaseQuantity = (id) => {
    setItems((current) =>
      current
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: Math.max(
                  0,
                  item.quantity - 1
                ),
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  /*
   * ============================
   * REMOVE ITEM
   * ============================
   */

  const removeItem = (id) => {
    setItems((current) =>
      current.filter((item) => item.id !== id)
    );
  };

  /*
   * ============================
   * CREATE INVOICE
   * ============================
   */

  const handleCreateInvoice = async () => {
    setError("");
    setSuccessMessage("");
    setPaymentId(null);

    if (!selectedPatient?.id) {
      setError(
        "Tafadhali chagua mgonjwa kwanza."
      );
      return;
    }

    if (items.length === 0) {
      setError(
        "Tafadhali ongeza angalau huduma moja kwenye invoice."
      );
      return;
    }

    const invalidItem = items.find(
      (item) =>
        Number(item.quantity) <= 0 ||
        Number(item.unitPrice) < 0
    );

    if (invalidItem) {
      setError(
        "Kuna huduma yenye quantity au bei isiyo sahihi."
      );
      return;
    }

    try {
      setCreatingInvoice(true);

      const invoicePayload = {
        patientId: Number(selectedPatient.id),

        billingType: "CASH",

        items: items.map((item) => ({
          description: item.name,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
        })),

        notes: `Cash billing for ${getPatientName(
          selectedPatient
        )}`,
      };

      const response = await api.post(
        "/invoices",
        invoicePayload
      );

      setInvoice(response.data);

      setPaymentAmount("");
      setPaymentReference("");

      setSuccessMessage(
        `Invoice ${
          response.data.invoiceNumber ||
          `INV-${response.data.id}`
        } imeundwa kwa mafanikio.`
      );
    } catch (err) {
      console.error(
        "Failed to create invoice:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Imeshindikana kutengeneza invoice."
      );
    } finally {
      setCreatingInvoice(false);
    }
  };

  /*
   * ============================
   * RECORD PAYMENT
   * ============================
   */

  const handleRecordPayment = async () => {
    setError("");
    setSuccessMessage("");
    setPaymentId(null);

    if (!invoice?.id) {
      setError(
        "Tafadhali tengeneza invoice kwanza."
      );
      return;
    }

    const outstanding = Number(
      invoice.balanceAmount ??
        invoice.totalAmount ??
        subtotal
    );

    if (amountPaid <= 0) {
      setError(
        "Weka kiasi cha malipo zaidi ya TZS 0."
      );
      return;
    }

    if (amountPaid > outstanding) {
      setError(
        `Malipo hayawezi kuzidi balance ya TZS ${formatCurrency(
          outstanding
        )}.`
      );
      return;
    }

    if (
      (paymentMethod === "MOBILE_MONEY" ||
        paymentMethod === "CARD") &&
      !paymentReference.trim()
    ) {
      setError(
        "Weka payment reference kwa Mobile Money au Card."
      );
      return;
    }

    try {
      setRecordingPayment(true);

      const paymentPayload = {
        invoiceId: Number(invoice.id),

        paymentMethod,

        amount: amountPaid,

        paymentReference:
          paymentReference.trim() || null,

        notes: `Payment for ${
          invoice.invoiceNumber ||
          `INV-${invoice.id}`
        }`,
      };

      const response = await api.post(
        "/payments",
        paymentPayload
      );

      const savedPayment = response.data;

      /*
       * Spring Boot inaweza kurudisha ID
       * kama id, paymentId au payment.id
       */
      const savedPaymentId =
        savedPayment?.id ||
        savedPayment?.paymentId ||
        savedPayment?.payment?.id;

      if (!savedPaymentId) {
        console.error(
          "Payment saved but payment ID was not returned:",
          savedPayment
        );

        setError(
          "Malipo yamehifadhiwa lakini Payment ID haikurudi kutoka server."
        );

        return;
      }

      setPaymentId(savedPaymentId);

      setSuccessMessage(
        `Malipo ya TZS ${formatCurrency(
          amountPaid
        )} yamehifadhiwa kwa mafanikio.`
      );

      setPaymentAmount("");
      setPaymentReference("");

      /*
       * Reload invoice kutoka database
       * ili kuonyesha balance/status halisi
       */
      const invoiceResponse = await api.get(
        `/invoices/${invoice.id}`
      );

      setInvoice(invoiceResponse.data);
    } catch (err) {
      console.error(
        "Failed to record payment:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Imeshindikana kuhifadhi malipo."
      );
    } finally {
      setRecordingPayment(false);
    }
  };

  /*
   * ============================
   * RESET BILLING
   * ============================
   */

  const handleReset = () => {
    setSelectedPatient(null);

    setPatientSearch("");

    setItems([
      {
        id: "consultation",
        name: "Consultation",
        quantity: 1,
        unitPrice: 20000,
      },
    ]);

    setInvoice(null);

    setPaymentAmount("");
    setPaymentReference("");
    setPaymentMethod("CASH");

    setPaymentId(null);

    setSuccessMessage("");
    setError("");
  };

  /*
   * ============================
   * INVOICE VALUES
   * ============================
   */

  const invoiceNumber =
    invoice?.invoiceNumber ||
    (invoice?.id
      ? `INV-${invoice.id}`
      : "-");

  const invoiceTotal = Number(
    invoice?.totalAmount ?? subtotal
  );

  const invoicePaid = Number(
    invoice?.paidAmount ?? 0
  );

  const invoiceBalance = Number(
    invoice?.balanceAmount ??
      Math.max(
        invoiceTotal - invoicePaid,
        0
      )
  );

  /*
   * ============================
   * UI
   * ============================
   */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-cyan-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* HEADER */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <Link
              to="/billing"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-cyan-700"
            >
              <ArrowLeft size={17} />
              Back to Billing
            </Link>

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-600 text-white shadow-lg shadow-cyan-200">
                <CreditCard size={24} />
              </div>

              <div>

                <h1 className="text-2xl font-bold text-slate-900">
                  Cash Billing
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Tengeneza invoice na pokea malipo ya mgonjwa.
                </p>

              </div>

            </div>

          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw size={16} />
            New Billing
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

            <AlertCircle
              size={19}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>

          </div>
        )}

        {/* SUCCESS MESSAGE */}

        {successMessage && (
          <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-2">

              <CheckCircle2 size={19} />

              <span>{successMessage}</span>

            </div>

            {paymentId && (
              <Link
                to={`/billing/receipts/${paymentId}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                <Printer size={17} />
                View / Print Receipt
              </Link>
            )}

          </div>
        )}

        {/* MAIN GRID */}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">

          {/* LEFT SIDE */}

          <div className="space-y-6">

            {/* PATIENT */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-4 flex items-center justify-between">

                <div>

                  <h2 className="flex items-center gap-2 font-bold text-slate-900">

                    <User
                      size={19}
                      className="text-cyan-600"
                    />

                    Patient

                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Chagua mgonjwa kutoka kwenye database.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={fetchPatients}
                  disabled={loadingPatients}
                  className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
                  title="Refresh patients"
                >
                  <RefreshCw
                    size={16}
                    className={
                      loadingPatients
                        ? "animate-spin"
                        : ""
                    }
                  />
                </button>

              </div>

              {selectedPatient ? (

                <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4">

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="font-bold text-slate-900">
                        {getPatientName(
                          selectedPatient
                        )}
                      </p>

                      <p className="mt-1 text-xs font-medium text-cyan-700">
                        {getPatientNumber(
                          selectedPatient
                        )}
                      </p>

                      <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">

                        <Phone size={15} />

                        {getPatientPhone(
                          selectedPatient
                        )}

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPatient(null);
                        setInvoice(null);
                        setPaymentId(null);
                        setSuccessMessage("");
                      }}
                      className="text-xs font-semibold text-cyan-700 hover:text-cyan-900"
                    >
                      Change
                    </button>

                  </div>

                </div>

              ) : (

                <>

                  <div className="relative">

                    <Search
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={patientSearch}
                      onChange={(e) =>
                        setPatientSearch(
                          e.target.value
                        )
                      }
                      placeholder="Search patient name, number or phone..."
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100"
                    />

                  </div>

                  <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-slate-200">

                    {loadingPatients ? (

                      <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-500">

                        <Loader2
                          size={18}
                          className="animate-spin"
                        />

                        Loading patients...

                      </div>

                    ) : filteredPatients.length === 0 ? (

                      <div className="p-8 text-center text-sm text-slate-500">
                        No patients found.
                      </div>

                    ) : (

                      filteredPatients.map(
                        (patient) => (

                          <button
                            type="button"
                            key={patient.id}
                            onClick={() => {
                              setSelectedPatient(
                                patient
                              );

                              setPatientSearch("");

                              setError("");
                            }}
                            className="flex w-full items-center justify-between border-b border-slate-100 p-3 text-left last:border-0 hover:bg-cyan-50"
                          >

                            <div>

                              <p className="font-semibold text-slate-800">
                                {getPatientName(
                                  patient
                                )}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {getPatientNumber(
                                  patient
                                )}{" "}
                                ·{" "}
                                {getPatientPhone(
                                  patient
                                )}
                              </p>

                            </div>

                            <Plus
                              size={17}
                              className="text-cyan-600"
                            />

                          </button>

                        )
                      )

                    )}

                  </div>

                </>

              )}

            </div>

            {/* SERVICES */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-4">

                <h2 className="flex items-center gap-2 font-bold text-slate-900">

                  <FileText
                    size={19}
                    className="text-cyan-600"
                  />

                  Services / Items

                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Ongeza huduma zinazotozwa kwenye invoice.
                </p>

              </div>

              <div className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-4">

                {serviceOptions.map(
                  (service) => (

                    <button
                      type="button"
                      key={service.id}
                      onClick={() =>
                        addService(service)
                      }
                      className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:border-cyan-300 hover:bg-cyan-50"
                    >

                      <p className="text-xs font-semibold text-slate-700">
                        {service.name}
                      </p>

                      <p className="mt-1 text-xs font-bold text-cyan-700">
                        TZS{" "}
                        {formatCurrency(
                          service.price
                        )}
                      </p>

                    </button>

                  )
                )}

              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200">

                <table className="w-full">

                  <thead>

                    <tr className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">

                      <th className="px-3 py-3">
                        Service
                      </th>

                      <th className="px-3 py-3 text-center">
                        Qty
                      </th>

                      <th className="px-3 py-3 text-right">
                        Amount
                      </th>

                      <th className="w-10 px-2 py-3" />

                    </tr>

                  </thead>

                  <tbody>

                    {items.length === 0 ? (

                      <tr>

                        <td
                          colSpan="4"
                          className="p-8 text-center text-sm text-slate-400"
                        >
                          No services added.
                        </td>

                      </tr>

                    ) : (

                      items.map((item) => (

                        <tr
                          key={item.id}
                          className="border-t border-slate-100"
                        >

                          <td className="px-3 py-3">

                            <p className="text-sm font-semibold text-slate-800">
                              {item.name}
                            </p>

                            <p className="text-xs text-slate-400">
                              TZS{" "}
                              {formatCurrency(
                                item.unitPrice
                              )}{" "}
                              each
                            </p>

                          </td>

                          <td className="px-3 py-3">

                            <div className="mx-auto flex w-fit items-center rounded-lg border border-slate-200">

                              <button
                                type="button"
                                onClick={() =>
                                  decreaseQuantity(
                                    item.id
                                  )
                                }
                                className="p-1.5 text-slate-500 hover:bg-slate-50"
                              >
                                <Minus size={14} />
                              </button>

                              <span className="min-w-7 text-center text-sm font-semibold">
                                {item.quantity}
                              </span>

                              <button
                                type="button"
                                onClick={() =>
                                  increaseQuantity(
                                    item.id
                                  )
                                }
                                className="p-1.5 text-slate-500 hover:bg-slate-50"
                              >
                                <Plus size={14} />
                              </button>

                            </div>

                          </td>

                          <td className="px-3 py-3 text-right text-sm font-bold text-slate-800">

                            TZS{" "}

                            {formatCurrency(
                              item.quantity *
                                item.unitPrice
                            )}

                          </td>

                          <td className="px-2 py-3">

                            <button
                              type="button"
                              onClick={() =>
                                removeItem(item.id)
                              }
                              className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                            >
                              <Trash2 size={15} />
                            </button>

                          </td>

                        </tr>

                      ))

                    )}

                  </tbody>

                </table>

              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">

                <span className="font-semibold text-slate-600">
                  Subtotal
                </span>

                <span className="text-lg font-bold text-slate-900">
                  TZS{" "}
                  {formatCurrency(subtotal)}
                </span>

              </div>

              {!invoice && (

                <button
                  type="button"
                  onClick={handleCreateInvoice}
                  disabled={
                    creatingInvoice ||
                    !selectedPatient
                  }
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {creatingInvoice ? (

                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Creating Invoice...
                    </>

                  ) : (

                    <>
                      <FileText size={18} />

                      Create Invoice
                    </>

                  )}

                </button>

              )}

            </div>

          </div>

          {/* RIGHT SIDE */}

          <div className="space-y-6">

            {/* INVOICE & PAYMENT */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                  <CreditCard size={20} />
                </div>

                <div>

                  <h2 className="font-bold text-slate-900">
                    Invoice & Payment
                  </h2>

                  <p className="text-xs text-slate-500">
                    Transaction inayohifadhiwa kwenye database.
                  </p>

                </div>

              </div>

              {!invoice ? (

                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">

                  <FileText
                    size={34}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-3 font-semibold text-slate-600">
                    Invoice bado haijatengenezwa
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Chagua patient na services,
                    kisha bonyeza Create Invoice.
                  </p>

                </div>

              ) : (

                <>

                  {/* INVOICE SUMMARY */}

                  <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-4">

                    <div className="flex items-start justify-between">

                      <div>

                        <p className="text-xs text-slate-500">
                          Invoice
                        </p>

                        <p className="text-lg font-bold text-slate-900">
                          {invoiceNumber}
                        </p>

                      </div>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-cyan-700">
                        {invoice.status ||
                          "UNPAID"}
                      </span>

                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">

                      <div>

                        <p className="text-xs text-slate-500">
                          Patient
                        </p>

                        <p className="font-semibold text-slate-800">
                          {getPatientName(
                            selectedPatient
                          )}
                        </p>

                      </div>

                      <div>

                        <p className="text-xs text-slate-500">
                          Total
                        </p>

                        <p className="font-bold text-slate-900">
                          TZS{" "}
                          {formatCurrency(
                            invoiceTotal
                          )}
                        </p>

                      </div>

                      <div>

                        <p className="text-xs text-slate-500">
                          Paid
                        </p>

                        <p className="font-semibold text-emerald-700">
                          TZS{" "}
                          {formatCurrency(
                            invoicePaid
                          )}
                        </p>

                      </div>

                      <div>

                        <p className="text-xs text-slate-500">
                          Balance
                        </p>

                        <p className="font-bold text-red-600">
                          TZS{" "}
                          {formatCurrency(
                            invoiceBalance
                          )}
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* PAYMENT */}

                  {invoiceBalance > 0 ? (

                    <>

                      {/* PAYMENT METHOD */}

                      <div className="mt-5">

                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Payment Method
                        </label>

                        <div className="grid grid-cols-3 gap-2">

                          {paymentMethods.map(
                            (method) => {

                              const Icon =
                                method.icon;

                              return (

                                <button
                                  type="button"
                                  key={method.value}
                                  onClick={() => {
                                    setPaymentMethod(
                                      method.value
                                    );
                                    setError("");
                                  }}
                                  className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-semibold transition ${
                                    paymentMethod ===
                                    method.value
                                      ? "border-cyan-500 bg-cyan-50 text-cyan-700 shadow-sm"
                                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                  }`}
                                >

                                  <Icon size={18} />

                                  {method.label}

                                </button>

                              );
                            }
                          )}

                        </div>

                      </div>

                      {/* PAYMENT AMOUNT */}

                      <div className="mt-5">

                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                          Payment Amount
                        </label>

                        <input
                          type="number"
                          min="1"
                          max={invoiceBalance}
                          value={paymentAmount}
                          onChange={(e) =>
                            setPaymentAmount(
                              e.target.value
                            )
                          }
                          placeholder={`Max TZS ${formatCurrency(
                            invoiceBalance
                          )}`}
                          disabled={
                            recordingPayment
                          }
                          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 disabled:opacity-60"
                        />

                      </div>

                      {/* PAYMENT REFERENCE */}

                      {(paymentMethod ===
                        "MOBILE_MONEY" ||
                        paymentMethod === "CARD") && (

                        <div className="mt-4">

                          <label className="mb-2 block text-sm font-semibold text-slate-700">
                            Payment Reference
                          </label>

                          <input
                            type="text"
                            value={
                              paymentReference
                            }
                            onChange={(e) =>
                              setPaymentReference(
                                e.target.value
                              )
                            }
                            placeholder="Transaction / reference number"
                            disabled={
                              recordingPayment
                            }
                            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-500 focus:bg-white focus:ring-2 focus:ring-cyan-100 disabled:opacity-60"
                          />

                        </div>

                      )}

                      {/* REMAINING / CHANGE */}

                      {amountPaid > 0 && (

                        <div className="mt-4 grid grid-cols-2 gap-3">

                          <div className="rounded-xl bg-slate-50 p-3">

                            <p className="text-xs text-slate-500">
                              Remaining
                            </p>

                            <p className="mt-1 font-bold text-slate-800">
                              TZS{" "}
                              {formatCurrency(
                                currentBalance
                              )}
                            </p>

                          </div>

                          <div className="rounded-xl bg-emerald-50 p-3">

                            <p className="text-xs text-emerald-600">
                              Change
                            </p>

                            <p className="mt-1 font-bold text-emerald-700">
                              TZS{" "}
                              {formatCurrency(
                                change
                              )}
                            </p>

                          </div>

                        </div>

                      )}

                      {/* RECORD PAYMENT */}

                      <button
                        type="button"
                        onClick={
                          handleRecordPayment
                        }
                        disabled={
                          recordingPayment
                        }
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >

                        {recordingPayment ? (

                          <>
                            <Loader2
                              size={18}
                              className="animate-spin"
                            />

                            Processing Payment...
                          </>

                        ) : (

                          <>
                            <CheckCircle2 size={18} />

                            Record Payment
                          </>

                        )}

                      </button>

                    </>

                  ) : (

                    <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center">

                      <CheckCircle2
                        size={30}
                        className="mx-auto text-emerald-600"
                      />

                      <p className="mt-2 font-bold text-emerald-700">
                        Invoice Paid
                      </p>

                    </div>

                  )}

                </>

              )}

            </div>

            {/* PAYMENT RECORDED */}

            {paymentId && (

              <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm">

                <div className="flex items-start gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={21} />
                  </div>

                  <div className="flex-1">

                    <h3 className="font-bold text-slate-900">
                      Payment Recorded
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      Payment ID: #{paymentId}
                    </p>

                    {/* IMPORTANT:
                        Link instead of button+navigate.
                        This matches AppRoutes:
                        /billing/receipts/:paymentId
                    */}

                    <Link
                      to={`/billing/receipts/${paymentId}`}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                    >
                      <Printer size={17} />

                      View / Print Receipt
                    </Link>

                  </div>

                </div>

              </div>

            )}

          </div>

        </div>

      </div>
    </div>
  );
}