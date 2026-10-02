import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Search,
  Stethoscope,
  UserRound,
  ArrowRight,
  FlaskConical,
  RefreshCw,
} from "lucide-react";

import api from "../../services/api";

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // GET TODAY'S DATE
  // ==========================================

  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ==========================================
  // LOAD DOCTOR QUEUE
  // ==========================================

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const today = getTodayDate();

      const response = await api.get(
        `/patient-queue/date?date=${today}`
      );

      const queueData = Array.isArray(
        response.data
      )
        ? response.data
        : [];

      // ==========================================
      // ONLY PATIENTS FOR DOCTOR
      // ==========================================

      const doctorPatients = queueData
        .filter(
          (queue) =>
            queue.service === "DOCTOR" &&
            (
              queue.status ===
                "SENT_TO_DOCTOR" ||
              queue.status ===
                "IN_CONSULTATION" ||
              queue.status ===
                "RETURNED_TO_DOCTOR"
            )
        )
        .map((queue) => ({
          queueId: queue.id,

          patientId: queue.patientId,

          // IMPORTANT:
          // Keep Visit ID so every doctor action
          // stays connected to the correct visit.
          visitId: queue.visitId,

          patientNumber:
            queue.patientNumber || "",

          firstName:
            queue.firstName || "",

          lastName:
            queue.lastName || "",

          gender:
            queue.gender || "",

          phone:
            queue.phone || "",

          queueNumber:
            queue.queueNumber || "",

          queueDate:
            queue.queueDate || "",

          checkInTime:
            queue.checkInTime || "",

          service:
            queue.service || "DOCTOR",

          queueStatus:
            queue.status,

          name:
            `${queue.firstName || ""} ${
              queue.lastName || ""
            }`
              .replace(/\s+/g, " ")
              .trim(),
        }));

      setPatients(doctorPatients);

    } catch (error) {
      console.error(
        "Failed to load doctor queue:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Imeshindikana kupata Doctor Queue ya leo."
      );

    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD ON PAGE OPEN
  // ==========================================

  useEffect(() => {
    loadPatients();
  }, []);

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredPatients = useMemo(() => {
    const keyword =
      search.toLowerCase().trim();

    if (!keyword) {
      return patients;
    }

    return patients.filter(
      (patient) =>
        patient.name
          .toLowerCase()
          .includes(keyword) ||

        patient.patientNumber
          .toLowerCase()
          .includes(keyword) ||

        patient.queueNumber
          .toLowerCase()
          .includes(keyword) ||

        String(patient.patientId)
          .toLowerCase()
          .includes(keyword) ||

        String(patient.phone || "")
          .toLowerCase()
          .includes(keyword)
    );
  }, [patients, search]);

  // ==========================================
  // COUNTS
  // ==========================================

  const sentCount =
    patients.filter(
      (patient) =>
        patient.queueStatus ===
        "SENT_TO_DOCTOR"
    ).length;

  const consultationCount =
    patients.filter(
      (patient) =>
        patient.queueStatus ===
        "IN_CONSULTATION"
    ).length;

  const returnedCount =
    patients.filter(
      (patient) =>
        patient.queueStatus ===
        "RETURNED_TO_DOCTOR"
    ).length;

  // ==========================================
  // START CONSULTATION
  // ==========================================

  const handleStartConsultation =
    async (patient) => {
      try {
        setError("");

        // Make sure Visit ID exists
        if (!patient.visitId) {
          setError(
            "Visit ID ya mgonjwa haijapatikana."
          );
          return;
        }

        await api.patch(
          `/patient-queue/${patient.queueId}/status`,
          null,
          {
            params: {
              status:
                "IN_CONSULTATION",
            },
          }
        );

        // Open consultation with correct Visit ID
        window.location.href =
          `/doctor/patients/${patient.patientId}/consultation?visitId=${patient.visitId}`;

      } catch (error) {
        console.error(
          "Failed to start consultation:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Imeshindikana kuanza consultation ya mgonjwa."
        );
      }
    };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">

        <div className="text-center">

          <div
            className="
              mx-auto h-12 w-12
              animate-spin rounded-full
              border-4 border-slate-200
              border-t-blue-600
            "
          />

          <p className="mt-4 text-sm font-medium text-slate-500">
            Inapakia Doctor Queue...
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="space-y-7">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div>

          <p className="text-sm font-medium text-blue-600">
            Doctor
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Doctor Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage today's patients, consultations
            and laboratory results.
          </p>

        </div>

        <button
          type="button"
          onClick={loadPatients}
          className="
            inline-flex items-center
            justify-center gap-2
            rounded-xl
            border border-slate-200
            bg-white
            px-4 py-2.5
            text-sm font-semibold
            text-slate-700
            shadow-sm
            transition
            hover:bg-slate-50
          "
        >
          <RefreshCw size={17} />

          Refresh
        </button>

      </div>

      {/* ==========================================
          ERROR
      ========================================== */}

      {error && (
        <div
          className="
            rounded-xl
            border border-red-200
            bg-red-50
            px-5 py-4
            text-sm font-medium
            text-red-700
          "
        >
          {error}
        </div>
      )}

      {/* ==========================================
          STATS
      ========================================== */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

        <StatCard
          title="Patients Sent"
          value={sentCount}
          icon={UserRound}
          description="Patients waiting for consultation"
          iconClass="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="In Consultation"
          value={consultationCount}
          icon={Stethoscope}
          description="Currently with doctor"
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Returned to Doctor"
          value={returnedCount}
          icon={FlaskConical}
          description="Patients returned from laboratory"
          iconClass="bg-emerald-50 text-emerald-600"
        />

      </div>

      {/* ==========================================
          SEARCH
      ========================================== */}

      <div
        className="
          rounded-2xl
          border border-slate-200/80
          bg-white
          p-5
          shadow-sm
        "
      >

        <div className="relative">

          <Search
            size={19}
            className="
              absolute left-4 top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search patient by name, patient number, queue number or phone..."
            className="
              h-12 w-full
              rounded-xl
              border border-slate-200
              bg-slate-50
              pl-11 pr-4
              text-sm text-slate-700
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

      {/* ==========================================
          DOCTOR QUEUE
      ========================================== */}

      <div
        className="
          overflow-hidden
          rounded-2xl
          border border-slate-200/80
          bg-white
          shadow-sm
        "
      >

        <div
          className="
            border-b
            border-slate-100
            px-6 py-5
          "
        >

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-lg font-bold text-slate-900">
                Today's Doctor Queue
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Patients sent by the nurse for
                doctor consultation today.
              </p>

            </div>

            <div
              className="
                rounded-lg
                bg-blue-50
                px-3 py-1.5
                text-sm font-semibold
                text-blue-600
              "
            >
              {filteredPatients.length} Patients
            </div>

          </div>

        </div>

        {/* ==========================================
            EMPTY
        ========================================== */}

        {filteredPatients.length === 0 ? (

          <EmptyState />

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1000px]">

              <thead>

                <tr
                  className="
                    border-b
                    border-slate-100
                    bg-slate-50/70
                  "
                >

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Patient
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Patient No.
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Queue No.
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Check In
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredPatients.map(
                  (patient) => (

                    <tr
                      key={patient.queueId}
                      className="
                        transition
                        hover:bg-slate-50/70
                      "
                    >

                      {/* PATIENT */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          <div
                            className="
                              flex h-11 w-11
                              items-center justify-center
                              rounded-full
                              bg-blue-50
                              font-bold
                              text-blue-600
                            "
                          >
                            {patient.name
                              .split(" ")
                              .map(
                                (word) =>
                                  word[0]
                              )
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>

                          <div>

                            <p className="font-semibold text-slate-800">
                              {patient.name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {patient.gender ||
                                "—"}{" "}
                              •{" "}
                              {patient.phone ||
                                "No phone"}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* PATIENT NUMBER */}

                      <td className="px-6 py-5">

                        <span
                          className="
                            text-sm
                            font-semibold
                            text-slate-700
                          "
                        >
                          {patient.patientNumber ||
                            "—"}
                        </span>

                      </td>

                      {/* QUEUE NUMBER */}

                      <td className="px-6 py-5">

                        <span
                          className="
                            rounded-lg
                            bg-slate-100
                            px-3 py-1.5
                            text-sm
                            font-semibold
                            text-slate-700
                          "
                        >
                          {patient.queueNumber ||
                            "—"}
                        </span>

                      </td>

                      {/* CHECK IN */}

                      <td className="px-6 py-5 text-sm text-slate-600">

                        {patient.checkInTime
                          ? new Date(
                              patient.checkInTime
                            ).toLocaleTimeString(
                              "en-GB",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "—"}

                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-5">

                        <StatusBadge
                          status={
                            patient.queueStatus
                          }
                        />

                      </td>

                      {/* ACTION */}

                      <td className="px-6 py-5 text-right">

                        {/* SENT TO DOCTOR */}

                        {patient.queueStatus ===
                          "SENT_TO_DOCTOR" && (

                          <button
                            type="button"
                            onClick={() =>
                              handleStartConsultation(
                                patient
                              )
                            }
                            className="
                              inline-flex
                              items-center gap-2
                              rounded-xl
                              bg-blue-600
                              px-4 py-2.5
                              text-sm
                              font-semibold
                              text-white
                              transition
                              hover:bg-blue-700
                            "
                          >
                            Start Consultation

                            <ArrowRight
                              size={16}
                            />

                          </button>

                        )}

                        {/* IN CONSULTATION */}

                        {patient.queueStatus ===
                          "IN_CONSULTATION" && (

                          <Link
                            to={`/doctor/patients/${patient.patientId}/consultation?visitId=${patient.visitId}`}
                            className="
                              inline-flex
                              items-center gap-2
                              rounded-xl
                              bg-blue-600
                              px-4 py-2.5
                              text-sm
                              font-semibold
                              text-white
                              transition
                              hover:bg-blue-700
                            "
                          >
                            Continue

                            <ArrowRight
                              size={16}
                            />

                          </Link>

                        )}

                        {/* RETURNED FROM LABORATORY */}

                        {patient.queueStatus ===
                          "RETURNED_TO_DOCTOR" && (

                          <Link
                            to={`/doctor/patients/${patient.patientId}/consultation?visitId=${patient.visitId}`}
                            className="
                              inline-flex
                              items-center gap-2
                              rounded-xl
                              bg-emerald-600
                              px-4 py-2.5
                              text-sm
                              font-semibold
                              text-white
                              transition
                              hover:bg-emerald-700
                            "
                          >
                            Review Results

                            <FlaskConical
                              size={16}
                            />

                          </Link>

                        )}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

// ==========================================
// STAT CARD
// ==========================================

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  iconClass,
}) {
  return (
    <div
      className="
        rounded-2xl
        border border-slate-200/80
        bg-white
        p-5
        shadow-sm
      "
    >

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>

        </div>

        <div
          className={`
            flex h-11 w-11
            items-center justify-center
            rounded-xl
            ${iconClass}
          `}
        >
          <Icon size={21} />
        </div>

      </div>

    </div>
  );
}

// ==========================================
// STATUS BADGE
// ==========================================

function StatusBadge({ status }) {
  const styles = {
    SENT_TO_DOCTOR:
      "border-purple-200 bg-purple-50 text-purple-700",

    IN_CONSULTATION:
      "border-blue-200 bg-blue-50 text-blue-700",

    RETURNED_TO_DOCTOR:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  const labels = {
    SENT_TO_DOCTOR:
      "Sent to Doctor",

    IN_CONSULTATION:
      "In Consultation",

    RETURNED_TO_DOCTOR:
      "Returned to Doctor",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        border
        px-3 py-1.5
        text-xs
        font-semibold
        ${
          styles[status] ||
          "border-slate-200 bg-slate-50 text-slate-600"
        }
      `}
    >
      {labels[status] || status || "Waiting"}
    </span>
  );
}

// ==========================================
// EMPTY STATE
// ==========================================

function EmptyState() {
  return (
    <div className="px-6 py-16 text-center">

      <div
        className="
          mx-auto
          flex h-16 w-16
          items-center justify-center
          rounded-2xl
          bg-slate-100
        "
      >
        <Stethoscope
          size={28}
          className="text-slate-400"
        />
      </div>

      <h3 className="mt-4 text-base font-bold text-slate-800">
        No patients in doctor queue
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        Patients sent by the nurse will appear here.
      </p>

    </div>
  );
}