import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Brain,
  Flame,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  MessageCircle,
  Phone,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts"

const hotLeads = [
  {
    id: 1,
    name: "Sarah Mitchell",
    avatar: "SM",
    property: "Manhattan Penthouse",
    budget: "$5.2M",
    urgency: 94,
    aiSummary:
      "Sarah is a high-intent buyer who has reviewed the listing 7 times this week and responded positively to the HOA document. Her financial verification is complete and she's been silent for 2 days — historically a sign she's comparing offers. Immediate outreach recommended.",
    suggestedActions: [
      { label: "Call now", icon: Phone, priority: "critical" },
      { label: "Send closing incentive", icon: MessageCircle, priority: "high" },
    ],
    signals: [
      { label: "Budget fit", score: 98 },
      { label: "Engagement", score: 91 },
      { label: "Timeline", score: 88 },
      { label: "Intent", score: 95 },
      { label: "Readiness", score: 90 },
    ],
    smartReminder: "Follow up today before 6 PM — her preferred window",
    status: "negotiation",
  },
  {
    id: 2,
    name: "Emily Rodriguez",
    avatar: "ER",
    property: "Miami Beach Condo",
    budget: "$3.1M",
    urgency: 87,
    aiSummary:
      "Emily has a hard June 30 tax deadline. She's a first-time luxury buyer showing strong urgency signals — 3 WhatsApp messages unanswered, viewing request submitted. Risk of losing to a competitor is elevated. Fast-track qualification and schedule the viewing immediately.",
    suggestedActions: [
      { label: "Schedule viewing", icon: Clock, priority: "critical" },
      { label: "WhatsApp message", icon: MessageCircle, priority: "high" },
    ],
    signals: [
      { label: "Budget fit", score: 85 },
      { label: "Engagement", score: 88 },
      { label: "Timeline", score: 97 },
      { label: "Intent", score: 82 },
      { label: "Readiness", score: 80 },
    ],
    smartReminder: "June 30 tax deadline — contact within 48 hours",
    status: "qualified",
  },
  {
    id: 3,
    name: "Michael Chen",
    avatar: "MC",
    property: "Beverly Hills Estate",
    budget: "$8.7M",
    urgency: 72,
    aiSummary:
      "Michael is an experienced investor comparing multiple listings. He requested Malibu comparables, indicating he's in active due diligence mode. The proposal has been unread for 18 hours — an unusual delay for him. Personalized video tour or updated comps could re-engage him.",
    suggestedActions: [
      { label: "Send updated comps", icon: TrendingUp, priority: "high" },
      { label: "Schedule call", icon: Phone, priority: "medium" },
    ],
    signals: [
      { label: "Budget fit", score: 95 },
      { label: "Engagement", score: 68 },
      { label: "Timeline", score: 60 },
      { label: "Intent", score: 75 },
      { label: "Readiness", score: 65 },
    ],
    smartReminder: "Send updated comps by end of day",
    status: "proposal",
  },
]

const insightCards = [
  {
    icon: Flame,
    title: "3 Hot Leads Detected",
    description: "AI identified 3 leads with >70% close probability requiring immediate attention.",
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-500/20",
  },
  {
    icon: AlertTriangle,
    title: "2 Inactivity Alerts",
    description: "David Park and Robert Chang have had no contact in 3+ days. Risk of cold-off.",
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    icon: TrendingUp,
    title: "Pipeline Score: 78/100",
    description: "Overall pipeline health is strong. Revenue forecast remains on track.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: Zap,
    title: "4 Actions Suggested",
    description: "AI has generated prioritized follow-up tasks based on lead behavior signals.",
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
  },
]

const priorityColor: Record<string, string> = {
  critical: "bg-red-500 text-white",
  high: "bg-amber-500 text-white",
  medium: "bg-blue-500 text-white",
}

const urgencyColor = (u: number) => {
  if (u >= 85) return "text-red-500"
  if (u >= 70) return "text-amber-500"
  return "text-emerald-500"
}

const urgencyBg = (u: number) => {
  if (u >= 85) return "bg-red-500"
  if (u >= 70) return "bg-amber-500"
  return "bg-emerald-500"
}

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "0.75rem",
}

export default function AIIntelligencePage() {
  const [selectedLead, setSelectedLead] = useState(hotLeads[0])
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1200)
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="AI Lead Intelligence"
        description="Real-time insights, urgency scoring, and AI-powered recommendations."
        actions={
          <div className="flex items-center gap-2">
            <Badge className="gap-1 bg-primary/10 text-primary border-primary/20">
              <Brain className="h-3 w-3" />
              AI Active
            </Badge>
            <Button
              variant="outline"
              className="gap-2 border-border/50"
              onClick={refresh}
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              Refresh Analysis
            </Button>
          </div>
        }
      />

      {/* Insight cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {insightCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={cn("glass-card border p-5", card.bg)}
          >
            <card.icon className={cn("mb-3 h-6 w-6", card.color)} />
            <p className="font-semibold text-foreground">{card.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Hot leads + radar */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Lead list */}
        <div className="xl:col-span-1 space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-1">
            Hot Leads — Needs Action
          </h3>
          {hotLeads.map((lead) => (
            <motion.button
              key={lead.id}
              onClick={() => setSelectedLead(lead)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "w-full rounded-xl border p-4 text-left transition-all",
                selectedLead.id === lead.id
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/40 bg-card hover:border-primary/20 hover:bg-secondary/20"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="relative flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-accent/80 text-sm font-semibold text-primary-foreground">
                    {lead.avatar}
                  </div>
                  <Flame className="absolute -bottom-1 -right-1 h-4 w-4 text-red-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">{lead.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{lead.property}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-border/50">
                      <div
                        className={cn("h-full rounded-full transition-all", urgencyBg(lead.urgency))}
                        style={{ width: `${lead.urgency}%` }}
                      />
                    </div>
                    <span className={cn("text-xs font-bold", urgencyColor(lead.urgency))}>
                      {lead.urgency}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Urgency score</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Detail panel */}
        <motion.div
          key={selectedLead.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-2 glass-card p-6 space-y-5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-accent/80 text-base font-semibold text-primary-foreground">
                {selectedLead.avatar}
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{selectedLead.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedLead.property} · {selectedLead.budget}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5">
              <Flame className="h-4 w-4 text-red-500" />
              <span className={cn("text-lg font-bold", urgencyColor(selectedLead.urgency))}>
                {selectedLead.urgency}
              </span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>

          {/* AI Summary */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-primary">AI Summary</p>
            </div>
            <p className="text-sm leading-relaxed text-foreground">{selectedLead.aiSummary}</p>
          </div>

          {/* Radar + actions side by side */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Signal Radar
              </p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={selectedLead.signals}>
                    <PolarGrid className="stroke-border/40" />
                    <PolarAngleAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    />
                    <Radar
                      dataKey="score"
                      stroke="oklch(0.65 0.15 75)"
                      fill="oklch(0.65 0.15 75)"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                    <Tooltip
                      formatter={(v) => [`${v}/100`, "Score"]}
                      contentStyle={tooltipStyle}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Suggested Actions
              </p>
              {selectedLead.suggestedActions.map((action) => (
                <button
                  key={action.label}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-90",
                    priorityColor[action.priority]
                  )}
                >
                  <action.icon className="h-4 w-4 flex-shrink-0" />
                  {action.label}
                  <ArrowRight className="ml-auto h-4 w-4" />
                </button>
              ))}

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                  <div>
                    <p className="text-xs font-semibold text-amber-600">Smart Reminder</p>
                    <p className="text-xs text-foreground">{selectedLead.smartReminder}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <p className="text-xs text-foreground">
                    All financials verified · Lead scored
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
