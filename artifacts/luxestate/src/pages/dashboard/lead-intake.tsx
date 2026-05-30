import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { surfaceInputClass, surfaceSelectClass } from "@/lib/ui-classes"
import {
  Plus,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  MoreHorizontal,
  Copy,
  ExternalLink,
  RefreshCw,
  Wifi,
  WifiOff,
  Loader2,
  User,
  DollarSign,
  MapPin,
  MessageSquare,
  TrendingUp,
  ShieldCheck,
  Code2,
  ArrowRight,
  Globe,
  Send,
  Bell,
  Sparkles,
  Users,
  Target,
  Activity,
  ChevronDown,
} from "lucide-react"
import {
  IntakeSource,
  Integration,
  IncomingLead,
  AssignmentRule,
  WebhookEndpoint,
  sourceConfig,
  integrations,
  incomingLeads as seedIncoming,
  campaigns,
  monthlyLeadsBySource,
  sourceDistribution,
  assignmentRules as seedRules,
  webhookEndpoints,
  samplePayload,
} from "@/data/intake-data"

type Tab = "queue" | "campaigns" | "webhooks" | "rules"
type QueueFilter = "all" | "new" | "assigned" | "duplicate" | "dismissed"

function SourceBadge({ source, size = "sm" }: { source: IntakeSource; size?: "xs" | "sm" | "md" }) {
  const cfg = sourceConfig[source]
  const sizeClass = size === "xs" ? "px-1.5 py-0.5 text-[10px]" : size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs"
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border font-medium", cfg.bg, cfg.border, cfg.color, sizeClass)}>
      <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", cfg.dot)} />
      {cfg.label}
    </span>
  )
}

function StatusDot({ status }: { status: Integration["status"] }) {
  const map = {
    connected: "bg-emerald-500",
    disconnected: "bg-zinc-400",
    error: "bg-red-500",
    pending: "bg-amber-400",
  }
  return <span className={cn("h-2.5 w-2.5 rounded-full flex-shrink-0", map[status])} />
}

function IntegrationCard({ integration }: { integration: Integration }) {
  const cfg = sourceConfig[integration.source]
  const statusLabel = {
    connected: "Connected",
    disconnected: "Disconnected",
    error: "Error",
    pending: "Pending setup",
  }
  const StatusIcon =
    integration.status === "connected"
      ? Wifi
      : integration.status === "pending"
        ? Loader2
        : WifiOff

  return (
    <div className={cn("glass-card border p-5", integration.status === "connected" ? "border-border/40" : "border-amber-500/20")}>
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl border", cfg.bg, cfg.border)}>
            <span className={cn("text-base font-bold leading-none", cfg.color)}>
              {integration.source === "facebook" ? "f" :
               integration.source === "instagram" ? "ig" :
               integration.source === "tiktok" ? "tt" :
               integration.source === "website" ? "W" : "WA"}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{integration.name}</p>
            <div className="flex items-center gap-1.5">
              <StatusDot status={integration.status} />
              <p className="text-xs text-muted-foreground">{statusLabel[integration.status]}</p>
            </div>
          </div>
        </div>
        <StatusIcon className={cn("mt-0.5 h-4 w-4 flex-shrink-0",
          integration.status === "connected" ? "text-emerald-500" :
          integration.status === "pending" ? "text-amber-400 animate-spin" : "text-zinc-400"
        )} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-lg bg-secondary/30 px-3 py-2">
          <p className="text-xs text-muted-foreground">This Month</p>
          <p className="text-lg font-bold text-foreground">{integration.leadsThisMonth}</p>
          <p className="text-xs text-muted-foreground">leads</p>
        </div>
        <div className="rounded-lg bg-secondary/30 px-3 py-2">
          <p className="text-xs text-muted-foreground">Conv. Rate</p>
          <p className="text-lg font-bold text-foreground">{integration.conversionRate}</p>
          <p className="text-xs text-muted-foreground">avg score {integration.avgScore || "—"}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {integration.lastSync}</span>
        <span>{integration.campaignCount} campaign{integration.campaignCount !== 1 ? "s" : ""}</span>
      </div>

      {integration.status === "connected" ? (
        <Button variant="outline" size="sm" className="w-full border-border/50 text-xs gap-1.5">
          <RefreshCw className="h-3 w-3" />
          Sync Now
        </Button>
      ) : integration.status === "pending" ? (
        <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-xs gap-1.5">
          <Plus className="h-3 w-3" />
          Connect
        </Button>
      ) : (
        <Button variant="outline" size="sm" className="w-full border-destructive/30 text-destructive text-xs gap-1.5">
          <AlertTriangle className="h-3 w-3" />
          Fix Error
        </Button>
      )}
    </div>
  )
}

function ScoreChip({ score }: { score: number }) {
  const color = score >= 75 ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20"
    : score >= 50 ? "text-amber-600 bg-amber-500/10 border-amber-500/20"
    : "text-red-500 bg-red-500/10 border-red-500/20"
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold", color)}>
      <Sparkles className="h-2.5 w-2.5" />
      {score}
    </span>
  )
}

function IncomingLeadRow({ lead, onAssign, onDismiss, onMerge }: {
  lead: IncomingLead
  onAssign: (id: string, agent: string) => void
  onDismiss: (id: string) => void
  onMerge: (id: string) => void
}) {
  const agents = ["James Donovan", "Sarah Mitchell", "Michael Chen", "Emily Rodriguez"]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        "rounded-xl border p-4 transition-colors",
        lead.status === "new" ? "border-primary/20 bg-primary/3" :
        lead.status === "duplicate" ? "border-amber-500/20 bg-amber-500/3" :
        lead.status === "dismissed" ? "border-border/30 bg-secondary/10 opacity-60" :
        "border-border/40 bg-secondary/10"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/70 to-accent/70 text-sm font-bold text-primary-foreground">
          {lead.name.split(" ").map(n => n[0]).join("")}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="font-semibold text-foreground">{lead.name}</p>
            <SourceBadge source={lead.source} size="xs" />
            <ScoreChip score={lead.score} />
            {lead.status === "new" && (
              <Badge className="bg-primary/15 text-primary border-primary/20 text-[10px] px-1.5">New</Badge>
            )}
            {lead.status === "duplicate" && (
              <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/20 text-[10px] px-1.5">
                <AlertTriangle className="mr-1 h-2.5 w-2.5" />
                Duplicate of {lead.duplicateOfName}
              </Badge>
            )}
            {lead.status === "assigned" && (
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] px-1.5">
                <CheckCircle2 className="mr-1 h-2.5 w-2.5" />
                {lead.assignedTo}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-2">
            <span className="flex items-center gap-1"><User className="h-3 w-3" />{lead.email}</span>
            {lead.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{lead.location}</span>}
            {lead.budget && <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{lead.budget}</span>}
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{lead.receivedAt}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-xs text-muted-foreground">
              Campaign: <span className="font-medium text-foreground">{lead.campaign}</span>
            </span>
            {lead.propertyInterest && (
              <span className="text-xs text-muted-foreground">
                Interest: <span className="font-medium text-foreground">{lead.propertyInterest}</span>
              </span>
            )}
          </div>

          {lead.message && (
            <p className="text-xs text-muted-foreground italic line-clamp-1 mb-2">
              "{lead.message}"
            </p>
          )}
        </div>

        <div className="flex flex-shrink-0 items-center gap-1">
          {lead.status === "new" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="h-7 bg-primary hover:bg-primary/90 text-xs px-3 gap-1">
                  <Zap className="h-3 w-3" />
                  Assign
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass">
                {agents.map((agent) => (
                  <DropdownMenuItem key={agent} onClick={() => onAssign(lead.id, agent)}>
                    {agent}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {lead.status === "duplicate" && (
            <Button
              size="sm"
              variant="outline"
              className="h-7 border-amber-500/30 text-amber-600 text-xs px-3 hover:bg-amber-500/10"
              onClick={() => onMerge(lead.id)}
            >
              Merge
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass">
              <DropdownMenuItem>View full profile</DropdownMenuItem>
              <DropdownMenuItem>Add to pipeline</DropdownMenuItem>
              <DropdownMenuItem>Send WhatsApp</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDismiss(lead.id)} className="text-destructive">
                Dismiss
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.div>
  )
}

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "0.75rem",
  fontSize: "12px",
  color: "var(--foreground)",
}

const CHART_COLORS: Record<string, string> = {
  facebook: "#1877F2",
  instagram: "#E1306C",
  tiktok: "#8B5CF6",
  website: "#10B981",
  whatsapp: "#25D366",
}

export default function LeadIntakePage() {
  const [activeTab, setActiveTab] = useState<Tab>("queue")
  const [queueFilter, setQueueFilter] = useState<QueueFilter>("all")
  const [sourceFilter, setSourceFilter] = useState<IntakeSource | "all">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [leads, setLeads] = useState<IncomingLead[]>(seedIncoming)
  const [rules, setRules] = useState<AssignmentRule[]>(seedRules)
  const [copied, setCopied] = useState<string | null>(null)

  const handleAssign = (id: string, agent: string) => {
    setLeads((prev) =>
      prev.map((l) => l.id === id ? { ...l, status: "assigned", assignedTo: agent } : l)
    )
  }

  const handleDismiss = (id: string) => {
    setLeads((prev) =>
      prev.map((l) => l.id === id ? { ...l, status: "dismissed" } : l)
    )
  }

  const handleMerge = (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id))
  }

  const toggleRule = (id: string) => {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, active: !r.active } : r))
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  const filteredLeads = leads.filter((l) => {
    const matchesStatus = queueFilter === "all" || l.status === queueFilter
    const matchesSource = sourceFilter === "all" || l.source === sourceFilter
    const q = searchQuery.toLowerCase()
    const matchesQuery = !q || l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.campaign.toLowerCase().includes(q)
    return matchesStatus && matchesSource && matchesQuery
  })

  const newCount = leads.filter((l) => l.status === "new").length
  const assignedCount = leads.filter((l) => l.status === "assigned").length
  const dupCount = leads.filter((l) => l.status === "duplicate").length
  const avgScore = Math.round(leads.filter(l => l.status !== "dismissed").reduce((s, l) => s + l.score, 0) / leads.filter(l => l.status !== "dismissed").length)

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "queue", label: "Intake Queue", icon: Activity },
    { key: "campaigns", label: "Campaign Analytics", icon: TrendingUp },
    { key: "webhooks", label: "Webhooks & API", icon: Code2 },
    { key: "rules", label: "Assignment Rules", icon: Zap },
  ]

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Lead Intake Hub"
        description="Centralized intake pipeline — Facebook, Instagram, TikTok, Website, and WhatsApp leads in one place."
        actions={
          <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
            <Plus className="h-4 w-4" />
            Add Source
          </Button>
        }
      />

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "New Today", value: newCount, sub: "Awaiting assignment", icon: Bell, color: "text-primary bg-primary/10" },
          { label: "Auto-Assigned", value: assignedCount, sub: "Rules matched", icon: Zap, color: "text-emerald-500 bg-emerald-500/10" },
          { label: "Duplicates Flagged", value: dupCount, sub: "Needs review", icon: AlertTriangle, color: "text-amber-500 bg-amber-500/10" },
          { label: "Avg Lead Score", value: avgScore, sub: "Across all sources", icon: Sparkles, color: "text-purple-500 bg-purple-500/10" },
        ].map(({ label, value, sub, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{label}</p>
              <div className={cn("flex h-8 w-8 items-center justify-center rounded-xl", color)}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Integration status cards */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Connected Sources</h2>
          <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600 text-xs">
            4 of 5 active
          </Badge>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {integrations.map((int) => (
            <IntegrationCard key={int.id} integration={int} />
          ))}
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass-card p-6"
      >
        <div className="mb-6 flex gap-1 rounded-xl border border-border/40 bg-secondary/20 p-1 overflow-x-auto">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={cn(
                "flex flex-shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                activeTab === key
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* QUEUE TAB */}
          {activeTab === "queue" && (
            <motion.div
              key="queue"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Filters */}
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  {(["all", "new", "assigned", "duplicate", "dismissed"] as QueueFilter[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setQueueFilter(f)}
                      className={cn(
                        "rounded-lg border px-3 py-1 text-xs font-semibold capitalize transition-colors",
                        queueFilter === f
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border/50 bg-secondary/20 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {f === "all" ? `All (${leads.length})` : `${f} (${leads.filter(l => l.status === f).length})`}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search leads..."
                      className={`pl-8 pr-3 h-8 w-48 text-xs ${surfaceInputClass}`}
                    />
                  </div>
                  <div className="relative w-36">
                    <select
                      value={sourceFilter}
                      onChange={(e) => setSourceFilter(e.target.value as IntakeSource | "all")}
                      className={cn("h-8 text-xs w-36", surfaceSelectClass)}
                    >
                      <option value="all">All Sources</option>
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                      <option value="website">Website</option>
                      <option value="whatsapp">WhatsApp</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {filteredLeads.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 py-12">
                      <Activity className="h-10 w-10 text-muted-foreground/30" />
                      <p className="text-sm text-muted-foreground">No leads match these filters</p>
                    </div>
                  ) : (
                    filteredLeads.map((lead) => (
                      <IncomingLeadRow
                        key={lead.id}
                        lead={lead}
                        onAssign={handleAssign}
                        onDismiss={handleDismiss}
                        onMerge={handleMerge}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* CAMPAIGNS TAB */}
          {activeTab === "campaigns" && (
            <motion.div
              key="campaigns"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="grid gap-6 xl:grid-cols-3">
                {/* Bar chart */}
                <div className="xl:col-span-2">
                  <h3 className="mb-4 font-semibold text-foreground">Monthly Lead Volume by Source</h3>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={monthlyLeadsBySource} barSize={10} barCategoryGap="30%">
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="facebook" name="Facebook" fill={CHART_COLORS.facebook} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="instagram" name="Instagram" fill={CHART_COLORS.instagram} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="website" name="Website" fill={CHART_COLORS.website} radius={[4, 4, 0, 0]} />
                      <Bar dataKey="whatsapp" name="WhatsApp" fill={CHART_COLORS.whatsapp} radius={[4, 4, 0, 0]} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Source distribution donut */}
                <div>
                  <h3 className="mb-4 font-semibold text-foreground">Source Distribution</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={sourceDistribution}
                        dataKey="count"
                        nameKey="label"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {sourceDistribution.map((entry) => (
                          <Cell key={entry.source} fill={CHART_COLORS[entry.source] ?? "#94A3B8"} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 space-y-1.5">
                    {sourceDistribution.map((s) => (
                      <div key={s.source} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: CHART_COLORS[s.source] }} />
                          <span className="text-muted-foreground">{s.label}</span>
                        </div>
                        <span className="font-semibold text-foreground">{s.count} <span className="font-normal text-muted-foreground">({s.pct}%)</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Campaign table */}
              <div>
                <h3 className="mb-4 font-semibold text-foreground">Active Campaigns</h3>
                <div className="overflow-x-auto -mx-6 px-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border/50">
                        {["Campaign", "Source", "Leads", "Conv.", "Spend", "CPL", "ROI", "Status"].map((h) => (
                          <th key={h} className="px-2 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {campaigns.map((c, i) => (
                        <motion.tr
                          key={c.id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="group hover:bg-secondary/20 transition-colors"
                        >
                          <td className="px-2 py-3">
                            <p className="text-sm font-medium text-foreground">{c.name}</p>
                            <p className="text-xs text-muted-foreground">Since {c.startDate}</p>
                          </td>
                          <td className="px-2 py-3"><SourceBadge source={c.source} size="xs" /></td>
                          <td className="px-2 py-3 text-sm font-semibold text-foreground">{c.leads}</td>
                          <td className="px-2 py-3 text-sm text-foreground">{c.conversions}</td>
                          <td className="px-2 py-3 text-sm text-foreground">{c.spend}</td>
                          <td className="px-2 py-3 text-sm text-foreground">{c.cpl}</td>
                          <td className="px-2 py-3">
                            <span className={cn("text-sm font-semibold", c.roi === "∞" ? "text-emerald-500" : "text-foreground")}>{c.roi}</span>
                          </td>
                          <td className="px-2 py-3">
                            <Badge variant="outline" className={cn("text-xs",
                              c.status === "active" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600" :
                              c.status === "paused" ? "border-amber-500/20 bg-amber-500/10 text-amber-600" :
                              "border-zinc-500/20 bg-zinc-500/10 text-zinc-500"
                            )}>
                              {c.status}
                            </Badge>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* WEBHOOKS TAB */}
          {activeTab === "webhooks" && (
            <motion.div
              key="webhooks"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Architecture flow */}
              <div>
                <h3 className="mb-4 font-semibold text-foreground">Integration Architecture</h3>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { label: "Facebook / Instagram", color: "bg-blue-500/10 border-blue-500/20 text-blue-600" },
                    { label: "TikTok Ads", color: "bg-purple-500/10 border-purple-500/20 text-purple-500" },
                    { label: "Website Forms", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" },
                    { label: "WhatsApp API", color: "bg-green-500/10 border-green-500/20 text-green-600" },
                  ].map((node, i, arr) => (
                    <div key={node.label} className="flex items-center gap-2">
                      <div className={cn("rounded-xl border px-3 py-2 text-xs font-semibold", node.color)}>
                        {node.label}
                      </div>
                      {i < arr.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
                    </div>
                  ))}
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <div className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
                    Webhook Endpoint
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-600">
                    Make.com / Zapier
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <div className="rounded-xl border border-border/40 bg-secondary/30 px-3 py-2 text-xs font-semibold text-foreground">
                    LuxeState CRM
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-600">
                    Agent Assigned
                  </div>
                </div>
              </div>

              {/* Webhook endpoints table */}
              <div>
                <h3 className="mb-4 font-semibold text-foreground">Webhook Endpoints</h3>
                <div className="space-y-3">
                  {webhookEndpoints.map((wh) => (
                    <div
                      key={wh.id}
                      className={cn(
                        "rounded-xl border p-4",
                        wh.status === "active" ? "border-border/40 bg-secondary/10" : "border-border/30 bg-secondary/5 opacity-70"
                      )}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            <StatusDot status={wh.status === "active" ? "connected" : "disconnected"} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <p className="font-semibold text-foreground text-sm">{wh.name}</p>
                              <SourceBadge source={wh.source} size="xs" />
                              <Badge variant="outline" className="border-border/50 text-xs text-muted-foreground">{wh.provider}</Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <code className="text-xs bg-secondary/50 rounded px-2 py-0.5 font-mono text-muted-foreground max-w-[320px] truncate">
                                {wh.url}
                              </code>
                              <button
                                onClick={() => handleCopy(wh.url, wh.id)}
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {copied === wh.id ? (
                                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {wh.events.map((e) => (
                                <span key={e} className="rounded-full bg-secondary/50 border border-border/40 px-2 py-0.5 text-[10px] text-muted-foreground font-mono">
                                  {e}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-right">
                          <div>
                            <p className="text-xs text-muted-foreground">Total calls</p>
                            <p className="text-sm font-semibold text-foreground">{wh.totalCalls.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Last called</p>
                            <p className="text-sm text-foreground">{wh.lastCalled}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample payload + Make.com guide */}
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="mb-3 font-semibold text-foreground">Sample Webhook Payload</h3>
                  <div className="relative rounded-xl border border-border/40 bg-secondary/20">
                    <button
                      onClick={() => handleCopy(samplePayload, "payload")}
                      className="absolute right-3 top-3 flex items-center gap-1 rounded-lg bg-secondary/70 px-2 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copied === "payload" ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      {copied === "payload" ? "Copied!" : "Copy"}
                    </button>
                    <pre className="overflow-x-auto p-4 text-[11px] text-muted-foreground font-mono leading-relaxed">
                      {samplePayload}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 font-semibold text-foreground">Make.com Integration Guide</h3>
                  <div className="space-y-3">
                    {[
                      { step: "1", title: "Create a Make.com scenario", desc: "Start with a webhook trigger module and paste your LuxeState endpoint URL." },
                      { step: "2", title: "Map lead fields", desc: "Map name, email, phone, campaign_id, and source fields to the CRM schema." },
                      { step: "3", title: "Add duplicate check", desc: "Use the HTTP module to call GET /v1/leads?email={email} before creating." },
                      { step: "4", title: "Post to intake endpoint", desc: "POST to /v1/leads/intake with the mapped payload and webhook secret header." },
                      { step: "5", title: "Trigger notification", desc: "Add a final step to send a Slack/WhatsApp alert to the assigned agent." },
                    ].map(({ step, title, desc }) => (
                      <div key={step} className="flex gap-3 rounded-xl border border-border/40 bg-secondary/10 p-3">
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                          {step}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{title}</p>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                  <div>
                    <p className="font-semibold text-foreground">Webhook Security</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      All inbound webhooks are verified using HMAC-SHA256 signatures. Include the <code className="rounded bg-secondary/50 px-1 text-xs font-mono">X-LuxeState-Signature</code> header with the shared secret on every request. Supabase Edge Functions are recommended for serverless webhook processing.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* RULES TAB */}
          {activeTab === "rules" && (
            <motion.div
              key="rules"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Rules run in order — first match wins. Drag to reorder.
                  </p>
                </div>
                <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90">
                  <Plus className="h-3.5 w-3.5" />
                  Add Rule
                </Button>
              </div>

              <div className="space-y-3">
                {rules.map((rule, i) => (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className={cn(
                      "rounded-xl border p-4 transition-all",
                      rule.active ? "border-border/40 bg-secondary/10" : "border-border/30 bg-secondary/5 opacity-60"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-border/50 bg-secondary/30 text-xs font-bold text-muted-foreground">
                        {rule.priority}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <p className="font-semibold text-foreground text-sm">{rule.name}</p>
                          {rule.triggerSource && <SourceBadge source={rule.triggerSource} size="xs" />}
                          {!rule.active && <Badge variant="outline" className="border-zinc-500/20 text-zinc-500 text-xs">Paused</Badge>}
                        </div>
                        <div className="grid gap-1.5 sm:grid-cols-2 text-xs text-muted-foreground">
                          <div className="flex items-start gap-1.5">
                            <Filter className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
                            <span><span className="text-foreground font-medium">When:</span> {rule.triggerCondition}</span>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <Zap className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
                            <span><span className="text-foreground font-medium">Then:</span> {rule.action}</span>
                          </div>
                          <div className="flex items-start gap-1.5">
                            <User className="mt-0.5 h-3 w-3 flex-shrink-0 text-primary" />
                            <span><span className="text-foreground font-medium">Agent:</span> {rule.assignedAgent}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-shrink-0 items-center gap-2">
                        <button
                          onClick={() => toggleRule(rule.id)}
                          className={cn(
                            "relative h-5 w-9 rounded-full transition-colors",
                            rule.active ? "bg-primary" : "bg-border"
                          )}
                        >
                          <span className={cn(
                            "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                            rule.active ? "translate-x-4" : "translate-x-0.5"
                          )} />
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass">
                            <DropdownMenuItem>Edit rule</DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Supabase note */}
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                <div className="flex items-start gap-3">
                  <Globe className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
                  <div>
                    <p className="font-semibold text-foreground">Supabase Integration Ready</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      This rule engine is architected for Supabase backend integration. Rules are designed as row-level records in a <code className="rounded bg-secondary/50 px-1 text-xs font-mono">assignment_rules</code> table with Postgres triggers. Connect your Supabase project to activate real-time lead routing, duplicate detection via email/phone hash matching, and serverless edge function execution.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
