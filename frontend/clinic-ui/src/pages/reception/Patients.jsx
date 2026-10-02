import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Search,
  UserPlus,
  Eye,
  Pencil,
  Plus,
  Users,
  UserCheck,
  UserRound,
  UserRoundCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  X,
} from "lucide-react";

import StatCard from "../../components/reception/StatCard";
import api from "../../services/api";

export default function Patients() {
  const [patients, setPatients] = useState([]);

  const [search, setSearch] = useState("");

  const [genderFilter, setGenderFilter] = useState("All");

  const [statusFilter, setStatusFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const patientsPerPage = 8;

  /* =========================================================
     LOAD PATIENTS FROM DATABASE
  ========================================================= */

  const loadPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/patients");

      setPatients(response.data || []);
    } catch (err) {
      console.error("LOAD PATIENTS ERROR:", err);

      if (err.response?.status === 401) {
        setError(
          "Session yako imekwisha. Tafadhali login tena."
        );
      } else if (err.response?.status === 403) {
        setError(
          "Huna ruhusa ya kuona orodha ya wagonjwa."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Imeshindikana kupata taarifa za wagonjwa."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  /* =========================================================
     AGE HELPER
  ========================================================= */

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) {
      return "-";
    }

    const today = new Date();

    const birthDate = new Date(dateOfBirth);

    let age =
      today.getFullYear() -
      birthDate.getFullYear();

    const monthDifference =
      today.getMonth() -
      birthDate.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 &&
        today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= 0 ? age : "-";
  };

  /* =========================================================
     REGISTERED DATE HELPER
  ========================================================= */

  const formatRegisteredDate = (registeredAt) => {
    if (!registeredAt) {
      return "-";
    }

    const date = new Date(registeredAt);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  /* =========================================================
     FULL NAME
  ========================================================= */

  const getFullName = (patient) => {
    return [
      patient.firstName,
      patient.middleName,
      patient.lastName,
    ]
      .filter(Boolean)
      .join(" ");
  };

  /* =========================================================
     INITIALS
  ========================================================= */

  const getInitials = (patient) => {
    return (
      `${patient.firstName?.charAt(0) || ""}${
        patient.lastName?.charAt(0) || ""
      }`
    ).toUpperCase();
  };

  /* =========================================================
     NORMALIZED STATUS
     
     Backend Patient entity currently does not have status.
     Therefore registered patients are displayed as Active.
  ========================================================= */

  const getPatientStatus = (patient) => {
    return patient.status || "Active";
  };

  /* =========================================================
     STATISTICS
  ========================================================= */

  const totalPatients = patients.length;

  const activePatients = patients.filter(
    (patient) =>
      getPatientStatus(patient) === "Active"
  ).length;

  const malePatients = patients.filter(
    (patient) => patient.gender === "Male"
  ).length;

  const femalePatients = patients.filter(
    (patient) => patient.gender === "Female"
  ).length;

  /* =========================================================
     SEARCH + FILTER
  ========================================================= */

  const filteredPatients = useMemo(() => {
    const searchValue =
      search.toLowerCase().trim();

    return patients.filter((patient) => {
      const fullName =
        getFullName(patient).toLowerCase();

      const patientNumber =
        String(
          patient.patientNumber || ""
        ).toLowerCase();

      const patientId =
        String(patient.id || "").toLowerCase();

      const phone =
        String(patient.phone || "").toLowerCase();

      const matchesSearch =
        fullName.includes(searchValue) ||
        patientNumber.includes(searchValue) ||
        patientId.includes(searchValue) ||
        phone.includes(searchValue);

      const matchesGender =
        genderFilter === "All" ||
        patient.gender === genderFilter;

      const matchesStatus =
        statusFilter === "All" ||
        getPatientStatus(patient) ===
          statusFilter;

      return (
        matchesSearch &&
        matchesGender &&
        matchesStatus
      );
    });
  }, [
    patients,
    search,
    genderFilter,
    statusFilter,
  ]);

  /* =========================================================
     PAGINATION
  ========================================================= */

  const totalPages = Math.ceil(
    filteredPatients.length /
      patientsPerPage
  );

  const startIndex =
    (currentPage - 1) * patientsPerPage;

  const endIndex =
    startIndex + patientsPerPage;

  const currentPatients =
    filteredPatients.slice(
      startIndex,
      endIndex
    );

  /* =========================================================
     RESET FILTERS
  ========================================================= */

  const resetFilters = () => {
    setSearch("");
    setGenderFilter("All");
    setStatusFilter("All");
    setCurrentPage(1);
  };

  /* =========================================================
     SEARCH CHANGE
  ========================================================= */

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  /* =========================================================
     EXPORT CSV
  ========================================================= */

  const handleExport = () => {
    if (filteredPatients.length === 0) {
      alert(
        "Hakuna wagonjwa wa ku-export."
      );
      return;
    }

    const headers = [
      "Patient ID",
      "First Name",
      "Last Name",
      "Gender",
      "Date of Birth",
      "Age",
      "Phone",
      "Email",
      "Address",
      "Emergency Contact",
      "Emergency Phone",
      "Status",
      "Registered",
    ];

    const rows = filteredPatients.map(
      (patient) => [
        patient.patientNumber ||
          `PAT-${String(patient.id).padStart(
            6,
            "0"
          )}`,

        patient.firstName || "",

        patient.lastName || "",

        patient.gender || "",

        patient.dateOfBirth || "",

        calculateAge(
          patient.dateOfBirth
        ),

        patient.phone || "",

        patient.email || "",

        patient.address || "",

        patient.emergencyContact || "",

        patient.emergencyPhone || "",

        getPatientStatus(patient),

        formatRegisteredDate(
          patient.registeredAt
        ),
      ]
    );

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => {
            const safeValue =
              String(value ?? "");

            return `"${safeValue.replace(
              /"/g,
              '""'
            )}"`;
          })
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      ["\uFEFF" + csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    const date =
      new Date()
        .toISOString()
        .split("T")[0];

    link.download = `patients-${date}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">

          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          <p className="text-sm font-medium text-slate-500">
            Inapakia taarifa za wagonjwa...
          </p>

        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <div className="space-y-6">

        <div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500" />

            <span className="text-sm font-semibold text-red-600">
              Reception
            </span>
          </div>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-800">
            Wagonjwa Wote
          </h1>
        </div>

        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-500">
            <Users size={28} />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-800">
            Imeshindikana kupata wagonjwa
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={loadPatients}
            className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Jaribu Tena
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* ===================================================
          PAGE HEADER
      ==================================================== */}

      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

        <div>

          <div className="flex items-center gap-2">

            <span className="h-2 w-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />

            <span className="text-sm font-semibold text-blue-600">
              Reception
            </span>

          </div>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-800">
            Wagonjwa Wote
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Orodha ya wagonjwa wote waliosajiliwa kwenye kliniki.
          </p>

        </div>

        {/* REGISTER BUTTON */}

        <Link
          to="/reception/patients/register"
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-2xl
            bg-gradient-to-r
            from-blue-600
            to-cyan-500
            px-5
            py-3
            text-sm
            font-bold
            text-white
            shadow-lg
            shadow-blue-500/20
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:shadow-xl
            hover:shadow-blue-500/25
          "
        >
          <UserPlus size={18} />

          Sajili Mgonjwa
        </Link>

      </div>

      {/* ===================================================
          STAT CARDS
      ==================================================== */}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Jumla ya Wagonjwa"
          value={totalPatients.toLocaleString()}
          subtitle="Wote"
          icon={Users}
          theme="blue"
        />

        <StatCard
          title="Active Patients"
          value={activePatients.toLocaleString()}
          subtitle="Active"
          icon={UserCheck}
          theme="green"
        />

        <StatCard
          title="Wanaume"
          value={malePatients.toLocaleString()}
          subtitle="Male"
          icon={UserRound}
          theme="purple"
        />

        <StatCard
          title="Wanawake"
          value={femalePatients.toLocaleString()}
          subtitle="Female"
          icon={UserRoundCheck}
          theme="orange"
        />

      </div>

      {/* ===================================================
          SEARCH + FILTER PANEL
      ==================================================== */}

      <div
        className="
          rounded-3xl
          border
          border-white/80
          bg-white/70
          p-5
          shadow-[0_10px_35px_rgba(30,64,175,0.07)]
          backdrop-blur-xl
        "
      >

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

          {/* SEARCH */}

          <div className="relative w-full xl:max-w-xl">

            <Search
              size={19}
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="text"
              value={search}
              onChange={handleSearch}
              placeholder="Tafuta kwa jina, Patient ID au simu..."
              className="
                h-12
                w-full
                rounded-2xl
                border
                border-slate-200
                bg-white/90
                pl-11
                pr-4
                text-sm
                text-slate-700
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-blue-400
                focus:ring-4
                focus:ring-blue-500/10
              "
            />

          </div>

          {/* FILTERS */}

          <div className="flex flex-col gap-3 sm:flex-row">

            {/* GENDER */}

            <div className="relative">

              <Filter
                size={16}
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-slate-400
                "
              />

              <select
                value={genderFilter}
                onChange={(event) => {
                  setGenderFilter(
                    event.target.value
                  );

                  setCurrentPage(1);
                }}
                className="
                  h-12
                  min-w-[150px]
                  appearance-none
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  pl-9
                  pr-9
                  text-sm
                  font-medium
                  text-slate-600
                  outline-none
                  transition
                  focus:border-blue-400
                  focus:ring-4
                  focus:ring-blue-500/10
                "
              >
                <option value="All">
                  Jinsia Zote
                </option>

                <option value="Male">
                  Wanaume
                </option>

                <option value="Female">
                  Wanawake
                </option>
              </select>

            </div>

            {/* STATUS */}

            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(
                  event.target.value
                );

                setCurrentPage(1);
              }}
              className="
                h-12
                min-w-[150px]
                rounded-2xl
                border
                border-slate-200
                bg-white
                px-4
                text-sm
                font-medium
                text-slate-600
                outline-none
                transition
                focus:border-blue-400
                focus:ring-4
                focus:ring-blue-500/10
              "
            >
              <option value="All">
                Status Zote
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>

            {/* RESET */}

            {(search ||
              genderFilter !== "All" ||
              statusFilter !== "All") && (
              <button
                onClick={resetFilters}
                className="
                  inline-flex
                  h-12
                  items-center
                  justify-center
                  gap-2
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  text-sm
                  font-semibold
                  text-slate-600
                  transition
                  hover:bg-slate-50
                "
              >
                <X size={17} />

                Clear
              </button>
            )}

          </div>

        </div>

        {/* FILTER RESULT */}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">

          <p className="text-xs font-medium text-slate-400">

            Inaonyesha{" "}

            <span className="font-bold text-slate-600">
              {filteredPatients.length}
            </span>{" "}

            ya{" "}

            <span className="font-bold text-slate-600">
              {patients.length}
            </span>{" "}

            wagonjwa

          </p>

          {/* EXPORT */}

          <button
            onClick={handleExport}
            disabled={filteredPatients.length === 0}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              px-3
              py-2
              text-xs
              font-semibold
              text-slate-500
              transition
              hover:bg-slate-100
              hover:text-slate-700
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <Download size={15} />

            Export
          </button>

        </div>

      </div>

      {/* ===================================================
          PATIENT TABLE
      ==================================================== */}

      <div
        className="
          overflow-hidden
          rounded-3xl
          border
          border-white/80
          bg-white/75
          shadow-[0_10px_35px_rgba(30,64,175,0.07)]
          backdrop-blur-xl
        "
      >

        {/* TABLE HEADER */}

        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center">

          <div>

            <h2 className="text-lg font-bold text-slate-800">
              Patient List
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Taarifa za wagonjwa waliosajiliwa.
            </p>

          </div>

          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-blue-50
              px-3
              py-2
              text-xs
              font-bold
              text-blue-600
            "
          >
            <Users size={15} />

            {filteredPatients.length} Patients

          </div>

        </div>

        {/* TABLE */}

        <div className="overflow-x-auto">

          <table className="w-full min-w-[900px] text-left">

            <thead className="bg-slate-50/70">

              <tr>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Patient
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Patient ID
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Age
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Gender
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Phone
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Registered
                </th>

                <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-slate-100">

              {currentPatients.length > 0 ? (

                currentPatients.map((patient) => {

                  const status =
                    getPatientStatus(patient);

                  return (
                    <tr
                      key={patient.id}
                      className="
                        group
                        transition-colors
                        hover:bg-blue-50/40
                      "
                    >

                      {/* PATIENT */}

                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div
                            className="
                              flex
                              h-11
                              w-11
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              bg-gradient-to-br
                              from-blue-100
                              to-cyan-100
                              text-sm
                              font-extrabold
                              text-blue-600
                              ring-4
                              ring-white
                            "
                          >
                            {getInitials(patient)}
                          </div>

                          <div>

                            <p className="text-sm font-bold text-slate-800">
                              {getFullName(patient)}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              Registered Patient
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* ID */}

                      <td className="px-6 py-4">

                        <span
                          className="
                            rounded-lg
                            bg-slate-100
                            px-2.5
                            py-1.5
                            font-mono
                            text-xs
                            font-semibold
                            text-slate-600
                          "
                        >
                          {patient.patientNumber ||
                            `PAT-${String(
                              patient.id
                            ).padStart(6, "0")}`}
                        </span>

                      </td>

                      {/* AGE */}

                      <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                        {calculateAge(
                          patient.dateOfBirth
                        )}
                      </td>

                      {/* GENDER */}

                      <td className="px-6 py-4">

                        <span
                          className={`
                            inline-flex
                            rounded-full
                            px-3
                            py-1.5
                            text-xs
                            font-bold
                            ${
                              patient.gender ===
                              "Male"
                                ? "bg-purple-50 text-purple-600"
                                : "bg-pink-50 text-pink-600"
                            }
                          `}
                        >
                          {patient.gender ===
                          "Male"
                            ? "Mwanaume"
                            : "Mwanamke"}
                        </span>

                      </td>

                      {/* PHONE */}

                      <td className="px-6 py-4 text-sm font-medium text-slate-600">
                        {patient.phone || "-"}
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">

                        <span
                          className={`
                            inline-flex
                            items-center
                            gap-2
                            rounded-full
                            px-3
                            py-1.5
                            text-xs
                            font-bold
                            ${
                              status === "Active"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-slate-100 text-slate-500"
                            }
                          `}
                        >

                          <span
                            className={`
                              h-1.5
                              w-1.5
                              rounded-full
                              ${
                                status ===
                                "Active"
                                  ? "bg-emerald-500"
                                  : "bg-slate-400"
                              }
                            `}
                          />

                          {status}

                        </span>

                      </td>

                      {/* REGISTERED */}

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatRegisteredDate(
                          patient.registeredAt
                        )}
                      </td>

                      {/* ACTIONS */}

                      <td className="px-6 py-4">

                        <div className="flex items-center justify-center gap-2">

                          {/* VIEW */}

                          <Link
                            to={`/reception/patients/${patient.id}`}
                            className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-lg
                              text-slate-500
                              transition
                              hover:bg-blue-50
                              hover:text-blue-600
                            "
                            title="View Patient"
                          >
                            <Eye size={17} />
                          </Link>

                          {/* EDIT */}

                          <Link
                            to={`/reception/patients/${patient.id}/edit`}
                            title="Edit Patient"
                            className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-xl
                              border
                              border-slate-200
                              bg-white
                              text-slate-500
                              shadow-sm
                              transition
                              hover:border-amber-200
                              hover:bg-amber-50
                              hover:text-amber-600
                            "
                          >
                            <Pencil size={16} />
                          </Link>

                        </div>

                      </td>

                    </tr>
                  );
                })

              ) : (

                /* EMPTY STATE */

                <tr>

                  <td
                    colSpan="8"
                    className="px-6 py-16 text-center"
                  >

                    <div className="mx-auto flex max-w-sm flex-col items-center">

                      <div
                        className="
                          flex
                          h-16
                          w-16
                          items-center
                          justify-center
                          rounded-2xl
                          bg-slate-100
                          text-slate-400
                        "
                      >
                        <Users size={28} />
                      </div>

                      <h3 className="mt-4 text-base font-bold text-slate-700">
                        Hakuna wagonjwa
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        Hakuna mgonjwa anayelingana na search au filters zako.
                      </p>

                      <button
                        onClick={resetFilters}
                        className="
                          mt-5
                          inline-flex
                          items-center
                          gap-2
                          rounded-xl
                          bg-blue-600
                          px-4
                          py-2.5
                          text-sm
                          font-semibold
                          text-white
                          transition
                          hover:bg-blue-700
                        "
                      >
                        <X size={16} />

                        Clear Filters
                      </button>

                    </div>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* =================================================
            PAGINATION
        ================================================== */}

        <div className="flex flex-col justify-between gap-4 border-t border-slate-100 px-6 py-5 sm:flex-row sm:items-center">

          <p className="text-xs font-medium text-slate-400">

            Showing{" "}

            <span className="font-bold text-slate-600">
              {filteredPatients.length === 0
                ? 0
                : startIndex + 1}
            </span>

            {" - "}

            <span className="font-bold text-slate-600">
              {Math.min(
                endIndex,
                filteredPatients.length
              )}
            </span>

            {" "}of{" "}

            <span className="font-bold text-slate-600">
              {filteredPatients.length}
            </span>

          </p>

          <div className="flex items-center gap-2">

            {/* PREVIOUS */}

            <button
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage((page) =>
                  Math.max(page - 1, 1)
                )
              }
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                text-slate-500
                transition
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <ChevronLeft size={17} />
            </button>

            {/* PAGE NUMBERS */}

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1
            ).map((page) => (

              <button
                key={page}
                onClick={() =>
                  setCurrentPage(page)
                }
                className={`
                  flex
                  h-9
                  min-w-9
                  items-center
                  justify-center
                  rounded-xl
                  px-2
                  text-xs
                  font-bold
                  transition
                  ${
                    currentPage === page
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  }
                `}
              >
                {page}
              </button>

            ))}

            {/* NEXT */}

            <button
              disabled={
                currentPage === totalPages ||
                totalPages === 0
              }
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(
                    page + 1,
                    totalPages
                  )
                )
              }
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                text-slate-500
                transition
                hover:bg-slate-50
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <ChevronRight size={17} />
            </button>

          </div>

        </div>

      </div>

      {/* ===================================================
          FLOATING ADD BUTTON
      ==================================================== */}

      <Link
        to="/reception/patients/register"
        title="Sajili Mgonjwa"
        className="
          fixed
          bottom-7
          right-7
          z-20
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl
          bg-gradient-to-br
          from-blue-600
          to-cyan-500
          text-white
          shadow-xl
          shadow-blue-500/30
          transition-all
          duration-300
          hover:-translate-y-1
          hover:scale-105
          hover:shadow-2xl
          hover:shadow-blue-500/40
        "
      >
        <Plus size={25} strokeWidth={2.5} />
      </Link>

    </div>
  );
}