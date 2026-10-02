import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import {
  Search,
  UserPlus,
  Eye,
  Pencil,
  Users,
  Filter,
  X,
} from "lucide-react";

import { getPatients } from "../../data/patients";

export default function Patients() {
  const [patients] = useState(() => getPatients());

  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const fullName = `${patient.firstName || ""} ${
        patient.middleName || ""
      } ${patient.lastName || ""}`
        .replace(/\s+/g, " ")
        .trim();

      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        fullName.toLowerCase().includes(searchValue) ||
        patient.id?.toLowerCase().includes(searchValue) ||
        patient.phone?.toLowerCase().includes(searchValue);

      const matchesGender =
        genderFilter === "All" ||
        patient.gender === genderFilter;

      const patientStatus = patient.queueStatus || "Waiting";

      const matchesStatus =
        statusFilter === "All" ||
        patientStatus === statusFilter;

      return (
        matchesSearch &&
        matchesGender &&
        matchesStatus
      );
    });
  }, [patients, search, genderFilter, statusFilter]);

  const clearFilters = () => {
    setSearch("");
    setGenderFilter("All");
    setStatusFilter("All");
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
            <Users size={17} />
            <span>Reception</span>
            <span>/</span>
            <span>Patients</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-slate-800">
            Wagonjwa
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage and view all registered patients.
          </p>
        </div>

        <Link
          to="/reception/patients/register"
          className="
            inline-flex items-center justify-center gap-2
            rounded-xl bg-gradient-to-r from-blue-600 to-blue-500
            px-5 py-3 text-sm font-semibold text-white
            shadow-lg shadow-blue-500/20
            transition-all duration-200
            hover:-translate-y-0.5 hover:shadow-xl
          "
        >
          <UserPlus size={18} />
          Register Patient
        </Link>

      </div>


      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="
          rounded-2xl border border-slate-200/80
          bg-white/90 p-5 shadow-sm backdrop-blur
        ">
          <p className="text-sm font-medium text-slate-500">
            Total Patients
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-800">
            {patients.length}
          </p>
        </div>

        <div className="
          rounded-2xl border border-slate-200/80
          bg-white/90 p-5 shadow-sm backdrop-blur
        ">
          <p className="text-sm font-medium text-slate-500">
            Showing
          </p>

          <p className="mt-2 text-3xl font-bold text-blue-600">
            {filteredPatients.length}
          </p>
        </div>

        <div className="
          rounded-2xl border border-slate-200/80
          bg-white/90 p-5 shadow-sm backdrop-blur
        ">
          <p className="text-sm font-medium text-slate-500">
            Active Queue
          </p>

          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {
              patients.filter(
                (patient) =>
                  patient.queueStatus === "Waiting" ||
                  patient.queueStatus === "In Consultation"
              ).length
            }
          </p>
        </div>

      </div>


      {/* Filters */}
      <div className="
        rounded-2xl border border-slate-200/80
        bg-white/90 p-5 shadow-sm backdrop-blur
      ">

        <div className="mb-4 flex items-center justify-between">

          <div className="flex items-center gap-2">
            <Filter size={18} className="text-blue-600" />

            <h2 className="font-semibold text-slate-800">
              Search & Filter
            </h2>
          </div>

          {(search ||
            genderFilter !== "All" ||
            statusFilter !== "All") && (
            <button
              type="button"
              onClick={clearFilters}
              className="
                inline-flex items-center gap-1.5
                text-sm font-semibold text-red-600
                hover:text-red-700
              "
            >
              <X size={16} />
              Clear
            </button>
          )}

        </div>


        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

          {/* Search */}
          <div className="relative md:col-span-1">

            <Search
              size={18}
              className="
                absolute left-4 top-1/2
                -translate-y-1/2 text-slate-400
              "
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, ID or phone..."
              className="
                h-12 w-full rounded-xl
                border border-slate-200
                bg-slate-50/70
                pl-11 pr-4 text-sm text-slate-700
                outline-none transition-all
                placeholder:text-slate-400
                focus:border-blue-400
                focus:bg-white
                focus:ring-4 focus:ring-blue-500/10
              "
            />

          </div>


          {/* Gender */}
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="
              h-12 rounded-xl border border-slate-200
              bg-slate-50/70 px-4 text-sm text-slate-700
              outline-none transition-all
              focus:border-blue-400
              focus:bg-white
              focus:ring-4 focus:ring-blue-500/10
            "
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>


          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="
              h-12 rounded-xl border border-slate-200
              bg-slate-50/70 px-4 text-sm text-slate-700
              outline-none transition-all
              focus:border-blue-400
              focus:bg-white
              focus:ring-4 focus:ring-blue-500/10
            "
          >
            <option value="All">All Statuses</option>
            <option value="Waiting">Waiting</option>
            <option value="In Consultation">
              In Consultation
            </option>
            <option value="Completed">Completed</option>
          </select>

        </div>

      </div>


      {/* Table */}
      <div className="
        overflow-hidden rounded-2xl
        border border-slate-200/80
        bg-white/95 shadow-sm
      ">

        <div className="
          flex items-center justify-between
          border-b border-slate-100
          px-6 py-5
        ">

          <div>
            <h2 className="text-lg font-bold text-slate-800">
              All Patients
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {filteredPatients.length} patient
              {filteredPatients.length !== 1 ? "s" : ""} found
            </p>
          </div>

        </div>


        {filteredPatients.length === 0 ? (

          <div className="px-6 py-16 text-center">

            <div className="
              mx-auto flex h-16 w-16
              items-center justify-center
              rounded-2xl bg-slate-100
            ">
              <Users
                size={28}
                className="text-slate-400"
              />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-slate-800">
              No patients found
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Try changing your search or filters.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[950px]">

              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">

                  <th className="
                    px-6 py-4 text-left
                    text-xs font-bold uppercase
                    tracking-wider text-slate-500
                  ">
                    Patient
                  </th>

                  <th className="
                    px-6 py-4 text-left
                    text-xs font-bold uppercase
                    tracking-wider text-slate-500
                  ">
                    Gender
                  </th>

                  <th className="
                    px-6 py-4 text-left
                    text-xs font-bold uppercase
                    tracking-wider text-slate-500
                  ">
                    Age
                  </th>

                  <th className="
                    px-6 py-4 text-left
                    text-xs font-bold uppercase
                    tracking-wider text-slate-500
                  ">
                    Phone
                  </th>

                  <th className="
                    px-6 py-4 text-left
                    text-xs font-bold uppercase
                    tracking-wider text-slate-500
                  ">
                    Status
                  </th>

                  <th className="
                    px-6 py-4 text-right
                    text-xs font-bold uppercase
                    tracking-wider text-slate-500
                  ">
                    Actions
                  </th>

                </tr>
              </thead>


              <tbody className="divide-y divide-slate-100">

                {filteredPatients.map((patient) => {

                  const fullName =
                    `${patient.firstName || ""} ${
                      patient.middleName || ""
                    } ${patient.lastName || ""}`
                      .replace(/\s+/g, " ")
                      .trim();

                  const status =
                    patient.queueStatus || "Waiting";

                  return (
                    <tr
                      key={patient.id}
                      className="
                        transition-colors
                        hover:bg-blue-50/40
                      "
                    >

                      {/* Patient */}
                      <td className="px-6 py-4">

                        <div className="flex items-center gap-3">

                          <div className="
                            flex h-11 w-11
                            shrink-0 items-center
                            justify-center rounded-full
                            bg-gradient-to-br
                            from-blue-400 to-blue-600
                            text-sm font-bold text-white
                          ">
                            {patient.firstName?.charAt(0)}
                            {patient.lastName?.charAt(0)}
                          </div>

                          <div className="min-w-0">

                            <p className="
                              truncate text-sm
                              font-semibold text-slate-800
                            ">
                              {fullName}
                            </p>

                            <p className="
                              mt-0.5 text-xs
                              font-medium text-slate-400
                            ">
                              {patient.id}
                            </p>

                          </div>

                        </div>

                      </td>


                      {/* Gender */}
                      <td className="px-6 py-4">

                        <span className="text-sm text-slate-600">
                          {patient.gender || "—"}
                        </span>

                      </td>


                      {/* Age */}
                      <td className="px-6 py-4">

                        <span className="text-sm text-slate-600">
                          {patient.age || "—"}
                        </span>

                      </td>


                      {/* Phone */}
                      <td className="px-6 py-4">

                        <span className="text-sm text-slate-600">
                          {patient.phone || "—"}
                        </span>

                      </td>


                      {/* Status */}
                      <td className="px-6 py-4">

                        <span
                          className={`
                            inline-flex items-center
                            rounded-full px-3 py-1
                            text-xs font-bold

                            ${
                              status === "Waiting"
                                ? "bg-amber-50 text-amber-700"
                                : status === "In Consultation"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-emerald-50 text-emerald-700"
                            }
                          `}
                        >
                          <span
                            className={`
                              mr-1.5 h-1.5 w-1.5
                              rounded-full

                              ${
                                status === "Waiting"
                                  ? "bg-amber-500"
                                  : status === "In Consultation"
                                  ? "bg-blue-500"
                                  : "bg-emerald-500"
                              }
                            `}
                          />

                          {status}
                        </span>

                      </td>


                      {/* Actions */}
                      <td className="px-6 py-4">

                        <div className="flex justify-end gap-2">

                          <Link
                            to={`/reception/patients/${patient.id}`}
                            className="
                              flex h-9 w-9
                              items-center justify-center
                              rounded-lg border border-slate-200
                              bg-white text-slate-500
                              transition-all
                              hover:border-blue-200
                              hover:bg-blue-50
                              hover:text-blue-600
                            "
                            title="View patient"
                          >
                            <Eye size={17} />
                          </Link>

                          <Link
                            to={`/reception/patients/${patient.id}/edit`}
                            className="
                              flex h-9 w-9
                              items-center justify-center
                              rounded-lg border border-slate-200
                              bg-white text-slate-500
                              transition-all
                              hover:border-amber-200
                              hover:bg-amber-50
                              hover:text-amber-600
                            "
                            title="Edit patient"
                          >
                            <Pencil size={17} />
                          </Link>

                        </div>

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