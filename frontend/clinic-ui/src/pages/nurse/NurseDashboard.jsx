import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Clock3,
  Activity,
  Stethoscope,
  Search,
  Eye,
  ClipboardPlus,
  History,
  CalendarDays,
  RefreshCw,
} from "lucide-react";

import api from "../../services/api";

export default function NurseDashboard() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");

  // =====================================================
  // VIEW MODE
  // =====================================================

  const [viewMode, setViewMode] = useState("today");

  // =====================================================
  // SELECTED HISTORY DATE
  // =====================================================

  const [selectedDate, setSelectedDate] = useState("");

  // =====================================================
  // LOADING
  // =====================================================

  const [loading, setLoading] = useState(false);

  // =====================================================
  // ERROR
  // =====================================================

  const [error, setError] = useState("");

  // =====================================================
  // TODAY STRING
  // =====================================================

  const todayString = useMemo(() => {
    const today = new Date();

    return (
      `${today.getFullYear()}-` +
      `${String(today.getMonth() + 1).padStart(2, "0")}-` +
      `${String(today.getDate()).padStart(2, "0")}`
    );
  }, []);

  // =====================================================
  // INITIAL HISTORY DATE
  // =====================================================

  useEffect(() => {
    setSelectedDate(todayString);
  }, [todayString]);

  // =====================================================
  // NORMALIZE QUEUE DATA
  // =====================================================

  const normalizeQueue = (queue) => {
    return {
      ...queue,

      // Queue ID
      queueId: queue.id,

      // Real patient ID
      patientId: queue.patientId,

      // Patient number
      patientNumber: queue.patientNumber || "",

      // Queue date
      queueDate: queue.queueDate || "",

      // Visit ID
      visitId: queue.visitId || null,

      // Visit number
      visitNumber: queue.visitNumber || "",

      // Queue status
      queueStatus:
        queue.status === "WAITING"
          ? "Waiting"
          : queue.status === "IN_CONSULTATION"
          ? "In Consultation"
          : queue.status === "SENT_TO_DOCTOR"
          ? "Sent to Doctor"
          : queue.status === "LAB_PENDING"
          ? "Laboratory Pending"
          : queue.status === "LAB_COMPLETED"
          ? "Laboratory Completed"
          : queue.status === "RETURNED_TO_DOCTOR"
          ? "Returned to Doctor"
          : queue.status === "PHARMACY_PENDING"
          ? "Pharmacy Pending"
          : queue.status === "PHARMACY_COMPLETED"
          ? "Pharmacy Completed"
          : queue.status === "INJECTION_PENDING"
          ? "Injection Pending"
          : queue.status === "INJECTION_COMPLETED"
          ? "Injection Completed"
          : queue.status === "COMPLETED"
          ? "Completed"
          : queue.status || "Waiting",

      // Check-in time
      registeredTime: queue.checkInTime
        ? new Date(queue.checkInTime).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "",
    };
  };

  // =====================================================
  // LOAD TODAY NURSE QUEUE
  // =====================================================

  const loadTodayQueue = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/patient-queue/nurse");

      const queueData = Array.isArray(response.data)
        ? response.data
        : [];

      const normalizedPatients =
        queueData.map(normalizeQueue);

      setPatients(normalizedPatients);
    } catch (error) {
      console.error(
        "Failed to load today's nurse queue:",
        error
      );

      setPatients([]);

      setError(
        "Imeshindikana kupata queue ya leo."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD QUEUE HISTORY
  // =====================================================

  const loadQueueHistory = async (date) => {
    if (!date) {
      setPatients([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.get(
        `/patient-queue/date?date=${date}`
      );

      const queueData = Array.isArray(response.data)
        ? response.data
        : [];

      const normalizedPatients =
        queueData.map(normalizeQueue);

      setPatients(normalizedPatients);
    } catch (error) {
      console.error(
        "Failed to load queue history:",
        error
      );

      setPatients([]);

      setError(
        "Imeshindikana kupata queue history."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD DATA WHEN VIEW CHANGES
  // =====================================================

  useEffect(() => {
    if (viewMode === "today") {
      loadTodayQueue();
    }
  }, [viewMode]);

  // =====================================================
  // LOAD HISTORY WHEN DATE CHANGES
  // =====================================================

  useEffect(() => {
    if (
      viewMode === "history" &&
      selectedDate
    ) {
      loadQueueHistory(selectedDate);
    }
  }, [viewMode, selectedDate]);

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = () => {
    if (viewMode === "today") {
      loadTodayQueue();
    } else {
      loadQueueHistory(selectedDate);
    }
  };

  // =====================================================
  // TODAY PATIENTS
  // =====================================================

  const patientsToday = useMemo(() => {
    if (viewMode === "today") {
      return patients.filter(
        (patient) =>
          patient.queueDate === todayString
      );
    }

    return patients;
  }, [
    patients,
    todayString,
    viewMode,
  ]);

  // =====================================================
  // WAITING
  // =====================================================

  const waitingPatients = useMemo(() => {
    return patientsToday.filter(
      (patient) =>
        patient.status === "WAITING" ||
        patient.queueStatus === "Waiting"
    );
  }, [patientsToday]);

  // =====================================================
  // IN CONSULTATION
  // =====================================================

  const inConsultation = useMemo(() => {
    return patientsToday.filter(
      (patient) =>
        patient.status === "IN_CONSULTATION" ||
        patient.queueStatus === "In Consultation"
    );
  }, [patientsToday]);

  // =====================================================
  // COMPLETED
  // =====================================================

  const completedPatients = useMemo(() => {
    return patientsToday.filter(
      (patient) =>
        patient.status === "COMPLETED" ||
        patient.queueStatus === "Completed"
    );
  }, [patientsToday]);

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredPatients = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    if (!keyword) {
      return patientsToday;
    }

    return patientsToday.filter(
      (patient) => {
        const fullName =
          `${patient.firstName || ""} ${
            patient.middleName || ""
          } ${patient.lastName || ""}`
            .replace(/\s+/g, " ")
            .trim()
            .toLowerCase();

        const patientId =
          String(
            patient.patientId || ""
          ).toLowerCase();

        const patientNumber =
          String(
            patient.patientNumber || ""
          ).toLowerCase();

        const queueNumber =
          String(
            patient.queueNumber || ""
          ).toLowerCase();

        const visitNumber =
          String(
            patient.visitNumber || ""
          ).toLowerCase();

        const phone =
          String(
            patient.phone || ""
          ).toLowerCase();

        const service =
          String(
            patient.service || ""
          ).toLowerCase();

        return (
          fullName.includes(keyword) ||
          patientId.includes(keyword) ||
          patientNumber.includes(keyword) ||
          queueNumber.includes(keyword) ||
          visitNumber.includes(keyword) ||
          phone.includes(keyword) ||
          service.includes(keyword)
        );
      }
    );
  }, [patientsToday, search]);

  // =====================================================
  // FULL NAME
  // =====================================================

  const getFullName = (patient) => {
    return (
      `${patient.firstName || ""} ${
        patient.middleName || ""
      } ${patient.lastName || ""}`
        .replace(/\s+/g, " ")
        .trim() ||
      "Unknown Patient"
    );
  };

  // =====================================================
  // INITIALS
  // =====================================================

  const getInitials = (patient) => {
    const name =
      getFullName(patient);

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) =>
        word.charAt(0).toUpperCase()
      )
      .join("");
  };

  // =====================================================
  // HISTORY DATE LABEL
  // =====================================================

  const historyDateLabel = selectedDate
    ? new Date(
        `${selectedDate}T00:00:00`
      ).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Select date";

  return (
    <div className="space-y-8">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

        <div>
          <p className="text-sm font-semibold text-blue-600">
            Nurse Module
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-800">
            Nurse Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage patients, record vital signs and
            send patients to doctor.
          </p>
        </div>

        {/* REFRESH */}

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            py-2.5
            text-sm
            font-semibold
            text-slate-600
            shadow-sm
            transition
            hover:border-blue-200
            hover:bg-blue-50
            hover:text-blue-600
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          <RefreshCw
            size={17}
            className={
              loading
                ? "animate-spin"
                : ""
            }
          />

          Refresh
        </button>

      </div>

      {/* =================================================
          VIEW SWITCHER
      ================================================= */}

      <div
        className="
          flex
          flex-col
          gap-4
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-4
          shadow-sm
          md:flex-row
          md:items-center
          md:justify-between
        "
      >

        <div className="flex rounded-xl bg-slate-100 p-1">

          <button
            type="button"
            onClick={() => {
              setViewMode("today");
              setSearch("");
            }}
            className={`
              inline-flex
              items-center
              gap-2
              rounded-lg
              px-4
              py-2
              text-sm
              font-semibold
              transition
              ${
                viewMode === "today"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }
            `}
          >
            <CalendarDays size={17} />
            Today's Queue
          </button>

          <button
            type="button"
            onClick={() => {
              setViewMode("history");
              setSearch("");
            }}
            className={`
              inline-flex
              items-center
              gap-2
              rounded-lg
              px-4
              py-2
              text-sm
              font-semibold
              transition
              ${
                viewMode === "history"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }
            `}
          >
            <History size={17} />
            Queue History
          </button>

        </div>

        {/* HISTORY DATE */}

        {viewMode === "history" && (
          <div className="flex items-center gap-3">

            <label className="text-sm font-semibold text-slate-600">
              Date
            </label>

            <input
              type="date"
              value={selectedDate}
              max={todayString}
              onChange={(e) =>
                setSelectedDate(
                  e.target.value
                )
              }
              className="
                h-10
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-3
                text-sm
                font-medium
                text-slate-700
                outline-none
                transition
                focus:border-blue-400
                focus:bg-white
                focus:ring-4
                focus:ring-blue-500/10
              "
            />

          </div>
        )}

      </div>

      {/* =================================================
          SELECTED HISTORY INFO
      ================================================= */}

      {viewMode === "history" && (
        <div
          className="
            flex
            items-center
            gap-3
            rounded-2xl
            border
            border-blue-100
            bg-blue-50/70
            px-5
            py-4
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-blue-100
              text-blue-600
            "
          >
            <History size={19} />
          </div>

          <div>
            <p className="text-sm font-bold text-slate-800">
              Queue History
            </p>

            <p className="text-xs text-slate-500">
              Showing queue records for{" "}
              <span className="font-semibold text-blue-600">
                {historyDateLabel}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title={
            viewMode === "today"
              ? "Patients Today"
              : "Total Queue"
          }
          value={patientsToday.length}
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />

        <StatCard
          title="Waiting"
          value={waitingPatients.length}
          icon={Clock3}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />

        <StatCard
          title="In Consultation"
          value={inConsultation.length}
          icon={Activity}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />

        <StatCard
          title="Completed"
          value={completedPatients.length}
          icon={Stethoscope}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />

      </div>

      {/* =================================================
          MAIN CARD
      ================================================= */}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* =================================================
            CARD HEADER
        ================================================= */}

        <div
          className="
            flex
            flex-col
            gap-4
            border-b
            border-slate-100
            p-6
            lg:flex-row
            lg:items-center
            lg:justify-between
          "
        >

          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {viewMode === "today"
                ? "Patients Today"
                : "Queue History"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {viewMode === "today"
                ? "Patients registered and waiting for nursing assessment."
                : `Queue records for ${historyDateLabel}.`}
            </p>
          </div>

          {/* SEARCH */}

          <div className="relative w-full lg:w-80">

            <Search
              size={18}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search patient..."
              className="
                h-11
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                pl-10
                pr-4
                text-sm
                text-slate-700
                outline-none
                transition
                focus:border-blue-400
                focus:bg-white
                focus:ring-4
                focus:ring-blue-500/10
              "
            />

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mx-6 mt-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1200px]">

            <thead>

              <tr className="border-b border-slate-100 bg-slate-50/70">

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Patient
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Patient ID
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Patient No.
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Queue
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Visit
                </th>

                {viewMode === "history" && (
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                    Service
                  </th>
                )}

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Gender
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Time
                </th>

                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                  Action
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan={
                      viewMode === "history"
                        ? 10
                        : 9
                    }
                    className="px-6 py-16 text-center"
                  >

                    <div className="flex flex-col items-center">

                      <RefreshCw
                        size={28}
                        className="animate-spin text-blue-500"
                      />

                      <p className="mt-4 text-sm font-semibold text-slate-600">
                        Loading queue...
                      </p>

                    </div>

                  </td>

                </tr>

              ) : filteredPatients.length > 0 ? (

                filteredPatients.map(
                  (patient) => (

                    <tr
                      key={patient.queueId}
                      className="
                        border-b
                        border-slate-100
                        transition
                        hover:bg-slate-50/70
                      "
                    >

                      {/* PATIENT */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div
                            className="
                              flex
                              h-10
                              w-10
                              items-center
                              justify-center
                              rounded-full
                              bg-blue-100
                              text-sm
                              font-bold
                              text-blue-700
                            "
                          >
                            {getInitials(patient)}
                          </div>

                          <div>

                            <p className="font-semibold text-slate-800">
                              {getFullName(patient)}
                            </p>

                            <p className="text-xs text-slate-400">
                              {patient.phone ||
                                "No phone"}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* PATIENT ID */}

                      <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                        {patient.patientId || "—"}
                      </td>

                      {/* PATIENT NUMBER */}

                      <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                        {patient.patientNumber || "—"}
                      </td>

                      {/* QUEUE */}

                      <td className="px-6 py-4 text-sm font-semibold text-slate-700">
                        {patient.queueNumber || "—"}
                      </td>

                      {/* VISIT */}

                      <td className="px-6 py-4 text-sm font-semibold text-indigo-600">
                        {patient.visitNumber || "—"}
                      </td>

                      {/* SERVICE - HISTORY ONLY */}

                      {viewMode === "history" && (
                        <td className="px-6 py-4">

                          <ServiceBadge
                            service={
                              patient.service
                            }
                          />

                        </td>
                      )}

                      {/* GENDER */}

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {patient.gender || "—"}
                      </td>

                      {/* TIME */}

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {patient.registeredTime || "—"}
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">

                        <StatusBadge
                          status={
                            patient.queueStatus
                          }
                        />

                      </td>

                      {/* ACTION */}

                      <td className="px-6 py-4">

                        <div className="flex justify-end gap-2">

                          {/* VIEW PATIENT */}

                          <Link
                            to={`/reception/patients/${patient.patientId}`}
                            className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-lg
                              border
                              border-slate-200
                              bg-white
                              text-slate-500
                              transition
                              hover:border-blue-200
                              hover:bg-blue-50
                              hover:text-blue-600
                            "
                            title="View Patient"
                          >
                            <Eye size={17} />
                          </Link>

                          {/* VITALS */}

                          {patient.visitId &&
                            viewMode === "today" &&
                            patient.service ===
                              "NURSE" && (
                              <Link
                                to={`/nurse/patients/${patient.patientId}/vitals?visitId=${patient.visitId}`}
                                className="
                                  flex
                                  items-center
                                  gap-2
                                  rounded-lg
                                  bg-blue-600
                                  px-3
                                  py-2
                                  text-xs
                                  font-bold
                                  text-white
                                  transition
                                  hover:bg-blue-700
                                "
                              >
                                <ClipboardPlus
                                  size={16}
                                />

                                Vitals
                              </Link>
                            )}

                        </div>

                      </td>

                    </tr>

                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan={
                      viewMode === "history"
                        ? 10
                        : 9
                    }
                    className="px-6 py-16 text-center"
                  >

                    <div
                      className="
                        mx-auto
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-full
                        bg-slate-100
                      "
                    >
                      {viewMode === "history" ? (
                        <History
                          size={24}
                          className="text-slate-400"
                        />
                      ) : (
                        <Users
                          size={24}
                          className="text-slate-400"
                        />
                      )}
                    </div>

                    <h3 className="mt-4 text-base font-bold text-slate-700">
                      {viewMode === "history"
                        ? "No queue history found"
                        : "No patients found"}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      {viewMode === "history"
                        ? "Hakuna queue iliyopatikana kwa tarehe uliyochagua."
                        : "There are no patients matching your search today."}
                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

// =====================================================
// STAT CARD
// =====================================================

function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-800">
            {value}
          </p>

        </div>

        <div
          className={`
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-xl
            ${iconBg}
          `}
        >

          <Icon
            size={23}
            className={iconColor}
          />

        </div>

      </div>

    </div>
  );
}

// =====================================================
// STATUS BADGE
// =====================================================

function StatusBadge({ status }) {
  const currentStatus =
    status || "Waiting";

  const styles = {
    Waiting:
      "bg-amber-50 text-amber-700 ring-1 ring-amber-200",

    "In Consultation":
      "bg-purple-50 text-purple-700 ring-1 ring-purple-200",

    "Sent to Doctor":
      "bg-blue-50 text-blue-700 ring-1 ring-blue-200",

    "Laboratory Pending":
      "bg-orange-50 text-orange-700 ring-1 ring-orange-200",

    "Laboratory Completed":
      "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200",

    "Returned to Doctor":
      "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",

    "Pharmacy Pending":
      "bg-violet-50 text-violet-700 ring-1 ring-violet-200",

    "Pharmacy Completed":
      "bg-purple-50 text-purple-700 ring-1 ring-purple-200",

    "Injection Pending":
      "bg-pink-50 text-pink-700 ring-1 ring-pink-200",

    "Injection Completed":
      "bg-rose-50 text-rose-700 ring-1 ring-rose-200",

    Completed:
      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  };

  return (
    <span
      className={`
        inline-flex
        rounded-full
        px-3
        py-1
        text-xs
        font-bold
        ${
          styles[currentStatus] ||
          "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
        }
      `}
    >
      {currentStatus}
    </span>
  );
}

// =====================================================
// SERVICE BADGE
// =====================================================

function ServiceBadge({ service }) {
  const currentService =
    service || "—";

  const styles = {
    NURSE:
      "bg-blue-50 text-blue-700 ring-1 ring-blue-200",

    DOCTOR:
      "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",

    LABORATORY:
      "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200",

    PHARMACY:
      "bg-purple-50 text-purple-700 ring-1 ring-purple-200",

    INJECTION:
      "bg-pink-50 text-pink-700 ring-1 ring-pink-200",

    COMPLETED:
      "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  };

  const labels = {
    NURSE: "Nurse",
    DOCTOR: "Doctor",
    LABORATORY: "Laboratory",
    PHARMACY: "Pharmacy",
    INJECTION: "Injection",
    COMPLETED: "Completed",
  };

  return (
    <span
      className={`
        inline-flex
        rounded-full
        px-3
        py-1
        text-xs
        font-bold
        ${
          styles[currentService] ||
          "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
        }
      `}
    >
      {labels[currentService] ||
        currentService}
    </span>
  );
}