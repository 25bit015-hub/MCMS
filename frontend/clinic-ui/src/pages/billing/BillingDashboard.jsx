import {
  ArrowRight,
  Banknote,
  Building2,
  CreditCard,
  FileText,
  Receipt,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";

const summaryCards = [
  {
    title: "Today's Revenue",
    value: "TZS 2.48M",
    description: "Cash + Insurance",
    icon: Wallet,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    title: "Cash Payments",
    value: "TZS 1.35M",
    description: "Today's cash collection",
    icon: Banknote,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    title: "Insurance Claims",
    value: "TZS 1.13M",
    description: "Submitted / approved claims",
    icon: ShieldCheck,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    title: "Pending Bills",
    value: "12",
    description: "Invoices awaiting payment",
    icon: Receipt,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
];

const billingOptions = [
  {
    title: "Cash Billing",
    description:
      "Create invoices, receive cash payments and issue receipts.",
    icon: Banknote,
    href: "/billing/cash",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    title: "Insurance Billing",
    description:
      "Manage insured patients, claims, approvals and co-payments.",
    icon: ShieldCheck,
    href: "/billing/insurance",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    title: "Invoices",
    description:
      "View, search and manage clinic invoices and outstanding balances.",
    icon: FileText,
    href: "/billing/invoices",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    title: "Payments",
    description:
      "Receive payments, record transactions and manage outstanding invoice balances.",
    icon: CreditCard,
    href: "/billing/payments",
    iconBg: "bg-cyan-50",
    iconColor: "text-cyan-600",
  },
  {
    title: "Insurance Providers",
    description:
      "Manage insurance companies and their billing information.",
    icon: Building2,
    href: "/billing/insurance-providers",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  {
  title: "Insurance Claims",
  description:
    "Manage insurance claims, approvals, rejected claims and claim payments.",
  icon: FileText,
  href: "/billing/insurance-claims",
  iconBg: "bg-purple-50",
  iconColor: "text-purple-600",
},
];

const recentTransactions = [
  {
    patient: "John Michael",
    invoice: "INV-00124",
    type: "Cash",
    amount: "TZS 50,000",
    status: "Paid",
  },
  {
    patient: "Asha Salum",
    invoice: "INV-00123",
    type: "Insurance",
    amount: "TZS 85,000",
    status: "Claim Pending",
  },
  {
    patient: "Mohamed Ali",
    invoice: "INV-00122",
    type: "Cash",
    amount: "TZS 35,000",
    status: "Paid",
  },
  {
    patient: "Fatma Hassan",
    invoice: "INV-00121",
    type: "Insurance",
    amount: "TZS 120,000",
    status: "Approved",
  },
];

export default function BillingDashboard() {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <Receipt size={16} />
            Billing & Payments
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Billing Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage cash payments, insurance billing and clinic invoices.
          </p>
        </div>

        <Link
          to="/billing/invoices/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
        >
          <FileText size={18} />
          Create Invoice
        </Link>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.iconBg}`}
              >
                <Icon size={21} className={card.iconColor} />
              </div>

              <div className="mt-5">
                <p className="text-sm font-medium text-slate-500">
                  {card.title}
                </p>

                <h2 className="mt-1 text-2xl font-bold text-slate-900">
                  {card.value}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {card.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* BILLING OPTIONS */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            Billing Services
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Choose a billing service to continue.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {billingOptions.map((option) => {
            const Icon = option.icon;

            return (
              <Link
                key={option.title}
                to={option.href}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${option.iconBg}`}
                  >
                    <Icon size={22} className={option.iconColor} />
                  </div>

                  <ArrowRight
                    size={19}
                    className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-500"
                  />
                </div>

                <h3 className="mt-4 text-base font-bold text-slate-800">
                  {option.title}
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  {option.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* RECENT TRANSACTIONS */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-bold text-slate-900">
              Recent Transactions
            </h2>

            <p className="mt-0.5 text-xs text-slate-400">
              Latest billing transactions
            </p>
          </div>

          <Link
            to="/billing/invoices"
            className="text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            View all
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Patient
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Invoice
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Payment Type
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Amount
                </th>

                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {recentTransactions.map((transaction) => (
                <tr
                  key={transaction.invoice}
                  className="transition hover:bg-slate-50"
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-slate-800">
                      {transaction.patient}
                    </p>
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-sm font-medium text-slate-600">
                      {transaction.invoice}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        transaction.type === "Cash"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-violet-50 text-violet-600"
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="text-sm font-bold text-slate-800">
                      {transaction.amount}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        transaction.status === "Paid"
                          ? "bg-emerald-50 text-emerald-600"
                          : transaction.status === "Approved"
                            ? "bg-blue-50 text-blue-600"
                            : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}