import {
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const themes = {
  blue: {
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    glow: "bg-blue-400/10",
    accent: "from-blue-500 to-cyan-400",
    badge: "bg-blue-50 text-blue-600",
    border: "from-blue-400 via-cyan-400 to-transparent",
  },

  orange: {
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
    glow: "bg-orange-400/10",
    accent: "from-orange-500 to-amber-400",
    badge: "bg-orange-50 text-orange-600",
    border: "from-orange-400 via-amber-400 to-transparent",
  },

  green: {
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    glow: "bg-emerald-400/10",
    accent: "from-emerald-500 to-teal-400",
    badge: "bg-emerald-50 text-emerald-600",
    border: "from-emerald-400 via-teal-400 to-transparent",
  },

  purple: {
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    glow: "bg-purple-400/10",
    accent: "from-purple-500 to-violet-400",
    badge: "bg-purple-50 text-purple-600",
    border: "from-purple-400 via-violet-400 to-transparent",
  },

  red: {
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    glow: "bg-red-400/10",
    accent: "from-red-500 to-rose-400",
    badge: "bg-red-50 text-red-600",
    border: "from-red-400 via-rose-400 to-transparent",
  },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  theme = "blue",
  trend,
  trendDirection = "up",
}) {
  const currentTheme = themes[theme] || themes.blue;

  const TrendIcon =
    trendDirection === "down"
      ? ArrowDownRight
      : ArrowUpRight;

  return (
    <div className="group relative">

      {/* =========================================
          MODERN TOP BORDER
      ========================================== */}
      <div
        className={`
          absolute
          left-8
          right-8
          top-0
          z-20
          h-[2px]
          rounded-full
          bg-gradient-to-r
          ${currentTheme.border}
          opacity-80
          blur-[0.3px]
          transition-all
          duration-500
          group-hover:left-4
          group-hover:right-4
          group-hover:opacity-100
        `}
      />

      {/* LEFT TOP CORNER */}
      <div
        className={`
          absolute
          left-0
          top-0
          h-8
          w-8
          rounded-tl-3xl
          border-l-2
          border-t-2
          border-blue-300/30
          pointer-events-none
          transition-all
          duration-300
          group-hover:h-10
          group-hover:w-10
        `}
      />

      {/* RIGHT TOP CORNER */}
      <div
        className="
          pointer-events-none
          absolute
          right-0
          top-0
          h-8
          w-8
          rounded-tr-3xl
          border-r-2
          border-t-2
          border-slate-200/70
          transition-all
          duration-300
          group-hover:h-10
          group-hover:w-10
        "
      />

      {/* =========================================
          MAIN CARD
      ========================================== */}
      <div
        className="
          relative
          overflow-hidden
          rounded-3xl
          border
          border-white/80
          bg-white/70
          p-6
          pt-7
          backdrop-blur-xl
          shadow-[0_10px_35px_rgba(30,64,175,0.08)]
          transition-all
          duration-300
          group-hover:-translate-y-1
          group-hover:shadow-[0_20px_50px_rgba(30,64,175,0.15)]
        "
      >

        {/* =====================================
            DECORATIVE BACKGROUND GLOW
        ====================================== */}
        <div
          className={`
            pointer-events-none
            absolute
            -right-16
            -top-16
            h-40
            w-40
            rounded-full
            blur-3xl
            ${currentTheme.glow}
            transition-all
            duration-500
            group-hover:scale-125
          `}
        />

        {/* Second subtle glow */}
        <div
          className={`
            pointer-events-none
            absolute
            -left-20
            bottom-0
            h-28
            w-28
            rounded-full
            blur-3xl
            ${currentTheme.glow}
            opacity-40
          `}
        />

        <div className="relative">

          {/* ===================================
              TOP ROW
          ==================================== */}
          <div className="flex items-start justify-between">

            {/* ICON */}
            <div
              className={`
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                ${currentTheme.iconBg}
                shadow-sm
                transition-all
                duration-300
                group-hover:scale-110
                group-hover:rotate-2
              `}
            >
              <Icon
                size={25}
                strokeWidth={2}
                className={currentTheme.iconColor}
              />
            </div>

            {/* TREND */}
            {trend && (
              <div
                className={`
                  flex
                  items-center
                  gap-1
                  rounded-full
                  px-2.5
                  py-1
                  text-xs
                  font-bold
                  ${currentTheme.badge}
                `}
              >
                <TrendIcon size={14} />
                <span>{trend}</span>
              </div>
            )}

          </div>

          {/* ===================================
              CARD INFORMATION
          ==================================== */}
          <div className="mt-7">

            <p className="text-sm font-medium text-slate-500">
              {title}
            </p>

            <div className="mt-1 flex items-end justify-between">

              <h2 className="text-4xl font-extrabold tracking-tight text-slate-800">
                {value}
              </h2>

              {subtitle && (
                <span className="mb-1 text-xs font-semibold text-slate-400">
                  {subtitle}
                </span>
              )}

            </div>

          </div>

          {/* ===================================
              BOTTOM ACCENT
          ==================================== */}
          <div className="mt-6 h-1 overflow-hidden rounded-full bg-slate-100">

            <div
              className={`
                h-full
                w-[68%]
                rounded-full
                bg-gradient-to-r
                ${currentTheme.accent}
                transition-all
                duration-500
                group-hover:w-[85%]
              `}
            />

          </div>

        </div>
      </div>

    </div>
  );
}