import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Search,
  FlaskConical,
  ArrowRight,
  History,
  Clock3,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import api from "../../services/api";

export default function LaboratoryDashboard() {
  const [queuePatients, setQueuePatients] = useState([]);
  const [laboratoryRecords, setLaboratoryRecords] = useState([]);

  const [search, setSearch] = useState("");

  const [loadingQueue, setLoadingQueue] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(true);

  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("queue");

  // ==========================================
  // TODAY
  // ==========================================
  const today = useMemo(() => {
    const date = new Date();

    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  }, []);

  // ==========================================
  // LOAD EVERYTHING
  // ==========================================
  useEffect(() => {
    loadLaboratoryQueue();
    loadLaboratoryRecords();
  }, [today]);

  // ==========================================
  // LOAD LABORATORY QUEUE
  // ==========================================
  async function loadLaboratoryQueue() {
    try {
      setLoadingQueue(true);
      setError("");

      const response = await api.get(
        `/patient-queue/date?date=${today}`
      );

      const queues = Array.isArray(response.data)
        ? response.data
        : [];

      /*
       * Only patients currently waiting
       * for Laboratory are displayed here.
       */
      const laboratoryQueue = queues
        .filter(
          (item) =>
            item.status === "LAB_PENDING"
        )
        .map((item) => ({
          ...item,

          name: [
            item.firstName,
            item.middleName,
            item.lastName,
          ]
            .filter(Boolean)
            .join(" ")
            .replace(/\s+/g, " ")
            .trim(),
        }));

      setQueuePatients(laboratoryQueue);
    } catch (err) {
      console.error(
        "Laboratory queue error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Imeshindikana kupata Laboratory Queue."
      );

      setQueuePatients([]);
    } finally {
      setLoadingQueue(false);
    }
  }

  // ==========================================
  // LOAD LABORATORY RECORDS
  // ==========================================
  async function loadLaboratoryRecords() {
    try {
      setLoadingRecords(true);

      /*
       * IMPORTANT:
       *
       * Hapa hatutumii /patients tena.
       *
       * Laboratory inapaswa kutumia data yake
       * moja kwa moja kutoka laboratory-results.
       *
       * Hii inaondoa 403 ya:
       *
       * GET /api/patients
       *
       * ambayo ni Reception endpoint.
       */

      const response = await api.get(
        "/laboratory-results"
      );

      const results = Array.isArray(response.data)
        ? response.data
        : [];

      /*
       * Backend laboratory result response
       * ndiyo source ya records.
       *
       * Kama backend tayari inarudisha patientName,
       * patientNumber, phone, visitNumber n.k.
       * tutatumia hizo values moja kwa moja.
       */
      const records = results
        .map((result) => ({
          ...result,

          patientName:
            result.patientName ||
            [
              result.firstName,
              result.middleName,
              result.lastName,
            ]
              .filter(Boolean)
              .join(" ")
              .replace(/\s+/g, " ")
              .trim(),

          patientPhone:
            result.patientPhone ||
            result.phone ||
            "",

          patientNumber:
            result.patientNumber ||
            "",

          visitNumber:
            result.visitNumber ||
            "",

          queueNumber:
            result.queueNumber ||
            "",
        }))
        .sort((a, b) => {
          const dateA = new Date(
            a.performedAt || a.createdAt || 0
          ).getTime();

          const dateB = new Date(
            b.performedAt || b.createdAt || 0
          ).getTime();

          return dateB - dateA;
        });

      setLaboratoryRecords(records);
    } catch (err) {
      console.error(
        "Laboratory records error:",
        err
      );

      console.error(
        "Laboratory records status:",
        err.response?.status
      );

      console.error(
        "Laboratory records data:",
        err.response?.data
      );

      /*
       * Records error is kept separate from
       * Laboratory Queue error.
       */
      setLaboratoryRecords([]);
    } finally {
      setLoadingRecords(false);
    }
  }

  // ==========================================
  // REFRESH
  // ==========================================
  async function refreshLaboratory() {
    await Promise.all([
      loadLaboratoryQueue(),
      loadLaboratoryRecords(),
    ]);
  }

  // ==========================================
  // QUEUE SEARCH
  // ==========================================
  const filteredQueuePatients = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return queuePatients;
    }

    return queuePatients.filter(
      (patient) =>
        String(patient.name || "")
          .toLowerCase()
          .includes(keyword) ||
        String(patient.patientNumber || "")
          .toLowerCase()
          .includes(keyword) ||
        String(patient.phone || "")
          .toLowerCase()
          .includes(keyword) ||
        String(patient.queueNumber || "")
          .toLowerCase()
          .includes(keyword) ||
        String(patient.visitNumber || "")
          .toLowerCase()
          .includes(keyword)
    );
  }, [queuePatients, search]);

  // ==========================================
  // RECORD SEARCH
  // ==========================================
  const filteredRecords = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return laboratoryRecords;
    }

    return laboratoryRecords.filter(
      (record) =>
        String(record.patientName || "")
          .toLowerCase()
          .includes(keyword) ||
        String(record.patientNumber || "")
          .toLowerCase()
          .includes(keyword) ||
        String(record.queueNumber || "")
          .toLowerCase()
          .includes(keyword) ||
        String(record.visitNumber || "")
          .toLowerCase()
          .includes(keyword) ||
        String(record.results || "")
          .toLowerCase()
          .includes(keyword)
    );
  }, [laboratoryRecords, search]);

  // ==========================================
  // INITIALS
  // ==========================================
  function getInitials(name) {
    return (
      String(name || "")
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "PT"
    );
  }

  // ==========================================
  // FORMAT DATE
  // ==========================================
  function formatDate(dateValue) {
    if (!dateValue) {
      return "—";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // ==========================================
  // FORMAT RESULT PREVIEW
  // ==========================================
  function resultPreview(result) {
    const text = String(result || "")
      .replace(/\s+/g, " ")
      .trim();

    if (!text) {
      return "No result";
    }

    if (text.length <= 80) {
      return text;
    }

    return `${text.substring(0, 80)}...`;
  }

  return (
    <div className="space-y-7">

      {/* ======================================
          HEADER
      ======================================= */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

        <div>
          <p className="text-sm font-medium text-blue-600">
            Laboratory
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Laboratory Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage laboratory requests, results and
            laboratory records.
          </p>
        </div>

        <button
          type="button"
          onClick={refreshLaboratory}
          className="
            inline-flex items-center justify-center gap-2
            rounded-xl border border-slate-200
            bg-white px-4 py-2.5
            text-sm font-semibold text-slate-700
            shadow-sm transition
            hover:bg-slate-50
          "
        >
          <RefreshCw size={17} />

          Refresh
        </button>
      </div>

      {/* ======================================
          ERROR
      ======================================= */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle
            size={20}
            className="mt-0.5 shrink-0 text-red-600"
          />

          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* ======================================
          STATS
      ======================================= */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

        <StatCard
          title="Pending Tests"
          value={queuePatients.length}
          icon={FlaskConical}
          description="Patients waiting for laboratory"
          iconClass="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Laboratory Queue"
          value={queuePatients.length}
          icon={Clock3}
          description="Current laboratory work"
          iconClass="bg-amber-50 text-amber-600"
        />

        <StatCard
          title="Laboratory Records"
          value={laboratoryRecords.length}
          icon={History}
          description="Completed laboratory results"
          iconClass="bg-emerald-50 text-emerald-600"
        />

      </div>

      {/* ======================================
          TABS
      ======================================= */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-2 shadow-sm">

        <div className="grid grid-cols-2 gap-2">

          <button
            type="button"
            onClick={() =>
              setActiveTab("queue")
            }
            className={`
              flex items-center justify-center gap-2
              rounded-xl px-4 py-3
              text-sm font-semibold
              transition
              ${
                activeTab === "queue"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }
            `}
          >
            <FlaskConical size={18} />

            Laboratory Queue

            <span
              className={`
                rounded-full px-2 py-0.5 text-xs
                ${
                  activeTab === "queue"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }
              `}
            >
              {queuePatients.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab("records")
            }
            className={`
              flex items-center justify-center gap-2
              rounded-xl px-4 py-3
              text-sm font-semibold
              transition
              ${
                activeTab === "records"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }
            `}
          >
            <History size={18} />

            Laboratory Records

            <span
              className={`
                rounded-full px-2 py-0.5 text-xs
                ${
                  activeTab === "records"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }
              `}
            >
              {laboratoryRecords.length}
            </span>
          </button>

        </div>
      </div>

      {/* ======================================
          SEARCH
      ======================================= */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">

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
            placeholder={
              activeTab === "queue"
                ? "Search patient by name, patient number, visit, queue or phone..."
                : "Search laboratory records by patient, visit, queue or result..."
            }
            className="
              h-12 w-full rounded-xl
              border border-slate-200
              bg-slate-50 pl-11 pr-4
              text-sm text-slate-700
              outline-none
              focus:border-blue-400
              focus:bg-white
              focus:ring-4
              focus:ring-blue-500/10
            "
          />

        </div>
      </div>

      {/* ======================================
          QUEUE TAB
      ======================================= */}
      {activeTab === "queue" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-5">

            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Laboratory Queue
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Patients referred by the Doctor and
                  waiting for laboratory investigation.
                </p>
              </div>

              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                <Clock3 size={14} />

                {queuePatients.length} Pending
              </span>

            </div>

          </div>

          {loadingQueue ? (
            <LoadingState
              message="Inapakia Laboratory Queue..."
            />
          ) : filteredQueuePatients.length === 0 ? (
            <EmptyState
              icon={FlaskConical}
              title="No laboratory patients"
              description={
                search
                  ? "Hakuna mgonjwa anayelingana na search yako."
                  : "Patients sent by the Doctor will appear here."
              }
            />
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px]">

                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Patient
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Queue
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Visit
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Patient Number
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Doctor Request
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

                  {filteredQueuePatients.map(
                    (patient) => (
                      <tr
                        key={patient.id}
                        className="transition hover:bg-slate-50/70"
                      >

                        {/* PATIENT */}
                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-600">
                              {getInitials(
                                patient.name
                              )}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-800">
                                {patient.name ||
                                  "Unknown Patient"}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {patient.phone ||
                                  "No phone"}
                              </p>
                            </div>

                          </div>

                        </td>

                        {/* QUEUE */}
                        <td className="px-6 py-5">

                          <span className="font-semibold text-slate-800">
                            {patient.queueNumber ||
                              "—"}
                          </span>

                          {patient.checkInTime && (
                            <p className="mt-1 text-xs text-slate-400">
                              {formatDate(
                                patient.checkInTime
                              )}
                            </p>
                          )}

                        </td>

                        {/* VISIT */}
                        <td className="px-6 py-5">

                          <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
                            {patient.visitNumber ||
                              "—"}
                          </span>

                        </td>

                        {/* PATIENT NUMBER */}
                        <td className="px-6 py-5 text-sm font-medium text-slate-600">
                          {patient.patientNumber ||
                            "—"}
                        </td>

                        {/* DOCTOR REQUEST */}
                        <td className="max-w-xs px-6 py-5 text-sm text-slate-600">

                          <div className="line-clamp-2">
                            {patient.notes ||
                              "Laboratory investigation requested"}
                          </div>

                        </td>

                        {/* STATUS */}
                        <td className="px-6 py-5">

                          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">

                            <Clock3 size={13} />

                            Lab Pending

                          </span>

                        </td>

                        {/* ACTION */}
                        <td className="px-6 py-5 text-right">

                          <Link
                            to={`/laboratory/patients/${patient.patientId}?visitId=${patient.visitId}`}
                            className="
                              inline-flex items-center gap-2
                              rounded-xl bg-blue-600 px-4 py-2.5
                              text-sm font-semibold text-white
                              transition
                              hover:bg-blue-700
                            "
                          >
                            Open Patient

                            <ArrowRight size={16} />
                          </Link>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>
      )}

      {/* ======================================
          RECORDS TAB
      ======================================= */}
      {activeTab === "records" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-5">

            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Laboratory Records
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Historical laboratory results that
                  have already been completed.
                </p>
              </div>

              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={14} />

                {laboratoryRecords.length} Records
              </span>

            </div>

          </div>

          {loadingRecords ? (
            <LoadingState
              message="Inapakia Laboratory Records..."
            />
          ) : filteredRecords.length === 0 ? (
            <EmptyState
              icon={History}
              title="No laboratory records"
              description={
                search
                  ? "Hakuna laboratory record inayolingana na search yako."
                  : "Completed laboratory results will appear here."
              }
            />
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px]">

                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Patient
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Patient Number
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Visit
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Queue
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Result
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Performed At
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredRecords.map(
                    (record) => (
                      <tr
                        key={record.id}
                        className="transition hover:bg-slate-50/70"
                      >

                        {/* PATIENT */}
                        <td className="px-6 py-5">

                          <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-50 font-bold text-emerald-600">
                              {getInitials(
                                record.patientName
                              )}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-800">
                                {record.patientName ||
                                  "Unknown Patient"}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {record.patientPhone ||
                                  "No phone"}
                              </p>
                            </div>

                          </div>

                        </td>

                        {/* PATIENT NUMBER */}
                        <td className="px-6 py-5 text-sm font-medium text-slate-600">
                          {record.patientNumber ||
                            "—"}
                        </td>

                        {/* VISIT */}
                        <td className="px-6 py-5">

                          <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700">
                            {record.visitNumber ||
                              "—"}
                          </span>

                        </td>

                        {/* QUEUE */}
                        <td className="px-6 py-5 text-sm text-slate-600">
                          {record.queueNumber ||
                            "—"}
                        </td>

                        {/* RESULT */}
                        <td className="max-w-md px-6 py-5">

                          <div className="rounded-xl bg-emerald-50 px-3 py-2">

                            <p className="line-clamp-2 text-sm font-medium text-emerald-800">
                              {resultPreview(
                                record.results
                              )}
                            </p>

                          </div>

                        </td>

                        {/* DATE */}
                        <td className="px-6 py-5 text-sm text-slate-600">
                          {formatDate(
                            record.performedAt
                          )}
                        </td>

                        {/* ACTION */}
                        <td className="px-6 py-5 text-right">

                          <Link
                            to={
                              record.visitId
                                ? `/laboratory/patients/${record.patientId}?visitId=${record.visitId}`
                                : `/laboratory/patients/${record.patientId}`
                            }
                            className="
                              inline-flex items-center gap-2
                              rounded-xl border
                              border-slate-200
                              bg-white px-4 py-2.5
                              text-sm font-semibold
                              text-slate-700
                              hover:bg-slate-50
                            "
                          >
                            View

                            <ArrowRight size={16} />

                          </Link>

                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>
      )}

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| STAT CARD
|--------------------------------------------------------------------------
*/

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">

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
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={21} />
        </div>

      </div>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| LOADING STATE
|--------------------------------------------------------------------------
*/

function LoadingState({ message }) {
  return (
    <div className="px-6 py-16 text-center">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">

        <FlaskConical
          size={28}
          className="animate-pulse text-slate-400"
        />

      </div>

      <h3 className="mt-4 text-base font-bold text-slate-800">
        Loading...
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        {message}
      </p>

    </div>
  );
}

/*
|--------------------------------------------------------------------------
| EMPTY STATE
|--------------------------------------------------------------------------
*/

function EmptyState({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="px-6 py-16 text-center">

      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">

        <Icon
          size={28}
          className="text-slate-400"
        />

      </div>

      <h3 className="mt-4 text-base font-bold text-slate-800">
        {title}
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        {description}
      </p>

    </div>
  );
}