import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  FlaskConical,
  ClipboardList,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";

import api from "../../services/api";

export default function LaboratoryPatient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // =====================================================
  // VISIT ID
  // =====================================================
  const visitIdFromUrl = searchParams.get("visitId");

  const [patient, setPatient] = useState(null);
  const [queue, setQueue] = useState(null);
  const [consultation, setConsultation] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [results, setResults] = useState("");
  const [notes, setNotes] = useState("");

  // =====================================================
  // TODAY
  // =====================================================
  const today = useMemo(() => {
    const date = new Date();

    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  }, []);

  // =====================================================
  // LOAD PATIENT
  // =====================================================
  useEffect(() => {
    loadPatient();
  }, [id, visitIdFromUrl, today]);

  async function loadPatient() {
    try {
      setLoading(true);
      setError("");

      // =================================================
      // VISIT VALIDATION
      // =================================================
      if (!visitIdFromUrl) {
        setError(
          "Visit ID haipo. Tafadhali fungua mgonjwa kupitia Laboratory Queue."
        );

        return;
      }

      // =================================================
      // PATIENT
      // =================================================
      const patientResponse = await api.get(
        `/patients/${id}`
      );

      const patientData = patientResponse.data;

      setPatient(patientData);

      // =================================================
      // TODAY'S QUEUE
      // =================================================
      const queueResponse = await api.get(
        `/patient-queue/date?date=${today}`
      );

      const queues = Array.isArray(queueResponse.data)
        ? queueResponse.data
        : [];

      // =================================================
      // FIND EXACT QUEUE
      // =================================================
      const patientQueue = queues.find(
        (item) =>
          Number(item.patientId) === Number(id) &&
          Number(item.visitId) === Number(visitIdFromUrl) &&
          item.status === "LAB_PENDING"
      );

      if (!patientQueue) {
        setError(
          "Laboratory Queue ya Visit hii haikupatikana."
        );

        setQueue(null);
        return;
      }

      setQueue(patientQueue);

      // =================================================
      // CONSULTATION FOR THIS VISIT
      // =================================================
      try {
        const consultationResponse = await api.get(
          `/consultations/visit/${visitIdFromUrl}/latest`
        );

        setConsultation(
          consultationResponse.data
        );
      } catch (consultationError) {
        console.log(
          "No consultation found for this visit:",
          consultationError
        );

        setConsultation(null);
      }

    } catch (err) {
      console.error(
        "Laboratory patient error:",
        err
      );

      if (err.response?.status === 404) {
        setError(
          "Mgonjwa au taarifa za Visit hazikupatikana."
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.response?.data ||
            "Imeshindikana kupata taarifa za mgonjwa."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // RESULT CHANGE
  // =====================================================
  function handleResultChange(event) {
    setResults(event.target.value);
  }

  // =====================================================
  // NOTES CHANGE
  // =====================================================
  function handleNotesChange(event) {
    setNotes(event.target.value);
  }

  // =====================================================
  // COMPLETE LABORATORY
  // =====================================================
  async function completeLaboratory() {

    // ===================================================
    // VALIDATE VISIT
    // ===================================================
    if (!visitIdFromUrl) {
      setError(
        "Visit ID haipo. Haiwezekani kuhifadhi Laboratory Result."
      );
      return;
    }

    // ===================================================
    // VALIDATE QUEUE
    // ===================================================
    if (!queue?.id) {
      setError(
        "Queue ya mgonjwa haikupatikana."
      );
      return;
    }

    // ===================================================
    // VALIDATE QUEUE VISIT
    // ===================================================
    if (
      Number(queue.visitId) !==
      Number(visitIdFromUrl)
    ) {
      setError(
        "Queue hii haihusiani na Visit iliyochaguliwa."
      );
      return;
    }

    // ===================================================
    // VALIDATE RESULTS
    // ===================================================
    if (!results.trim()) {
      setError(
        "Tafadhali ingiza majibu ya vipimo."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      // =================================================
      // STEP 1
      // SAVE LABORATORY RESULT
      // =================================================
      const laboratoryResultResponse =
        await api.post(
          "/laboratory-results",
          {
            patientId: Number(id),

            queueId: Number(queue.id),

            visitId: Number(visitIdFromUrl),

            consultationId:
              consultation?.id
                ? Number(consultation.id)
                : null,

            results: results.trim(),

            notes: notes.trim(),
          }
        );

      console.log(
        "Laboratory result saved:",
        laboratoryResultResponse.data
      );

      // =================================================
      // STEP 2
      // LAB_PENDING → LAB_COMPLETED
      // =================================================
      await api.patch(
        `/patient-queue/${queue.id}/status`,
        null,
        {
          params: {
            status: "LAB_COMPLETED",
          },
        }
      );

      // =================================================
      // STEP 3
      // LAB_COMPLETED → RETURNED_TO_DOCTOR
      // =================================================
      await api.patch(
        `/patient-queue/${queue.id}/status`,
        null,
        {
          params: {
            status: "RETURNED_TO_DOCTOR",
          },
        }
      );

      // =================================================
      // SUCCESS
      // =================================================
      alert(
        "Majibu ya Laboratory yamehifadhiwa na mgonjwa amerudishwa kwa Doctor."
      );

      navigate("/laboratory");

    } catch (err) {
      console.error(
        "Complete laboratory error:",
        err
      );

      console.error(
        "Status:",
        err.response?.status
      );

      console.error(
        "Response:",
        err.response?.data
      );

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Imeshindikana kuhifadhi majibu ya Laboratory."
      );

    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // LOADING
  // =====================================================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="w-6 h-6 animate-spin" />

          <span>
            Inapakia taarifa za mgonjwa...
          </span>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR / PATIENT NOT FOUND
  // =====================================================
  if (error && !patient) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">

          <Link
            to="/laboratory"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />

            Rudi Laboratory
          </Link>

          <div className="bg-white border border-red-200 rounded-2xl p-8 shadow-sm">

            <div className="flex items-center gap-3 text-red-600 mb-3">

              <AlertCircle className="w-6 h-6" />

              <h2 className="text-lg font-semibold">
                Taarifa haikupatikana
              </h2>

            </div>

            <p className="text-slate-600">
              {error}
            </p>

          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // FULL NAME
  // =====================================================
  const fullName = [
    patient?.firstName,
    patient?.middleName,
    patient?.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  // =====================================================
  // LAB REQUEST
  // =====================================================
  const labRequest =
    consultation?.labNotes ||
    "Hakuna maelekezo maalum ya Laboratory.";

  // =====================================================
  // PAGE
  // =====================================================
  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-7xl mx-auto space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>

            <Link
              to="/laboratory"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-3"
            >
              <ArrowLeft className="w-4 h-4" />

              Rudi Laboratory
            </Link>

            <h1 className="text-2xl font-bold text-slate-900">
              Laboratory Patient
            </h1>

            <p className="text-slate-500 mt-1">
              Taarifa za vipimo vya mgonjwa
            </p>

          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">

            <FlaskConical className="w-5 h-5" />

            <span className="font-semibold">
              {queue?.status || "LAB_PENDING"}
            </span>

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">

            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />

            <p className="text-sm text-red-700">
              {error}
            </p>

          </div>
        )}

        {/* =================================================
            PATIENT CARD
        ================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          <div className="p-6 border-b border-slate-200">

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">

                <User className="w-7 h-7 text-blue-600" />

              </div>

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  {fullName || "Unknown Patient"}
                </h2>

                <p className="text-sm text-slate-500">
                  {patient?.patientNumber || "N/A"}
                </p>

              </div>

            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-6">

            <div>
              <p className="text-xs text-slate-500 mb-1">
                Patient Number
              </p>

              <p className="font-semibold text-slate-900">
                {patient?.patientNumber || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">
                Queue Number
              </p>

              <p className="font-semibold text-slate-900">
                {queue?.queueNumber || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">
                Visit Number
              </p>

              <p className="font-semibold text-slate-900">
                {queue?.visitNumber || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">
                Gender
              </p>

              <p className="font-semibold text-slate-900">
                {patient?.gender || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500 mb-1">
                Phone
              </p>

              <p className="font-semibold text-slate-900">
                {patient?.phone || "N/A"}
              </p>
            </div>

          </div>

        </div>

        {/* =================================================
            DOCTOR REQUEST
        ================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">

          <div className="p-6 border-b border-slate-200 flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">

              <ClipboardList className="w-5 h-5 text-purple-600" />

            </div>

            <div>

              <h2 className="font-bold text-slate-900">
                Doctor's Laboratory Request
              </h2>

              <p className="text-sm text-slate-500">
                Vipimo vilivyoombwa na Doctor
              </p>

            </div>

          </div>

          <div className="p-6 space-y-5">

            <div>

              <p className="text-sm font-semibold text-slate-700 mb-2">
                Requested Tests
              </p>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-blue-900">
                {labRequest}
              </div>

            </div>

            {consultation && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="bg-slate-50 rounded-xl p-4">

                  <p className="text-xs text-slate-500 mb-1">
                    Complaint
                  </p>

                  <p className="text-sm text-slate-800">
                    {consultation.complaint || "—"}
                  </p>

                </div>

                <div className="bg-slate-50 rounded-xl p-4">

                  <p className="text-xs text-slate-500 mb-1">
                    Diagnosis
                  </p>

                  <p className="text-sm text-slate-800">
                    {consultation.diagnosis || "—"}
                  </p>

                </div>

              </div>
            )}

          </div>

        </div>

        {/* =================================================
            LAB RESULTS
        ================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">

          <div className="p-6 border-b border-slate-200">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">

                <FlaskConical className="w-5 h-5 text-emerald-600" />

              </div>

              <div>

                <h2 className="font-bold text-slate-900">
                  Laboratory Results
                </h2>

                <p className="text-sm text-slate-500">
                  Ingiza majibu ya vipimo
                </p>

              </div>

            </div>

          </div>

          <div className="p-6 space-y-5">

            {/* RESULTS */}
            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Results
              </label>

              <textarea
                value={results}
                onChange={handleResultChange}
                rows={7}
                placeholder="Mfano: Malaria Test: Positive. CBC: Hb 11.2 g/dL..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />

            </div>

            {/* NOTES */}
            <div>

              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Laboratory Notes
              </label>

              <textarea
                value={notes}
                onChange={handleNotesChange}
                rows={4}
                placeholder="Andika maelezo mengine ya Laboratory..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />

            </div>

          </div>

        </div>

        {/* =================================================
            ACTIONS
        ================================================= */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">

          <Link
            to="/laboratory"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />

            Cancel
          </Link>

          <button
            type="button"
            onClick={completeLaboratory}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >

            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />

                Inahifadhi...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />

                Complete Laboratory
              </>
            )}

          </button>

        </div>

      </div>
    </div>
  );
}