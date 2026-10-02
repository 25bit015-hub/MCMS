import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Stethoscope,
  User,
  Clock,
  CalendarDays,
  Activity,
  ArrowRight,
  Eye,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import api from "../../services/api";

export default function DoctorQueue() {
  const navigate = useNavigate();

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  // =========================================================
  // LOAD DOCTOR QUEUE
  // =========================================================

  const loadDoctorQueue = async (
    showRefreshLoader = false
  ) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response =
        await api.get("/patient-queue/doctor");

      const data = Array.isArray(response.data) ? response.data: [];
      console.log("DOCTOR QUEUE DATA:", data);
      setQueue(data);
    } catch (error) {
      console.error(
        "Failed to load doctor queue:",
        error
      );

      if (error.response?.status === 401) {
        setError(
          "Session yako imeisha. Tafadhali login tena."
        );
      } else {
        setError(
          error.response?.data?.message ||
            "Imeshindikana kupata Doctor Queue."
        );
      }

      setQueue([]);

    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadDoctorQueue();
  }, []);

  // =========================================================
  // NORMALIZE QUEUE
  // =========================================================

  const normalizedQueue = useMemo(() => {
    return queue.map((item) => ({
      ...item,

      fullName:
        `${item.firstName || ""} ${
          item.lastName || ""
        }`
          .replace(/\s+/g, " ")
          .trim(),

      patientNo:
        item.patientNumber || "—",

      queueNo:
        item.queueNumber || "—",

      visitNo:
        item.visitNumber || "—",

      status:
        item.status || "—",

      service:
        item.service || "—",
    }));
  }, [queue]);

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredQueue = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    if (!keyword) {
      return normalizedQueue;
    }

    return normalizedQueue.filter(
      (patient) => {

        const searchableText = [
          patient.fullName,
          patient.patientId,
          patient.patientNo,
          patient.queueNo,
          patient.visitNo,
          patient.phone,
          patient.status,
        ]
          .filter(
            (value) =>
              value !== null &&
              value !== undefined
          )
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          keyword
        );
      }
    );
  }, [normalizedQueue, search]);

  // =========================================================
  // STATS
  // =========================================================

  const stats = useMemo(() => {

    const total =
      normalizedQueue.length;

    const waiting =
      normalizedQueue.filter(
        (item) =>
          item.status ===
          "SENT_TO_DOCTOR"
      ).length;

    const returned =
      normalizedQueue.filter(
        (item) =>
          item.status ===
          "RETURNED_TO_DOCTOR"
      ).length;

    return {
      total,
      waiting,
      returned,
    };

  }, [normalizedQueue]);

  // =========================================================
  // START CONSULTATION
  // =========================================================

  const handleStartConsultation = (
    patient
  ) => {

    if (!patient.patientId) {
      return;
    }

    if (!patient.visitId) {
      alert(
        "Visit ID ya mgonjwa huyu haijapatikana."
      );
      return;
    }

    navigate(
      `/doctor/patients/${patient.patientId}/consultation?visitId=${patient.visitId}`
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

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

          <p
            className="
              mt-4 text-sm font-medium
              text-slate-500
            "
          >
            Inapakia Doctor Queue...
          </p>

        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="
          flex flex-col gap-4
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >

        <div className="flex items-center gap-4">

          <div
            className="
              flex h-14 w-14
              items-center justify-center
              rounded-2xl
              bg-blue-100
            "
          >
            <Stethoscope
              size={28}
              className="text-blue-600"
            />
          </div>

          <div>

            <p
              className="
                text-sm font-semibold
                text-blue-600
              "
            >
              Doctor Module
            </p>

            <h1
              className="
                text-2xl font-bold
                text-slate-800
              "
            >
              Doctor Queue
            </h1>

            <p
              className="
                mt-1 text-sm
                text-slate-500
              "
            >
              Wagonjwa waliotumwa kwa daktari
              kwa huduma ya leo.
            </p>

          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            loadDoctorQueue(true)
          }
          disabled={refreshing}
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            border border-slate-200
            bg-white
            px-5 py-3
            text-sm font-bold
            text-slate-700
            shadow-sm
            transition
            hover:bg-slate-50
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
            ? "Inapakia..."
            : "Refresh"}

        </button>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

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

      {/* =====================================================
          STAT CARDS
      ===================================================== */}

      <div
        className="
          grid grid-cols-1
          gap-4
          sm:grid-cols-2
          lg:grid-cols-3
        "
      >

        <StatCard
          label="Total Doctor Queue"
          value={stats.total}
          icon={User}
        />

        <StatCard
          label="Sent to Doctor"
          value={stats.waiting}
          icon={Stethoscope}
        />

        <StatCard
          label="Returned to Doctor"
          value={stats.returned}
          icon={Activity}
        />

      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div
        className="
          rounded-2xl
          border border-slate-200
          bg-white
          p-5
          shadow-sm
        "
      >

        <div className="relative">

          <Search
            size={19}
            className="
              absolute
              left-4 top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="
              Tafuta kwa jina, Patient No.,
              Queue No., Visit No. au simu...
            "
            className="
              w-full
              rounded-xl
              border border-slate-200
              bg-slate-50
              py-3
              pl-11 pr-4
              text-sm
              text-slate-700
              outline-none
              transition
              focus:border-blue-400
              focus:bg-white
              focus:ring-4
              focus:ring-blue-100
            "
          />

        </div>
      </div>

      {/* =====================================================
          QUEUE TABLE
      ===================================================== */}

      <div
        className="
          overflow-hidden
          rounded-2xl
          border border-slate-200
          bg-white
          shadow-sm
        "
      >

        <div
          className="
            flex flex-col gap-2
            border-b border-slate-100
            px-6 py-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <div>

            <h2
              className="
                text-lg font-bold
                text-slate-800
              "
            >
              Patients Waiting for Doctor
            </h2>

            <p
              className="
                mt-1 text-sm
                text-slate-500
              "
            >
              {filteredQueue.length} patient
              {filteredQueue.length !== 1
                ? "s"
                : ""}{" "}
              kwenye queue.
            </p>

          </div>

          <div
            className="
              inline-flex
              items-center gap-2
              rounded-full
              bg-blue-50
              px-4 py-2
              text-xs font-bold
              text-blue-700
            "
          >
            <CalendarDays size={15} />
            Leo
          </div>

        </div>

        {filteredQueue.length === 0 ? (

          <div
            className="
              flex min-h-[300px]
              items-center
              justify-center
              px-6
            "
          >

            <div className="text-center">

              <div
                className="
                  mx-auto
                  flex h-16 w-16
                  items-center justify-center
                  rounded-full
                  bg-slate-100
                "
              >
                <Stethoscope
                  size={28}
                  className="text-slate-400"
                />
              </div>

              <h3
                className="
                  mt-4
                  text-lg font-bold
                  text-slate-700
                "
              >
                Hakuna wagonjwa
              </h3>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Hakuna wagonjwa wanaosubiri
                daktari kwa sasa.
              </p>

            </div>
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table
              className="
                min-w-[1100px]
                w-full
                text-left
              "
            >

              <thead
                className="
                  border-b
                  border-slate-200
                  bg-slate-50
                "
              >

                <tr>

                  <th
                    className="
                      px-6 py-4
                      text-xs font-bold
                      uppercase
                      tracking-wide
                      text-slate-500
                    "
                  >
                    Patient
                  </th>

                  <th
                    className="
                      px-6 py-4
                      text-xs font-bold
                      uppercase
                      tracking-wide
                      text-slate-500
                    "
                  >
                    Patient No.
                  </th>

                  <th
                    className="
                      px-6 py-4
                      text-xs font-bold
                      uppercase
                      tracking-wide
                      text-slate-500
                    "
                  >
                    Queue
                  </th>

                  <th
                    className="
                      px-6 py-4
                      text-xs font-bold
                      uppercase
                      tracking-wide
                      text-slate-500
                    "
                  >
                    Visit
                  </th>

                  <th
                    className="
                      px-6 py-4
                      text-xs font-bold
                      uppercase
                      tracking-wide
                      text-slate-500
                    "
                  >
                    Gender
                  </th>

                  <th
                    className="
                      px-6 py-4
                      text-xs font-bold
                      uppercase
                      tracking-wide
                      text-slate-500
                    "
                  >
                    Time
                  </th>

                  <th
                    className="
                      px-6 py-4
                      text-xs font-bold
                      uppercase
                      tracking-wide
                      text-slate-500
                    "
                  >
                    Status
                  </th>

                  <th
                    className="
                      px-6 py-4
                      text-right
                      text-xs font-bold
                      uppercase
                      tracking-wide
                      text-slate-500
                    "
                  >
                    Action
                  </th>

                </tr>

              </thead>

              <tbody
                className="
                  divide-y
                  divide-slate-100
                "
              >

                {filteredQueue.map(
                  (patient) => (

                    <tr
                      key={patient.id}
                      className="
                        transition
                        hover:bg-slate-50
                      "
                    >

                      {/* PATIENT */}

                      <td className="px-6 py-5">

                        <div
                          className="
                            flex
                            items-center gap-3
                          "
                        >

                          <div
                            className="
                              flex h-11 w-11
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              bg-blue-100
                              text-sm
                              font-bold
                              text-blue-700
                            "
                          >
                            {patient.fullName
                              .split(" ")
                              .filter(Boolean)
                              .slice(0, 2)
                              .map(
                                (name) =>
                                  name.charAt(0)
                              )
                              .join("")
                              .toUpperCase()}
                          </div>

                          <div>

                            <p
                              className="
                                font-bold
                                text-slate-800
                              "
                            >
                              {patient.fullName}
                            </p>

                            <p
                              className="
                                mt-0.5
                                text-xs
                                text-slate-500
                              "
                            >
                              ID:{" "}
                              {patient.patientId}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* PATIENT NUMBER */}

                      <td
                        className="
                          px-6 py-5
                          text-sm
                          font-semibold
                          text-slate-700
                        "
                      >
                        {patient.patientNo}
                      </td>

                      {/* QUEUE */}

                      <td className="px-6 py-5">

                        <span
                          className="
                            inline-flex
                            rounded-lg
                            bg-slate-100
                            px-3 py-1.5
                            text-xs
                            font-bold
                            text-slate-700
                          "
                        >
                          {patient.queueNo}
                        </span>

                      </td>

                      {/* VISIT */}

                      <td className="px-6 py-5">

                        {patient.visitId ? (

                          <span
                            className="
                              inline-flex
                              rounded-lg
                              bg-purple-50
                              px-3 py-1.5
                              text-xs
                              font-bold
                              text-purple-700
                            "
                          >
                            {patient.visitNo}
                          </span>

                        ) : (

                          <span
                            className="
                              text-sm
                              text-slate-400
                            "
                          >
                            —
                          </span>

                        )}

                      </td>

                      {/* GENDER */}

                      <td
                        className="
                          px-6 py-5
                          text-sm
                          text-slate-600
                        "
                      >
                        {patient.gender || "—"}
                      </td>

                      {/* TIME */}

                      <td className="px-6 py-5">

                        <div
                          className="
                            flex
                            items-center gap-2
                            text-sm
                            text-slate-600
                          "
                        >

                          <Clock
                            size={16}
                            className="text-slate-400"
                          />

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

                        </div>

                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-5">

                        <StatusBadge
                          status={
                            patient.status
                          }
                        />

                      </td>

                      {/* ACTION */}

                      <td className="px-6 py-5">

                        <div
                          className="
                            flex
                            items-center
                            justify-end
                            gap-2
                          "
                        >

                          <Link
                            to={`/reception/patients/${patient.patientId}`}
                            className="
                              inline-flex
                              items-center
                              justify-center
                              rounded-lg
                              border
                              border-slate-200
                              bg-white
                              p-2.5
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

                          <button
                            type="button"
                            onClick={() =>
                              handleStartConsultation(
                                patient
                              )
                            }
                            className="
                              inline-flex
                              items-center
                              gap-2
                              rounded-lg
                              bg-blue-600
                              px-4 py-2.5
                              text-xs
                              font-bold
                              text-white
                              transition
                              hover:bg-blue-700
                            "
                          >

                            <Stethoscope
                              size={16}
                            />

                            Start Consultation

                            <ArrowRight
                              size={15}
                            />

                          </button>

                        </div>

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

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  label,
  value,
  icon: Icon,
}) {
  return (
    <div
      className="
        rounded-2xl
        border border-slate-200
        bg-white
        p-5
        shadow-sm
      "
    >

      <div
        className="
          flex
          items-center
          justify-between
        "
      >

        <div>

          <p
            className="
              text-sm font-medium
              text-slate-500
            "
          >
            {label}
          </p>

          <p
            className="
              mt-2
              text-3xl font-bold
              text-slate-800
            "
          >
            {value}
          </p>

        </div>

        <div
          className="
            flex h-12 w-12
            items-center
            justify-center
            rounded-xl
            bg-blue-50
          "
        >
          <Icon
            size={23}
            className="text-blue-600"
          />
        </div>

      </div>
    </div>
  );
}

// =========================================================
// STATUS BADGE
// =========================================================

function StatusBadge({
  status,
}) {

  const isReturned =
    status ===
    "RETURNED_TO_DOCTOR";

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        px-3 py-1.5
        text-xs
        font-bold
        ${
          isReturned
            ? "bg-amber-50 text-amber-700"
            : "bg-blue-50 text-blue-700"
        }
      `}
    >
      {isReturned
        ? "Returned to Doctor"
        : "Sent to Doctor"}
    </span>
  );
}