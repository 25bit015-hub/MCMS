import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Baby,
  ChevronRight,
  Clock3,
  HeartPulse,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../../services/api";

function formatDate(dateValue) {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("sw-TZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(dateValue, timeValue) {
  const date = formatDate(dateValue);

  if (date === "—" && !timeValue) {
    return "—";
  }

  if (timeValue) {
    return `${date} • ${timeValue}`;
  }

  return date;
}

function getStatusLabel(status) {
  if (!status) {
    return "Haijulikani";
  }

  switch (String(status).toUpperCase()) {
    case "ACTIVE":
      return "Inaendelea";

    case "ARCHIVED":
      return "Imehifadhiwa";

    case "COMPLETED":
      return "Imekamilika";

    default:
      return status;
  }
}

function getStatusClasses(status) {
  switch (String(status || "").toUpperCase()) {
    case "ACTIVE":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "ARCHIVED":
      return "border-slate-200 bg-slate-100 text-slate-600";

    case "COMPLETED":
      return "border-blue-200 bg-blue-50 text-blue-700";

    default:
      return "border-amber-200 bg-amber-50 text-amber-700";
  }
}

function getStatusAccent(status) {
  switch (String(status || "").toUpperCase()) {
    case "ACTIVE":
      return "bg-emerald-500";

    case "ARCHIVED":
      return "bg-slate-400";

    case "COMPLETED":
      return "bg-blue-500";

    default:
      return "bg-amber-500";
  }
}

function getLabourStageLabel(stage) {
  if (!stage) {
    return "—";
  }

  const labels = {
    FIRST_STAGE: "First Stage",
    SECOND_STAGE: "Second Stage",
    THIRD_STAGE: "Third Stage",
    FOURTH_STAGE: "Fourth Stage",
    LATENT_PHASE: "Latent Phase",
    ACTIVE_PHASE: "Active Phase",
  };

  return labels[String(stage).toUpperCase()] || stage;
}

function getDeliveryModeLabel(mode) {
  if (!mode) {
    return "Bado";
  }

  const labels = {
    SVD: "Normal Delivery",
    NORMAL: "Normal Delivery",
    VAGINAL: "Vaginal Delivery",
    C_SECTION: "C-Section",
    CAESAREAN: "C-Section",
    ASSISTED_VAGINAL: "Assisted Vaginal",
  };

  return labels[String(mode).toUpperCase()] || mode;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconWrapperClass,
  loading,
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="absolute -right-5 -top-8 h-24 w-24 rounded-full bg-slate-50" />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <div className="mt-2 flex min-h-[40px] items-center">
            {loading ? (
              <Loader2 className="h-7 w-7 animate-spin text-slate-400" />
            ) : (
              <p className="text-3xl font-bold tracking-tight text-slate-900">
                {value}
              </p>
            )}
          </div>

          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>

        <div
          className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconWrapperClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function ClinicalItem({ icon: Icon, label, value, iconClass }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex items-center gap-2">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconClass}`}
        >
          <Icon className="h-3.5 w-3.5" />
        </div>

        <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
          {label}
        </span>
      </div>

      <p className="mt-2 truncate text-sm font-bold text-slate-700">
        {value || "—"}
      </p>
    </div>
  );
}

export default function LabourRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadRecords = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/maternity/labour-records");

      const data = Array.isArray(response.data) ? response.data : [];

      setRecords(data);
    } catch (err) {
      console.error("Labour records error:", err);

      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message;

      setError(
        backendMessage ||
          "Imeshindikana kupata Labour records kutoka kwenye server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const activeRecords = useMemo(() => {
    return records.filter(
      (record) =>
        String(record?.recordStatus || "").toUpperCase() === "ACTIVE"
    );
  }, [records]);

  const archivedRecords = useMemo(() => {
    return records.filter(
      (record) =>
        String(record?.recordStatus || "").toUpperCase() === "ARCHIVED"
    );
  }, [records]);

  const completedRecords = useMemo(() => {
    return records.filter(
      (record) =>
        String(record?.recordStatus || "").toUpperCase() === "COMPLETED"
    );
  }, [records]);

  const filteredRecords = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return records.filter((record) => {
      const recordStatus = String(
        record?.recordStatus || ""
      ).toUpperCase();

      const matchesStatus =
        statusFilter === "ALL" || recordStatus === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!query) {
        return true;
      }

      const searchableText = [
        record?.patientName,
        record?.patientNumber,
        record?.pregnancyId,
        record?.admissionReason,
        record?.labourOnset,
        record?.labourStage,
        record?.membraneStatus,
        record?.deliveryMode,
        record?.maternalCondition,
        record?.fetalCondition,
        record?.diagnosis,
        record?.recordStatus,
      ]
        .filter(
          (value) =>
            value !== null && value !== undefined && value !== ""
        )
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [records, searchTerm, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
        {/* HEADER */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-rose-100/70 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-orange-100/60 blur-3xl" />
          <div className="absolute right-1/3 top-1/2 h-40 w-40 rounded-full bg-blue-100/40 blur-3xl" />

          <div className="relative flex flex-col gap-6 p-6 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-lg shadow-rose-600/20">
                <Baby className="h-7 w-7" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Labour & Delivery
                  </h1>

                  <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">
                    MATERNITY
                  </span>
                </div>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  Simamia labour, delivery na taarifa muhimu za mama na
                  mtoto kwa usalama na mwendelezo wa huduma.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 font-medium">
                    <HeartPulse className="h-3.5 w-3.5 text-rose-600" />
                    Clinical Monitoring
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    Protected History
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadRecords}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loading ? "animate-spin" : ""
                  }`}
                />
                Onyesha upya
              </button>

              <Link
                to="/maternity"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 hover:shadow-md"
              >
                <Baby className="h-4 w-4" />
                Maternity
              </Link>
            </div>
          </div>
        </section>

        {/* ERROR */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

              <div className="min-w-0">
                <p className="font-semibold text-red-800">
                  Imeshindikana kupakia taarifa
                </p>

                <p className="mt-1 text-sm leading-6 text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={loadRecords}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Jaribu tena
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STATS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Labour Active"
            value={activeRecords.length}
            description="Records zinazoendelea"
            icon={HeartPulse}
            iconWrapperClass="bg-rose-50 text-rose-600"
            loading={loading}
          />

          <StatCard
            title="Completed"
            value={completedRecords.length}
            description="Records zilizokamilika"
            icon={ShieldCheck}
            iconWrapperClass="bg-emerald-50 text-emerald-600"
            loading={loading}
          />

          <StatCard
            title="Archived"
            value={archivedRecords.length}
            description="Historia iliyohifadhiwa"
            icon={ShieldCheck}
            iconWrapperClass="bg-slate-100 text-slate-600"
            loading={loading}
          />

          <StatCard
            title="Jumla"
            value={records.length}
            description="Labour records zote"
            icon={Stethoscope}
            iconWrapperClass="bg-blue-50 text-blue-600"
            loading={loading}
          />
        </div>

        {/* FILTERS + RECORDS */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-slate-50/70 p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(event.target.value)
                    }
                    placeholder="Tafuta kwa jina, Patient Number, Labour Stage..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10"
                  />
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Inaonyesha {filteredRecords.length} kati ya{" "}
                  {records.length} Labour records
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  {
                    value: "ALL",
                    label: "Zote",
                  },
                  {
                    value: "ACTIVE",
                    label: "Active",
                  },
                  {
                    value: "COMPLETED",
                    label: "Completed",
                  },
                  {
                    value: "ARCHIVED",
                    label: "Archived",
                  },
                ].map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setStatusFilter(filter.value)}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                      statusFilter === filter.value
                        ? "border-rose-200 bg-rose-50 text-rose-700 shadow-sm"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RECORDS */}
          {loading ? (
            <div className="flex min-h-[360px] items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50">
                  <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
                </div>

                <p className="text-sm font-medium">
                  Inapakia Labour records...
                </p>
              </div>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Baby className="h-7 w-7" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Hakuna Labour record iliyopatikana
              </h3>

              <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
                Badilisha search au status filter ili kuona records
                nyingine.
              </p>

              {(searchTerm || statusFilter !== "ALL") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("ALL");
                  }}
                  className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Ondoa filters
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredRecords.map((record) => {
                const status = String(
                  record?.recordStatus || ""
                ).toUpperCase();

                return (
                  <Link
                    key={record.id}
                    to={`/maternity/labour-records/${record.id}`}
                    className="group relative block overflow-hidden p-5 transition hover:bg-slate-50/80 sm:p-6"
                  >
                    <div
                      className={`absolute bottom-0 left-0 top-0 w-1 ${getStatusAccent(
                        record?.recordStatus
                      )}`}
                    />

                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      {/* PATIENT */}
                      <div className="flex min-w-0 items-start gap-4 xl:min-w-[300px] xl:flex-1">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-sm ${
                            status === "ARCHIVED"
                              ? "bg-slate-100 text-slate-500"
                              : "bg-rose-50 text-rose-600"
                          }`}
                        >
                          <UserRound className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate font-bold text-slate-900">
                              {record?.patientName ||
                                "Mgonjwa hajatajwa"}
                            </h3>

                            <span
                              className={`rounded-full border px-2 py-1 text-[11px] font-bold ${getStatusClasses(
                                record?.recordStatus
                              )}`}
                            >
                              {getStatusLabel(
                                record?.recordStatus
                              )}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span>
                              Patient No:{" "}
                              <strong className="font-semibold text-slate-700">
                                {record?.patientNumber || "—"}
                              </strong>
                            </span>

                            <span>
                              Pregnancy ID:{" "}
                              <strong className="font-semibold text-slate-700">
                                {record?.pregnancyId || "—"}
                              </strong>
                            </span>
                          </div>

                          <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                            <Clock3 className="h-3.5 w-3.5 text-rose-600" />
                            Admission:{" "}
                            <span className="font-semibold text-slate-800">
                              {formatDateTime(
                                record?.admissionDate,
                                record?.admissionTime
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* CLINICAL SUMMARY */}
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:min-w-[650px] xl:max-w-[720px] xl:flex-1 xl:grid-cols-4">
                        <ClinicalItem
                          icon={Clock3}
                          label="Labour Stage"
                          value={getLabourStageLabel(
                            record?.labourStage
                          )}
                          iconClass="bg-rose-50 text-rose-600"
                        />

                        <ClinicalItem
                          icon={HeartPulse}
                          label="FHR"
                          value={
                            record?.fetalHeartRate
                              ? `${record.fetalHeartRate} bpm`
                              : "—"
                          }
                          iconClass="bg-red-50 text-red-600"
                        />

                        <ClinicalItem
                          icon={Stethoscope}
                          label="Maternal"
                          value={
                            record?.maternalCondition || "—"
                          }
                          iconClass="bg-blue-50 text-blue-600"
                        />

                        <ClinicalItem
                          icon={Baby}
                          label="Delivery"
                          value={getDeliveryModeLabel(
                            record?.deliveryMode
                          )}
                          iconClass="bg-violet-50 text-violet-600"
                        />
                      </div>

                      {/* ACTION */}
                      <div className="flex shrink-0 items-center justify-end xl:min-w-[145px]">
                        <div className="inline-flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3.5 py-2.5 text-sm font-bold text-rose-700 transition group-hover:border-rose-200 group-hover:bg-rose-100">
                          Fungua record
                          <ChevronRight className="h-5 w-5 text-rose-500 transition group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* INFORMATION */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm">
                <Baby className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Labour & Delivery Continuity
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Taarifa za labour na delivery zinaendelea kuwa sehemu
                  ya historia ya pregnancy husika.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Historia inalindwa
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Records zilizohifadhiwa kama ARCHIVED hazifutwi
                  kutoka kwenye historia ya mgonjwa.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs text-slate-500 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p>Maternity Management • Labour & Delivery</p>

          <p>
            Records zinahifadhiwa kwa mwendelezo wa huduma.
          </p>
        </div>
      </div>
    </div>
  );
}