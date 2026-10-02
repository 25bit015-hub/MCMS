import { useEffect, useMemo, useState } from "react";

import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CalendarClock,
  CheckCircle2,
  ClipboardEdit,
  ClipboardList,
  Clock3,
  Package,
  PackagePlus,
  Pill,
  RefreshCw,
  ShoppingCart,
  TrendingDown,
  Users,
  Loader2,
  WalletCards,
  XCircle,
} from "lucide-react";

import { Link } from "react-router-dom";
import api from "../../services/api";

/*
 * =========================================================
 * API
 * =========================================================
 */


/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

function formatMoney(value) {
  const amount = Number(value || 0);

  return `TZS ${amount.toLocaleString("en-TZ")}`;
}

function formatTime(value) {
  if (!value) return "--";

  try {
    return new Date(value).toLocaleTimeString("en-TZ", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "--";
  }
}

function formatDate(value) {
  if (!value) return "--";

  try {
    return new Date(value).toLocaleDateString("en-TZ", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "--";
  }
}

function getPatientName(item) {
  const firstName = item?.firstName || "";
  const middleName = item?.middleName || "";
  const lastName = item?.lastName || "";

  return (
    `${firstName} ${middleName} ${lastName}`
      .replace(/\s+/g, " ")
      .trim() || "Unknown Patient"
  );
}

function getPrescriptionItems(prescription) {
  if (Array.isArray(prescription?.items)) {
    return prescription.items;
  }

  if (Array.isArray(prescription?.prescriptionItems)) {
    return prescription.prescriptionItems;
  }

  return [];
}

function getPrescriptionMedicineText(prescription) {
  const items = getPrescriptionItems(prescription);

  if (items.length === 0) {
    return prescription?.notes || "Prescription";
  }

  if (items.length === 1) {
    const item = items[0];

    return (
      `${item?.medicineName || "Medicine"}${
        item?.strength ? ` ${item.strength}` : ""
      }`
    );
  }

  return `${items[0]?.medicineName || "Medicine"} + ${
    items.length - 1
  } more`;
}

function getPrescriptionQuantity(prescription) {
  const items = getPrescriptionItems(prescription);

  if (items.length === 0) {
    return "--";
  }

  const total = items.reduce(
    (sum, item) => sum + Number(item?.quantity || 0),
    0
  );

  return `${total} units`;
}

function getMedicineQuantity(medicine) {
  return Number(
    medicine?.quantity ??
      medicine?.stock ??
      medicine?.availableStock ??
      0
  );
}

function getMedicineMinimum(medicine) {
  return Number(medicine?.minimumStock ?? 0);
}

function getBatchMedicineName(batch) {
  return (
    batch?.medicine?.name ||
    batch?.medicineName ||
    "Medicine"
  );
}

function getBatchQuantity(batch) {
  return Number(batch?.quantity || 0);
}

/*
 * =========================================================
 * QUICK ACTIONS
 * =========================================================
 */

const quickActions = [
  {
    title: "Add Medicine",
    description: "Register a new medicine",
    icon: Pill,
    path: "/pharmacy/medicines/add",
    className:
      "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
  },
  {
    title: "Receive Stock",
    description: "Add received stock",
    icon: PackagePlus,
    path: "/pharmacy/stock-in",
    className:
      "from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800",
  },
  {
    title: "Stock Adjustment",
    description: "Correct damaged, lost or expired stock",
    icon: ClipboardEdit,
    path: "/pharmacy/stock-adjustment",
    className:
      "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
  },
  {
    title: "Prescriptions",
    description: "View pending prescriptions",
    icon: ShoppingCart,
    path: "/pharmacy/prescriptions",
    className:
      "from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800",
  },
  {
    title: "Dispensing History",
    description: "View daily and monthly dispensing records",
    icon: ClipboardList,
    path: "/pharmacy/dispensing-history",
    className:
      "from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800",
  },
];

/*
 * =========================================================
 * DASHBOARD
 * =========================================================
 */

export default function PharmacyDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [medicines, setMedicines] = useState([]);
  const [pendingPrescriptions, setPendingPrescriptions] =
    useState([]);
  const [dispensings, setDispensings] = useState([]);
  const [pharmacyQueue, setPharmacyQueue] = useState([]);
  const [expiringBatches, setExpiringBatches] = useState([]);

  /*
   * =========================================================
   * TODAY
   * =========================================================
   */

  const today = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  /*
   * =========================================================
   * LOAD DASHBOARD
   * =========================================================
   */

  const loadDashboard = async () => {
    try {
      setError("");

      const [
        medicinesResponse,
        prescriptionsResponse,
        dispensingsResponse,
        queueResponse,
        expiryResponse,
      ] = await Promise.allSettled([
        api.get("/medicines"),

api.get("/prescriptions/status/PENDING"),

api.get("/dispensings"),

api.get(
  `/patient-queue/date?date=${today}`
),

api.get(
  "/medicine-batches/expiring-soon?days=30"
),
      ]);

      /*
       * =====================================================
       * MEDICINES
       * =====================================================
       */

      if (
        medicinesResponse.status === "fulfilled" &&
        Array.isArray(medicinesResponse.value?.data)
      ) {
        setMedicines(
          medicinesResponse.value.data
        );
      } else {
        setMedicines([]);
      }

      /*
       * =====================================================
       * PENDING PRESCRIPTIONS
       * =====================================================
       */

      if (
        prescriptionsResponse.status === "fulfilled" &&
        Array.isArray(
          prescriptionsResponse.value?.data
        )
      ) {
        setPendingPrescriptions(
          prescriptionsResponse.value.data
        );
      } else {
        setPendingPrescriptions([]);
      }

      /*
       * =====================================================
       * DISPENSINGS
       * =====================================================
       */

      if (
        dispensingsResponse.status === "fulfilled" &&
        Array.isArray(
          dispensingsResponse.value?.data
        )
      ) {
        setDispensings(
          dispensingsResponse.value.data
        );
      } else {
        setDispensings([]);
      }

      /*
       * =====================================================
       * PHARMACY QUEUE
       * =====================================================
       */

      if (
        queueResponse.status === "fulfilled" &&
        Array.isArray(
          queueResponse.value?.data
        )
      ) {
        const pharmacyPatients =
          queueResponse.value.data.filter(
            (item) =>
              item?.service === "PHARMACY" &&
              item?.status === "PHARMACY_PENDING"
          );

        setPharmacyQueue(
          pharmacyPatients
        );
      } else {
        setPharmacyQueue([]);
      }

      /*
       * =====================================================
       * EXPIRING BATCHES
       * =====================================================
       */

      if (
        expiryResponse.status === "fulfilled" &&
        Array.isArray(
          expiryResponse.value?.data
        )
      ) {
        setExpiringBatches(
          expiryResponse.value.data
        );
      } else {
        setExpiringBatches([]);
      }

      /*
       * =====================================================
       * ERROR CHECK
       * =====================================================
       */

      const failedRequests = [
        medicinesResponse,
        prescriptionsResponse,
        dispensingsResponse,
        queueResponse,
        expiryResponse,
      ].filter(
        (result) =>
          result.status === "rejected"
      );

      if (failedRequests.length === 5) {
        setError(
          "Imeshindikana kuwasiliana na Pharmacy backend."
        );
      }
    } catch (err) {
      console.error(
        "Pharmacy dashboard error:",
        err
      );

      setError(
        "Imeshindikana kupakia taarifa za Pharmacy."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /*
   * =========================================================
   * INITIAL LOAD
   * =========================================================
   */

  useEffect(() => {
    loadDashboard();
  }, []);

  /*
   * =========================================================
   * REFRESH
   * =========================================================
   */

  const handleRefresh = async () => {
    setRefreshing(true);

    await loadDashboard();
  };

  /*
   * =========================================================
   * STATISTICS
   * =========================================================
   */

  const totalMedicines =
    medicines.length;

  const activeMedicines =
    medicines.filter(
      (medicine) =>
        medicine?.status === "ACTIVE" ||
        medicine?.status == null
    ).length;

  const lowStockMedicines =
    medicines.filter((medicine) => {
      const quantity =
        getMedicineQuantity(medicine);

      const minimum =
        getMedicineMinimum(medicine);

      return (
        minimum > 0 &&
        quantity <= minimum
      );
    });

  const outOfStockMedicines =
    medicines.filter((medicine) => {
      const quantity =
        getMedicineQuantity(medicine);

      return quantity <= 0;
    });

  /*
   * =========================================================
   * RECENT PRESCRIPTIONS
   * =========================================================
   */

  const recentPrescriptions =
    pendingPrescriptions
      .slice()
      .sort((a, b) => {
        const dateA =
          new Date(
            a?.createdAt || 0
          ).getTime();

        const dateB =
          new Date(
            b?.createdAt || 0
          ).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);

  /*
   * =========================================================
   * RECENT DISPENSING
   * =========================================================
   */

  const recentDispensing =
    dispensings
      .slice()
      .sort((a, b) => {
        const dateA =
          new Date(
            a?.dispensedAt ||
              a?.createdAt ||
              0
          ).getTime();

        const dateB =
          new Date(
            b?.dispensedAt ||
              b?.createdAt ||
              0
          ).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);

  /*
   * =========================================================
   * TODAY DISPENSING
   * =========================================================
   */

  const todayDispensing =
    dispensings.filter((item) => {
      const date =
        item?.dispensedAt ||
        item?.createdAt;

      if (!date) return false;

      return String(date).startsWith(today);
    });

  /*
   * =========================================================
   * PAYMENT SUMMARY
   * =========================================================
   */

  const cashTotal =
    todayDispensing
      .filter(
        (item) =>
          item?.paymentType === "CASH"
      )
      .reduce(
        (sum, item) =>
          sum +
          Number(
            item?.totalAmount || 0
          ),
        0
      );

  const insuranceTotal =
    todayDispensing
      .filter(
        (item) =>
          item?.paymentType ===
          "INSURANCE"
      )
      .reduce(
        (sum, item) =>
          sum +
          Number(
            item?.totalAmount || 0
          ),
        0
      );

  const totalPayments =
    todayDispensing.reduce(
      (sum, item) =>
        sum +
        Number(
          item?.totalAmount || 0
        ),
      0
    );

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center bg-slate-50">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl px-8 py-7 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Loader2
              size={25}
              className="animate-spin text-blue-600"
            />
          </div>

          <div>
            <p className="font-bold text-slate-900">
              Inapakia Pharmacy Dashboard...
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Tafadhali subiri kidogo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
   * =========================================================
   * UI
   * =========================================================
   */

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">

      <div className="max-w-7xl mx-auto space-y-6">

        {/* ===================================================
            HEADER
        =================================================== */}

        <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-700 p-6 md:p-8 shadow-xl">

          <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-white/10 blur-3xl" />

          <div className="absolute -bottom-32 -left-20 w-80 h-80 rounded-full bg-cyan-300/10 blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7">

            <div>

              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-1.5 text-xs font-bold text-blue-100">
                <Pill size={14} />
                PHARMACY MANAGEMENT
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-4">
                Pharmacy Dashboard
              </h1>

              <p className="text-blue-100 mt-2 max-w-2xl text-sm md:text-base">
                Simamia medicines, prescriptions,
                pharmacy queue, stock na dispensing
                kwa sehemu moja.
              </p>

              <div className="flex flex-wrap gap-2 mt-5">

                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-2 text-xs font-semibold text-white">
                  <Users size={14} />
                  {pharmacyQueue.length} Pharmacy Queue
                </span>

                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-2 text-xs font-semibold text-white">
                  <ShoppingCart size={14} />
                  {pendingPrescriptions.length} Pending Rx
                </span>

                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 px-3 py-2 text-xs font-semibold text-white">
                  <CalendarClock size={14} />
                  {expiringBatches.length} Expiring Soon
                </span>

              </div>

            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-lg transition hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing..."
                : "Refresh Dashboard"}
            </button>

          </div>
        </section>

        {/* ===================================================
            ERROR
        =================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} />
            </div>

            <div>
              <p className="font-bold">
                Pharmacy Backend
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>

          </div>
        )}

        {/* ===================================================
            STAT CARDS
        =================================================== */}

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

          <StatCard
            title="Total Medicines"
            value={totalMedicines}
            subtitle={`${activeMedicines} active medicines`}
            icon={Pill}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            accent="border-blue-100"
          />

          <StatCard
            title="Pharmacy Queue"
            value={pharmacyQueue.length}
            subtitle="Patients waiting"
            icon={Users}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            accent="border-purple-100"
          />

          <StatCard
            title="Pending Prescriptions"
            value={pendingPrescriptions.length}
            subtitle="Waiting for dispensing"
            icon={ShoppingCart}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            accent="border-amber-100"
          />

          <StatCard
            title="Out of Stock"
            value={outOfStockMedicines.length}
            subtitle="Currently unavailable"
            icon={XCircle}
            iconBg="bg-red-50"
            iconColor="text-red-600"
            accent="border-red-100"
          />

        </section>

        {/* ===================================================
            PHARMACY QUEUE
        =================================================== */}

        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="bg-gradient-to-r from-purple-50 to-white border-b border-purple-100 p-5 md:p-6">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div className="flex items-center gap-3">

                <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center">
                  <Users
                    size={21}
                    className="text-purple-600"
                  />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Pharmacy Queue
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Wagonjwa waliotumwa Pharmacy na Doctor
                  </p>
                </div>

              </div>

              <Link
                to="/pharmacy/prescriptions"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-purple-700 transition"
              >
                Open Prescriptions
                <ArrowRight size={14} />
              </Link>

            </div>

          </div>

          {pharmacyQueue.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Hakuna wagonjwa wanaosubiri"
              description="Pharmacy Queue iko wazi kwa sasa."
            />
          ) : (
            <div className="divide-y divide-slate-100">

              {pharmacyQueue
                .slice(0, 5)
                .map((patient) => (

                  <div
                    key={patient.id}
                    className="px-5 md:px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-slate-50 transition"
                  >

                    <div className="flex items-center gap-4">

                      <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                        {(patient.firstName || "P")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>

                        <p className="font-bold text-slate-900">
                          {getPatientName(patient)}
                        </p>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">

                          <span>
                            Patient:{" "}
                            {patient.patientNumber || "--"}
                          </span>

                          <span>
                            Visit:{" "}
                            {patient.visitNumber || "--"}
                          </span>

                          <span className="inline-flex items-center gap-1">
                            <Clock3 size={12} />
                            {formatTime(
                              patient.checkInTime
                            )}
                          </span>

                        </div>

                      </div>

                    </div>

                    <span className="self-start md:self-auto rounded-full bg-purple-100 px-3 py-1.5 text-[11px] font-bold text-purple-700">
                      PHARMACY PENDING
                    </span>

                  </div>

                ))}

            </div>
          )}

        </section>

        {/* ===================================================
            ALERT SECTION
        =================================================== */}

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {/* LOW STOCK */}

          <div className="bg-white rounded-3xl border border-amber-200 shadow-sm overflow-hidden">

            <div className="p-5 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-white flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-2xl bg-amber-100 flex items-center justify-center">
                  <TrendingDown
                    size={20}
                    className="text-amber-600"
                  />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Low Stock Alert
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Dawa zilizo chini ya minimum stock
                  </p>
                </div>

              </div>

              <Link
                to="/pharmacy/medicines"
                className="text-xs font-bold text-amber-700 hover:text-amber-800"
              >
                View All
              </Link>

            </div>

            {lowStockMedicines.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="Stock iko vizuri"
                description="Hakuna dawa iliyo chini ya minimum stock."
              />
            ) : (
              <div className="divide-y divide-slate-100">

                {lowStockMedicines
                  .slice(0, 5)
                  .map((medicine) => {

                    const stock =
                      getMedicineQuantity(
                        medicine
                      );

                    const minimum =
                      getMedicineMinimum(
                        medicine
                      );

                    const percentage =
                      minimum > 0
                        ? (stock / minimum) * 100
                        : 0;

                    return (
                      <div
                        key={
                          medicine.id ||
                          medicine.medicineCode ||
                          medicine.name
                        }
                        className="px-5 py-4"
                      >

                        <div className="flex items-center justify-between gap-4">

                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              {medicine.name}
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                              Minimum: {minimum} units
                            </p>
                          </div>

                          <span className="text-sm font-bold text-red-600">
                            {stock}
                          </span>

                        </div>

                        <div className="mt-3 h-2 rounded-full bg-slate-100 overflow-hidden">

                          <div
                            className="h-full rounded-full bg-red-500 transition-all"
                            style={{
                              width: `${Math.min(
                                Math.max(
                                  percentage,
                                  0
                                ),
                                100
                              )}%`,
                            }}
                          />

                        </div>

                      </div>
                    );
                  })}

              </div>
            )}

          </div>

          {/* EXPIRING SOON */}

          <div className="bg-white rounded-3xl border border-red-200 shadow-sm overflow-hidden">

            <div className="p-5 border-b border-red-100 bg-gradient-to-r from-red-50 to-white flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-2xl bg-red-100 flex items-center justify-center">
                  <CalendarClock
                    size={20}
                    className="text-red-600"
                  />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Expiring Soon
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Batches zinazo-expire ndani ya siku 30
                  </p>
                </div>

              </div>

              <Link
                to="/pharmacy/expiry-management"
                className="text-xs font-bold text-red-700 hover:text-red-800"
              >
                View All
              </Link>

            </div>

            {expiringBatches.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="Hakuna batch inayokaribia expiry"
                description="Stock yako haina batch inayotarajiwa ku-expire ndani ya siku 30."
              />
            ) : (
              <div className="divide-y divide-slate-100">

                {expiringBatches
                  .slice(0, 5)
                  .map((batch) => {

                    const expiryDate =
                      batch?.expiryDate;

                    const expired =
                      expiryDate &&
                      new Date(expiryDate) <
                        new Date();

                    return (
                      <div
                        key={batch.id}
                        className="px-5 py-4 flex items-center justify-between gap-4"
                      >

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                            <Package
                              size={18}
                              className="text-red-600"
                            />
                          </div>

                          <div>

                            <p className="text-sm font-bold text-slate-800">
                              {getBatchMedicineName(
                                batch
                              )}
                            </p>

                            <p className="text-xs text-slate-500 mt-1">
                              Batch:{" "}
                              {batch.batchNumber ||
                                batch.id}
                            </p>

                          </div>

                        </div>

                        <div className="text-right">

                          <p
                            className={`text-sm font-bold ${
                              expired
                                ? "text-red-600"
                                : "text-orange-600"
                            }`}
                          >
                            {formatDate(
                              expiryDate
                            )}
                          </p>

                          <p className="text-xs text-slate-400 mt-1">
                            Stock:{" "}
                            {getBatchQuantity(
                              batch
                            )}
                          </p>

                        </div>

                      </div>
                    );
                  })}

              </div>
            )}

          </div>

        </section>

        {/* ===================================================
            STOCK OVERVIEW
        =================================================== */}

        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="p-5 md:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Boxes
                  size={20}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Medicine Stock Overview
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Muhtasari wa hali ya medicine inventory
                </p>
              </div>

            </div>

            <Link
              to="/pharmacy/medicines"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              View Medicines
              <ArrowRight size={14} />
            </Link>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 md:p-6">

            <MiniStat
              label="Registered"
              value={totalMedicines}
              icon={Pill}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
            />

            <MiniStat
              label="Active"
              value={activeMedicines}
              icon={CheckCircle2}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
            />

            <MiniStat
              label="Low Stock"
              value={lowStockMedicines.length}
              icon={TrendingDown}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
            />

            <MiniStat
              label="Out of Stock"
              value={outOfStockMedicines.length}
              icon={XCircle}
              iconBg="bg-red-50"
              iconColor="text-red-600"
            />

          </div>

        </section>

        {/* ===================================================
            QUICK ACTIONS
        =================================================== */}

        <section>

          <div className="mb-4">

            <h2 className="text-xl font-bold text-slate-900">
              Quick Actions
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Common pharmacy operations
            </p>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

            {quickActions.map((action) => {

              const Icon = action.icon;

              return (
                <Link
                  key={action.title}
                  to={action.path}
                  className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${action.className} p-5 text-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:shadow-xl`}
                >

                  <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-white/10" />

                  <div className="relative z-10">

                    <div className="flex items-center justify-between">

                      <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/10 flex items-center justify-center">
                        <Icon size={21} />
                      </div>

                      <ArrowRight
                        size={19}
                        className="transition-transform group-hover:translate-x-1"
                      />

                    </div>

                    <h3 className="mt-5 font-bold text-base">
                      {action.title}
                    </h3>

                    <p className="mt-1 text-sm text-white/75">
                      {action.description}
                    </p>

                  </div>

                </Link>
              );
            })}

          </div>

        </section>

        {/* ===================================================
            PRESCRIPTIONS + DISPENSING
        =================================================== */}

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {/* PENDING PRESCRIPTIONS */}

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="p-5 md:p-6 border-b border-slate-200 flex items-center justify-between">

              <div>

                <h2 className="text-lg font-bold text-slate-900">
                  Pending Prescriptions
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Prescriptions zinazosubiri dispensing
                </p>

              </div>

              <Link
                to="/pharmacy/prescriptions"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                View All
                <ArrowRight size={14} />
              </Link>

            </div>

            {recentPrescriptions.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="No pending prescriptions"
                description="Hakuna prescription inayosubiri dispensing."
              />
            ) : (
              <div className="divide-y divide-slate-100">

                {recentPrescriptions.map(
                  (prescription) => (

                    <div
                      key={prescription.id}
                      className="px-5 md:px-6 py-4 hover:bg-slate-50 transition"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div className="flex min-w-0 items-start gap-3">

                          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                            <Pill
                              size={18}
                              className="text-purple-600"
                            />
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-bold text-slate-800">
                              {getPatientName(
                                prescription.patient ||
                                  prescription
                              )}
                            </p>

                            <p className="truncate text-xs text-slate-500 mt-1">
                              {getPrescriptionMedicineText(
                                prescription
                              )}
                            </p>

                            <p className="text-xs text-slate-400 mt-1">
                              {getPrescriptionQuantity(
                                prescription
                              )}
                            </p>

                          </div>

                        </div>

                        <div className="text-right shrink-0">

                          <p className="text-[11px] font-bold text-slate-400">
                            RX-
                            {String(
                              prescription.id ||
                                "--"
                            ).padStart(5, "0")}
                          </p>

                          <p className="flex items-center justify-end gap-1 text-xs text-slate-400 mt-2">
                            <Clock3 size={12} />
                            {formatTime(
                              prescription.createdAt
                            )}
                          </p>

                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </div>

          {/* RECENT DISPENSING */}

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

            <div className="p-5 md:p-6 border-b border-slate-200 flex items-center justify-between">

              <div>

                <h2 className="text-lg font-bold text-slate-900">
                  Recent Dispensing
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Dawa zilizotolewa hivi karibuni
                </p>

              </div>

              <Link
                to="/pharmacy/dispensing-history"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                View History
                <ArrowRight size={14} />
              </Link>

            </div>

            {recentDispensing.length === 0 ? (
              <EmptyState
                icon={Clock3}
                title="No dispensing yet"
                description="Hakuna dispensing records zilizopo."
              />
            ) : (
              <div className="divide-y divide-slate-100">

                {recentDispensing.map(
                  (item, index) => (

                    <div
                      key={
                        item.id ||
                        `${item.patientId}-${index}`
                      }
                      className="px-5 md:px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition"
                    >

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                          <CheckCircle2
                            size={18}
                            className="text-emerald-600"
                          />
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-bold text-slate-800">
                            {getPatientName(
                              item.patient ||
                                item
                            )}
                          </p>

                          <p className="truncate text-xs text-slate-500 mt-1">
                            {item.prescriptionId
                              ? `Prescription #${item.prescriptionId}`
                              : "Dispensing completed"}
                          </p>

                        </div>

                      </div>

                      <div className="text-right shrink-0">

                        <p className="text-sm font-bold text-slate-800">
                          {formatMoney(
                            item.totalAmount
                          )}
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          {formatTime(
                            item.dispensedAt ||
                              item.createdAt
                          )}
                        </p>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </div>

        </section>

        {/* ===================================================
            PAYMENT SUMMARY
        =================================================== */}

        <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-7 shadow-xl">

          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-7">

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                <WalletCards
                  size={26}
                  className="text-blue-300"
                />
              </div>

              <div>

                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">
                  Today&apos;s Pharmacy
                </p>

                <h2 className="text-xl font-bold text-white mt-1">
                  Payment Summary
                </h2>

                <p className="text-sm text-slate-400 mt-1">
                  Based on completed dispensing records
                </p>

              </div>

            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">

              <DarkPaymentValue
                label="Cash"
                value={formatMoney(cashTotal)}
              />

              <DarkPaymentValue
                label="Insurance"
                value={formatMoney(
                  insuranceTotal
                )}
              />

              <DarkPaymentValue
                label="Transactions"
                value={todayDispensing.length}
              />

              <DarkPaymentValue
                label="Total"
                value={formatMoney(
                  totalPayments
                )}
                highlight
              />

            </div>

            <Link
              to="/billing"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-xs font-bold text-white hover:bg-white/15 transition"
            >
              View Payments
              <ArrowRight size={14} />
            </Link>

          </div>

        </section>

      </div>
    </div>
  );
}

/*
 * =========================================================
 * STAT CARD
 * =========================================================
 */

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  accent,
}) {
  return (
    <div
      className={`rounded-3xl border ${accent} bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
    >

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {subtitle}
          </p>

        </div>

        <div
          className={`w-11 h-11 rounded-2xl ${iconBg} flex items-center justify-center`}
        >
          <Icon
            size={21}
            className={iconColor}
          />
        </div>

      </div>

    </div>
  );
}

/*
 * =========================================================
 * MINI STAT
 * =========================================================
 */

function MiniStat({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">

      <div className="flex items-center justify-between">

        <p className="text-xs font-semibold text-slate-500">
          {label}
        </p>

        <div
          className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center`}
        >
          <Icon
            size={15}
            className={iconColor}
          />
        </div>

      </div>

      <p className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </p>

    </div>
  );
}

/*
 * =========================================================
 * DARK PAYMENT VALUE
 * =========================================================
 */

function DarkPaymentValue({
  label,
  value,
  highlight = false,
}) {
  return (
    <div>

      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-lg font-bold ${
          highlight
            ? "text-blue-300"
            : "text-white"
        }`}
      >
        {value}
      </p>

    </div>
  );
}

/*
 * =========================================================
 * EMPTY STATE
 * =========================================================
 */

function EmptyState({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-10">

      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
        <Icon
          size={22}
          className="text-slate-400"
        />
      </div>

      <p className="mt-3 text-sm font-bold text-slate-700">
        {title}
      </p>

      <p className="mt-1 max-w-sm text-xs text-slate-400">
        {description}
      </p>

    </div>
  );
}