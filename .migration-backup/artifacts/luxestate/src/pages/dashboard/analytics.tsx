import { motion } from "framer-motion"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { AnalyticsChart } from "@/components/dashboard/analytics-chart"
import { Button } from "@/components/ui/button"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from "recharts"
import { Download, TrendingUp, TrendingDown, Award } from "lucide-react"
import { cn } from "@/lib/utils"

const conversionData = [
  { name: "Jan", rate: 18 },
  { name: "Feb", rate: 22 },
  { name: "Mar", rate: 19 },
  { name: "Apr", rate: 28 },
  { name: "May", rate: 24 },
  { name: "Jun", rate: 31 },
  { name: "Jul", rate: 27 },
  { name: "Aug", rate: 35 },
  { name: "Sep", rate: 29 },
  { name: "Oct", rate: 38 },
  { name: "Nov", rate: 34 },
  { name: "Dec", rate: 42 },
]

const sourceData = [
  { name: "Referral", value: 35, color: "oklch(0.65 0.15 75)" },
  { name: "Website", value: 28, color: "oklch(0.55 0.15 200)" },
  { name: "Social Media", value: 22, color: "oklch(0.60 0.15 270)" },
  { name: "Email", value: 10, color: "oklch(0.65 0.15 145)" },
  { name: "Other", value: 5, color: "oklch(0.60 0.05 0)" },
]

const forecastData = [
  { month: "Jun", actual: 3.2, forecast: 3.5 },
  { month: "Jul", actual: null, forecast: 4.1 },
  { month: "Aug", actual: null, forecast: 4.8 },
  { month: "Sep", actual: null, forecast: 5.2 },
  { month: "Oct", actual: null, forecast: 5.9 },
  { month: "Nov", actual: null, forecast: 6.4 },
]

const kpis = [
  { label: "Avg. Deal Size", value: "$4.2M", change: "+18%", positive: true },
  { label: "Conversion Rate", value: "24.8%", change: "+6.2pp", positive: true },
  { label: "Time to Close", value: "42 days", change: "-8 days", positive: true },
  { label: "Lead Response", value: "2.3 hrs", change: "+0.4 hrs", positive: false },
]

const agentPerformance = [
  { name: "James Donovan", leads: 12, deals: 4, revenue: "$22.4M", winRate: 33, rank: 1 },
  { name: "Emily Rodriguez", leads: 8, deals: 3, revenue: "$11.2M", winRate: 38, rank: 2 },
  { name: "Sarah Mitchell", leads: 9, deals: 3, revenue: "$15.1M", winRate: 33, rank: 3 },
  { name: "Michael Chen", leads: 11, deals: 2, revenue: "$8.7M", winRate: 18, rank: 4 },
]

const propertyTrends = [
  { month: "Jan", penthouse: 2, villa: 1, estate: 0, condo: 3 },
  { month: "Feb", penthouse: 1, villa: 2, estate: 1, condo: 2 },
  { month: "Mar", penthouse: 3, villa: 1, estate: 2, condo: 1 },
  { month: "Apr", penthouse: 2, villa: 3, estate: 1, condo: 4 },
  { month: "May", penthouse: 4, villa: 2, estate: 3, condo: 2 },
  { month: "Jun", penthouse: 3, villa: 4, estate: 2, condo: 3 },
]

const heatmapData = (() => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  const weeks = Array.from({ length: 12 }, (_, w) => w)
  return days.map((day) => ({
    day,
    values: weeks.map((w) => ({
      week: w,
      value: Math.floor(Math.random() * 10),
    })),
  }))
})()

const heatColor = (v: number) => {
  if (v === 0) return "bg-border/30"
  if (v <= 2) return "bg-primary/20"
  if (v <= 5) return "bg-primary/45"
  if (v <= 7) return "bg-primary/70"
  return "bg-primary"
}

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "0.75rem",
  backdropFilter: "blur(12px)",
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Analytics & Insights"
        description="Deep dive into your performance metrics and market trends."
        actions={
          <Button variant="outline" className="gap-2 border-border/50">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="glass-card p-5"
          >
            <p className="text-sm text-muted-foreground">{kpi.label}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{kpi.value}</p>
            <p className={`mt-1 text-sm font-medium ${kpi.positive ? "text-emerald-500" : "text-red-500"}`}>
              {kpi.change} vs last year
            </p>
          </motion.div>
        ))}
      </div>

      {/* Performance chart + Lead sources */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AnalyticsChart />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">Lead Sources</h3>
            <p className="text-sm text-muted-foreground">Where your leads are coming from</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Share"]}
                  contentStyle={tooltipStyle}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Conversion Trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">Conversion Rate Trend</h3>
          <p className="text-sm text-muted-foreground">Monthly lead-to-deal conversion percentage</p>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={conversionData}>
              <defs>
                <linearGradient id="convGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.65 0.15 75)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.65 0.15 75)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" />
              <YAxis
                axisLine={false}
                tickLine={false}
                className="text-xs fill-muted-foreground"
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip formatter={(v) => [`${v}%`, "Conversion Rate"]} contentStyle={tooltipStyle} />
              <Area
                type="monotone"
                dataKey="rate"
                stroke="oklch(0.65 0.15 75)"
                strokeWidth={2}
                fill="url(#convGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Revenue Forecasting + Property Trends */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass-card p-6"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">Revenue Forecast</h3>
            <p className="text-sm text-muted-foreground">Actual vs projected revenue (millions)</p>
          </div>
          <div className="mb-3 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary" />
              Actual
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary/30 border border-primary/50 border-dashed" />
              Forecast
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecastData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  className="text-xs fill-muted-foreground"
                  tickFormatter={(v) => `$${v}M`}
                />
                <Tooltip
                  formatter={(v, name) => [`$${v}M`, name === "actual" ? "Actual" : "Forecast"]}
                  contentStyle={tooltipStyle}
                />
                <Bar dataKey="actual" fill="oklch(0.65 0.15 75)" radius={[4, 4, 0, 0]} />
                <Bar
                  dataKey="forecast"
                  fill="oklch(0.65 0.15 75)"
                  fillOpacity={0.3}
                  radius={[4, 4, 0, 0]}
                  strokeDasharray="4 2"
                  stroke="oklch(0.65 0.15 75)"
                  strokeWidth={1}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground">Property Type Trends</h3>
            <p className="text-sm text-muted-foreground">Inquiries by property category</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={propertyTrends} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" />
                <YAxis axisLine={false} tickLine={false} className="text-xs fill-muted-foreground" />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="penthouse" fill="oklch(0.65 0.15 75)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="villa" fill="oklch(0.55 0.15 200)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="estate" fill="oklch(0.60 0.15 270)" radius={[3, 3, 0, 0]} />
                <Bar dataKey="condo" fill="oklch(0.65 0.15 145)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Agent Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="glass-card p-6"
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">Agent Performance</h3>
          <p className="text-sm text-muted-foreground">Team rankings and revenue attribution</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                {["Rank", "Agent", "Leads", "Deals Closed", "Revenue", "Win Rate", "Progress"].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {agentPerformance.map((agent) => (
                <tr key={agent.name} className="group transition-colors hover:bg-secondary/20">
                  <td className="px-3 py-4">
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                        agent.rank === 1
                          ? "bg-primary text-primary-foreground"
                          : agent.rank === 2
                            ? "bg-secondary text-foreground"
                            : "text-muted-foreground"
                      )}
                    >
                      {agent.rank === 1 ? <Award className="h-3.5 w-3.5" /> : `#${agent.rank}`}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/70 to-accent/70 text-xs font-semibold text-primary-foreground">
                        {agent.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <span className="font-medium text-foreground">{agent.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-muted-foreground">{agent.leads}</td>
                  <td className="px-3 py-4 font-medium text-foreground">{agent.deals}</td>
                  <td className="px-3 py-4 font-semibold text-foreground">{agent.revenue}</td>
                  <td className="px-3 py-4">
                    <span
                      className={cn(
                        "flex items-center gap-1 font-semibold",
                        agent.winRate >= 30 ? "text-emerald-500" : "text-amber-500"
                      )}
                    >
                      {agent.winRate >= 30 ? (
                        <TrendingUp className="h-3.5 w-3.5" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5" />
                      )}
                      {agent.winRate}%
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex w-28 items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-border/50">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${agent.winRate}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{agent.winRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Activity Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6"
      >
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-foreground">Activity Heatmap</h3>
          <p className="text-sm text-muted-foreground">Contact and follow-up activity over the last 12 weeks</p>
        </div>
        <div className="overflow-x-auto">
          <div className="inline-flex flex-col gap-1 min-w-max">
            {heatmapData.map((row) => (
              <div key={row.day} className="flex items-center gap-1">
                <span className="w-8 flex-shrink-0 text-right text-xs text-muted-foreground">{row.day}</span>
                {row.values.map((cell) => (
                  <div
                    key={cell.week}
                    title={`${cell.value} activities`}
                    className={cn(
                      "h-5 w-5 rounded-sm transition-opacity hover:opacity-80",
                      heatColor(cell.value)
                    )}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Less</span>
            {[0, 2, 5, 7, 9].map((v) => (
              <div key={v} className={cn("h-3 w-3 rounded-sm", heatColor(v))} />
            ))}
            <span className="text-xs text-muted-foreground">More</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
