import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Clock3,
  FileText,
  Loader2,
  Pill,
  RefreshCw,
  User,
  Hash,
  CheckCircle2,
} from "lucide-react";

import api from "../../services/api";

/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

function formatDateTime(value) {
  if (!value) return "--";

  try {
    return new Date(value).toLocaleString("en-TZ", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "--";
  }
}

function getPatientId(prescription) {
  return (
    prescription?.patientId ??
    prescription?.patient?.id ??
    prescription?.patient?.patientId ??
    null
  );
}

function getVisitId(prescription) {
  return (
    prescription?.visitId ??
    prescription?.visit?.id ??
    prescription?.visit?.visitId ??
    null
  );
}

function getPatientName(prescription) {
  const patient =
    prescription?.patient || prescription;

  const firstName =
    patient?.firstName || "";

  const middleName =
    patient?.middleName || "";

  const lastName =
    patient?.lastName || "";

  return (
    `${firstName} ${middleName} ${lastName}`
      .replace(/\s+/g, " ")
      .trim() || "Unknown Patient"
  );
}

function getPatientNumber(prescription) {
  return (
    prescription?.patientNumber ??
    prescription?.patient?.patientNumber ??
    "--"
  );
}

function getVisitNumber(prescription) {
  return (
    prescription?.visitNumber ??
    prescription?.visit?.visitNumber ??
    "--"
  );
}

function getItems(prescription) {
  if (Array.isArray(prescription?.items)) {
    return prescription.items;
  }

  if (Array.isArray(prescription?.prescriptionItems)) {
    return prescription.prescriptionItems;
  }

  return [];
}

function getMedicineText(prescription) {
  const items = getItems(prescription);

  if (items.length === 0) {
    return "Hakuna medicine items";
  }

  if (items.length === 1) {
    const item = items[0];

    return `${item?.medicineName || "Medicine"}${
      item?.strength
        ? ` ${item.strength}`
        : ""
    }`;
  }

  return `${items[0]?.medicineName || "Medicine"} + ${
    items.length - 1
 } more`;
}

function getTotalQuantity(prescription) {
  const items = getItems(prescription);

  return items.reduce(
    (sum, item) =>
      sum + Number(item?.quantity || 0),
    0
  );
}

/*
 * =========================================================
 * COMPONENT
 * =========================================================
 */

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * =========================================================
   * LOAD PRESCRIPTIONS
   * =========================================================
   */

  const loadPrescriptions = async ({
    fullLoading = true,
  } = {}) => {
    try {
      setError("");

      if (fullLoading) {
        setLoading(true);
      }

      const response =
  await api.get(
    "/prescriptions/status/PENDING"
  );

      const data =
        Array.isArray(response?.data)
          ? response.data
          : [];

      /*
       * -------------------------------------------------------
       * LOAD ITEMS IF NOT EMBEDDED
       * -------------------------------------------------------
       */

      const prescriptionsWithItems =
        await Promise.all(
          data.map(async (prescription) => {
            const existingItems =
              getItems(prescription);

            if (
              existingItems.length > 0
              || !prescription?.id
            ) {
              return prescription;
            }

            try {
              const itemsResponse =
  await api.get(
    `/prescriptions/${prescription.id}/items`
  );

              return {
                ...prescription,
                items:
                  Array.isArray(
                    itemsResponse?.data
                  )
                    ? itemsResponse.data
                    : [],
              };
            } catch (itemError) {
              console.error(
                "Prescription items error:",
                itemError
              );

              return {
                ...prescription,
                items: [],
              };
            }
          })
        );

      /*
       * -------------------------------------------------------
       * SORT NEWEST FIRST
       * -------------------------------------------------------
       */

      prescriptionsWithItems.sort(
        (a, b) => {
          const dateA =
            new Date(
              a?.createdAt || 0
            ).getTime();

          const dateB =
            new Date(
              b?.createdAt || 0
            ).getTime();

          return dateB - dateA;
        }
      );

      setPrescriptions(
        prescriptionsWithItems
      );
    } catch (err) {
      console.error(
        "Prescriptions page error:",
        err
      );

      setError(
        "Imeshindikana kupakia prescriptions kutoka Pharmacy backend."
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
    loadPrescriptions();
  }, []);

  /*
   * =========================================================
   * REFRESH
   * =========================================================
   */

  const handleRefresh = async () => {
    setRefreshing(true);

    await loadPrescriptions({
      fullLoading: false,
    });
  };

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">

          <div
            className="
              flex h-14 w-14
              items-center justify-center
              rounded-2xl bg-purple-50
            "
          >
            <Loader2
              size={27}
              className="animate-spin text-purple-600"
            />
          </div>

          <p className="text-sm font-semibold text-slate-600">
            Inapakia prescriptions...
          </p>

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
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          relative overflow-hidden
          rounded-3xl
          border border-purple-200
          bg-gradient-to-br
          from-purple-50 via-white to-blue-50
          p-6 shadow-sm
        "
      >
        <div
          className="
            relative z-10
            flex flex-col gap-5
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >

          <div>

            <div className="flex items-center gap-3">

              <div
                className="
                  flex h-12 w-12
                  items-center justify-center
                  rounded-2xl
                  bg-purple-600
                  text-white
                "
              >
                <Pill size={23} />
              </div>

              <div>

                <p className="text-sm font-bold text-purple-600">
                  Pharmacy
                </p>

                <h1 className="text-2xl font-bold text-slate-900">
                  Prescriptions
                </h1>

              </div>

            </div>

            <p className="mt-4 text-sm text-slate-500">
              Prescriptions zinazosubiri
              kutolewa na Pharmacy.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">

              <span
                className="
                  inline-flex items-center gap-2
                  rounded-full
                  border border-purple-200
                  bg-purple-50
                  px-3 py-1.5
                  text-xs font-bold
                  text-purple-700
                "
              >
                <FileText size={14} />
                {prescriptions.length} pending
              </span>

            </div>

          </div>

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="
                inline-flex items-center gap-2
                rounded-xl
                border border-slate-200
                bg-white
                px-4 py-2.5
                text-sm font-semibold
                text-slate-700
                shadow-sm
                hover:border-purple-300
                hover:bg-purple-50
                hover:text-purple-700
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
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
                : "Refresh"}

            </button>

            <Link
              to="/pharmacy"
              className="
                inline-flex items-center gap-2
                rounded-xl
                bg-purple-600
                px-4 py-2.5
                text-sm font-bold
                text-white
                hover:bg-purple-700
              "
            >
              <ArrowLeft size={17} />
              Pharmacy
            </Link>

          </div>

        </div>

        <div
          className="
            absolute -right-10 -top-10
            h-40 w-40
            rounded-full
            bg-purple-200/30
            blur-2xl
          "
        />

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div
          className="
            flex items-start gap-3
            rounded-2xl
            border border-red-200
            bg-red-50
            p-4
            text-sm text-red-700
          "
        >

          <AlertTriangle
            size={19}
            className="mt-0.5 shrink-0"
          />

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

      {/* =====================================================
          EMPTY
      ===================================================== */}

      {prescriptions.length === 0 ? (

        <div
          className="
            rounded-3xl
            border border-slate-200
            bg-white
            px-6 py-16
            text-center
            shadow-sm
          "
        >

          <div
            className="
              mx-auto
              flex h-16 w-16
              items-center justify-center
              rounded-2xl
              bg-emerald-50
            "
          >
            <CheckCircle2
              size={29}
              className="text-emerald-600"
            />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Hakuna Pending Prescriptions
          </h2>

          <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
            Kwa sasa hakuna prescription inayosubiri
            dispensing kwenye Pharmacy.
          </p>

          <Link
            to="/pharmacy"
            className="
              mt-6
              inline-flex items-center gap-2
              rounded-xl
              bg-purple-600
              px-5 py-2.5
              text-sm font-bold
              text-white
              hover:bg-purple-700
            "
          >
            <ArrowLeft size={17} />
            Rudi Pharmacy
          </Link>

        </div>

      ) : (

        /* ===================================================
           PRESCRIPTION LIST
        =================================================== */

        <div className="grid grid-cols-1 gap-5">

          {prescriptions.map(
            (prescription, index) => {

              const patientId =
                getPatientId(
                  prescription
                );

              const visitId =
                getVisitId(
                  prescription
                );

              const items =
                getItems(
                  prescription
                );

              const totalQuantity =
                getTotalQuantity(
                  prescription
                );

              const canOpenPatient =
                patientId &&
                visitId;

              return (
                <div
                  key={
                    prescription.id ||
                    index
                  }
                  className="
                    overflow-hidden
                    rounded-2xl
                    border border-slate-200
                    bg-white
                    shadow-sm
                    transition
                    hover:border-purple-200
                    hover:shadow-md
                  "
                >

                  {/* CARD HEADER */}

                  <div
                    className="
                      flex flex-col gap-4
                      border-b
                      border-slate-100
                      bg-slate-50/70
                      px-6 py-5
                      lg:flex-row
                      lg:items-center
                      lg:justify-between
                    "
                  >

                    <div className="flex items-start gap-4">

                      <div
                        className="
                          flex h-12 w-12
                          shrink-0
                          items-center
                          justify-center
                          rounded-2xl
                          bg-purple-100
                        "
                      >
                        <Pill
                          size={22}
                          className="text-purple-600"
                        />
                      </div>

                      <div>

                        <div className="flex flex-wrap items-center gap-2">

                          <span
                            className="
                              rounded-full
                              bg-purple-100
                              px-3 py-1.5
                              text-xs font-bold
                              text-purple-700
                            "
                          >
                            RX-
                            {String(
                              prescription.id ||
                                "--"
                            ).padStart(5, "0")}
                          </span>

                          <span
                            className="
                              rounded-full
                              bg-amber-50
                              px-3 py-1.5
                              text-xs font-bold
                              text-amber-700
                            "
                          >
                            {prescription.status ||
                              "PENDING"}
                          </span>

                          <span
                            className="
                              rounded-full
                              bg-blue-50
                              px-3 py-1.5
                              text-xs font-bold
                              text-blue-700
                            "
                          >
                            {prescription.paymentType ||
                              "CASH"}
                          </span>

                        </div>

                        <p className="mt-3 text-lg font-bold text-slate-900">
                          {getPatientName(
                            prescription
                          )}
                        </p>

                      </div>

                    </div>

                    <div className="flex items-center gap-2">

                      <span
                        className="
                          inline-flex items-center gap-2
                          rounded-xl
                          bg-white
                          px-3 py-2
                          text-xs font-bold
                          text-slate-600
                          shadow-sm
                        "
                      >
                        <Clock3 size={14} />

                        {formatDateTime(
                          prescription.createdAt
                        )}
                      </span>

                    </div>

                  </div>

                  {/* CARD BODY */}

                  <div className="p-6">

                    <div
                      className="
                        grid grid-cols-1
                        gap-4
                        md:grid-cols-2
                        xl:grid-cols-4
                      "
                    >

                      {/* PATIENT */}

                      <InfoBox
                        icon={User}
                        label="Patient"
                        value={getPatientName(
                          prescription
                        )}
                      />

                      {/* PATIENT NUMBER */}

                      <InfoBox
                        icon={Hash}
                        label="Patient Number"
                        value={getPatientNumber(
                          prescription
                        )}
                      />

                      {/* VISIT */}

                      <InfoBox
                        icon={FileText}
                        label="Visit"
                        value={getVisitNumber(
                          prescription
                        )}
                      />

                      {/* QUANTITY */}

                      <InfoBox
                        icon={Pill}
                        label="Total Quantity"
                        value={
                          totalQuantity > 0
                            ? `${totalQuantity} units`
                            : "--"
                        }
                      />

                    </div>

                    {/* MEDICINES */}

                    <div className="mt-5">

                      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                        Medicines
                      </p>

                      {items.length === 0 ? (

                        <div
                          className="
                            rounded-xl
                            border border-amber-200
                            bg-amber-50
                            p-4
                          "
                        >

                          <div className="flex items-start gap-3">

                            <AlertTriangle
                              size={18}
                              className="mt-0.5 text-amber-600"
                            />

                            <div>

                              <p className="text-sm font-bold text-amber-800">
                                Medicine items hazijapatikana
                              </p>

                              <p className="mt-1 text-xs text-amber-700">
                                Prescription ipo lakini
                                items zake hazikurudishwa
                                na backend.
                              </p>

                            </div>

                          </div>

                        </div>

                      ) : (

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

                          {items.map(
                            (item, itemIndex) => (

                              <div
                                key={
                                  item.id ||
                                  itemIndex
                                }
                                className="
                                  rounded-xl
                                  border
                                  border-slate-200
                                  bg-slate-50
                                  p-4
                                "
                              >

                                <div className="flex items-start justify-between gap-3">

                                  <div>

                                    <p className="text-sm font-bold text-slate-800">
                                      {item.medicineName ||
                                        "Medicine"}
                                    </p>

                                    {item.strength && (
                                      <p className="mt-1 text-xs text-slate-500">
                                        {item.strength}
                                      </p>
                                    )}

                                  </div>

                                  <span
                                    className="
                                      rounded-lg
                                      bg-purple-100
                                      px-2.5 py-1.5
                                      text-xs font-bold
                                      text-purple-700
                                    "
                                  >
                                    Qty{" "}
                                    {item.quantity ??
                                      "--"}
                                  </span>

                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">

                                  <div>

                                    <p className="text-slate-400">
                                      Dosage
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-700">
                                      {item.dosage ||
                                        "--"}
                                    </p>

                                  </div>

                                  <div>

                                    <p className="text-slate-400">
                                      Frequency
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-700">
                                      {item.frequency ||
                                        "--"}
                                    </p>

                                  </div>

                                  <div>

                                    <p className="text-slate-400">
                                      Duration
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-700">
                                      {item.duration ||
                                        "--"}
                                    </p>

                                  </div>

                                  <div>

                                    <p className="text-slate-400">
                                      Instructions
                                    </p>

                                    <p className="mt-1 font-semibold text-slate-700">
                                      {item.instructions ||
                                        "--"}
                                    </p>

                                  </div>

                                </div>

                              </div>

                            )
                          )}

                        </div>

                      )}

                    </div>

                    {/* ACTION */}

                    <div
                      className="
                        mt-6
                        flex flex-col gap-3
                        border-t border-slate-100
                        pt-5
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                      "
                    >

                      <div>

                        <p className="text-xs font-semibold text-slate-500">
                          Pharmacy Action
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Fungua patient na Visit hii
                          ili kuendelea na dispensing.
                        </p>

                      </div>

                      {canOpenPatient ? (

                        <Link
                          to={`/pharmacy/patients/${patientId}?visitId=${visitId}`}
                          className="
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            rounded-xl
                            bg-purple-600
                            px-5 py-2.5
                            text-sm font-bold
                            text-white
                            shadow-sm
                            transition
                            hover:bg-purple-700
                          "
                        >
                          Open Prescription
                          <ArrowRight size={17} />
                        </Link>

                      ) : (

                        <span
                          className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-xl
                            bg-slate-100
                            px-5 py-2.5
                            text-sm font-bold
                            text-slate-400
                          "
                        >
                          Patient / Visit ID haipo
                        </span>

                      )}

                    </div>

                  </div>

                </div>
              );
            }
          )}

        </div>

      )}

    </div>
  );
}

/*
 * =========================================================
 * INFO BOX
 * =========================================================
 */

function InfoBox({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div
      className="
        rounded-xl
        border border-slate-100
        bg-slate-50
        p-4
      "
    >

      <div className="flex items-center gap-2">

        <Icon
          size={15}
          className="text-slate-400"
        />

        <p className="text-xs font-semibold text-slate-500">
          {label}
        </p>

      </div>

      <p className="mt-2 truncate text-sm font-bold text-slate-800">
        {value}
      </p>

    </div>
  );
}