import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Pill,
  Package,
  Calendar,
  User,
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShoppingCart,
  Phone,
  CreditCard,
  ClipboardList,
  Boxes,
} from "lucide-react";

import {
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";

import api from "../../services/api";

// =========================================================
// HELPERS
// =========================================================

function getPatientName(patient) {
  if (!patient) return "Unknown Patient";

  return [
    patient.firstName,
    patient.middleName,
    patient.lastName,
  ]
    .filter(Boolean)
    .join(" ");
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getAge(dateOfBirth) {
  if (!dateOfBirth) return "-";

  const dob = new Date(dateOfBirth);

  if (Number.isNaN(dob.getTime())) {
    return "-";
  }

  const today = new Date();

  let age =
    today.getFullYear() -
    dob.getFullYear();

  const monthDifference =
    today.getMonth() -
    dob.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      today.getDate() < dob.getDate())
  ) {
    age--;
  }

  return age;
}

// =========================================================
// PRESCRIPTION HELPERS
// =========================================================

function getPrescriptionItems(prescription) {
  if (!prescription) return [];

  if (Array.isArray(prescription.items)) {
    return prescription.items;
  }

  if (
    Array.isArray(
      prescription.prescriptionItems
    )
  ) {
    return prescription.prescriptionItems;
  }

  return [];
}

function getMedicineName(item) {
  return (
    item?.medicineName ||
    item?.medicine?.name ||
    item?.medicine?.medicineName ||
    "-"
  );
}

function getMedicineStrength(item) {
  return (
    item?.strength ||
    item?.medicine?.strength ||
    "-"
  );
}

function getMedicineId(item) {
  return (
    item?.medicineId ??
    item?.medicine?.id ??
    item?.medicine?.medicineId ??
    null
  );
}

// =========================================================
// BATCH HELPERS
// =========================================================

function getBatchMedicineName(batch) {
  return (
    batch?.medicine?.name ||
    batch?.medicine?.medicineName ||
    batch?.medicineName ||
    ""
  );
}

function getBatchMedicineId(batch) {
  return (
    batch?.medicineId ??
    batch?.medicine?.id ??
    batch?.medicine?.medicineId ??
    null
  );
}

function getBatchStrength(batch) {
  return (
    batch?.medicine?.strength ||
    batch?.strength ||
    ""
  );
}

function getBatchQuantity(batch) {
  return Number(
    batch?.quantity ??
      batch?.availableQuantity ??
      batch?.stockQuantity ??
      batch?.remainingQuantity ??
      0
  );
}

// =========================================================
// MEDICINE NAME NORMALIZATION
// =========================================================

function normalizeMedicineName(value) {
  if (!value) return "";

  return String(value)
    .toLowerCase()
    .trim()
    .replace(
      /^(tab|tablet|tabs|tablets|cap|caps|capsule|capsules)\s+/i,
      ""
    )
    .replace(/\s+/g, " ");
}

// =========================================================
// STRENGTH NORMALIZATION
// =========================================================

function normalizeStrength(value) {
  if (!value) return "";

  return String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "")
    .replace(/milligrams?/g, "mg")
    .replace(/milligrammes?/g, "mg")
    .replace(/grams?/g, "g")
    .replace(/grammes?/g, "g")
    .replace(/micrograms?/g, "mcg")
    .replace(/microgrammes?/g, "mcg");
}

// =========================================================
// MEDICINE MATCHING
// =========================================================

function medicineNamesMatch(
  firstName,
  secondName
) {
  const first =
    normalizeMedicineName(firstName);

  const second =
    normalizeMedicineName(secondName);

  if (!first || !second) {
    return false;
  }

  return first === second;
}

// =========================================================
// STRENGTH MATCHING
// =========================================================

function medicineStrengthsMatch(
  firstStrength,
  secondStrength
) {
  const first =
    normalizeStrength(firstStrength);

  const second =
    normalizeStrength(secondStrength);

  if (!first || !second) {
    return true;
  }

  if (
    first === "-" ||
    second === "-"
  ) {
    return true;
  }

  return first === second;
}

// =========================================================
// MEDICINE/BATCH MATCH
// =========================================================
//
// Priority:
//
// 1. Medicine ID
// 2. Medicine name + strength
// 3. Medicine name only
//
// Hii inasaidia hata kama backend inarudisha
// medicine object tofauti kidogo.
// =========================================================

function medicineBatchMatches(item, batch) {
  const prescriptionMedicineId = getMedicineId(item);
  const batchMedicineId = getBatchMedicineId(batch);

  // =====================================================
  // 1. MATCH BY MEDICINE ID
  // =====================================================

  if (
    prescriptionMedicineId !== null &&
    prescriptionMedicineId !== undefined &&
    batchMedicineId !== null &&
    batchMedicineId !== undefined
  ) {
    return (
      Number(prescriptionMedicineId) ===
      Number(batchMedicineId)
    );
  }

  // =====================================================
  // 2. FALLBACK TO MEDICINE NAME
  // =====================================================

  const itemName = getMedicineName(item);
  const batchName = getBatchMedicineName(batch);

  return medicineNamesMatch(
    batchName,
    itemName
  );
}
// =========================================================
// EXPIRY CHECK
// =========================================================

function isBatchExpired(batch) {
  if (!batch?.expiryDate) {
    return false;
  }

  const expiry = new Date(
    batch.expiryDate
  );

  if (Number.isNaN(expiry.getTime())) {
    return false;
  }

  expiry.setHours(
    23,
    59,
    59,
    999
  );

  const now = new Date();

  return expiry < now;
}

// =========================================================
// COMPONENT
// =========================================================

export default function PharmacyPatient() {
  const { id } = useParams();

  const [searchParams] =
    useSearchParams();

  const visitId =
    searchParams.get("visitId");

  const numericPatientId =
    Number(id);

  const numericVisitId =
    Number(visitId);

  const [patient, setPatient] =
    useState(null);

  const [prescriptions, setPrescriptions] =
    useState([]);

  const [batches, setBatches] =
    useState([]);

  const [queue, setQueue] =
    useState(null);

  const [
    dispensingItems,
    setDispensingItems,
  ] = useState({});

  const [loading, setLoading] =
    useState(true);

  const [dispensing, setDispensing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    loadPatient();
  }, [id, visitId]);

  async function loadPatient() {
    if (
      !Number.isInteger(
        numericPatientId
      ) ||
      numericPatientId <= 0
    ) {
      setError(
        "Patient ID si sahihi."
      );

      setLoading(false);
      return;
    }

    if (
      !Number.isInteger(
        numericVisitId
      ) ||
      numericVisitId <= 0
    ) {
      setError(
        "Visit ID haipo au si sahihi."
      );

      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const today =
        new Date()
          .toISOString()
          .split("T")[0];

      // =====================================================
      // LOAD MAIN DATA
      // =====================================================

      const [
        patientResponse,
        prescriptionResponse,
        batchResponse,
        queueResponse,
      ] = await Promise.all([
        api.get(
          `/patients/${numericPatientId}`
        ),

        api.get(
          `/prescriptions/visit/${numericVisitId}`
        ),

        api.get(
          `/medicine-batches/available`
        ),

        api.get(
          `/patient-queue/date?date=${today}`
        ),
      ]);

      const loadedPatient =
        patientResponse.data;

      let loadedPrescriptions =
        Array.isArray(
          prescriptionResponse.data
        )
          ? prescriptionResponse.data
          : [];

      const loadedBatches =
        Array.isArray(
          batchResponse.data
        )
          ? batchResponse.data
          : [];

      const loadedQueue =
        Array.isArray(
          queueResponse.data
        )
          ? queueResponse.data.find(
              (item) =>
                Number(
                  item.patientId
                ) ===
                  numericPatientId &&
                Number(
                  item.visitId
                ) ===
                  numericVisitId
            )
          : null;

      console.log(
        "PHARMACY PATIENT:",
        loadedPatient
      );

      console.log(
        "PHARMACY PRESCRIPTIONS:",
        loadedPrescriptions
      );

      console.log(
        "PHARMACY BATCHES:",
        loadedBatches
      );

      // =====================================================
      // LOAD PRESCRIPTION ITEMS
      // =====================================================

      loadedPrescriptions =
        await Promise.all(
          loadedPrescriptions.map(
            async (prescription) => {
              const existingItems =
                getPrescriptionItems(
                  prescription
                );

              if (
                existingItems.length > 0
              ) {
                return prescription;
              }

              try {
                const itemResponse =
                  await api.get(
                    `/prescriptions/${prescription.id}/items`
                  );

                return {
                  ...prescription,

                  items:
                    Array.isArray(
                      itemResponse.data
                    )
                      ? itemResponse.data
                      : [],
                };
              } catch (itemError) {
                console.error(
                  "Failed to load prescription items:",
                  itemError
                );

                return {
                  ...prescription,
                  items: [],
                };
              }
            }
          )
        );

      // =====================================================
      // SAVE STATE
      // =====================================================

      setPatient(
        loadedPatient
      );

      setPrescriptions(
        loadedPrescriptions
      );

      setBatches(
        loadedBatches
      );

      setQueue(
        loadedQueue
      );

      // =====================================================
      // INITIAL DISPENSING ITEMS
      // =====================================================

      const initialItems = {};

      loadedPrescriptions.forEach(
        (prescription) => {
          const items =
            getPrescriptionItems(
              prescription
            );

          items.forEach(
            (item) => {
              const matchingBatches =
                loadedBatches.filter(
                  (batch) => {
                    const matches =
                      medicineBatchMatches(
                        item,
                        batch
                      );

                    const quantity =
                      getBatchQuantity(
                        batch
                      );

                    const expired =
                      isBatchExpired(
                        batch
                      );

                    return (
                      matches &&
                      quantity > 0 &&
                      !expired
                    );
                  }
                );

              // Prefer batch with earliest expiry.
              // This follows FEFO principle.
              const sortedBatches =
                [...matchingBatches].sort(
                  (a, b) => {
                    const dateA =
                      new Date(
                        a.expiryDate ||
                          "9999-12-31"
                      ).getTime();

                    const dateB =
                      new Date(
                        b.expiryDate ||
                          "9999-12-31"
                      ).getTime();

                    return (
                      dateA - dateB
                    );
                  }
                );

              const firstBatch =
                sortedBatches[0];

              console.log(
                "MATCH ITEM:",
                {
                  item,
                  medicineId:
                    getMedicineId(
                      item
                    ),
                  medicineName:
                    getMedicineName(
                      item
                    ),
                  strength:
                    getMedicineStrength(
                      item
                    ),
                  matchingBatches:
                    sortedBatches,
                }
              );

              initialItems[
                item.id
              ] = {
                batchId:
                  firstBatch?.id ||
                  "",

                dispensedQuantity:
                  item.quantity || 0,

                unitPrice:
                  item.unitPrice ??
                  firstBatch?.medicine
                    ?.unitPrice ??
                  0,

                instructions:
                  item.instructions ||
                  "",
              };
            }
          );
        }
      );

      setDispensingItems(
        initialItems
      );
    } catch (err) {
      console.error(
        "Failed to load pharmacy patient:",
        err
      );

      setError(
        err.response?.data
          ?.message ||
          err.response?.data
            ?.error ||
          "Imeshindikana kupata taarifa za mgonjwa."
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // PRESCRIPTION DATA
  // =========================================================

  const allPrescriptionItems =
    useMemo(() => {
      return prescriptions.flatMap(
        (prescription) =>
          getPrescriptionItems(
            prescription
          ).map((item) => ({
            ...item,

            prescriptionId:
              prescription.id,

            paymentType:
              prescription.paymentType ||
              "CASH",
          }))
      );
    }, [prescriptions]);

  const hasPrescription =
    prescriptions.length > 0;

  const totalAmount =
    useMemo(() => {
      return allPrescriptionItems.reduce(
        (total, item) => {
          const formItem =
            dispensingItems[
              item.id
            ];

          const quantity =
            Number(
              formItem
                ?.dispensedQuantity ||
                0
            );

          const price =
            Number(
              formItem
                ?.unitPrice ||
                0
            );

          return (
            total +
            quantity * price
          );
        },
        0
      );
    }, [
      allPrescriptionItems,
      dispensingItems,
    ]);

  // =========================================================
  // GET AVAILABLE BATCHES FOR ITEM
  // =========================================================

  function getAvailableBatchesForItem(
    item
  ) {
    return batches
      .filter((batch) => {
        const medicineMatches =
          medicineBatchMatches(
            item,
            batch
          );

        if (!medicineMatches) {
          return false;
        }

        const quantity =
          getBatchQuantity(batch);

        if (quantity <= 0) {
          return false;
        }

        if (
          isBatchExpired(batch)
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const dateA =
          new Date(
            a.expiryDate ||
              "9999-12-31"
          ).getTime();

        const dateB =
          new Date(
            b.expiryDate ||
              "9999-12-31"
          ).getTime();

        return dateA - dateB;
      });
  }

  // =========================================================
  // UPDATE DISPENSING ITEM
  // =========================================================

  function updateDispensingItem(
    itemId,
    field,
    value
  ) {
    setDispensingItems(
      (previous) => ({
        ...previous,

        [itemId]: {
          ...previous[itemId],

          [field]: value,
        },
      })
    );
  }

  // =========================================================
  // BATCH CHANGE
  // =========================================================

  function handleBatchChange(
    item,
    batchId
  ) {
    const selectedBatch =
      batches.find(
        (batch) =>
          Number(batch.id) ===
          Number(batchId)
      );

    updateDispensingItem(
      item.id,
      "batchId",
      batchId
    );

    if (selectedBatch) {
      const medicinePrice =
        selectedBatch?.medicine
          ?.unitPrice;

      if (
        medicinePrice !==
          null &&
        medicinePrice !==
          undefined
      ) {
        updateDispensingItem(
          item.id,
          "unitPrice",
          medicinePrice
        );
      }
    }
  }

  // =========================================================
  // DISPENSE
  // =========================================================

  async function handleDispense(
    prescription
  ) {
    setError("");
    setSuccess("");

    const prescriptionItems =
      getPrescriptionItems(
        prescription
      );

    if (
      prescriptionItems.length === 0
    ) {
      setError(
        "Prescription hii haina dawa."
      );

      return;
    }

    const requestItems = [];

    // =====================================================
    // VALIDATE EACH ITEM
    // =====================================================

    for (
      const item of prescriptionItems
    ) {
      const formItem =
        dispensingItems[item.id];

      if (!formItem) {
        setError(
          `Taarifa za dawa ${getMedicineName(
            item
          )} hazijakamilika.`
        );

        return;
      }

      const batchId =
        Number(
          formItem.batchId
        );

      const quantity =
        Number(
          formItem.dispensedQuantity
        );

      const prescribedQuantity =
        Number(
          item.quantity || 0
        );

      // -----------------------------------------------------
      // BATCH ID
      // -----------------------------------------------------

      if (
        !Number.isInteger(
          batchId
        ) ||
        batchId <= 0
      ) {
        setError(
          `Chagua batch ya ${getMedicineName(
            item
          )}.`
        );

        return;
      }

      // -----------------------------------------------------
      // QUANTITY
      // -----------------------------------------------------

      if (
        !Number.isInteger(
          quantity
        ) ||
        quantity <= 0
      ) {
        setError(
          `Weka quantity sahihi ya ${getMedicineName(
            item
          )}.`
        );

        return;
      }

      // -----------------------------------------------------
      // PRESCRIBED LIMIT
      // -----------------------------------------------------

      if (
        quantity >
        prescribedQuantity
      ) {
        setError(
          `Huwezi kutoa ${quantity} za ${getMedicineName(
            item
          )}. Doctor ameandika ${prescribedQuantity}.`
        );

        return;
      }

      // -----------------------------------------------------
      // FIND SELECTED BATCH
      // -----------------------------------------------------

      const selectedBatch =
        batches.find(
          (batch) =>
            Number(batch.id) ===
            batchId
        );

      if (!selectedBatch) {
        setError(
          `Batch ya ${getMedicineName(
            item
          )} haipatikani kwenye taarifa zilizopakuliwa. Tafadhali refresh ukurasa.`
        );

        return;
      }

      // -----------------------------------------------------
      // CHECK MEDICINE MATCH
      // -----------------------------------------------------

      if (
        !medicineBatchMatches(
          item,
          selectedBatch
        )
      ) {
        setError(
          `Batch ${selectedBatch.batchNumber || batchId} haiendani na dawa ${getMedicineName(
            item
          )}.`
        );

        return;
      }

      // -----------------------------------------------------
      // EXPIRY PROTECTION
      // -----------------------------------------------------

      if (
        isBatchExpired(
          selectedBatch
        )
      ) {
        setError(
          `Batch ${selectedBatch.batchNumber || batchId} ya ${getMedicineName(
            item
          )} ime-expire. Huwezi kutoa dawa hii.`
        );

        return;
      }

      // -----------------------------------------------------
      // STOCK
      // -----------------------------------------------------

      const availableStock =
        getBatchQuantity(
          selectedBatch
        );

      if (
        availableStock <= 0
      ) {
        setError(
          `Stock ya ${getMedicineName(
            item
          )} kwenye batch hii imeisha.`
        );

        return;
      }

      if (
        quantity >
        availableStock
      ) {
        setError(
          `Stock ya ${getMedicineName(
            item
          )} ni ${availableStock} tu.`
        );

        return;
      }

      // -----------------------------------------------------
      // REQUEST ITEM
      // -----------------------------------------------------

      requestItems.push({
        batchId,

        dispensedQuantity:
          quantity,

        unitPrice:
          Number(
            formItem.unitPrice ||
              0
          ),

        instructions:
          formItem.instructions ||
          item.instructions ||
          "",
      });
    }

    // =========================================================
    // SEND TO BACKEND
    // =========================================================

    try {
      setDispensing(true);

      const paymentType =
        prescription.paymentType ||
        "CASH";

      console.log(
        "DISPENSING REQUEST:",
        {
          patientId:
            numericPatientId,

          visitId:
            numericVisitId,

          prescriptionId:
            prescription.id,

          paymentType,

          requestItems,
        }
      );

      await api.post(
        `/dispensings`,
        requestItems,
        {
          params: {
            patientId:
              numericPatientId,

            visitId:
              numericVisitId,

            prescriptionId:
              prescription.id,

            paymentType,
          },
        }
      );

      // =====================================================
      // SUCCESS
      // =====================================================

      setSuccess(
        "Dawa zimetolewa kwa mafanikio."
      );

      // =====================================================
      // RELOAD
      // =====================================================

      await loadPatient();
    } catch (err) {
      console.error(
        "Dispensing failed:",
        err
      );

      const backendMessage =
        err.response?.data
          ?.message ||
        err.response?.data
          ?.error ||
        err.response?.data;

      setError(
        typeof backendMessage ===
          "string"
          ? backendMessage
          : "Imeshindikana kutoa dawa. Tafadhali jaribu tena."
      );
    } finally {
      setDispensing(false);
    }
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 px-8 py-7 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Loader2
              className="animate-spin text-blue-600"
              size={24}
            />
          </div>

          <div>
            <p className="font-semibold text-slate-900">
              Inapakia Pharmacy Patient
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Tafadhali subiri kidogo...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // PATIENT NOT FOUND
  // =========================================================

  if (!patient) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <div className="max-w-4xl mx-auto pt-10">
          <Link
            to="/pharmacy/prescriptions"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 font-medium mb-6"
          >
            <ArrowLeft size={18} />

            Rudi kwenye Prescriptions
          </Link>

          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
              <AlertTriangle
                className="text-red-500"
                size={32}
              />
            </div>

            <h2 className="text-xl font-bold text-slate-900 mt-5">
              Mgonjwa hakupatikana
            </h2>

            <p className="text-slate-500 mt-2">
              {error ||
                "Taarifa za mgonjwa hazikupatikana."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-100">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-700">

        <div className="absolute -top-24 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

        <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-28 relative">

          <Link
            to="/pharmacy/prescriptions"
            className="inline-flex items-center gap-2 text-blue-100 hover:text-white transition mb-6"
          >
            <ArrowLeft size={18} />

            Rudi kwenye Prescriptions
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-blue-100 text-xs font-semibold mb-4">
                <Pill size={14} />

                PHARMACY
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                Pharmacy Patient
              </h1>

              <p className="text-blue-100 mt-2 max-w-xl">
                Simamia prescription, batches, stock na
                dispensing ya mgonjwa kwa visit hii.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">

              <div className="px-4 py-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
                <p className="text-xs text-blue-100">
                  Visit
                </p>

                <p className="text-white font-bold mt-1">
                  {queue?.visitNumber ||
                    `VIS-${String(
                      numericVisitId
                    ).padStart(6, "0")}`}
                </p>
              </div>

              <div className="px-4 py-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md">
                <p className="text-xs text-blue-100">
                  Queue
                </p>

                <p className="text-white font-bold mt-1">
                  {queue?.status || "-"}
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 md:px-6 -mt-20 pb-10 relative">

        {/* =====================================================
            ALERTS
        ===================================================== */}

        {error && (
          <div className="mb-5 bg-white border border-red-200 rounded-2xl shadow-sm p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle
                size={19}
                className="text-red-600"
              />
            </div>

            <div>
              <p className="font-semibold text-red-800">
                Kuna tatizo
              </p>

              <p className="text-sm text-red-600 mt-1">
                {error}
              </p>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-5 bg-white border border-emerald-200 rounded-2xl shadow-sm p-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
              <CheckCircle2
                size={19}
                className="text-emerald-600"
              />
            </div>

            <div>
              <p className="font-semibold text-emerald-800">
                Dispensing imekamilika
              </p>

              <p className="text-sm text-emerald-600 mt-1">
                {success}
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            PATIENT PROFILE
        ===================================================== */}

        <section className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden mb-6">

          <div className="p-5 md:p-7">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

              <div className="flex items-center gap-4">

                <div className="relative">

                  <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
                    <User
                      size={36}
                      className="text-white"
                    />
                  </div>

                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-white" />

                </div>

                <div>

                  <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Patient
                  </p>

                  <h2 className="text-2xl font-bold text-slate-900 mt-1">
                    {getPatientName(
                      patient
                    )}
                  </h2>

                  <p className="text-sm text-slate-500 mt-1">
                    Patient No:{" "}
                    <span className="font-semibold text-slate-700">
                      {patient.patientNumber ||
                        patient.id}
                    </span>
                  </p>

                </div>

              </div>

              <div className="flex flex-wrap gap-3">

                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-blue-50 border border-blue-100">

                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center">
                    <Calendar
                      size={18}
                      className="text-blue-600"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Date of Birth
                    </p>

                    <p className="text-sm font-semibold text-slate-800">
                      {formatDate(
                        patient.dateOfBirth
                      )}
                    </p>
                  </div>

                </div>

                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-100">

                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center">
                    <Phone
                      size={18}
                      className="text-emerald-600"
                    />
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Phone
                    </p>

                    <p className="text-sm font-semibold text-slate-800">
                      {patient.phone ||
                        "-"}
                    </p>
                  </div>

                </div>

              </div>

            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-7">

              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-xs text-slate-400">
                  Gender
                </p>

                <p className="font-semibold text-slate-800 mt-1">
                  {patient.gender ||
                    "-"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-xs text-slate-400">
                  Age
                </p>

                <p className="font-semibold text-slate-800 mt-1">
                  {getAge(
                    patient.dateOfBirth
                  )}{" "}
                  years
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-xs text-slate-400">
                  Visit ID
                </p>

                <p className="font-semibold text-slate-800 mt-1">
                  {numericVisitId}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4">
                <p className="text-xs text-slate-400">
                  Queue Status
                </p>

                <p className="font-semibold text-slate-800 mt-1">
                  {queue?.status ||
                    "-"}
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* =====================================================
            VISIT SUMMARY
        ===================================================== */}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <Stethoscope
                  size={21}
                  className="text-indigo-600"
                />
              </div>

              <div>

                <p className="text-xs text-slate-400">
                  Visit Number
                </p>

                <p className="font-bold text-slate-900 mt-1">
                  {queue?.visitNumber ||
                    `VIS-${String(
                      numericVisitId
                    ).padStart(6, "0")}`}
                </p>

              </div>

            </div>

          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Calendar
                  size={21}
                  className="text-blue-600"
                />
              </div>

              <div>

                <p className="text-xs text-slate-400">
                  Visit Date
                </p>

                <p className="font-bold text-slate-900 mt-1">
                  {formatDate(
                    queue?.queueDate
                  )}
                </p>

              </div>

            </div>

          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

            <div className="flex items-center gap-3">

              <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center">
                <ClipboardList
                  size={21}
                  className="text-amber-600"
                />
              </div>

              <div>

                <p className="text-xs text-slate-400">
                  Prescriptions
                </p>

                <p className="font-bold text-slate-900 mt-1">
                  {prescriptions.length}
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            PRESCRIPTIONS
        ===================================================== */}

        {!hasPrescription ? (
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-12 text-center">

            <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto">

              <Pill
                size={38}
                className="text-slate-300"
              />

            </div>

            <h2 className="text-xl font-bold text-slate-900 mt-5">
              Hakuna Prescription
            </h2>

            <p className="text-slate-500 mt-2">
              Hakuna prescription iliyopatikana kwa visit hii.
            </p>

          </section>
        ) : (
          <div className="space-y-6">

            {prescriptions.map(
              (prescription) => {
                const items =
                  getPrescriptionItems(
                    prescription
                  );

                const isCompleted =
                  prescription.status ===
                  "COMPLETED";

                const prescriptionTotal =
                  items.reduce(
                    (total, item) => {
                      const formItem =
                        dispensingItems[
                          item.id
                        ];

                      const quantity =
                        Number(
                          formItem
                            ?.dispensedQuantity ||
                            0
                        );

                      const price =
                        Number(
                          formItem
                            ?.unitPrice ||
                            0
                        );

                      return (
                        total +
                        quantity *
                          price
                      );
                    },
                    0
                  );

                return (
                  <section
                    key={
                      prescription.id
                    }
                    className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden"
                  >

                    {/* =================================================
                        PRESCRIPTION HEADER
                    ================================================= */}

                    <div className="p-5 md:p-6 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">

                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                        <div className="flex items-center gap-4">

                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">

                            <Pill
                              size={27}
                              className="text-white"
                            />

                          </div>

                          <div>

                            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                              Prescription
                            </p>

                            <h2 className="text-xl font-bold text-slate-900 mt-1">
                              #
                              {
                                prescription.id
                              }
                            </h2>

                            <p className="text-sm text-slate-500 mt-1">
                              Created:{" "}
                              {formatDateTime(
                                prescription.createdAt
                              )}
                            </p>

                          </div>

                        </div>

                        <div className="flex flex-wrap gap-2">

                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold ${
                              isCompleted
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >

                            {isCompleted ? (
                              <CheckCircle2
                                size={14}
                              />
                            ) : (
                              <AlertTriangle
                                size={14}
                              />
                            )}

                            {prescription.status ||
                              "PENDING"}

                          </span>

                          <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold">

                            <CreditCard
                              size={14}
                            />

                            {prescription.paymentType ||
                              "CASH"}

                          </span>

                        </div>

                      </div>

                    </div>

                    {/* =================================================
                        MEDICINES
                    ================================================= */}

                    <div className="p-5 md:p-6">

                      <div className="flex items-center justify-between mb-5">

                        <div className="flex items-center gap-3">

                          <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center">

                            <Boxes
                              size={20}
                              className="text-violet-600"
                            />

                          </div>

                          <div>

                            <h3 className="font-bold text-slate-900">
                              Medicine Items
                            </h3>

                            <p className="text-xs text-slate-500 mt-0.5">
                              Dawa zilizoandikwa na Doctor
                            </p>

                          </div>

                        </div>

                        <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold">
                          {items.length} item
                          {items.length !==
                          1
                            ? "s"
                            : ""}
                        </span>

                      </div>

                      <div className="space-y-4">

                        {items.map(
                          (item) => {
                            const formItem =
                              dispensingItems[
                                item.id
                              ] || {};

                            const itemBatches =
                              getAvailableBatchesForItem(
                                item
                              );

                            const selectedBatch =
                              batches.find(
                                (batch) =>
                                  Number(
                                    batch.id
                                  ) ===
                                  Number(
                                    formItem.batchId
                                  )
                              );

                            const quantity =
                              Number(
                                formItem
                                  .dispensedQuantity ||
                                  0
                              );

                            const unitPrice =
                              Number(
                                formItem
                                  .unitPrice ||
                                  0
                              );

                            const itemTotal =
                              quantity *
                              unitPrice;

                            return (
                              <div
                                key={item.id}
                                className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 md:p-5"
                              >

                                {/* MEDICINE TITLE */}

                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">

                                  <div className="flex items-center gap-3">

                                    <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">

                                      <Pill
                                        size={21}
                                        className="text-blue-600"
                                      />

                                    </div>

                                    <div>

                                      <h4 className="font-bold text-slate-900">
                                        {getMedicineName(
                                          item
                                        )}
                                      </h4>

                                      <p className="text-sm text-slate-500 mt-0.5">
                                        {getMedicineStrength(
                                          item
                                        )}
                                      </p>

                                    </div>

                                  </div>

                                  <div className="flex items-center gap-2">

                                    <span className="px-3 py-2 rounded-xl bg-blue-100 text-blue-700 text-xs font-bold">
                                      Prescribed:{" "}
                                      {
                                        item.quantity
                                      }
                                    </span>

                                  </div>

                                </div>

                                {/* CONTROLS */}

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                                  {/* BATCH */}

                                  <div>

                                    <label className="block text-xs font-semibold text-slate-500 mb-2">
                                      Batch
                                    </label>

                                    <select
                                      value={
                                        formItem.batchId ||
                                        ""
                                      }
                                      disabled={
                                        isCompleted
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        handleBatchChange(
                                          item,
                                          event
                                            .target
                                            .value
                                        )
                                      }
                                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >

                                      <option value="">
                                        Chagua Batch
                                      </option>

                                      {itemBatches.map(
                                        (
                                          batch
                                        ) => (
                                          <option
                                            key={
                                              batch.id
                                            }
                                            value={
                                              batch.id
                                            }
                                          >
                                            {batch.batchNumber ||
                                              `Batch ${batch.id}`}{" "}
                                            — Stock:{" "}
                                            {
                                              getBatchQuantity(
                                                batch
                                              )
                                            }
                                          </option>
                                        )
                                      )}

                                    </select>

                                    {itemBatches.length ===
                                      0 && (
                                      <p className="text-xs text-red-500 mt-2">
                                        Hakuna stock inayopatikana.
                                      </p>
                                    )}

                                  </div>

                                  {/* STOCK */}

                                  <div>

                                    <label className="block text-xs font-semibold text-slate-500 mb-2">
                                      Available Stock
                                    </label>

                                    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 flex items-center justify-between">

                                      <span className="font-bold text-slate-800">
                                        {selectedBatch
                                          ? getBatchQuantity(
                                              selectedBatch
                                            )
                                          : 0}
                                      </span>

                                      <Package
                                        size={17}
                                        className={
                                          Number(
                                            selectedBatch
                                              ? getBatchQuantity(
                                                  selectedBatch
                                                )
                                              : 0
                                          ) > 0
                                            ? "text-emerald-500"
                                            : "text-red-500"
                                        }
                                      />

                                    </div>

                                  </div>

                                  {/* DISPENSE QUANTITY */}

                                  <div>

                                    <label className="block text-xs font-semibold text-slate-500 mb-2">
                                      Dispense Quantity
                                    </label>

                                    <input
                                      type="number"
                                      min="1"
                                      max={
                                        item.quantity
                                      }
                                      value={
                                        formItem.dispensedQuantity ??
                                        ""
                                      }
                                      disabled={
                                        isCompleted
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        updateDispensingItem(
                                          item.id,
                                          "dispensedQuantity",
                                          event
                                            .target
                                            .value
                                        )
                                      }
                                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />

                                    <p className="text-[11px] text-slate-400 mt-1">
                                      Max:{" "}
                                      {
                                        item.quantity
                                      }
                                    </p>

                                  </div>

                                  {/* PRICE */}

                                  <div>

                                    <label className="block text-xs font-semibold text-slate-500 mb-2">
                                      Unit Price
                                    </label>

                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={
                                        formItem.unitPrice ??
                                        ""
                                      }
                                      disabled={
                                        isCompleted
                                      }
                                      onChange={(
                                        event
                                      ) =>
                                        updateDispensingItem(
                                          item.id,
                                          "unitPrice",
                                          event
                                            .target
                                            .value
                                        )
                                      }
                                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />

                                  </div>

                                </div>

                                {/* EXPIRY + TOTAL */}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

                                  <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">

                                    <p className="text-xs text-slate-400">
                                      Batch Expiry
                                    </p>

                                    <p
                                      className={`font-semibold mt-1 ${
                                        selectedBatch?.expiryDate &&
                                        isBatchExpired(
                                          selectedBatch
                                        )
                                          ? "text-red-600"
                                          : "text-slate-800"
                                      }`}
                                    >
                                      {formatDate(
                                        selectedBatch?.expiryDate
                                      )}
                                    </p>

                                  </div>

                                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100 px-4 py-3 flex items-center justify-between">

                                    <div>

                                      <p className="text-xs text-emerald-600">
                                        Item Total
                                      </p>

                                      <p className="text-lg font-bold text-emerald-700 mt-1">
                                        {itemTotal.toLocaleString(
                                          "en-TZ",
                                          {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          }
                                        )}
                                      </p>

                                    </div>

                                    <ShoppingCart
                                      size={21}
                                      className="text-emerald-500"
                                    />

                                  </div>

                                </div>

                                {/* INSTRUCTIONS */}

                                <div className="mt-4">

                                  <label className="block text-xs font-semibold text-slate-500 mb-2">
                                    Maelekezo
                                  </label>

                                  <textarea
                                    value={
                                      formItem.instructions ||
                                      ""
                                    }
                                    disabled={
                                      isCompleted
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      updateDispensingItem(
                                        item.id,
                                        "instructions",
                                        event
                                          .target
                                          .value
                                      )
                                    }
                                    rows={2}
                                    placeholder="Andika maelekezo ya dispensing..."
                                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                  />

                                </div>

                              </div>
                            );
                          }
                        )}

                      </div>

                      {/* =================================================
                          PRESCRIPTION FOOTER
                      ================================================= */}

                      <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                        <div>

                          <p className="text-xs text-slate-400 uppercase tracking-wide font-semibold">
                            Prescription Total
                          </p>

                          <p className="text-2xl font-bold text-slate-900 mt-1">
                            {prescriptionTotal.toLocaleString(
                              "en-TZ",
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
                          </p>

                        </div>

                        {!isCompleted && (
                          <button
                            type="button"
                            disabled={
                              dispensing
                            }
                            onClick={() =>
                              handleDispense(
                                prescription
                              )
                            }
                            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold shadow-lg shadow-blue-200 transition"
                          >

                            {dispensing ? (
                              <>
                                <Loader2
                                  size={19}
                                  className="animate-spin"
                                />

                                Inatoa Dawa...
                              </>
                            ) : (
                              <>
                                <ShoppingCart
                                  size={19}
                                />

                                Toa Dawa
                              </>
                            )}

                          </button>
                        )}

                        {isCompleted && (
                          <div className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">

                            <CheckCircle2
                              size={20}
                            />

                            Dawa Zimetolewa

                          </div>
                        )}

                      </div>

                    </div>
                  </section>
                );
              }
            )}

          </div>
        )}

        {/* =====================================================
            GRAND TOTAL
        ===================================================== */}

        {hasPrescription && (
          <section className="mt-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl shadow-xl p-6 md:p-7 text-white">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">

                  <Package
                    size={27}
                    className="text-blue-300"
                  />

                </div>

                <div>

                  <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Dispensing Summary
                  </p>

                  <h3 className="text-xl font-bold mt-1">
                    Jumla ya Dawa
                  </h3>

                  <p className="text-sm text-slate-400 mt-1">
                    Prescription zote za visit hii
                  </p>

                </div>

              </div>

              <div className="text-left md:text-right">

                <p className="text-xs text-slate-400 uppercase tracking-wide">
                  Grand Total
                </p>

                <p className="text-3xl font-bold text-white mt-1">
                  {totalAmount.toLocaleString(
                    "en-TZ",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </p>

              </div>

            </div>

          </section>
        )}

      </main>
    </div>
  );
}