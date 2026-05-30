import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Plus,
  DollarSign,
  ClipboardList,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  TrendingUp,
  Building2,
  User,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  ArrowRight,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { surfaceInputClass, surfaceSelectClass } from "@/lib/ui-classes"

type DealStage = "contract_sent" | "under_review" | "signed" | "due_diligence" | "closed_won" | "closed_lost"

type PaymentMilestone = {
  label: string
  amount: string
  due: string
  paid: boolean
}

type Deal = {
  id: number
  property: string
  buyer: string
  buyerAvatar: string
  agent: string
  value: number
  stage: DealStage
  stageProgress: number
  startDate: string
  closingDate: string
  milestones: PaymentMilestone[]
  contractStages: Array<{ label: string; done: boolean; date?: string }>
  notes: string
}

const stageConfig: Record<DealStage, { label: string; color: string; bg: string; order: number }> = {
  contract_sent:  { label: "Contract Sent",    color: "text-blue-500",    bg: "bg-blue-500/10 border-blue-500/20",    order: 1 },
  under_review:   { label: "Under Review",     color: "text-amber-500",   bg: "bg-amber-500/10 border-amber-500/20",  order: 2 },
  signed:         { label: "Signed",           color: "text-purple-500",  bg: "bg-purple-500/10 border-purple-500/20", order: 3 },
  due_diligence:  { label: "Due Diligence",    color: "text-orange-500",  bg: "bg-orange-500/10 border-orange-500/20", order: 4 },
  closed_won:     { label: "Closed — Won",     color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20", order: 5 },
  closed_lost:    { label: "Closed — Lost",    color: "text-red-500",     bg: "bg-red-500/10 border-red-500/20",      order: 6 },
}

const pipelineStages: DealStage[] = ["contract_sent", "under_review", "signed", "due_diligence", "closed_won"]

const stageProgressMap: Record<DealStage, number> = {
  contract_sent: 10,
  under_review:  30,
  signed:        50,
  due_diligence: 70,
  closed_won:    100,
  closed_lost:   0,
}

const stageOrder: DealStage[] = ["contract_sent", "under_review", "signed", "due_diligence", "closed_won"]

const initialDeals: Deal[] = [
  {
    id: 1,
    property: "Malibu Beach House",
    buyer: "Amanda Foster",
    buyerAvatar: "AF",
    agent: "James Donovan",
    value: 16000000,
    stage: "closed_won",
    stageProgress: 100,
    startDate: "May 10, 2026",
    closingDate: "May 21, 2026",
    milestones: [
      { label: "Initial deposit (5%)", amount: "$800,000", due: "May 12", paid: true },
      { label: "Second payment (45%)", amount: "$7,200,000", due: "May 18", paid: true },
      { label: "Final balance (50%)", amount: "$8,000,000", due: "May 21", paid: true },
    ],
    contractStages: [
      { label: "Contract drafted", done: true, date: "May 10" },
      { label: "Legal review", done: true, date: "May 13" },
      { label: "Buyer signature", done: true, date: "May 15" },
      { label: "Seller signature", done: true, date: "May 16" },
      { label: "Title transfer", done: true, date: "May 21" },
    ],
    notes: "Smooth close. Client very satisfied. Potential referral expected.",
  },
  {
    id: 2,
    property: "Manhattan Penthouse",
    buyer: "Sarah Mitchell",
    buyerAvatar: "SM",
    agent: "James Donovan",
    value: 12500000,
    stage: "due_diligence",
    stageProgress: 70,
    startDate: "May 15, 2026",
    closingDate: "Jun 10, 2026",
    milestones: [
      { label: "Earnest money (2%)", amount: "$250,000", due: "May 18", paid: true },
      { label: "Inspection escrow (10%)", amount: "$1,250,000", due: "Jun 1", paid: false },
      { label: "Final balance (88%)", amount: "$11,000,000", due: "Jun 10", paid: false },
    ],
    contractStages: [
      { label: "Contract drafted", done: true, date: "May 15" },
      { label: "Legal review", done: true, date: "May 19" },
      { label: "Buyer signature", done: true, date: "May 20" },
      { label: "Seller signature", done: false },
      { label: "Title transfer", done: false },
    ],
    notes: "HOA documentation still pending from seller. Follow up required.",
  },
  {
    id: 3,
    property: "Beverly Hills Estate",
    buyer: "Michael Chen",
    buyerAvatar: "MC",
    agent: "Sarah Mitchell",
    value: 28900000,
    stage: "under_review",
    stageProgress: 30,
    startDate: "May 22, 2026",
    closingDate: "Jul 1, 2026",
    milestones: [
      { label: "Good faith deposit (3%)", amount: "$867,000", due: "May 28", paid: false },
      { label: "Mid payment (37%)", amount: "$10,693,000", due: "Jun 15", paid: false },
      { label: "Final balance (60%)", amount: "$17,340,000", due: "Jul 1", paid: false },
    ],
    contractStages: [
      { label: "Contract drafted", done: true, date: "May 22" },
      { label: "Legal review", done: false },
      { label: "Buyer signature", done: false },
      { label: "Seller signature", done: false },
      { label: "Title transfer", done: false },
    ],
    notes: "Buyer reviewing with international legal counsel. Timeline may extend.",
  },
  {
    id: 4,
    property: "Miami Beach Villa",
    buyer: "Emily Rodriguez",
    buyerAvatar: "ER",
    agent: "Michael Chen",
    value: 8750000,
    stage: "contract_sent",
    stageProgress: 10,
    startDate: "May 27, 2026",
    closingDate: "Jun 25, 2026",
    milestones: [
      { label: "Initial deposit (5%)", amount: "$437,500", due: "May 30", paid: false },
      { label: "Second payment (45%)", amount: "$3,937,500", due: "Jun 15", paid: false },
      { label: "Final balance (50%)", amount: "$4,375,000", due: "Jun 25", paid: false },
    ],
    contractStages: [
      { label: "Contract drafted", done: true, date: "May 27" },
      { label: "Legal review", done: false },
      { label: "Buyer signature", done: false },
      { label: "Seller signature", done: false },
      { label: "Title transfer", done: false },
    ],
    notes: "Fast-track requested. Deadline is June 30.",
  },
]

const fmt = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : `$${(n / 1_000).toFixed(0)}K`

const agentOptions = ["James Donovan", "Sarah Mitchell", "Michael Chen", "Emily Rodriguez"]
const propertyOptions = ["Manhattan Penthouse", "Beverly Hills Estate", "Miami Beach Condo", "Malibu Beach House", "San Francisco Loft", "Dubai Marina Villa"]

const today = "May 28"

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>(initialDeals)
  const [stageFilter, setStageFilter] = useState<DealStage | "all">("all")
  const [expandedId, setExpandedId] = useState<number | null>(initialDeals[1].id)
  const [showNewDeal, setShowNewDeal] = useState(false)
  const [newDeal, setNewDeal] = useState({ property: "", buyer: "", agent: agentOptions[0], value: "" })

  // Derived stats from live state
  const totalValue = deals.reduce((s, d) => s + d.value, 0)
  const closedValue = deals.filter((d) => d.stage === "closed_won").reduce((s, d) => s + d.value, 0)
  const activeDeals = deals.filter((d) => d.stage !== "closed_won" && d.stage !== "closed_lost")
  const filtered = stageFilter === "all" ? deals : deals.filter((d) => d.stage === stageFilter)

  // --- Actions ---

  const markNextStage = (id: number) => {
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d
        const idx = stageOrder.indexOf(d.stage as typeof stageOrder[0])
        if (idx === -1 || idx >= stageOrder.length - 1) return d
        const nextStage = stageOrder[idx + 1]
        const nextUndoneIdx = d.contractStages.findIndex((cs) => !cs.done)
        const updatedContractStages = d.contractStages.map((cs, i) =>
          i === nextUndoneIdx ? { ...cs, done: true, date: today } : cs
        )
        return {
          ...d,
          stage: nextStage,
          stageProgress: stageProgressMap[nextStage],
          contractStages: updatedContractStages,
        }
      })
    )
  }

  const markAsWon = (id: number) => {
    setDeals((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              stage: "closed_won",
              stageProgress: 100,
              contractStages: d.contractStages.map((cs) => ({ ...cs, done: true, date: cs.date ?? today })),
              milestones: d.milestones.map((m) => ({ ...m, paid: true })),
            }
          : d
      )
    )
  }

  const markAsLost = (id: number) => {
    setDeals((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, stage: "closed_lost", stageProgress: 0 } : d
      )
    )
  }

  const toggleMilestonePaid = (dealId: number, milestoneIdx: number) => {
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id !== dealId) return d
        return {
          ...d,
          milestones: d.milestones.map((m, i) =>
            i === milestoneIdx ? { ...m, paid: !m.paid } : m
          ),
        }
      })
    )
  }

  const toggleContractStage = (dealId: number, stageIdx: number) => {
    setDeals((prev) =>
      prev.map((d) => {
        if (d.id !== dealId) return d
        return {
          ...d,
          contractStages: d.contractStages.map((cs, i) =>
            i === stageIdx ? { ...cs, done: !cs.done, date: !cs.done ? today : undefined } : cs
          ),
        }
      })
    )
  }

  const handleCreateDeal = () => {
    if (!newDeal.property || !newDeal.buyer) return
    const val = parseFloat(newDeal.value.replace(/[^0-9.]/g, "")) || 1000000
    const initials = newDeal.buyer.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    const deal: Deal = {
      id: Date.now(),
      property: newDeal.property,
      buyer: newDeal.buyer,
      buyerAvatar: initials,
      agent: newDeal.agent,
      value: val,
      stage: "contract_sent",
      stageProgress: 10,
      startDate: "May 28, 2026",
      closingDate: "Jun 30, 2026",
      milestones: [
        { label: "Initial deposit (5%)", amount: fmt(val * 0.05), due: "Jun 5", paid: false },
        { label: "Second payment (45%)", amount: fmt(val * 0.45), due: "Jun 20", paid: false },
        { label: "Final balance (50%)", amount: fmt(val * 0.5), due: "Jun 30", paid: false },
      ],
      contractStages: [
        { label: "Contract drafted", done: true, date: today },
        { label: "Legal review", done: false },
        { label: "Buyer signature", done: false },
        { label: "Seller signature", done: false },
        { label: "Title transfer", done: false },
      ],
      notes: "New deal created.",
    }
    setDeals((prev) => [deal, ...prev])
    setNewDeal({ property: "", buyer: "", agent: agentOptions[0], value: "" })
    setShowNewDeal(false)
    setExpandedId(deal.id)
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Deals & Closings"
        description="Track every deal from contract to closing."
        actions={
          <Button
            onClick={() => setShowNewDeal(true)}
            className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
          >
            <Plus className="h-4 w-4" />
            New Deal
          </Button>
        }
      />

      {/* New Deal quick-form */}
      <AnimatePresence>
        {showNewDeal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card overflow-hidden border-primary/20"
          >
            <div className="p-5">
              <p className="mb-4 font-semibold text-foreground">Create New Deal</p>
              <div className="grid gap-3 sm:grid-cols-4">
                <select
                  value={newDeal.property}
                  onChange={(e) => setNewDeal((p) => ({ ...p, property: e.target.value }))}
                  className={surfaceSelectClass}
                >
                  <option value="">Select property…</option>
                  {propertyOptions.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <Input
                  value={newDeal.buyer}
                  onChange={(e) => setNewDeal((p) => ({ ...p, buyer: e.target.value }))}
                  placeholder="Buyer name"
                  className={surfaceInputClass}
                />
                <select
                  value={newDeal.agent}
                  onChange={(e) => setNewDeal((p) => ({ ...p, agent: e.target.value }))}
                  className={surfaceSelectClass}
                >
                  {agentOptions.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                <Input
                  value={newDeal.value}
                  onChange={(e) => setNewDeal((p) => ({ ...p, value: e.target.value }))}
                  placeholder="Deal value (e.g. 5000000)"
                  className={surfaceInputClass}
                />
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowNewDeal(false)} className="border-border/50">
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateDeal}
                  disabled={!newDeal.property || !newDeal.buyer}
                  className="bg-primary hover:bg-primary/90"
                >
                  Create Deal
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Pipeline",  value: fmt(totalValue),              icon: DollarSign,  sub: `${deals.length} deals` },
          { label: "Revenue Closed",  value: fmt(closedValue),             icon: TrendingUp,  sub: "This month", color: "text-emerald-500" },
          { label: "Active Deals",    value: activeDeals.length,           icon: ClipboardList, sub: "In progress" },
          { label: "Avg. Deal Size",  value: deals.length ? fmt(totalValue / deals.length) : "$0", icon: Building2, sub: "Across all deals" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <s.icon className={cn("h-4 w-4", s.color ?? "text-primary")} />
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Pipeline stage tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStageFilter("all")}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            stageFilter === "all"
              ? "bg-primary text-primary-foreground"
              : "border border-border/50 text-muted-foreground hover:text-foreground"
          )}
        >
          All Deals ({deals.length})
        </button>
        {pipelineStages.map((stage) => {
          const count = deals.filter((d) => d.stage === stage).length
          const cfg = stageConfig[stage]
          return (
            <button
              key={stage}
              onClick={() => setStageFilter(stage)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                stageFilter === stage ? cfg.bg + " " + cfg.color : "border-border/50 text-muted-foreground hover:text-foreground"
              )}
            >
              {cfg.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Deal cards */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map((deal, i) => {
            const cfg = stageConfig[deal.stage]
            const isExpanded = expandedId === deal.id
            const paidMilestones = deal.milestones.filter((m) => m.paid).length
            const canAdvance = deal.stage !== "closed_won" && deal.stage !== "closed_lost"

            return (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card overflow-hidden"
              >
                {/* Card header */}
                <div
                  className="flex w-full cursor-pointer items-start gap-4 p-5 text-left"
                  onClick={() => setExpandedId(isExpanded ? null : deal.id)}
                >
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-accent/80 text-sm font-bold text-primary-foreground">
                    {deal.buyerAvatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-foreground">{deal.property}</p>
                      <Badge variant="outline" className={cn("text-xs", cfg.bg, cfg.color)}>
                        {cfg.label}
                      </Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{deal.buyer}</span>
                      <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{deal.agent}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Closes {deal.closingDate}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-2 flex-1 rounded-full bg-border/50">
                        <div
                          className={cn("h-full rounded-full transition-all duration-500", deal.stage === "closed_won" ? "bg-emerald-500" : deal.stage === "closed_lost" ? "bg-red-500" : "bg-primary")}
                          style={{ width: `${deal.stageProgress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{deal.stageProgress}%</span>
                    </div>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-2">
                    <p className="text-xl font-bold text-foreground">{fmt(deal.value)}</p>
                    <p className="text-xs text-muted-foreground">{paidMilestones}/{deal.milestones.length} payments</p>
                    <div className="flex items-center gap-1">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass">
                          <DropdownMenuItem>Edit deal</DropdownMenuItem>
                          <DropdownMenuItem>Upload contract</DropdownMenuItem>
                          {canAdvance && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); markAsWon(deal.id) }}>
                              <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                              Mark as won
                            </DropdownMenuItem>
                          )}
                          {deal.stage !== "closed_lost" && deal.stage !== "closed_won" && (
                            <DropdownMenuItem
                              onClick={(e) => { e.stopPropagation(); markAsLost(deal.id) }}
                              className="text-destructive"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Mark as lost
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>
                </div>

                {/* Expanded detail */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden border-t border-border/50"
                    >
                      <div className="grid gap-5 p-5 sm:grid-cols-3">
                        {/* Contract stages — clickable */}
                        <div>
                          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Contract Stages
                          </p>
                          <div className="space-y-2">
                            {deal.contractStages.map((cs, idx) => (
                              <button
                                key={idx}
                                onClick={() => toggleContractStage(deal.id, idx)}
                                className="flex w-full items-center gap-2.5 rounded-lg px-1 py-0.5 hover:bg-secondary/30 transition-colors text-left"
                              >
                                {cs.done ? (
                                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
                                ) : (
                                  <Circle className="h-4 w-4 flex-shrink-0 text-border" />
                                )}
                                <span className={cn("text-sm flex-1", cs.done ? "text-foreground" : "text-muted-foreground")}>
                                  {cs.label}
                                </span>
                                {cs.date && (
                                  <span className="text-xs text-muted-foreground">{cs.date}</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Payment milestones — clickable to mark paid */}
                        <div>
                          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Payment Milestones
                          </p>
                          <div className="space-y-2">
                            {deal.milestones.map((m, idx) => (
                              <button
                                key={idx}
                                onClick={() => toggleMilestonePaid(deal.id, idx)}
                                className={cn(
                                  "w-full rounded-lg border p-2.5 text-left transition-all hover:brightness-105",
                                  m.paid
                                    ? "border-emerald-500/20 bg-emerald-500/5"
                                    : "border-border/40 bg-secondary/20"
                                )}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-xs font-medium text-foreground">{m.label}</p>
                                  {m.paid ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                                  ) : (
                                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
                                  )}
                                </div>
                                <p className="mt-0.5 text-sm font-bold text-foreground">{m.amount}</p>
                                <p className="text-xs text-muted-foreground">Due: {m.due}</p>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Notes + actions */}
                        <div>
                          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Notes
                          </p>
                          <p className="mb-4 rounded-lg border border-border/40 bg-secondary/20 p-3 text-sm text-foreground leading-relaxed">
                            {deal.notes}
                          </p>
                          <div className="space-y-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full gap-2 border-border/50"
                              onClick={() => {
                                const input = document.createElement("input")
                                input.type = "file"
                                input.accept = ".pdf,.doc,.docx"
                                input.click()
                              }}
                            >
                              <ClipboardList className="h-4 w-4" />
                              Upload contract
                            </Button>
                            {canAdvance && (
                              <Button
                                size="sm"
                                onClick={() => markNextStage(deal.id)}
                                className="w-full gap-2 bg-primary hover:bg-primary/90"
                              >
                                <ArrowRight className="h-4 w-4" />
                                Mark next stage
                              </Button>
                            )}
                            {deal.stage === "closed_won" && (
                              <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-500">
                                <CheckCircle2 className="h-4 w-4" />
                                Deal Closed — Won
                              </div>
                            )}
                            {deal.stage === "closed_lost" && (
                              <div className="flex items-center justify-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm font-semibold text-red-500">
                                <XCircle className="h-4 w-4" />
                                Deal Closed — Lost
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
