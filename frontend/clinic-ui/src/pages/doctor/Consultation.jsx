import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowLeft,
  UserRound,
  Phone,
  CalendarDays,
  Activity,
  Stethoscope,
  FlaskConical,
  Pill,
  Syringe,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Clock3,
  Hash,
  FileText,
  DollarSign,
} from "lucide-react";

import api from "../../services/api";

export default function Consultation() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /*
   * =====================================================
   * CURRENT VISIT ID
   * =====================================================
   */
  const visitId = searchParams.get("visitId");

  const [patient, setPatient] = useState(null);
  const [laboratoryResults, setLaboratoryResults] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /*
   * =====================================================
   * CONSULTATION FORM
   * =====================================================
   */
  const [form, setForm] = useState({
    complaint: "",
    examination: "",
    diagnosis: "",
    treatment: "",

    labRequired: false,
    labNotes: "",

    pharmacyRequired: false,
    prescription: "",

    /*
     * NEW STRUCTURED PRESCRIPTION ITEMS
     */
    prescriptionItems: [],

    injectionRequired: false,
    injectionNotes: "",
  });

  useEffect(() => {
    loadPatient();
  }, [id, visitId]);

  async function loadPatient() {
    try {
      setLoading(true);
      setError("");

      /*
       * =====================================================
       * 1. VISIT VALIDATION
       * =====================================================
       */
      if (!visitId) {
        setPatient(null);

        setError(
          "Visit ID haipo. Tafadhali rudi Doctor Queue na ufungue consultation kupitia Visit ya mgonjwa."
        );

        return;
      }

      const numericVisitId = Number(visitId);

      if (
        !Number.isInteger(numericVisitId) ||
        numericVisitId <= 0
      ) {
        setPatient(null);

        setError(
          "Visit ID si sahihi. Tafadhali rudi Doctor Queue na ufungue consultation tena."
        );

        return;
      }

      /*
       * =====================================================
       * 2. GET PATIENT
       * =====================================================
       */
      const patientResponse = await api.get(
        `/patients/${id}`
      );

      const patientData = patientResponse.data;

      /*
       * =====================================================
       * 3. GET TODAY'S QUEUE
       * =====================================================
       */
      const today = new Date();

      const date =
        `${today.getFullYear()}-` +
        `${String(today.getMonth() + 1).padStart(2, "0")}-` +
        `${String(today.getDate()).padStart(2, "0")}`;

      const queueResponse = await api.get(
        `/patient-queue/date?date=${date}`
      );

      const queues = Array.isArray(queueResponse.data)
        ? queueResponse.data
        : [];

      /*
       * =====================================================
       * 4. FIND CURRENT PATIENT QUEUE
       * =====================================================
       *
       * IMPORTANT:
       * patientId + visitId
       */
      const patientQueue = queues.find(
        (item) =>
          String(item.patientId) === String(id) &&
          item.visitId != null &&
          String(item.visitId) ===
            String(numericVisitId)
      );

      /*
       * =====================================================
       * 5. QUEUE NOT FOUND
       * =====================================================
       */
      if (!patientQueue) {
        setPatient(null);

        setError(
          `Queue ya mgonjwa kwa Visit ${numericVisitId} haikupatikana kwenye queue ya leo. Tafadhali rudi Doctor Queue na ufungue Visit iliyopo kwenye queue.`
        );

        return;
      }

      /*
       * =====================================================
       * 6. GET LATEST VITALS
       * =====================================================
       */
      let vitalsData = null;

      try {
        const vitalsResponse = await api.get(
          `/vitals/visit/${numericVisitId}/latest`
        );

        vitalsData = vitalsResponse.data;
      } catch (vitalsError) {
        console.log(
          "No latest visit vitals found:",
          vitalsError
        );

        vitalsData = null;
      }

      /*
       * =====================================================
       * 7. GET LATEST CONSULTATION
       * =====================================================
       */
      let consultationData = null;

      try {
        const consultationResponse =
          await api.get(
            `/consultations/visit/${numericVisitId}/latest`
          );

        consultationData =
          consultationResponse.data;
      } catch (consultationError) {
        console.log(
          "No previous consultation found for this visit.",
          consultationError
        );

        consultationData = null;
      }

      /*
       * =====================================================
       * 8. GET LAB RESULTS FOR CURRENT VISIT
       * =====================================================
       */
      let laboratoryResultsData = [];

      try {
        const laboratoryResponse =
          await api.get(
            `/laboratory-results/visit/${numericVisitId}`
          );

        laboratoryResultsData =
          Array.isArray(laboratoryResponse.data)
            ? laboratoryResponse.data
            : [];
      } catch (laboratoryError) {
        console.error(
          "LABORATORY RESULTS GET ERROR:",
          laboratoryError
        );

        console.error(
          "Status:",
          laboratoryError.response?.status
        );

        console.error(
          "Response:",
          laboratoryError.response?.data
        );

        laboratoryResultsData = [];
      }

      setLaboratoryResults(
        laboratoryResultsData
      );

      /*
       * =====================================================
       * 9. LATEST LAB RESULT
       * =====================================================
       */
      const latestLaboratoryResult =
        laboratoryResultsData.length > 0
          ? laboratoryResultsData[0]
          : null;

      /*
       * =====================================================
       * 10. BUILD PATIENT DATA
       * =====================================================
       */
      const foundPatient = {
        ...patientData,

        patientId: patientData.id,

        patientNumber:
          patientData.patientNumber || "—",

        queueId:
          patientQueue.id || null,

        queueNumber:
          patientQueue.queueNumber || "—",

        queueStatus:
          patientQueue.status || "WAITING",

        queueService:
          patientQueue.service || "DOCTOR",

        visitId:
          patientQueue.visitId ||
          numericVisitId,

        visitNumber:
          patientQueue.visitNumber || "—",

        visitDate:
          patientQueue.queueDate || "—",

        vitals: vitalsData
          ? {
              temperature:
                vitalsData.temperature,

              bloodPressure:
                vitalsData.bloodPressure,

              pulse:
                vitalsData.pulseRate,

              respiratoryRate:
                vitalsData.respiratoryRate,

              spo2:
                vitalsData.oxygenSaturation,

              weight:
                vitalsData.weight,

              height:
                vitalsData.height,

              bmi:
                vitalsData.bmi,
            }
          : null,

        consultation:
          consultationData || null,

        laboratory:
          latestLaboratoryResult
            ? {
                id:
                  latestLaboratoryResult.id,

                results:
                  latestLaboratoryResult.results,

                notes:
                  latestLaboratoryResult.notes,

                performedAt:
                  latestLaboratoryResult.performedAt,

                queueNumber:
                  latestLaboratoryResult.queueNumber,

                consultationId:
                  latestLaboratoryResult.consultationId,

                visitId:
                  latestLaboratoryResult.visitId,

                visitNumber:
                  latestLaboratoryResult.visitNumber,
              }
            : null,

        laboratoryHistory:
          laboratoryResultsData,
      };

      setPatient(foundPatient);

      /*
       * =====================================================
       * 11. RETURNED FROM LABORATORY
       * =====================================================
       */
      const returnedFromLab =
        patientQueue.status ===
        "RETURNED_TO_DOCTOR";

      /*
       * Existing consultation:
       *
       * We preserve old prescription string.
       *
       * Structured prescription items are not loaded here
       * because the current ConsultationResponse does not
       * expose PrescriptionItems yet.
       */
      if (
        consultationData &&
        !returnedFromLab
      ) {
        setForm({
          complaint:
            consultationData.complaint || "",

          examination:
            consultationData.examination || "",

          diagnosis:
            consultationData.diagnosis || "",

          treatment:
            consultationData.treatment || "",

          labRequired:
            Boolean(
              consultationData.labRequired
            ),

          labNotes:
            consultationData.labNotes || "",

          pharmacyRequired:
            Boolean(
              consultationData.pharmacyRequired
            ),

          prescription:
            consultationData.prescription || "",

          prescriptionItems: [],

          injectionRequired:
            Boolean(
              consultationData.injectionRequired
            ),

          injectionNotes:
            consultationData.injectionNotes || "",
        });
      }

      /*
       * If returned from Laboratory:
       *
       * NEW doctor decision.
       */
      if (returnedFromLab) {
        setForm({
          complaint: "",
          examination: "",
          diagnosis: "",
          treatment: "",

          labRequired: false,
          labNotes: "",

          pharmacyRequired: false,
          prescription: "",
          prescriptionItems: [],

          injectionRequired: false,
          injectionNotes: "",
        });
      }
    } catch (err) {
      console.error(
        "Failed to load consultation patient:",
        err
      );

      setPatient(null);

      setError(
        err.response?.data?.message ||
          "Failed to load patient information."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * =====================================================
   * GENERAL FORM CHANGE
   * =====================================================
   */
  function handleChange(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  }

  /*
   * =====================================================
   * PRESCRIPTION ITEM HELPERS
   * =====================================================
   */

  function createEmptyPrescriptionItem() {
    return {
      medicineName: "",
      strength: "",
      dosage: "",
      frequency: "",
      duration: "",
      quantity: "",
      instructions: "",
      unitPrice: "",
    };
  }

  function addPrescriptionItem() {
    setForm((prev) => ({
      ...prev,
      prescriptionItems: [
        ...prev.prescriptionItems,
        createEmptyPrescriptionItem(),
      ],
    }));
  }

  function removePrescriptionItem(index) {
    setForm((prev) => ({
      ...prev,
      prescriptionItems:
        prev.prescriptionItems.filter(
          (_, itemIndex) =>
            itemIndex !== index
        ),
    }));
  }

  function updatePrescriptionItem(
    index,
    field,
    value
  ) {
    setForm((prev) => ({
      ...prev,
      prescriptionItems:
        prev.prescriptionItems.map(
          (item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,
                  [field]: value,
                }
              : item
        ),
    }));
  }

  function clearPrescriptionItems() {
    setForm((prev) => ({
      ...prev,
      prescriptionItems: [],
    }));
  }

  /*
   * =====================================================
   * FULL NAME
   * =====================================================
   */
  function getFullName() {
    if (!patient) return "";

    return `${patient.firstName || ""} ${
      patient.middleName || ""
    } ${patient.lastName || ""}`
      .replace(/\s+/g, " ")
      .trim();
  }

  /*
   * =====================================================
   * INITIALS
   * =====================================================
   */
  function getInitials() {
    const fullName = getFullName();

    if (!fullName) return "PT";

    return fullName
      .split(" ")
      .filter(Boolean)
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  /*
   * =====================================================
   * RETURNED FROM LAB
   * =====================================================
   */
  const isReturnedFromLab =
    patient?.queueStatus ===
    "RETURNED_TO_DOCTOR";

  /*
   * =====================================================
   * PRESCRIPTION ITEM VALIDATION
   * =====================================================
   */
  function validatePrescriptionItems() {
    const items =
      form.prescriptionItems || [];

    if (items.length === 0) {
      /*
       * Backward compatibility:
       *
       * Old prescription textarea can still be used.
       */
      if (
        form.prescription &&
        form.prescription.trim()
      ) {
        return true;
      }

      setError(
        "Please add at least one medicine or enter the prescription."
      );

      return false;
    }

    for (
      let index = 0;
      index < items.length;
      index++
    ) {
      const item = items[index];

      if (
        !item.medicineName ||
        !item.medicineName.trim()
      ) {
        setError(
          `Please enter the medicine name for medicine #${
            index + 1
          }.`
        );

        return false;
      }

      if (
        !item.quantity ||
        Number(item.quantity) <= 0
      ) {
        setError(
          `Please enter a valid quantity for medicine #${
            index + 1
          }.`
        );

        return false;
      }
    }

    return true;
  }

  /*
   * =====================================================
   * HANDLE SUBMIT
   * =====================================================
   */
  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    /*
     * =====================================================
     * VISIT VALIDATION
     * =====================================================
     */
    if (!visitId) {
      setError(
        "Visit ID haipo. Tafadhali rudi Doctor Queue na ujaribu tena."
      );

      return;
    }

    const numericVisitId = Number(visitId);

    if (
      !Number.isInteger(numericVisitId) ||
      numericVisitId <= 0
    ) {
      setError(
        "Visit ID si sahihi. Tafadhali rudi Doctor Queue na ujaribu tena."
      );

      return;
    }

    /*
     * =====================================================
     * BASIC CLINICAL VALIDATION
     * =====================================================
     */
    if (
      !form.complaint.trim() ||
      !form.examination.trim() ||
      !form.diagnosis.trim() ||
      !form.treatment.trim()
    ) {
      setError(
        "Please fill in Complaint, Examination, Diagnosis and Treatment."
      );

      return;
    }

    /*
     * =====================================================
     * LABORATORY VALIDATION
     * =====================================================
     */
    if (
      form.labRequired &&
      !isReturnedFromLab &&
      !form.labNotes.trim()
    ) {
      setError(
        "Please enter the laboratory request."
      );

      return;
    }

    /*
     * =====================================================
     * PHARMACY VALIDATION
     * =====================================================
     */
    if (form.pharmacyRequired) {
      const pharmacyValid =
        validatePrescriptionItems();

      if (!pharmacyValid) {
        return;
      }
    }

    /*
     * =====================================================
     * INJECTION VALIDATION
     * =====================================================
     */
    if (
      form.injectionRequired &&
      !form.injectionNotes.trim()
    ) {
      setError(
        "Please enter the injection instructions."
      );

      return;
    }

    /*
     * =====================================================
     * QUEUE VALIDATION
     * =====================================================
     */
    if (!patient?.queueId) {
      setError(
        "Patient queue was not found. Please return to Doctor Queue and try again."
      );

      return;
    }

    /*
     * =====================================================
     * VISIT / QUEUE CONSISTENCY
     * =====================================================
     */
    if (
      String(patient.visitId) !==
      String(numericVisitId)
    ) {
      setError(
        "Visit ID ya consultation hii haifanani na Visit ya queue. Tafadhali rudi Doctor Queue na ufungue mgonjwa tena."
      );

      return;
    }

    /*
     * =====================================================
     * DETERMINE NEXT SERVICE
     * =====================================================
     */
    let nextService = "COMPLETED";

    if (isReturnedFromLab) {
      if (form.pharmacyRequired) {
        nextService = "PHARMACY";
      } else if (
        form.injectionRequired
      ) {
        nextService = "INJECTION";
      } else {
        nextService = "COMPLETED";
      }
    } else if (form.labRequired) {
      nextService = "LABORATORY";
    } else if (
      form.pharmacyRequired
    ) {
      nextService = "PHARMACY";
    } else if (
      form.injectionRequired
    ) {
      nextService = "INJECTION";
    }

    /*
     * =====================================================
     * PREPARE STRUCTURED PRESCRIPTION
     * =====================================================
     */
    const cleanedPrescriptionItems =
      (form.prescriptionItems || [])
        .filter(
          (item) =>
            item &&
            item.medicineName &&
            item.medicineName.trim()
        )
        .map((item) => ({
          medicineName:
            item.medicineName.trim(),

          strength:
            item.strength?.trim() || "",

          dosage:
            item.dosage?.trim() || "",

          frequency:
            item.frequency?.trim() || "",

          duration:
            item.duration?.trim() || "",

          quantity:
            Number(item.quantity),

          instructions:
            item.instructions?.trim() || "",

          unitPrice:
            item.unitPrice === "" ||
            item.unitPrice == null
              ? null
              : Number(item.unitPrice),
        }));

    try {
      setSaving(true);

      /*
       * =====================================================
       * SAVE CONSULTATION
       * =====================================================
       */
      const response = await api.post(
        "/consultations",
        {
          patientId:
            Number(patient.id),

          queueId:
            Number(patient.queueId),

          visitId:
            numericVisitId,

          complaint:
            form.complaint.trim(),

          examination:
            form.examination.trim(),

          diagnosis:
            form.diagnosis.trim(),

          treatment:
            form.treatment.trim(),

          labRequired:
            form.labRequired,

          labNotes:
            form.labNotes.trim(),

          pharmacyRequired:
            form.pharmacyRequired,

          /*
           * Legacy prescription text.
           *
           * Tunaiweka ili workflow ya zamani
           * isiathirike.
           */
          prescription:
            form.prescription.trim(),

          /*
           * NEW structured prescription.
           */
          prescriptionItems:
            cleanedPrescriptionItems,

          injectionRequired:
            form.injectionRequired,

          injectionNotes:
            form.injectionNotes.trim(),

          nextService,
        }
      );

      console.log(
        "Consultation saved successfully:",
        response.data
      );

      /*
       * =====================================================
       * NEXT SERVICE
       * =====================================================
       */

      if (
        nextService ===
        "LABORATORY"
      ) {
        navigate(
          `/laboratory/patients/${patient.id}?visitId=${numericVisitId}`
        );

        return;
      }

      if (
        nextService ===
        "PHARMACY"
      ) {
        navigate(
          `/pharmacy/patients/${patient.id}?visitId=${numericVisitId}`
        );

        return;
      }

      if (
        nextService ===
        "INJECTION"
      ) {
        navigate(
          `/injection/patients/${patient.id}?visitId=${numericVisitId}`
        );

        return;
      }

      /*
       * No additional service.
       */
      navigate("/doctor");
    } catch (err) {
      console.error(
        "Failed to save consultation:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data ||
          "Failed to save consultation. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * =====================================================
   * LOADING
   * =====================================================
   */
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white px-8 py-7 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading patient information...
          </p>
        </div>
      </div>
    );
  }

  /*
   * =====================================================
   * PATIENT NOT FOUND
   * =====================================================
   */
  if (!patient) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <AlertCircle
            size={42}
            className="mx-auto text-red-500"
          />

          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Patient Not Found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error ||
              "The requested patient could not be found."}
          </p>

          <Link
            to="/doctor/queue"
            className="
              mt-5 inline-flex items-center gap-2
              rounded-xl bg-blue-600 px-4 py-2.5
              text-sm font-semibold text-white
              hover:bg-blue-700
            "
          >
            <ArrowLeft size={17} />
            Back to Doctor Queue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7 pb-10">
      {/* =================================================
          BACK
      ================================================= */}
      <div>
        <Link
          to="/doctor/queue"
          className="
            inline-flex items-center gap-2 text-sm
            font-semibold text-slate-500
            transition hover:text-blue-600
          "
        >
          <ArrowLeft size={17} />
          Back to Doctor Queue
        </Link>
      </div>

      {/* =================================================
          HEADER
      ================================================= */}
      <div>
        <p className="text-sm font-semibold text-blue-600">
          Doctor
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          {isReturnedFromLab
            ? "Review Laboratory Results"
            : "Patient Consultation"}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          {isReturnedFromLab
            ? "Review the laboratory results and decide the next treatment step."
            : "Assess the patient and determine the appropriate treatment plan."}
        </p>
      </div>

      {/* =================================================
          PATIENT CARD
      ================================================= */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
        <div className="bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-700 px-6 py-7 text-white">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold ring-1 ring-white/20 backdrop-blur">
                {getInitials()}
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  {getFullName()}
                </h2>

                <p className="mt-1 text-sm text-blue-100">
                  Patient ID:{" "}
                  {patient.patientNumber ||
                    patient.id}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <HeaderBadge
                    label="Queue"
                    value={
                      patient.queueNumber ||
                      "—"
                    }
                  />

                  <HeaderBadge
                    label="Visit"
                    value={
                      patient.visitNumber ||
                      "—"
                    }
                  />

                  <HeaderBadge
                    label="Visit ID"
                    value={
                      patient.visitId ||
                      "—"
                    }
                  />

                  <HeaderBadge
                    label="Date"
                    value={
                      patient.visitDate ||
                      "—"
                    }
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 px-5 py-4 ring-1 ring-white/15 backdrop-blur">
              <p className="text-xs text-blue-100">
                Current Status
              </p>

              <p className="mt-1 font-semibold">
                {formatQueueStatus(
                  patient.queueStatus
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-3">
          <InfoItem
            icon={UserRound}
            label="Gender"
            value={
              patient.gender || "—"
            }
          />

          <InfoItem
            icon={Phone}
            label="Phone"
            value={
              patient.phone || "—"
            }
          />

          <InfoItem
            icon={CalendarDays}
            label="Date of Birth"
            value={
              patient.dateOfBirth ||
              "—"
            }
          />
        </div>
      </div>

      {/* =================================================
          VITALS
      ================================================= */}
      {patient.vitals && (
        <section>
          <SectionHeading
            icon={Activity}
            title="Patient Vitals"
            subtitle="Latest vital signs recorded for this Visit."
          />

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <VitalItem
              label="Temperature"
              value={
                patient.vitals.temperature
              }
              unit="°C"
            />

            <VitalItem
              label="Blood Pressure"
              value={
                patient.vitals.bloodPressure
              }
              unit=""
            />

            <VitalItem
              label="Pulse"
              value={
                patient.vitals.pulse
              }
              unit="bpm"
            />

            <VitalItem
              label="Respiratory"
              value={
                patient.vitals.respiratoryRate
              }
              unit="/min"
            />

            <VitalItem
              label="SpO₂"
              value={
                patient.vitals.spo2
              }
              unit="%"
            />

            <VitalItem
              label="Weight"
              value={
                patient.vitals.weight
              }
              unit="kg"
            />
          </div>

          {(patient.vitals.height ||
            patient.vitals.bmi) && (
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
              <VitalItem
                label="Height"
                value={
                  patient.vitals.height
                }
                unit="cm"
              />

              <VitalItem
                label="BMI"
                value={
                  patient.vitals.bmi
                }
                unit=""
              />
            </div>
          )}
        </section>
      )}

      {/* =================================================
          PREVIOUS CONSULTATION
      ================================================= */}
      {isReturnedFromLab &&
        patient.consultation && (
          <section className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                <Stethoscope
                  size={21}
                  className="text-blue-600"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-lg font-bold text-slate-900">
                  Previous Doctor Consultation
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  This is the previous consultation before the patient was sent to Laboratory.
                </p>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <ResultBox
                    title="Chief Complaint"
                    value={
                      patient
                        .consultation
                        .complaint
                    }
                  />

                  <ResultBox
                    title="Examination"
                    value={
                      patient
                        .consultation
                        .examination
                    }
                  />

                  <ResultBox
                    title="Diagnosis"
                    value={
                      patient
                        .consultation
                        .diagnosis
                    }
                  />

                  <ResultBox
                    title="Treatment"
                    value={
                      patient
                        .consultation
                        .treatment
                    }
                  />
                </div>

                {patient.consultation.labNotes && (
                  <div className="mt-5 rounded-xl border border-blue-200 bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Laboratory Request
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {
                        patient
                          .consultation
                          .labNotes
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

      {/* =================================================
          LABORATORY RESULTS
      ================================================= */}
      {isReturnedFromLab &&
        patient.laboratory && (
          <section className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                <FlaskConical
                  size={21}
                  className="text-emerald-600"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Laboratory Results
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Results received from Laboratory for this Visit.
                    </p>
                  </div>

                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
                    <CheckCircle2 size={14} />
                    Laboratory Completed
                  </span>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <ResultBox
                    title="Laboratory Results"
                    value={
                      patient
                        .laboratory
                        .results
                    }
                  />

                  <ResultBox
                    title="Performed At"
                    value={
                      patient
                        .laboratory
                        .performedAt
                        ? new Date(
                            patient
                              .laboratory
                              .performedAt
                          ).toLocaleString()
                        : "—"
                    }
                  />
                </div>

                {patient.laboratory.notes && (
                  <div className="mt-5 rounded-xl border border-emerald-200 bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Laboratory Notes
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {
                        patient
                          .laboratory
                          .notes
                      }
                    </p>
                  </div>
                )}

                {patient.laboratoryHistory?.length > 1 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-bold text-slate-800">
                      Previous Laboratory Results for This Visit
                    </h3>

                    <div className="mt-3 space-y-3">
                      {patient.laboratoryHistory
                        .slice(1)
                        .map((result) => (
                          <div
                            key={result.id}
                            className="rounded-xl border border-emerald-100 bg-white p-4"
                          >
                            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                              <p className="text-xs font-semibold text-slate-500">
                                {result.performedAt
                                  ? new Date(
                                      result.performedAt
                                    ).toLocaleString()
                                  : "Date unavailable"}
                              </p>

                              <span className="text-xs font-medium text-slate-400">
                                Result #
                                {result.id}
                              </span>
                            </div>

                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                              {result.results ||
                                "—"}
                            </p>

                            {result.notes && (
                              <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-500">
                                Notes:{" "}
                                {result.notes}
                              </p>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

      {/* =================================================
          NO LAB RESULT
      ================================================= */}
      {isReturnedFromLab &&
        !patient.laboratory && (
          <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={21}
                className="mt-0.5 text-amber-600"
              />

              <div>
                <h2 className="font-bold text-amber-800">
                  Laboratory Result Not Found
                </h2>

                <p className="mt-1 text-sm leading-6 text-amber-700">
                  The patient has been returned from Laboratory,
                  but no saved laboratory result was found for this Visit.
                </p>
              </div>
            </div>
          </section>
        )}

      {/* =================================================
          CONSULTATION FORM
      ================================================= */}
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm"
      >
        {/* Form header */}
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
              <Stethoscope
                size={20}
                className="text-blue-600"
              />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isReturnedFromLab
                  ? "Doctor Follow-up Assessment"
                  : "Clinical Assessment"}
              </h2>

              <p className="text-sm text-slate-500">
                {isReturnedFromLab
                  ? "Record the doctor's assessment after reviewing the laboratory results."
                  : "Record the doctor's clinical assessment."}
              </p>
            </div>
          </div>
        </div>

        {/* Clinical fields */}
        <div className="space-y-6 p-6">
          <TextAreaField
            label="Chief Complaint"
            name="complaint"
            value={form.complaint}
            onChange={handleChange}
            placeholder="Describe the patient's main complaint..."
            required
          />

          <TextAreaField
            label="Examination"
            name="examination"
            value={form.examination}
            onChange={handleChange}
            placeholder="Enter examination findings..."
            required
          />

          <TextAreaField
            label="Diagnosis"
            name="diagnosis"
            value={form.diagnosis}
            onChange={handleChange}
            placeholder="Enter diagnosis..."
            required
          />

          <TextAreaField
            label="Treatment"
            name="treatment"
            value={form.treatment}
            onChange={handleChange}
            placeholder="Enter treatment plan..."
            required
          />
        </div>

        {/* =================================================
            SERVICES
        ================================================= */}
        <div className="border-t border-slate-100 bg-slate-50/40 px-6 py-6">
          <h2 className="text-lg font-bold text-slate-900">
            Treatment / Services
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Select the next service required for this patient.
          </p>
        </div>

        <div className="space-y-4 px-6 pb-6">
          {/* =================================================
              LABORATORY
          ================================================= */}
          {!isReturnedFromLab && (
            <ServiceCard
              icon={FlaskConical}
              title="Laboratory"
              description="Send patient for laboratory investigation."
              checked={form.labRequired}
              onChange={handleChange}
              name="labRequired"
              activeClass="border-blue-300 bg-blue-50/40"
            >
              {form.labRequired && (
                <TextAreaField
                  label="Laboratory Request"
                  name="labNotes"
                  value={form.labNotes}
                  onChange={handleChange}
                  placeholder="Example: CBC, Malaria, Blood Sugar..."
                />
              )}
            </ServiceCard>
          )}

          {/* =================================================
              PHARMACY
          ================================================= */}
          <ServiceCard
            icon={Pill}
            title="Pharmacy"
            description="Send patient to pharmacy for prescribed medication."
            checked={form.pharmacyRequired}
            onChange={handleChange}
            name="pharmacyRequired"
            activeClass="border-violet-300 bg-violet-50/40"
          >
            {form.pharmacyRequired && (
              <PrescriptionBuilder
                form={form}
                updatePrescriptionItem={
                  updatePrescriptionItem
                }
                addPrescriptionItem={
                  addPrescriptionItem
                }
                removePrescriptionItem={
                  removePrescriptionItem
                }
                clearPrescriptionItems={
                  clearPrescriptionItems
                }
                handleChange={
                  handleChange
                }
              />
            )}
          </ServiceCard>

          {/* =================================================
              INJECTION
          ================================================= */}
          <ServiceCard
            icon={Syringe}
            title="Injection"
            description="Send patient for injection administration."
            checked={form.injectionRequired}
            onChange={handleChange}
            name="injectionRequired"
            activeClass="border-rose-300 bg-rose-50/40"
          >
            {form.injectionRequired && (
              <TextAreaField
                label="Injection Instructions"
                name="injectionNotes"
                value={form.injectionNotes}
                onChange={handleChange}
                placeholder="Enter injection name, dose and instructions..."
              />
            )}
          </ServiceCard>
        </div>

        {/* =================================================
            NEXT STEP
        ================================================= */}
        <div className="mx-6 mb-6 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
              <CheckCircle2
                size={20}
                className="text-blue-600"
              />
            </div>

            <div>
              <p className="text-sm font-bold text-blue-800">
                Next Step
              </p>

              <p className="mt-1 text-sm leading-6 text-blue-700">
                {getNextStepLabel(
                  form,
                  isReturnedFromLab
                )}
              </p>
            </div>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}
        {error && (
          <div className="mx-6 mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-700">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>{error}</span>
          </div>
        )}

        {/* =================================================
            ACTIONS
        ================================================= */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-5 sm:flex-row sm:justify-end">
          <Link
            to="/doctor/queue"
            className="
              inline-flex items-center justify-center gap-2
              rounded-xl border border-slate-200 bg-white
              px-5 py-3 text-sm font-semibold text-slate-700
              transition hover:bg-slate-50
            "
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="
              inline-flex items-center justify-center gap-2
              rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600
              px-6 py-3 text-sm font-semibold text-white
              shadow-sm transition
              hover:from-blue-700 hover:to-indigo-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            <Save size={18} />

            {saving
              ? "Saving..."
              : isReturnedFromLab
              ? "Save Doctor Decision"
              : "Complete Consultation"}
          </button>
        </div>
      </form>
    </div>
  );
}

/*
 * =========================================================
 * PRESCRIPTION BUILDER
 * =========================================================
 */
function PrescriptionBuilder({
  form,
  updatePrescriptionItem,
  addPrescriptionItem,
  removePrescriptionItem,
  clearPrescriptionItems,
  handleChange,
}) {
  const items =
    form.prescriptionItems || [];

  return (
    <div className="space-y-5">
      {/* Intro */}
      <div className="rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-50 to-white p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100">
              <Pill
                size={21}
                className="text-violet-600"
              />
            </div>

            <div>
              <h3 className="font-bold text-slate-900">
                Prescription
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Add the medicines prescribed by the doctor.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={addPrescriptionItem}
            className="
              inline-flex items-center justify-center gap-2
              rounded-xl bg-violet-600 px-4 py-2.5
              text-sm font-semibold text-white
              shadow-sm transition
              hover:bg-violet-700
            "
          >
            <Plus size={17} />
            Add Medicine
          </button>
        </div>
      </div>

      {/* Medicine items */}
      {items.length > 0 && (
        <div className="space-y-4">
          {items.map((item, index) => (
            <PrescriptionItemCard
              key={index}
              item={item}
              index={index}
              updatePrescriptionItem={
                updatePrescriptionItem
              }
              removePrescriptionItem={
                removePrescriptionItem
              }
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-violet-300 bg-violet-50/40 px-6 py-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100">
            <Pill
              size={22}
              className="text-violet-600"
            />
          </div>

          <h3 className="mt-3 font-bold text-slate-800">
            No medicine added yet
          </h3>

          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
            Click "Add Medicine" to create a structured prescription for Pharmacy.
          </p>

          <button
            type="button"
            onClick={addPrescriptionItem}
            className="
              mt-4 inline-flex items-center gap-2
              rounded-xl border border-violet-200
              bg-white px-4 py-2.5
              text-sm font-semibold text-violet-700
              shadow-sm transition hover:bg-violet-50
            "
          >
            <Plus size={17} />
            Add First Medicine
          </button>
        </div>
      )}

      {/* Legacy prescription */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
        <div className="mb-3 flex items-center gap-2">
          <FileText
            size={17}
            className="text-slate-500"
          />

          <div>
            <p className="text-sm font-bold text-slate-800">
              Additional Prescription Notes
            </p>

            <p className="text-xs text-slate-500">
              Optional notes for Pharmacy.
            </p>
          </div>
        </div>

        <textarea
          name="prescription"
          value={form.prescription}
          onChange={handleChange}
          rows={3}
          placeholder="Example: Take after meals, continue medication for the prescribed duration..."
          className="
            w-full rounded-xl border border-slate-200
            bg-white px-4 py-3 text-sm text-slate-700
            outline-none transition
            focus:border-violet-400
            focus:ring-4 focus:ring-violet-500/10
          "
        />
      </div>

      {/* Clear */}
      {items.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={clearPrescriptionItems}
            className="
              inline-flex items-center gap-2
              text-xs font-semibold text-slate-500
              transition hover:text-red-600
            "
          >
            <Trash2 size={14} />
            Clear medicine list
          </button>
        </div>
      )}
    </div>
  );
}

/*
 * =========================================================
 * PRESCRIPTION ITEM CARD
 * =========================================================
 */
function PrescriptionItemCard({
  item,
  index,
  updatePrescriptionItem,
  removePrescriptionItem,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-violet-200 bg-white shadow-sm">
      {/* Card header */}
      <div className="flex flex-col gap-3 border-b border-violet-100 bg-violet-50/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-sm font-bold text-violet-700">
            {index + 1}
          </div>

          <div>
            <p className="text-sm font-bold text-slate-900">
              Medicine #{index + 1}
            </p>

            <p className="text-xs text-slate-500">
              Prescription item
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            removePrescriptionItem(index)
          }
          className="
            inline-flex w-fit items-center gap-2
            rounded-lg px-3 py-2
            text-xs font-semibold text-red-600
            transition hover:bg-red-50
          "
        >
          <Trash2 size={15} />
          Remove
        </button>
      </div>

      <div className="space-y-5 p-5">
        {/* Medicine name */}
        <InputField
          icon={Pill}
          label="Medicine Name"
          value={item.medicineName}
          onChange={(event) =>
            updatePrescriptionItem(
              index,
              "medicineName",
              event.target.value
            )
          }
          placeholder="Example: Paracetamol"
          required
        />

        {/* Row 1 */}
        <div className="grid gap-4 md:grid-cols-3">
          <InputField
            icon={Hash}
            label="Strength"
            value={item.strength}
            onChange={(event) =>
              updatePrescriptionItem(
                index,
                "strength",
                event.target.value
              )
            }
            placeholder="Example: 500 mg"
          />

          <InputField
            icon={Activity}
            label="Dosage"
            value={item.dosage}
            onChange={(event) =>
              updatePrescriptionItem(
                index,
                "dosage",
                event.target.value
              )
            }
            placeholder="Example: 1 tablet"
          />

          <InputField
            icon={Clock3}
            label="Frequency"
            value={item.frequency}
            onChange={(event) =>
              updatePrescriptionItem(
                index,
                "frequency",
                event.target.value
              )
            }
            placeholder="Example: 3 times/day"
          />
        </div>

        {/* Row 2 */}
        <div className="grid gap-4 md:grid-cols-3">
          <InputField
            icon={Clock3}
            label="Duration"
            value={item.duration}
            onChange={(event) =>
              updatePrescriptionItem(
                index,
                "duration",
                event.target.value
              )
            }
            placeholder="Example: 5 days"
          />

          <InputField
            icon={Hash}
            label="Quantity"
            type="number"
            min="1"
            value={item.quantity}
            onChange={(event) =>
              updatePrescriptionItem(
                index,
                "quantity",
                event.target.value
              )
            }
            placeholder="Example: 15"
            required
          />

          <InputField
            icon={DollarSign}
            label="Unit Price"
            type="number"
            min="0"
            step="0.01"
            value={item.unitPrice}
            onChange={(event) =>
              updatePrescriptionItem(
                index,
                "unitPrice",
                event.target.value
              )
            }
            placeholder="Optional"
          />
        </div>

        {/* Instructions */}
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <FileText
              size={16}
              className="text-violet-600"
            />
            Instructions
          </label>

          <textarea
            value={item.instructions}
            onChange={(event) =>
              updatePrescriptionItem(
                index,
                "instructions",
                event.target.value
              )
            }
            rows={3}
            placeholder="Example: Take after meals. Do not skip doses."
            className="
              w-full rounded-xl border border-slate-200
              bg-slate-50 px-4 py-3 text-sm text-slate-700
              outline-none transition
              focus:border-violet-400
              focus:bg-white
              focus:ring-4 focus:ring-violet-500/10
            "
          />
        </div>
      </div>
    </div>
  );
}

/*
 * =========================================================
 * INPUT FIELD
 * =========================================================
 */
function InputField({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  step,
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
        {Icon && (
          <Icon
            size={16}
            className="text-violet-600"
          />
        )}

        <span>
          {label}{" "}
          {required && (
            <span className="text-red-500">
              *
            </span>
          )}
        </span>
      </label>

      <input
        type={type}
        min={min}
        step={step}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full rounded-xl border border-slate-200
          bg-slate-50 px-4 py-3 text-sm text-slate-700
          outline-none transition
          focus:border-violet-400
          focus:bg-white
          focus:ring-4 focus:ring-violet-500/10
        "
      />
    </div>
  );
}

/*
 * =========================================================
 * QUEUE STATUS LABEL
 * =========================================================
 */
function formatQueueStatus(status) {
  const labels = {
    WAITING: "Waiting",
    IN_CONSULTATION: "In Consultation",
    SENT_TO_DOCTOR: "Sent to Doctor",
    LAB_PENDING: "Laboratory Pending",
    LAB_COMPLETED: "Laboratory Completed",
    RETURNED_TO_DOCTOR: "Returned to Doctor",
    PHARMACY_PENDING: "Pharmacy Pending",
    PHARMACY_COMPLETED: "Pharmacy Completed",
    INJECTION_PENDING: "Injection Pending",
    INJECTION_COMPLETED: "Injection Completed",
    COMPLETED: "Completed",
  };

  return (
    labels[status] ||
    status ||
    "—"
  );
}

/*
 * =========================================================
 * NEXT STEP LABEL
 * =========================================================
 */
function getNextStepLabel(
  form,
  isReturnedFromLab
) {
  if (
    !isReturnedFromLab &&
    form.labRequired
  ) {
    return "Laboratory — Patient will be sent for laboratory investigation.";
  }

  if (form.pharmacyRequired) {
    const count =
      form.prescriptionItems?.length || 0;

    if (count > 0) {
      return `Pharmacy — Patient will be sent with ${count} prescribed medicine ${
        count === 1
          ? "item"
          : "items"
      }.`;
    }

    return "Pharmacy — Patient will be sent for prescribed medication.";
  }

  if (form.injectionRequired) {
    return "Injection — Patient will be sent for injection.";
  }

  return "Completed — No additional service is required.";
}

/*
 * =========================================================
 * HEADER BADGE
 * =========================================================
 */
function HeaderBadge({
  label,
  value,
}) {
  return (
    <span className="rounded-lg bg-white/10 px-2.5 py-1.5 text-xs text-blue-100 ring-1 ring-white/10">
      <span className="text-blue-200">
        {label}:
      </span>{" "}
      <span className="font-semibold text-white">
        {value}
      </span>
    </span>
  );
}

/*
 * =========================================================
 * SECTION HEADING
 * =========================================================
 */
function SectionHeading({
  icon: Icon,
  title,
  subtitle,
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
        <Icon
          size={19}
          className="text-blue-600"
        />
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900">
          {title}
        </h2>

        {subtitle && (
          <p className="text-xs text-slate-500">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

/*
 * =========================================================
 * INFO ITEM
 * =========================================================
 */
function InfoItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
        <Icon
          size={18}
          className="text-blue-600"
        />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}

/*
 * =========================================================
 * VITAL ITEM
 * =========================================================
 */
function VitalItem({
  label,
  value,
  unit,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-lg font-bold text-slate-900">
        {value || "—"}{" "}
        <span className="text-xs font-medium text-slate-500">
          {unit}
        </span>
      </p>
    </div>
  );
}

/*
 * =========================================================
 * RESULT BOX
 * =========================================================
 */
function ResultBox({
  title,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {title}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {value || "—"}
      </p>
    </div>
  );
}

/*
 * =========================================================
 * TEXT AREA FIELD
 * =========================================================
 */
function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}{" "}
        {required && (
          <span className="text-red-500">
            *
          </span>
        )}
      </label>

      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={4}
        placeholder={placeholder}
        required={required}
        className="
          w-full rounded-xl border border-slate-200
          bg-slate-50 px-4 py-3 text-sm text-slate-700
          outline-none transition
          focus:border-blue-400
          focus:bg-white
          focus:ring-4 focus:ring-blue-500/10
        "
      />
    </div>
  );
}

/*
 * =========================================================
 * SERVICE CARD
 * =========================================================
 */
function ServiceCard({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
  name,
  children,
  activeClass = "border-blue-300 bg-blue-50/40",
}) {
  return (
    <div
      className={`rounded-2xl border p-5 transition ${
        checked
          ? activeClass
          : "border-slate-200 bg-white"
      }`}
    >
      <label className="flex cursor-pointer items-start gap-4">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="
            mt-1 h-5 w-5 rounded
            border-slate-300
            text-blue-600
            focus:ring-blue-500
          "
        />

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
          <Icon
            size={21}
            className="text-blue-600"
          />
        </div>

        <div>
          <p className="font-bold text-slate-900">
            {title}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        </div>
      </label>

      {checked && (
        <div className="mt-5 pl-0 md:pl-9">
          {children}
        </div>
      )}
    </div>
  );
}