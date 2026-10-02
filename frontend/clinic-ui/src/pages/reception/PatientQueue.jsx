import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  RefreshCw,
  Users,
  Clock3,
  Stethoscope,
  Syringe,
  FlaskConical,
  Pill,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import api from "../../services/api";

const statusConfig = {
  Waiting: {
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },

  "In Consultation": {
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },

  "Sent to Doctor": {
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },

  "Lab Pending": {
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },

  "Lab Completed": {
    className: "bg-cyan-50 text-cyan-700 border-cyan-200",
  },

  "Returned to Doctor": {
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },

  "Pharmacy Pending": {
    className: "bg-pink-50 text-pink-700 border-pink-200",
  },

  "Pharmacy Completed": {
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },

  "Injection Pending": {
    className: "bg-violet-50 text-violet-700 border-violet-200",
  },

  "Injection Completed": {
    className: "bg-teal-50 text-teal-700 border-teal-200",
  },

  Completed: {
    className: "bg-green-50 text-green-700 border-green-200",
  },
};

const serviceConfig = {
  Reception: {
    className: "bg-slate-100 text-slate-700",
    icon: Users,
  },

  Nurse: {
    className: "bg-blue-50 text-blue-700",
    icon: Syringe,
  },

  Doctor: {
    className: "bg-purple-50 text-purple-700",
    icon: Stethoscope,
  },

  Laboratory: {
    className: "bg-orange-50 text-orange-700",
    icon: FlaskConical,
  },

  Pharmacy: {
    className: "bg-pink-50 text-pink-700",
    icon: Pill,
  },

  Injection: {
    className: "bg-violet-50 text-violet-700",
    icon: Syringe,
  },

  Completed: {
    className: "bg-green-50 text-green-700",
    icon: CheckCircle2,
  },
};

const statusLabels = {
  WAITING: "Waiting",
  IN_CONSULTATION: "In Consultation",
  SENT_TO_DOCTOR: "Sent to Doctor",
  LAB_PENDING: "Lab Pending",
  LAB_COMPLETED: "Lab Completed",
  RETURNED_TO_DOCTOR: "Returned to Doctor",
  PHARMACY_PENDING: "Pharmacy Pending",
  PHARMACY_COMPLETED: "Pharmacy Completed",
  INJECTION_PENDING: "Injection Pending",
  INJECTION_COMPLETED: "Injection Completed",
  COMPLETED: "Completed",
};

const serviceLabels = {
  RECEPTION: "Reception",
  NURSE: "Nurse",
  DOCTOR: "Doctor",
  LABORATORY: "Laboratory",
  PHARMACY: "Pharmacy",
  INJECTION: "Injection",
  COMPLETED: "Completed",
};

function normalizeQueueItem(item) {
  return {
    ...item,

    status:
      statusLabels[item.status] ||
      item.status ||
      "Waiting",

    service:
      serviceLabels[item.service] ||
      item.service ||
      "Nurse",
  };
}

function formatTime(dateTime) {
  if (!dateTime) {
    return "--:--";
  }

  const date = new Date(dateTime);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PatientQueue() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadQueue = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/patient-queue");

      const queueData = Array.isArray(response.data)
        ? response.data
        : [];

      const normalizedQueue = queueData.map(
        normalizeQueueItem
      );

      setPatients(normalizedQueue);
    } catch (error) {
      console.error(
        "Failed to load patient queue:",
        error
      );

      setPatients([]);

      if (error.response?.status === 401) {
        setError(
          "Session yako imekwisha. Tafadhali login tena."
        );
      } else if (error.response?.status === 403) {
        setError(
          "Huna ruhusa ya kuona Patient Queue."
        );
      } else {
        setError(
          "Imeshindikana kupata Patient Queue kutoka server."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const filteredPatients = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return patients.filter((patient) => {
      const fullName =
        `${patient.firstName || ""} ${
          patient.lastName || ""
        }`
          .trim()
          .toLowerCase();

      const patientNumber = String(
        patient.patientNumber || ""
      ).toLowerCase();

      const patientId = String(
        patient.patientId || ""
      ).toLowerCase();

      const queueNumber = String(
        patient.queueNumber || ""
      ).toLowerCase();

      const visitNumber = String(
        patient.visitNumber || ""
      ).toLowerCase();

      const phone = String(
        patient.phone || ""
      ).toLowerCase();

      const matchesSearch =
        !keyword ||
        fullName.includes(keyword) ||
        patientNumber.includes(keyword) ||
        patientId.includes(keyword) ||
        queueNumber.includes(keyword) ||
        visitNumber.includes(keyword) ||
        phone.includes(keyword);

      const matchesStatus =
        filterStatus === "All" ||
        patient.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [patients, search, filterStatus]);

  const updateQueueStatus = async (
    id,
    newStatus
  ) => {
    try {
      const response = await api.patch(
        `/patient-queue/${id}/status`,
        null,
        {
          params: {
            status: newStatus,
          },
        }
      );

      const updatedPatient =
        normalizeQueueItem(response.data);

      setPatients((prev) =>
        prev.map((patient) =>
          String(patient.id) === String(id)
            ? updatedPatient
            : patient
        )
      );
    } catch (error) {
      console.error(
        "Failed to update queue status:",
        error
      );

      alert(
        "Imeshindikana kubadilisha status ya mgonjwa."
      );
    }
  };

  const handleSendToNurse = (id) => {
    updateQueueStatus(
      id,
      "IN_CONSULTATION"
    );
  };

  const getStatusClass = (status) => {
    return (
      statusConfig[status]?.className ||
      "bg-slate-50 text-slate-700 border-slate-200"
    );
  };

  const getServiceConfig = (service) => {
    return (
      serviceConfig[service] || {
        className: "bg-slate-100 text-slate-700",
        icon: Users,
      }
    );
  };

  const totalPatients = patients.length;

  const waitingPatients = patients.filter(
    (patient) => patient.status === "Waiting"
  ).length;

  const activePatients = patients.filter(
    (patient) =>
      patient.status !== "Waiting" &&
      patient.status !== "Completed"
  ).length;

  const completedPatients = patients.filter(
    (patient) => patient.status === "Completed"
  ).length;

  return (
    <div className="space-y-7">
      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-600">
            Reception
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            Patient Queue
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage patients currently moving through the clinic workflow.
          </p>
        </div>

        <button
          type="button"
          onClick={loadQueue}
          disabled={loading}
          className="
            inline-flex items-center justify-center gap-2 rounded-xl
            border border-slate-200 bg-white px-4 py-2.5 text-sm
            font-semibold text-slate-700 shadow-sm transition-all
            hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600
            disabled:cursor-not-allowed disabled:opacity-60
          "
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />

          Refresh Queue
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Patients Today
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                {totalPatients}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
              <Users
                size={21}
                className="text-blue-600"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Waiting
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                {waitingPatients}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
              <Clock3
                size={21}
                className="text-amber-600"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Active
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                {activePatients}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50">
              <Stethoscope
                size={21}
                className="text-purple-600"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Completed
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                {completedPatients}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50">
              <CheckCircle2
                size={21}
                className="text-green-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH / FILTER */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={19}
              className="
                absolute left-4 top-1/2 -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search patient by name, ID, visit or phone..."
              className="
                h-11 w-full rounded-xl border border-slate-200
                bg-slate-50 pl-11 pr-4 text-sm text-slate-700
                outline-none transition-all
                placeholder:text-slate-400
                focus:border-blue-400
                focus:bg-white
                focus:ring-4 focus:ring-blue-500/10
              "
            />
          </div>

          <select
            value={filterStatus}
            onChange={(event) =>
              setFilterStatus(event.target.value)
            }
            className="
              h-11 rounded-xl border border-slate-200 bg-slate-50
              px-4 text-sm font-medium text-slate-700 outline-none
              focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10
            "
          >
            <option value="All">All Status</option>

            <option value="Waiting">
              Waiting
            </option>

            <option value="In Consultation">
              In Consultation
            </option>

            <option value="Sent to Doctor">
              Sent to Doctor
            </option>

            <option value="Lab Pending">
              Lab Pending
            </option>

            <option value="Lab Completed">
              Lab Completed
            </option>

            <option value="Returned to Doctor">
              Returned to Doctor
            </option>

            <option value="Pharmacy Pending">
              Pharmacy Pending
            </option>

            <option value="Pharmacy Completed">
              Pharmacy Completed
            </option>

            <option value="Injection Pending">
              Injection Pending
            </option>

            <option value="Injection Completed">
              Injection Completed
            </option>

            <option value="Completed">
              Completed
            </option>
          </select>
        </div>
      </div>

      {/* ERROR */}
      {error && !loading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* QUEUE TABLE */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Today&apos;s Queue
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredPatients.length} patient
              {filteredPatients.length === 1
                ? ""
                : "s"}{" "}
              found
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
              <RefreshCw
                size={18}
                className="animate-spin"
              />

              Loading queue...
            </div>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="flex min-h-[330px] flex-col items-center justify-center px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <Users
                size={28}
                className="text-slate-400"
              />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-800">
              No patients found
            </h3>

            <p className="mt-2 max-w-md text-sm text-slate-500">
              There are no patients matching your current
              search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Patient
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Time
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Service
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
                {filteredPatients.map((patient) => {
                  const fullName =
                    `${patient.firstName || ""} ${
                      patient.lastName || ""
                    }`.trim();

                  const status =
                    patient.status || "Waiting";

                  const service =
                    patient.service || "Nurse";

                  const currentStatus =
                    statusConfig[status] ||
                    statusConfig.Waiting;

                  const currentService =
                    getServiceConfig(service);

                  const ServiceIcon =
                    currentService.icon;

                  return (
                    <tr
                      key={patient.id}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      {/* PATIENT */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div
                            className="
                              flex h-11 w-11 shrink-0 items-center
                              justify-center rounded-xl bg-gradient-to-br
                              from-blue-500 to-blue-600 text-sm font-bold
                              text-white shadow-md shadow-blue-500/20
                            "
                          >
                            {(
                              patient.firstName?.[0] ||
                              "P"
                            ).toUpperCase()}

                            {(
                              patient.lastName?.[0] ||
                              ""
                            ).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <Link
                              to={`/reception/patients/${patient.patientId}`}
                              className="
                                block truncate text-sm font-bold
                                text-slate-800 transition-colors
                                hover:text-blue-600
                              "
                            >
                              {fullName ||
                                "Unnamed Patient"}
                            </Link>

                            <p className="mt-1 text-xs text-slate-500">
                              {patient.patientNumber ||
                                `PAT-${String(
                                  patient.patientId || ""
                                ).padStart(6, "0")}`}
                            </p>

                            <p className="mt-0.5 text-[11px] text-slate-400">
                              Queue:{" "}
                              {patient.queueNumber ||
                                "-"}
                            </p>

                            <p className="mt-0.5 text-[11px] font-medium text-blue-500">
                              Visit:{" "}
                              {patient.visitNumber ||
                                "-"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* TIME */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <Clock3
                            size={16}
                            className="text-slate-400"
                          />

                          {formatTime(
                            patient.checkInTime
                          )}
                        </div>
                      </td>

                      {/* SERVICE */}
                      <td className="px-6 py-5">
                        <div
                          className={`
                            inline-flex items-center gap-2 rounded-lg
                            px-3 py-2 text-xs font-semibold
                            ${currentService.className}
                          `}
                        >
                          <ServiceIcon size={15} />

                          {service}
                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-5">
                        <span
                          className={`
                            inline-flex items-center rounded-full border
                            px-3 py-1.5 text-xs font-bold
                            ${currentStatus.className}
                          `}
                        >
                          {status}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td className="px-6 py-5 text-right">
                        {status === "Waiting" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleSendToNurse(
                                patient.id
                              )
                            }
                            className="
                              inline-flex items-center gap-2 rounded-xl
                              bg-blue-600 px-4 py-2.5 text-xs font-bold
                              text-white shadow-md shadow-blue-600/20
                              transition-all hover:bg-blue-700
                            "
                          >
                            Send to Nurse

                            <ArrowRight size={15} />
                          </button>
                        )}

                        {status ===
                          "In Consultation" && (
                          <span className="text-xs font-semibold text-blue-600">
                            With Nurse
                          </span>
                        )}

                        {status ===
                          "Sent to Doctor" && (
                          <span className="text-xs font-semibold text-purple-600">
                            With Doctor
                          </span>
                        )}

                        {status === "Lab Pending" && (
                          <span className="text-xs font-semibold text-orange-600">
                            Laboratory
                          </span>
                        )}

                        {status ===
                          "Lab Completed" && (
                          <span className="text-xs font-semibold text-cyan-600">
                            Lab Completed
                          </span>
                        )}

                        {status ===
                          "Returned to Doctor" && (
                          <span className="text-xs font-semibold text-indigo-600">
                            Doctor Review
                          </span>
                        )}

                        {status ===
                          "Pharmacy Pending" && (
                          <span className="text-xs font-semibold text-pink-600">
                            Pharmacy
                          </span>
                        )}

                        {status ===
                          "Pharmacy Completed" && (
                          <span className="text-xs font-semibold text-emerald-600">
                            Pharmacy Done
                          </span>
                        )}

                        {status ===
                          "Injection Pending" && (
                          <span className="text-xs font-semibold text-violet-600">
                            Injection
                          </span>
                        )}

                        {status ===
                          "Injection Completed" && (
                          <span className="text-xs font-semibold text-teal-600">
                            Injection Done
                          </span>
                        )}

                        {status === "Completed" && (
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600">
                            <CheckCircle2
                              size={16}
                            />

                            Completed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}