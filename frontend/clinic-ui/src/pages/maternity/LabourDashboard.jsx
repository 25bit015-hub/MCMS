import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Baby,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  Clock3,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  Users,
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

function formatDateTime(dateValue) {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("sw-TZ", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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
  if (!status) {
    return "border-slate-200 bg-slate-100 text-slate-600";
  }

  switch (String(status).toUpperCase()) {
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

function getLabourStageLabel(stage) {
  if (!stage) {
    return "—";
  }

  switch (String(stage).toUpperCase()) {
    case "FIRST_STAGE":
      return "Hatua ya Kwanza";

    case "SECOND_STAGE":
      return "Hatua ya Pili";

    case "THIRD_STAGE":
      return "Hatua ya Tatu";

    case "POSTPARTUM":
      return "Baada ya Kujifungua";

    default:
      return stage;
  }
}

function getDeliveryModeLabel(mode) {
  if (!mode) {
    return "Haijafanyika";
  }

  switch (String(mode).toUpperCase()) {
    case "SVD":
      return "Normal Delivery";

    case "NORMAL":
      return "Normal Delivery";

    case "C_SECTION":
      return "C-Section";

    case "CAESAREAN":
      return "C-Section";

    case "ASSISTED":
      return "Assisted Delivery";

    default:
      return mode;
  }
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
      <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-slate-50 opacity-70" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <div className="mt-2 min-h-[40px]">
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
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconWrapperClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function LabourDashboard() {
  const [labourRecords, setLabourRecords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/maternity/labour-records");

      const data = Array.isArray(response.data) ? response.data : [];

      setLabourRecords(data);
    } catch (err) {
      console.error("Labour dashboard error:", err);

      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message;

      setError(
        backendMessage ||
          "Imeshindikana kupata taarifa za Labour & Delivery kutoka kwenye server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const activeRecords = useMemo(() => {
    return labourRecords.filter(
      (record) =>
        String(record?.recordStatus || "").toUpperCase() === "ACTIVE"
    );
  }, [labourRecords]);

  const archivedRecords = useMemo(() => {
    return labourRecords.filter(
      (record) =>
        String(record?.recordStatus || "").toUpperCase() === "ARCHIVED"
    );
  }, [labourRecords]);

  const completedRecords = useMemo(() => {
    return labourRecords.filter(
      (record) =>
        String(record?.recordStatus || "").toUpperCase() === "COMPLETED"
    );
  }, [labourRecords]);

  const uniquePregnancyIds = useMemo(() => {
    return new Set(
      labourRecords
        .map((record) => record?.pregnancyId)
        .filter((pregnancyId) => pregnancyId !== null && pregnancyId !== undefined)
    );
  }, [labourRecords]);

  const recentActiveRecords = useMemo(() => {
    return [...activeRecords]
      .sort((a, b) => {
        const dateA = new Date(
          `${a?.admissionDate || ""}T${a?.admissionTime || "00:00"}`
        ).getTime();

        const dateB = new Date(
          `${b?.admissionDate || ""}T${b?.admissionTime || "00:00"}`
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 8);
  }, [activeRecords]);

  const filteredRecords = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return recentActiveRecords;
    }

    return recentActiveRecords.filter((record) => {
      const searchableText = [
        record?.patientName,
        record?.patientNumber,
        record?.recordStatus,
        record?.labourStage,
        record?.labourOnset,
        record?.admissionReason,
        record?.fetalPresentation,
        record?.fetalPosition,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [recentActiveRecords, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-[1600px] space-y-6 p-4 sm:p-6 lg:p-8">
        {/* ========================================================= */}
        {/* HEADER */}
        {/* ========================================================= */}

        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-rose-100/60 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-orange-100/50 blur-3xl" />

          <div className="relative flex flex-col gap-6 p-6 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-lg shadow-rose-600/20">
                <Baby className="h-7 w-7" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    Labour & Delivery
                  </h1>

                  <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
                    L&D
                  </span>
                </div>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  Simamia admission ya mama mwenye uchungu, maendeleo ya
                  labour, hali ya mama na mtoto pamoja na taarifa za kujifungua.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadDashboard}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Onyesha upya
              </button>

              <Link
                to="/maternity/pregnancies"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
              >
                <Plus className="h-4 w-4" />
                Fungua Pregnancy
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ERROR */}
        {/* ========================================================= */}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
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
                  onClick={loadDashboard}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                >
                  <RefreshCw className="h-4 w-4" />
                  Jaribu tena
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* STAT CARDS */}
        {/* ========================================================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Labour Zinazoendelea"
            value={activeRecords.length}
            description="Records zenye status ACTIVE"
            icon={Activity}
            iconWrapperClass="bg-emerald-50 text-emerald-600"
            loading={loading}
          />

          <StatCard
            title="Labour Zilizohifadhiwa"
            value={archivedRecords.length}
            description="Historical records za Labour"
            icon={ShieldCheck}
            iconWrapperClass="bg-slate-100 text-slate-600"
            loading={loading}
          />

          <StatCard
            title="Jumla ya Records"
            value={labourRecords.length}
            description="Labour records zote kwenye mfumo"
            icon={ClipboardList}
            iconWrapperClass="bg-blue-50 text-blue-600"
            loading={loading}
          />

          <StatCard
            title="Pregnancies zenye Labour"
            value={uniquePregnancyIds.size}
            description="Pregnancy records zenye Labour history"
            icon={Users}
            iconWrapperClass="bg-violet-50 text-violet-600"
            loading={loading}
          />
        </div>

        {/* ========================================================= */}
        {/* QUICK ACTIONS */}
        {/* ========================================================= */}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Link
            to="/maternity/pregnancies"
            className="group rounded-2xl border border-rose-200 bg-rose-50/70 p-5 transition hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-50 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white">
                  <Baby className="h-5 w-5" />
                </div>

                <h2 className="mt-4 font-bold text-slate-900">
                  Chagua Mama Mjamzito
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Fungua pregnancy profile na uanze Labour management.
                </p>
              </div>

              <ChevronRight className="h-5 w-5 text-rose-600 transition group-hover:translate-x-1" />
            </div>
          </Link>

          <Link
            to="/maternity/pregnancies"
            className="group rounded-2xl border border-blue-200 bg-blue-50/70 p-5 transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <Users className="h-5 w-5" />
                </div>

                <h2 className="mt-4 font-bold text-slate-900">
                  Pregnancy Records
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Tafuta mama na ufungue pregnancy yenye Labour inahitajika.
                </p>
              </div>

              <ChevronRight className="h-5 w-5 text-blue-600 transition group-hover:translate-x-1" />
            </div>
          </Link>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-600 text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-bold text-slate-900">
                  Historia inalindwa
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Labour records zilizohifadhiwa hazifutwi kwenye database;
                  zinabaki kwa ajili ya historia ya huduma.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ACTIVE LABOUR RECORDS */}
        {/* ========================================================= */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-rose-600" />

                <h2 className="text-lg font-bold text-slate-900">
                  Labour Zinazoendelea
                </h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                Labour records za hivi karibuni zilizo ACTIVE.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Activity className="h-4 w-4 text-emerald-600" />
              {activeRecords.length} active
            </div>
          </div>

          <div className="border-b border-slate-100 p-4 sm:p-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Tafuta kwa jina, Patient Number, labour stage..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-500/10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[280px] items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
                <p className="text-sm">
                  Inapakia Labour & Delivery records...
                </p>
              </div>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <UserRound className="h-6 w-6" />
              </div>

              <h3 className="mt-4 font-semibold text-slate-900">
                Hakuna Labour record iliyopatikana
              </h3>

              <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
                {searchTerm
                  ? "Hakuna Labour record inayolingana na utafutaji wako."
                  : "Kwa sasa hakuna Labour record yenye status ACTIVE."}
              </p>

              {!searchTerm && (
                <Link
                  to="/maternity/pregnancies"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
                >
                  <Plus className="h-4 w-4" />
                  Chagua Pregnancy
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredRecords.map((record) => (
                <Link
                  key={record.id}
                  to={`/maternity/labour-records/${record.id}`}
                  className="group block p-5 transition hover:bg-slate-50 sm:p-6"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                        <UserRound className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate font-bold text-slate-900">
                            {record?.patientName || "Mgonjwa hajatajwa"}
                          </h3>

                          <span
                            className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${getStatusClasses(
                              record?.recordStatus
                            )}`}
                          >
                            {getStatusLabel(record?.recordStatus)}
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
                              {record?.pregnancyId ?? "—"}
                            </strong>
                          </span>

                          <span>
                            Admission:{" "}
                            <strong className="font-semibold text-slate-700">
                              {formatDate(record?.admissionDate)}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[560px]">
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Stage
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {getLabourStageLabel(record?.labourStage)}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          FHR
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {record?.fetalHeartRate
                            ? `${record.fetalHeartRate} bpm`
                            : "—"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          BP
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {record?.bloodPressureSystolic &&
                          record?.bloodPressureDiastolic
                            ? `${record.bloodPressureSystolic}/${record.bloodPressureDiastolic}`
                            : "—"}
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                          Delivery
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-800">
                          {getDeliveryModeLabel(record?.deliveryMode)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 xl:min-w-[180px] xl:justify-end">
                      <div className="text-left xl:text-right">
                        <div className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400 xl:justify-end">
                          <Clock3 className="h-3.5 w-3.5" />
                          Updated
                        </div>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {formatDateTime(record?.updatedAt)}
                        </p>
                      </div>

                      <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-rose-600" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* INFORMATION FOOTER */}
        {/* ========================================================= */}

        <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Labour & Delivery • Maternal & Fetal Care</p>

          <p>
            Records zilizohifadhiwa hubaki kwenye historia bila kufutwa.
          </p>
        </div>
      </div>
    </div>
  );
}