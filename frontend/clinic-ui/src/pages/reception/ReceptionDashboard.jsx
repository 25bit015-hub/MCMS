import {
  Users,
  Clock3,
  UserPlus,
  CalendarDays,
  ArrowRight,
  UserRoundPlus,
  ClipboardList,
  Activity,
} from "lucide-react";

import { Link } from "react-router-dom";

import StatCard from "../../components/reception/StatCard";

export default function ReceptionDashboard() {
  return (
    <div className="space-y-8">

      {/* =====================================================
          HEADER
      ====================================================== */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>
          <p className="text-sm font-medium text-blue-600">
            Reception
          </p>

          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-800">
            Reception Dashboard
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Karibu kwenye mfumo wa usimamizi wa kliniki.
          </p>
        </div>

        <Link
          to="/reception/patients/register"
          className="
            inline-flex
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-gradient-to-r
            from-blue-600
            to-cyan-500
            px-5
            py-3
            text-sm
            font-semibold
            text-white
            shadow-lg
            shadow-blue-500/20
            transition
            hover:-translate-y-0.5
            hover:shadow-xl
          "
        >
          <UserRoundPlus size={18} />
          Sajili Mgonjwa
        </Link>

      </div>


      {/* =====================================================
          STAT CARDS
      ====================================================== */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">

        <StatCard
          title="Patients Today"
          value="42"
          subtitle="Leo"
          icon={Users}
          theme="blue"
          trend="+8.2%"
        />

        <StatCard
          title="Waiting"
          value="12"
          subtitle="Wanasubiri"
          icon={Clock3}
          theme="orange"
          trend="+5.1%"
        />

        <StatCard
          title="New Patients"
          value="18"
          subtitle="Leo"
          icon={UserPlus}
          theme="green"
          trend="+12.4%"
        />

        <StatCard
          title="Appointments"
          value="16"
          subtitle="Leo"
          icon={CalendarDays}
          theme="purple"
          trend="+6.8%"
        />

      </div>


      {/* =====================================================
          QUICK ACTIONS + TODAY SUMMARY
      ====================================================== */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* QUICK ACTIONS */}
        <div
          className="
            rounded-3xl
            border
            border-white/80
            bg-white/70
            p-6
            shadow-[0_10px_35px_rgba(30,64,175,0.07)]
            backdrop-blur-xl
            xl:col-span-1
          "
        >

          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-800">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Vitendo vinavyotumika mara kwa mara.
            </p>
          </div>


          <div className="space-y-3">

            <Link
              to="/reception/patients/register"
              className="
                group
                flex
                items-center
                justify-between
                rounded-2xl
                border
                border-blue-100
                bg-blue-50/70
                p-4
                transition
                hover:border-blue-200
                hover:bg-blue-50
              "
            >

              <div className="flex items-center gap-3">

                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-100
                    text-blue-600
                  "
                >
                  <UserPlus size={20} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Sajili Mgonjwa
                  </p>

                  <p className="text-xs text-slate-500">
                    Ongeza mgonjwa mpya
                  </p>
                </div>

              </div>

              <ArrowRight
                size={18}
                className="
                  text-blue-500
                  transition
                  group-hover:translate-x-1
                "
              />

            </Link>


            <Link
              to="/reception/patients"
              className="
                group
                flex
                items-center
                justify-between
                rounded-2xl
                border
                border-emerald-100
                bg-emerald-50/70
                p-4
                transition
                hover:border-emerald-200
                hover:bg-emerald-50
              "
            >

              <div className="flex items-center gap-3">

                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-emerald-100
                    text-emerald-600
                  "
                >
                  <Users size={20} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Wagonjwa Wote
                  </p>

                  <p className="text-xs text-slate-500">
                    Angalia wagonjwa wote
                  </p>
                </div>

              </div>

              <ArrowRight
                size={18}
                className="
                  text-emerald-500
                  transition
                  group-hover:translate-x-1
                "
              />

            </Link>


            <button
              className="
                group
                flex
                w-full
                items-center
                justify-between
                rounded-2xl
                border
                border-purple-100
                bg-purple-50/70
                p-4
                text-left
                transition
                hover:border-purple-200
                hover:bg-purple-50
              "
            >

              <div className="flex items-center gap-3">

                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-xl
                    bg-purple-100
                    text-purple-600
                  "
                >
                  <CalendarDays size={20} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Appointments
                  </p>

                  <p className="text-xs text-slate-500">
                    Angalia appointments
                  </p>
                </div>

              </div>

              <ArrowRight
                size={18}
                className="
                  text-purple-500
                  transition
                  group-hover:translate-x-1
                "
              />

            </button>

          </div>

        </div>


        {/* TODAY SUMMARY */}
        <div
          className="
            rounded-3xl
            border
            border-white/80
            bg-white/70
            p-6
            shadow-[0_10px_35px_rgba(30,64,175,0.07)]
            backdrop-blur-xl
            xl:col-span-2
          "
        >

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Muhtasari wa Leo
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Hali ya huduma kwa siku ya leo.
              </p>
            </div>

            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-xl
                bg-blue-50
                text-blue-600
              "
            >
              <Activity size={21} />
            </div>

          </div>


          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

            <div className="rounded-2xl bg-slate-50 p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <ClipboardList size={19} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Registered
                  </p>

                  <p className="text-xl font-bold text-slate-800">
                    42
                  </p>
                </div>

              </div>

            </div>


            <div className="rounded-2xl bg-slate-50 p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <Clock3 size={19} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Waiting
                  </p>

                  <p className="text-xl font-bold text-slate-800">
                    12
                  </p>
                </div>

              </div>

            </div>


            <div className="rounded-2xl bg-slate-50 p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <Activity size={19} />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Completed
                  </p>

                  <p className="text-xl font-bold text-slate-800">
                    24
                  </p>
                </div>

              </div>

            </div>

          </div>


          {/* PROGRESS */}
          <div className="mt-7">

            <div className="mb-2 flex items-center justify-between">

              <span className="text-xs font-semibold text-slate-500">
                Huduma zilizokamilika
              </span>

              <span className="text-xs font-bold text-slate-700">
                57%
              </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-100">

              <div
                className="
                  h-full
                  w-[57%]
                  rounded-full
                  bg-gradient-to-r
                  from-blue-500
                  to-cyan-400
                "
              />

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          RECENT PATIENTS
      ====================================================== */}
      <div
        className="
          overflow-hidden
          rounded-3xl
          border
          border-white/80
          bg-white/70
          shadow-[0_10px_35px_rgba(30,64,175,0.07)]
          backdrop-blur-xl
        "
      >

        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Recent Patients
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Wagonjwa waliosajiliwa hivi karibuni.
            </p>
          </div>

          <Link
            to="/reception/patients"
            className="
              flex
              items-center
              gap-1
              text-sm
              font-semibold
              text-blue-600
              hover:text-blue-700
            "
          >
            View All
            <ArrowRight size={16} />
          </Link>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead className="bg-slate-50/70">

              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Patient
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Patient ID
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Gender
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Status
                </th>

                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                  Time
                </th>
              </tr>

            </thead>


            <tbody className="divide-y divide-slate-100">

              <tr className="transition hover:bg-blue-50/40">

                <td className="px-6 py-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                      AP
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Ali Rajab Pandu
                      </p>

                      <p className="text-xs text-slate-500">
                        0777809000
                      </p>
                    </div>

                  </div>

                </td>

                <td className="px-6 py-4 text-sm font-medium text-slate-600">
                  PT-0001
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  Male
                </td>

                <td className="px-6 py-4">

                  <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                    Active
                  </span>

                </td>

                <td className="px-6 py-4 text-sm text-slate-500">
                  09:20 AM
                </td>

              </tr>


              <tr className="transition hover:bg-blue-50/40">

                <td className="px-6 py-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">
                      JH
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Juma Hassan
                      </p>

                      <p className="text-xs text-slate-500">
                        0712345678
                      </p>
                    </div>

                  </div>

                </td>

                <td className="px-6 py-4 text-sm font-medium text-slate-600">
                  PT-0002
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  Male
                </td>

                <td className="px-6 py-4">

                  <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                    Waiting
                  </span>

                </td>

                <td className="px-6 py-4 text-sm text-slate-500">
                  09:35 AM
                </td>

              </tr>


              <tr className="transition hover:bg-blue-50/40">

                <td className="px-6 py-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-sm font-bold text-pink-600">
                      AS
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Asha Salim
                      </p>

                      <p className="text-xs text-slate-500">
                        0756123456
                      </p>
                    </div>

                  </div>

                </td>

                <td className="px-6 py-4 text-sm font-medium text-slate-600">
                  PT-0003
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  Female
                </td>

                <td className="px-6 py-4">

                  <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                    Active
                  </span>

                </td>

                <td className="px-6 py-4 text-sm text-slate-500">
                  10:05 AM
                </td>

              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}