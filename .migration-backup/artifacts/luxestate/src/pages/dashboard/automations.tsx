import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Zap,
  Plus,
  Clock,
  Bell,
  MessageCircle,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Trash2,
  CalendarClock,
  UserCheck,
  TrendingDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { surfaceInputClass } from "@/lib/ui-classes"

type AutomationRule = {
  id: number
  name: string
  trigger: string
  action: string
  icon: React.ElementType
  active: boolean
  color: string
  runsToday: number
  category: "reminder" | "message" | "pipeline" | "alert"
}

const initialRules: AutomationRule[] = [
  {
    id: 1,
    name: "3-Day Inactivity Reminder",
    trigger: "Lead has no activity for 3 days",
    action: "Send agent reminder + WhatsApp draft",
    icon: Clock,
    active: true,
    color: "text-amber-500",
    runsToday: 2,
    category: "reminder",
  },
  {
    id: 2,
    name: "New Lead Welcome Message",
    trigger: "Lead status set to New",
    action: "Send WhatsApp welcome template",
    icon: MessageCircle,
    active: true,
    color: "text-emerald-500",
    runsToday: 1,
    category: "message",
  },
  {
    id: 3,
    name: "Weekly Pipeline Check-in",
    trigger: "Every Monday at 9 AM",
    action: "Send weekly summary to all agents",
    icon: RefreshCw,
    active: true,
    color: "text-blue-500",
    runsToday: 0,
    category: "reminder",
  },
  {
    id: 4,
    name: "Hot Lead Escalation",
    trigger: "Lead score exceeds 85",
    action: "Notify senior agent + create urgent task",
    icon: Zap,
    active: true,
    color: "text-red-500",
    runsToday: 1,
    category: "alert",
  },
  {
    id: 5,
    name: "Proposal Follow-up",
    trigger: "Proposal sent — no reply after 48 hours",
    action: "Send follow-up message + agent reminder",
    icon: Bell,
    active: false,
    color: "text-purple-500",
    runsToday: 0,
    category: "message",
  },
  {
    id: 6,
    name: "Won Deal Celebration",
    trigger: "Lead status changed to Won",
    action: "Notify team + create closing checklist",
    icon: UserCheck,
    active: true,
    color: "text-emerald-500",
    runsToday: 0,
    category: "pipeline",
  },
  {
    id: 7,
    name: "Cold Lead Archive Alert",
    trigger: "Lead has no activity for 30 days",
    action: "Flag for archiving + notify manager",
    icon: TrendingDown,
    active: false,
    color: "text-zinc-400",
    runsToday: 0,
    category: "alert",
  },
]

const inactivityAlerts = [
  { name: "David Park", avatar: "DP", property: "San Francisco Loft", days: 3, urgency: "medium" },
  { name: "Robert Chang", avatar: "RC", property: "Dubai Marina Villa", days: 2, urgency: "medium" },
  { name: "Lisa Thornton", avatar: "LT", property: "Beverly Hills Estate", days: 1, urgency: "low" },
]

const scheduledMessages = [
  { lead: "Michael Chen", message: "Updated comparables report", time: "Today, 5:00 PM", type: "WhatsApp" },
  { lead: "Emily Rodriguez", message: "Viewing confirmation", time: "Tomorrow, 9:00 AM", type: "WhatsApp" },
  { lead: "David Park", message: "Weekly check-in", time: "Mon, Jun 1 · 9:00 AM", type: "Email" },
]

const categoryColors: Record<string, string> = {
  reminder: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  message: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  pipeline: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  alert: "bg-red-500/10 text-red-500 border-red-500/20",
}

export default function AutomationsPage() {
  const [rules, setRules] = useState<AutomationRule[]>(initialRules)
  const [filter, setFilter] = useState<"all" | "reminder" | "message" | "pipeline" | "alert">("all")

  const toggleRule = (id: number) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)))
  }

  const filtered = filter === "all" ? rules : rules.filter((r) => r.category === filter)
  const activeCount = rules.filter((r) => r.active).length
  const runsToday = rules.reduce((s, r) => s + r.runsToday, 0)

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Follow-Up Automation"
        description="Automate reminders, messages, and pipeline actions to never miss a lead."
        actions={
          <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
            <Plus className="h-4 w-4" />
            New Rule
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Active Rules", value: activeCount, icon: Zap, color: "text-primary" },
          { label: "Runs Today", value: runsToday, icon: RefreshCw, color: "text-emerald-500" },
          { label: "Inactivity Alerts", value: inactivityAlerts.length, icon: AlertTriangle, color: "text-amber-500" },
          { label: "Scheduled", value: scheduledMessages.length, icon: CalendarClock, color: "text-blue-500" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <stat.icon className={cn("h-4 w-4", stat.color)} />
            </div>
            <p className="mt-1 text-3xl font-bold text-foreground">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Rules + side panels */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Rules list */}
        <div className="xl:col-span-2 glass-card p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Automation Rules</h3>
              <p className="text-sm text-muted-foreground">Toggle rules on or off anytime</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(["all", "reminder", "message", "pipeline", "alert"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors",
                    filter === c
                      ? "bg-primary text-primary-foreground"
                      : "border border-border/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filtered.map((rule, i) => (
              <motion.div
                key={rule.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-4 transition-all",
                  rule.active
                    ? "border-border/50 bg-secondary/20"
                    : "border-border/30 bg-secondary/5 opacity-60"
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border",
                    rule.active ? "bg-secondary/50" : "bg-secondary/20",
                    "border-border/40"
                  )}
                >
                  <rule.icon className={cn("h-4 w-4", rule.active ? rule.color : "text-muted-foreground")} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{rule.name}</p>
                    <Badge
                      variant="outline"
                      className={cn("text-xs capitalize", categoryColors[rule.category])}
                    >
                      {rule.category}
                    </Badge>
                    {rule.runsToday > 0 && (
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs">
                        Ran {rule.runsToday}× today
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/70">Trigger:</span> {rule.trigger}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground/70">Action:</span> {rule.action}
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {rule.active ? (
                      <ToggleRight className="h-6 w-6 text-primary" />
                    ) : (
                      <ToggleLeft className="h-6 w-6" />
                    )}
                  </button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Side panels */}
        <div className="space-y-4">
          {/* Inactivity alerts */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-5"
          >
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h4 className="font-semibold text-foreground">Inactivity Alerts</h4>
            </div>
            <div className="space-y-2">
              {inactivityAlerts.map((alert) => (
                <div
                  key={alert.name}
                  className="flex items-center gap-2 rounded-lg border border-amber-500/15 bg-amber-500/5 p-2.5"
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/70 to-accent/70 text-xs font-semibold text-primary-foreground">
                    {alert.avatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{alert.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{alert.property}</p>
                  </div>
                  <span className="flex-shrink-0 text-xs font-semibold text-amber-500">
                    {alert.days}d
                  </span>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-3 w-full gap-2 border-border/50">
              Send reminders to all
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </motion.div>

          {/* Scheduled messages */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card p-5"
          >
            <div className="mb-3 flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-blue-500" />
              <h4 className="font-semibold text-foreground">Scheduled Messages</h4>
            </div>
            <div className="space-y-2">
              {scheduledMessages.map((msg, i) => (
                <div key={i} className="rounded-lg border border-border/40 bg-secondary/20 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{msg.lead}</p>
                    <Badge variant="outline" className="flex-shrink-0 text-xs border-border/50">
                      {msg.type}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{msg.message}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-blue-500">
                    <Clock className="h-3 w-3" />
                    {msg.time}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <Input placeholder="Schedule new message..." className={surfaceInputClass} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
