import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Baby,
  CalendarDays,
  CheckCircle2,
  HeartPulse,
  Loader2,
  Save,
  Search,
  ShieldAlert,
  UserRound,
  XCircle,
} from "lucide-react";

import api from "../../services/api";

const initialForm = {
  patientId: "",
  lmp: "",
  edd: "",
  gravida: "",
  para: "",
  livingChildren: "",
  abortions: "",
  status: "ACTIVE",
  highRisk: false,
  notes: "",
};

function calculateEddFromLmp(lmp) {
  if (!lmp) {
    return "";
  }

  const date = new Date(`${lmp}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  date.setDate(date.getDate() + 280);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getPatientName(patient) {
  return [
    patient?.firstName,
    patient?.middleName,
    patient?.lastName,
  ]
    .filter(Boolean)
    .join(" ");
}

export default function RegisterPregnancy() {
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState("");

  const [form, setForm] = useState(initialForm);

  const [loadingPatients, setLoadingPatients] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    try {
      setLoadingPatients(true);
      setError("");

      const response = await api.get("/patients");

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setPatients(data);
    } catch (err) {
      console.error("Failed to load patients:", err);

      setError(
        err.response?.data?.message ||
          "Imeshindikana kupata orodha ya wagonjwa kutoka kwenye database."
      );
    } finally {
      setLoadingPatients(false);
    }
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
    setSuccess("");
  }

  function handleLmpChange(event) {
    const value = event.target.value;

    setForm((previous) => ({
      ...previous,
      lmp: value,
      edd: calculateEddFromLmp(value),
    }));

    setError("");
    setSuccess("");
  }

  function handlePatientSelect(event) {
    setForm((previous) => ({
      ...previous,
      patientId: event.target.value,
    }));

    setError("");
    setSuccess("");
  }

  function resetForm() {
    setForm(initialForm);
    setPatientSearch("");
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.patientId) {
      setError("Tafadhali chagua mgonjwa.");
      return;
    }

    if (!form.lmp) {
      setError("Tafadhali weka tarehe ya LMP.");
      return;
    }

    if (!form.edd) {
      setError("Tarehe ya EDD inahitajika.");
      return;
    }

    const gravida =
      form.gravida === ""
        ? null
        : Number(form.gravida);

    const para =
      form.para === ""
        ? null
        : Number(form.para);

    const livingChildren =
      form.livingChildren === ""
        ? null
        : Number(form.livingChildren);

    const abortions =
      form.abortions === ""
        ? null
        : Number(form.abortions);

    if (
      gravida !== null &&
      (Number.isNaN(gravida) || gravida < 1)
    ) {
      setError("Gravida lazima iwe namba sahihi.");
      return;
    }

    if (
      para !== null &&
      (Number.isNaN(para) || para < 0)
    ) {
      setError("Para lazima iwe namba sahihi.");
      return;
    }

    if (
      livingChildren !== null &&
      (Number.isNaN(livingChildren) || livingChildren < 0)
    ) {
      setError("Idadi ya watoto walio hai lazima iwe sahihi.");
      return;
    }

    if (
      abortions !== null &&
      (Number.isNaN(abortions) || abortions < 0)
    ) {
      setError("Idadi ya abortions lazima iwe sahihi.");
      return;
    }

    if (
      gravida !== null &&
      para !== null &&
      para > gravida
    ) {
      setError("Para haiwezi kuwa kubwa kuliko Gravida.");
      return;
    }

    const selectedPatient = patients.find(
      (patient) =>
        String(patient.id) === String(form.patientId)
    );

    if (!selectedPatient) {
      setError(
        "Mgonjwa aliyechaguliwa hakupatikana. Tafadhali chagua mgonjwa tena."
      );
      return;
    }

    const pregnancyData = {
      patientId: Number(form.patientId),
      lmp: form.lmp,
      edd: form.edd,
      gravida,
      para,
      livingChildren,
      abortions,
      status: "ACTIVE",
      highRisk: Boolean(form.highRisk),
      notes: form.notes.trim() || null,
    };

    try {
      setSaving(true);

      const response = await api.post(
        "/maternity/pregnancies",
        pregnancyData
      );

      const savedPregnancy = response.data;

      setSuccess(
        `Ujauzito umesajiliwa kwa mafanikio. Pregnancy ID: ${
          savedPregnancy?.id || "-"
        }`
      );

      setTimeout(() => {
        if (savedPregnancy?.id) {
          navigate(
            `/maternity/pregnancies/${savedPregnancy.id}`
          );
        } else {
          navigate("/maternity/pregnancies");
        }
      }, 900);
    } catch (err) {
      console.error(
        "Failed to register pregnancy:",
        err
      );

      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data;

      if (err.response?.status === 409) {
        setError(
          typeof backendMessage === "string"
            ? backendMessage
            : "Mgonjwa huyu tayari ana pregnancy ACTIVE."
        );
      } else {
        setError(
          typeof backendMessage === "string"
            ? backendMessage
            : "Imeshindikana kusajili ujauzito. Tafadhali jaribu tena."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  const filteredPatients = useMemo(() => {
    const search = patientSearch
      .trim()
      .toLowerCase();

    if (!search) {
      return patients;
    }

    return patients.filter((patient) => {
      const fullName = getPatientName(patient).toLowerCase();

      const patientNumber = String(
        patient.patientNumber || ""
      ).toLowerCase();

      const phone = String(
        patient.phone || ""
      ).toLowerCase();

      return (
        fullName.includes(search) ||
        patientNumber.includes(search) ||
        phone.includes(search)
      );
    });
  }, [patients, patientSearch]);

  const selectedPatient = patients.find(
    (patient) =>
      String(patient.id) === String(form.patientId)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-rose-50/40 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <Link
              to="/maternity/pregnancies"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
              title="Rudi kwenye Pregnancies"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>

            <div>
              <div className="mb-1 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <Baby className="h-5 w-5" />
                </div>

                <span className="text-sm font-semibold uppercase tracking-wide text-rose-600">
                  Maternity
                </span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Sajili Ujauzito
              </h1>

              <p className="mt-1 text-sm text-slate-500 sm:text-base">
                Sajili taarifa za ujauzito mpya kwa mgonjwa
                aliyepo kwenye mfumo.
              </p>
            </div>
          </div>

          <Link
            to="/maternity/pregnancies"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Orodha ya Pregnancies
          </Link>
        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-red-700 shadow-sm">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-semibold">
                Imeshindikana
              </p>

              <p className="mt-1 text-sm">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =====================================================
            SUCCESS
        ====================================================== */}

        {success && (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-emerald-700 shadow-sm">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

            <div>
              <p className="font-semibold">
                Umefanikiwa
              </p>

              <p className="mt-1 text-sm">
                {success}
              </p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* ===================================================
              PATIENT SELECTION
          ==================================================== */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="border-b border-slate-100 bg-gradient-to-r from-rose-50 to-white px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                  <UserRound className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Chagua Mgonjwa
                  </h2>

                  <p className="text-sm text-slate-500">
                    Pregnancy itaunganishwa na Patient
                    aliyepo kwenye database.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <div className="grid gap-5 lg:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Tafuta Mgonjwa
                  </label>

                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      type="text"
                      value={patientSearch}
                      onChange={(event) =>
                        setPatientSearch(
                          event.target.value
                        )
                      }
                      placeholder="Jina, Patient Number au simu..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-4 focus:ring-rose-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Mgonjwa
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <select
                    name="patientId"
                    value={form.patientId}
                    onChange={handlePatientSelect}
                    disabled={loadingPatients}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                  >
                    <option value="">
                      {loadingPatients
                        ? "Inapakia wagonjwa..."
                        : "Chagua mgonjwa"}
                    </option>

                    {filteredPatients.map(
                      (patient) => (
                        <option
                          key={patient.id}
                          value={patient.id}
                        >
                          {getPatientName(patient) ||
                            "Mgonjwa asiye na jina"}
                          {" — "}
                          {patient.patientNumber ||
                            `ID ${patient.id}`}
                          {patient.phone
                            ? ` — ${patient.phone}`
                            : ""}
                        </option>
                      )
                    )}
                  </select>

                  {!loadingPatients &&
                    filteredPatients.length === 0 && (
                      <p className="mt-2 text-xs text-amber-600">
                        Hakuna mgonjwa aliyepatikana
                        kwa utafutaji huu.
                      </p>
                    )}
                </div>
              </div>

              {/* SELECTED PATIENT PREVIEW */}

              {selectedPatient && (
                <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
                        <UserRound className="h-6 w-6" />
                      </div>

                      <div>
                        <p className="font-bold text-slate-900">
                          {getPatientName(
                            selectedPatient
                          ) || "-"}
                        </p>

                        <p className="text-sm text-slate-500">
                          {selectedPatient.patientNumber ||
                            `Patient ID: ${selectedPatient.id}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      {selectedPatient.gender && (
                        <span className="rounded-full bg-white px-3 py-1.5 font-semibold text-slate-600">
                          {selectedPatient.gender}
                        </span>
                      )}

                      {selectedPatient.phone && (
                        <span className="rounded-full bg-white px-3 py-1.5 font-semibold text-slate-600">
                          {selectedPatient.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ===================================================
              PREGNANCY INFORMATION
          ==================================================== */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="border-b border-slate-100 bg-gradient-to-r from-pink-50 to-white px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-100 text-pink-600">
                  <HeartPulse className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Taarifa za Ujauzito
                  </h2>

                  <p className="text-sm text-slate-500">
                    Taarifa za msingi za pregnancy na
                    historia ya uzazi.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {/* LMP */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    LMP
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      type="date"
                      name="lmp"
                      value={form.lmp}
                      onChange={handleLmpChange}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                    />
                  </div>

                  <p className="mt-1.5 text-xs text-slate-400">
                    Last Menstrual Period
                  </p>
                </div>

                {/* EDD */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    EDD
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      type="date"
                      name="edd"
                      value={form.edd}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                    />
                  </div>

                  <p className="mt-1.5 text-xs text-slate-400">
                    Expected Date of Delivery
                  </p>
                </div>

                {/* GRAVIDA */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Gravida
                  </label>

                  <input
                    type="number"
                    name="gravida"
                    min="1"
                    value={form.gravida}
                    onChange={handleChange}
                    placeholder="Mfano: 2"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    Jumla ya mimba alizowahi kuwa nazo
                  </p>
                </div>

                {/* PARA */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Para
                  </label>

                  <input
                    type="number"
                    name="para"
                    min="0"
                    value={form.para}
                    onChange={handleChange}
                    placeholder="Mfano: 1"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    Idadi ya deliveries zilizofika
                  </p>
                </div>

                {/* LIVING CHILDREN */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Watoto Walio Hai
                  </label>

                  <input
                    type="number"
                    name="livingChildren"
                    min="0"
                    value={form.livingChildren}
                    onChange={handleChange}
                    placeholder="Mfano: 1"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                  />
                </div>

                {/* ABORTIONS */}

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Abortions
                  </label>

                  <input
                    type="number"
                    name="abortions"
                    min="0"
                    value={form.abortions}
                    onChange={handleChange}
                    placeholder="Mfano: 0"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                  />
                </div>
              </div>

              {/* DATE PREVIEW */}

              {form.lmp && form.edd && (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      LMP
                    </p>

                    <p className="mt-1 font-bold text-slate-800">
                      {formatDate(form.lmp)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-rose-500">
                      EDD
                    </p>

                    <p className="mt-1 font-bold text-slate-800">
                      {formatDate(form.edd)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ===================================================
              RISK + NOTES
          ==================================================== */}

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
            <div className="border-b border-slate-100 bg-gradient-to-r from-amber-50 to-white px-5 py-5 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                  <ShieldAlert className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Risk & Clinical Notes
                  </h2>

                  <p className="text-sm text-slate-500">
                    Taarifa za ziada za ufuatiliaji wa ujauzito.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
                <input
                  type="checkbox"
                  name="highRisk"
                  checked={form.highRisk}
                  onChange={handleChange}
                  className="mt-1 h-5 w-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />

                <span>
                  <span className="block font-bold text-slate-900">
                    High Risk Pregnancy
                  </span>

                  <span className="mt-1 block text-sm text-slate-600">
                    Weka alama hii kama pregnancy imetambuliwa
                    kuwa ya high risk na mhudumu wa afya.
                  </span>
                </span>
              </label>

              <div className="mt-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Clinical Notes
                </label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Andika taarifa muhimu za ziada kuhusu pregnancy..."
                  className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                />
              </div>
            </div>
          </section>

          {/* ===================================================
              ACTIONS
          ==================================================== */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              Safisha Form
            </button>

            <Link
              to="/maternity/pregnancies"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Ghairi
            </Link>

            <button
              type="submit"
              disabled={saving || loadingPatients}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-rose-200 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Inahifadhi...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Sajili Ujauzito
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}