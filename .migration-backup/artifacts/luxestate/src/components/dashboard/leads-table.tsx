import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MoreHorizontal,
  Phone,
  Mail,
  MessageCircle,
  Filter,
  Search,
  UserPlus,
  NotebookText,
  Sparkles,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  Tag,
  Bell,
  Paperclip,
  FileText,
  FileImage,
  File,
  ExternalLink,
} from "lucide-react"
import { Link } from "wouter"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { surfaceInputClass, surfaceSelectClass } from "@/lib/ui-classes"
import {
  agents,
  availableTags,
  pipelineOrder,
  priorityConfig,
  statusConfig,
} from "@/components/dashboard/leads-data"
import { Lead, LeadStatus } from "@/components/dashboard/leads-types"

type LeadsTableProps = {
  leads: Lead[]
  setLeads: Dispatch<SetStateAction<Lead[]>>
}

type PanelTab = "notes" | "timeline" | "reminders" | "attachments"

function ScoreBar({ score }: { score: number }) {
  const color =
    score >= 75
      ? "bg-emerald-500"
      : score >= 50
        ? "bg-amber-500"
        : "bg-red-500"
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 rounded-full bg-border/50">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs font-medium text-muted-foreground">{score}</span>
    </div>
  )
}

function FileIcon({ type }: { type: Lead["attachments"][number]["type"] }) {
  if (type === "pdf") return <FileText className="h-4 w-4 text-red-500" />
  if (type === "img") return <FileImage className="h-4 w-4 text-blue-500" />
  if (type === "doc") return <FileText className="h-4 w-4 text-blue-600" />
  return <File className="h-4 w-4 text-muted-foreground" />
}

export function LeadsTable({ leads, setLeads }: LeadsTableProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [pipelineFilter, setPipelineFilter] = useState<LeadStatus | "all">("all")
  const [sourceFilter, setSourceFilter] = useState<Lead["source"] | "all">("all")
  const [selectedLead, setSelectedLead] = useState<number | null>(null)
  const [newNote, setNewNote] = useState("")
  const [panelTab, setPanelTab] = useState<PanelTab>("notes")

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 850)
    return () => clearTimeout(timer)
  }, [])

  const pipelineCounts = useMemo(() => {
    return pipelineOrder.reduce<Record<LeadStatus, number>>(
      (acc, status) => {
        acc[status] = leads.filter((lead) => lead.status === status).length
        return acc
      },
      { new: 0, qualified: 0, proposal: 0, negotiation: 0, won: 0, lost: 0 }
    )
  }, [leads])

  const filteredLeads = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return leads.filter((lead) => {
      const matchesQuery =
        query.length === 0 ||
        lead.name.toLowerCase().includes(query) ||
        lead.property.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        lead.assignedTo.toLowerCase().includes(query) ||
        lead.tags.some((t) => t.toLowerCase().includes(query))
      const matchesPipeline = pipelineFilter === "all" || lead.status === pipelineFilter
      const matchesSource = sourceFilter === "all" || lead.source === sourceFilter
      return matchesQuery && matchesPipeline && matchesSource
    })
  }, [leads, pipelineFilter, searchQuery, sourceFilter])

  const activeLead = selectedLead ? (leads.find((lead) => lead.id === selectedLead) ?? null) : null

  const updateLeadStatus = (id: number, status: LeadStatus) => {
    setLeads((current) =>
      current.map((lead) => (lead.id === id ? { ...lead, status } : lead))
    )
  }

  const updateLeadAssignee = (id: number, assignee: string) => {
    setLeads((current) =>
      current.map((lead) => (lead.id === id ? { ...lead, assignedTo: assignee } : lead))
    )
  }

  const archiveLead = (id: number) => {
    setLeads((current) => current.filter((lead) => lead.id !== id))
    if (selectedLead === id) setSelectedLead(null)
  }

  const addMeetingTask = (id: number) => {
    const today = new Date()
    const dateStr = today.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    setLeads((current) =>
      current.map((lead) =>
        lead.id === id
          ? {
              ...lead,
              timeline: [
                {
                  id: `tl-${Date.now()}`,
                  title: "Meeting scheduled",
                  time: `${dateStr} — added via CRM`,
                },
                ...lead.timeline,
              ].slice(0, 10),
            }
          : lead
      )
    )
    if (selectedLead === id) setPanelTab("timeline")
  }

  const addLeadNote = () => {
    if (!activeLead || !newNote.trim()) return
    setLeads((current) =>
      current.map((lead) =>
        lead.id === activeLead.id
          ? { ...lead, notes: [newNote.trim(), ...lead.notes].slice(0, 6) }
          : lead
      )
    )
    setNewNote("")
  }

  const toggleTag = (leadId: number, tag: string) => {
    setLeads((current) =>
      current.map((lead) => {
        if (lead.id !== leadId) return lead
        const has = lead.tags.includes(tag)
        return { ...lead, tags: has ? lead.tags.filter((t) => t !== tag) : [...lead.tags, tag] }
      })
    )
  }

  const openWhatsApp = (lead: Lead) => {
    const message = encodeURIComponent(
      `Hi ${lead.name}, just checking in regarding ${lead.property}.`
    )
    const phoneNumber = lead.whatsappNumber.replace(/\D/g, "")
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank", "noopener,noreferrer")
  }

  const panelTabs: { key: PanelTab; label: string; icon: React.ElementType }[] = [
    { key: "notes", label: "Notes", icon: NotebookText },
    { key: "timeline", label: "Timeline", icon: Clock3 },
    { key: "reminders", label: "Reminders", icon: Bell },
    { key: "attachments", label: "Attachments", icon: Paperclip },
  ]

  return (
    <div className="glass-card p-6">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Lead Pipeline</h3>
          <p className="text-sm text-muted-foreground">
            Search, prioritize, assign and convert high-value prospects
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, property, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 sm:w-72 ${surfaceInputClass}`}
            />
          </div>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as Lead["source"] | "all")}
            className={cn("w-full sm:w-44", surfaceSelectClass)}
          >
            <option value="all">All Sources</option>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="Social Media">Social Media</option>
            <option value="Email">Email</option>
            <option value="Cold Call">Cold Call</option>
          </select>
          <Button variant="outline" size="icon" className="border-border/50">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={pipelineFilter === "all" ? "default" : "outline"}
          onClick={() => setPipelineFilter("all")}
          className={pipelineFilter === "all" ? "bg-primary hover:bg-primary/90" : "border-border/50"}
        >
          All ({leads.length})
        </Button>
        {pipelineOrder.map((status) => (
          <Button
            key={status}
            size="sm"
            variant={pipelineFilter === status ? "default" : "outline"}
            onClick={() => setPipelineFilter(status)}
            className={
              pipelineFilter === status ? "bg-primary hover:bg-primary/90" : "border-border/50"
            }
          >
            {statusConfig[status].label} ({pipelineCounts[status]})
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="grid grid-cols-12 items-center gap-3 rounded-xl border border-border/40 p-3"
            >
              <Skeleton className="col-span-5 h-12" />
              <Skeleton className="col-span-3 h-8 hidden md:block" />
              <Skeleton className="col-span-2 h-8 hidden lg:block" />
              <Skeleton className="col-span-2 h-8" />
            </div>
          ))}
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="glass border-border/50 py-10 rounded-xl flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <Sparkles className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold text-foreground">No leads match these filters</p>
          <p className="text-sm text-muted-foreground">
            Try widening your search or switching pipeline stages to surface more prospects.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("")
              setPipelineFilter("all")
              setSourceFilter("all")
            }}
          >
            Reset filters
          </Button>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto -mx-6 px-6 lg:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Lead
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Property
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Budget
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Score
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Pipeline
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Assigned
                  </th>
                  <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Actions
                  </th>
                  <th className="px-2 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    <span className="sr-only">More</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                <AnimatePresence>
                  {filteredLeads.map((lead, index) => (
                    <motion.tr
                      key={lead.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2, delay: index * 0.04 }}
                      className={cn(
                        "group cursor-pointer transition-colors hover:bg-secondary/30",
                        selectedLead === lead.id && "bg-secondary/50"
                      )}
                      onClick={() =>
                        setSelectedLead(selectedLead === lead.id ? null : lead.id)
                      }
                    >
                      <td className="px-2 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-accent/80 text-sm font-semibold text-primary-foreground">
                            {lead.avatar}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="truncate font-medium text-foreground">{lead.name}</p>
                              {lead.duplicateOf && (
                                <span title="Possible duplicate lead">
                                  <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
                                </span>
                              )}
                            </div>
                            <p className="truncate text-sm text-muted-foreground">{lead.email}</p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              <Badge
                                variant="outline"
                                className={priorityConfig[lead.priority].className}
                              >
                                {priorityConfig[lead.priority].label}
                              </Badge>
                              {lead.tags.slice(0, 2).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="border-border/50 bg-secondary/40 text-xs text-muted-foreground"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {lead.tags.length > 2 && (
                                <Badge
                                  variant="outline"
                                  className="border-border/50 bg-secondary/40 text-xs text-muted-foreground"
                                >
                                  +{lead.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-4">
                        <p className="text-sm text-foreground">{lead.property}</p>
                        <p className="text-xs text-muted-foreground">{lead.lastContact}</p>
                      </td>
                      <td className="px-2 py-4">
                        <span className="font-semibold text-foreground">{lead.budget}</span>
                      </td>
                      <td className="px-2 py-4">
                        <ScoreBar score={lead.score} />
                      </td>
                      <td className="px-2 py-4">
                        <select
                          value={lead.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) =>
                            updateLeadStatus(lead.id, e.target.value as LeadStatus)
                          }
                          className={cn("h-8 w-36 text-xs", surfaceSelectClass)}
                        >
                          {pipelineOrder.map((status) => (
                            <option key={status} value={status}>
                              {statusConfig[status].label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-4">
                        <select
                          value={lead.assignedTo}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateLeadAssignee(lead.id, e.target.value)}
                          className={cn("h-8 w-40 text-xs", surfaceSelectClass)}
                        >
                          {agents.map((agent) => (
                            <option key={agent} value={agent}>
                              {agent}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-4">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-500 opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation()
                              openWhatsApp(lead)
                            }}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-2 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass">
                            <Link href={`/dashboard/leads/${lead.id}`}>
                              <DropdownMenuItem className="gap-2 cursor-pointer">
                                <ExternalLink className="h-3.5 w-3.5" />
                                View full profile
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem onClick={() => { addMeetingTask(lead.id); setSelectedLead(lead.id) }}>
                              Add meeting task
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openWhatsApp(lead)}>
                              Send WhatsApp
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => archiveLead(lead.id)}
                            >
                              Archive lead
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            <AnimatePresence>
              {filteredLeads.map((lead, index) => (
                <motion.div
                  key={lead.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className={cn(
                    "rounded-xl border border-border/40 bg-secondary/20 p-4",
                    selectedLead === lead.id && "border-primary/40"
                  )}
                >
                  <button
                    className="w-full text-left"
                    onClick={() =>
                      setSelectedLead(selectedLead === lead.id ? null : lead.id)
                    }
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate font-medium text-foreground">{lead.name}</p>
                          {lead.duplicateOf && (
                            <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
                          )}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">{lead.email}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {lead.tags.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="border-border/50 bg-secondary/40 text-xs text-muted-foreground"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={statusConfig[lead.status].className}
                      >
                        {statusConfig[lead.status].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground">{lead.property}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {lead.budget} • {lead.assignedTo}
                      </p>
                      <ScoreBar score={lead.score} />
                    </div>
                  </button>

                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => openWhatsApp(lead)}
                    >
                      <MessageCircle className="mr-2 h-4 w-4 text-green-500" />
                      WhatsApp
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Phone className="mr-2 h-4 w-4" />
                      Call
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {/* Expanded lead panel */}
      <AnimatePresence>
        {activeLead && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className="mt-6 border-t border-border/50 pt-5"
          >
            {/* Duplicate warning */}
            {activeLead.duplicateOf && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-amber-600">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>
                  Possible duplicate — this lead may overlap with lead #{activeLead.duplicateOf}.
                  Review before assigning tasks.
                </span>
              </div>
            )}

            {/* Panel tabs */}
            <div className="mb-4 flex gap-1 rounded-xl border border-border/40 bg-secondary/20 p-1">
              {panelTabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setPanelTab(key)}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors",
                    panelTab === key
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                  {key === "attachments" && activeLead.attachments.length > 0 && (
                    <span className="ml-0.5 rounded-full bg-primary/20 px-1.5 text-primary">
                      {activeLead.attachments.length}
                    </span>
                  )}
                  {key === "reminders" && activeLead.reminder && (
                    <span className="ml-0.5 h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {/* Left panel: contact info always shown */}
              <div className="rounded-xl border border-border/40 bg-secondary/20 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <NotebookText className="h-4 w-4 text-primary" />
                  <h4 className="font-semibold text-foreground">Contact & Details</h4>
                </div>
                <div className="mb-4 space-y-2 rounded-md border border-border/40 bg-background/60 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground">Phone</p>
                      <p className="font-medium text-foreground">{activeLead.phone}</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      Call
                    </Button>
                  </div>
                  <div className="flex items-center justify-between border-t border-border/40 pt-2">
                    <div>
                      <p className="text-muted-foreground">WhatsApp</p>
                      <p className="font-medium text-foreground">{activeLead.whatsappNumber}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() => openWhatsApp(activeLead)}
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-green-500" />
                      Chat
                    </Button>
                  </div>
                  <div className="border-t border-border/40 pt-2">
                    <p className="mb-1 text-muted-foreground">Source</p>
                    <Badge variant="outline" className="border-border/50">
                      {activeLead.source}
                    </Badge>
                  </div>
                </div>

                {/* Tags editor */}
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Tag className="h-3.5 w-3.5 text-primary" />
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Tags
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {availableTags.map((tag) => {
                      const active = activeLead.tags.includes(tag)
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleTag(activeLead.id, tag)}
                          className={cn(
                            "rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                            active
                              ? "border-primary/40 bg-primary/15 text-primary"
                              : "border-border/50 bg-secondary/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                          )}
                        >
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Right panel: tab content */}
              <div className="rounded-xl border border-border/40 bg-secondary/20 p-4">
                {panelTab === "notes" && (
                  <>
                    <div className="mb-3 flex items-center gap-2">
                      <NotebookText className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-foreground">Notes</h4>
                    </div>
                    <div className="mb-3 flex gap-2">
                      <Input
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addLeadNote()}
                        placeholder="Add a contextual note for this lead..."
                        className={surfaceInputClass}
                      />
                      <Button onClick={addLeadNote} className="bg-primary hover:bg-primary/90">
                        Add
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {activeLead.notes.length === 0 ? (
                        <p className="py-4 text-center text-sm text-muted-foreground">
                          No notes yet — add one above.
                        </p>
                      ) : (
                        activeLead.notes.map((note, idx) => (
                          <div
                            key={`${activeLead.id}-note-${idx}`}
                            className="rounded-md border border-border/40 bg-background/60 p-3 text-sm text-foreground"
                          >
                            {note}
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}

                {panelTab === "timeline" && (
                  <>
                    <div className="mb-3 flex items-center gap-2">
                      <Clock3 className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-foreground">Activity Timeline</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="rounded-md border border-border/40 bg-background/60 p-3">
                        <p className="mb-1 text-xs text-muted-foreground">Interested properties</p>
                        <p className="text-sm text-foreground">
                          {activeLead.interestedProperties.join(", ")}
                        </p>
                      </div>
                      {activeLead.timeline.map((item) => (
                        <div key={item.id} className="flex items-start gap-3">
                          <span className="mt-1 rounded-full bg-primary/15 p-1 text-primary">
                            <CheckCircle2 className="h-3 w-3" />
                          </span>
                          <div>
                            <p className="text-sm font-medium text-foreground">{item.title}</p>
                            <p className="text-xs text-muted-foreground">{item.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-border/40 pt-4">
                      <Button variant="outline" size="sm" className="gap-2">
                        <UserPlus className="h-4 w-4" />
                        Reassign
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => openWhatsApp(activeLead)}
                      >
                        <MessageCircle className="h-4 w-4 text-green-500" />
                        WhatsApp
                      </Button>
                    </div>
                  </>
                )}

                {panelTab === "reminders" && (
                  <>
                    <div className="mb-3 flex items-center gap-2">
                      <Bell className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-foreground">Reminders</h4>
                    </div>
                    {activeLead.reminder ? (
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                        <div className="mb-1 flex items-center gap-2">
                          <Bell className="h-4 w-4 text-primary" />
                          <span className="text-sm font-semibold text-primary">
                            {activeLead.reminder.date}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{activeLead.reminder.note}</p>
                        <div className="mt-3 flex gap-2">
                          <Button variant="outline" size="sm">
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                            Mark done
                          </Button>
                          <Button variant="outline" size="sm">
                            Snooze
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-border/60 py-8 text-center">
                        <Bell className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">No reminders set</p>
                        <Button variant="outline" size="sm" className="mt-3">
                          Add reminder
                        </Button>
                      </div>
                    )}
                  </>
                )}

                {panelTab === "attachments" && (
                  <>
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Paperclip className="h-4 w-4 text-primary" />
                        <h4 className="font-semibold text-foreground">Attachments</h4>
                      </div>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Paperclip className="h-3.5 w-3.5" />
                        Upload
                      </Button>
                    </div>
                    {activeLead.attachments.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border/60 py-8 text-center">
                        <Paperclip className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">No files attached</p>
                        <Button variant="outline" size="sm" className="mt-3">
                          Upload document
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {activeLead.attachments.map((file, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3 rounded-lg border border-border/40 bg-background/60 p-3"
                          >
                            <FileIcon type={file.type} />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-foreground">
                                {file.name}
                              </p>
                              <p className="text-xs text-muted-foreground">{file.size}</p>
                            </div>
                            <Button variant="ghost" size="sm" className="flex-shrink-0 text-xs">
                              View
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
        <p className="text-sm text-muted-foreground">
          Showing {filteredLeads.length} of {leads.length} leads
        </p>
        <div className="hidden items-center gap-2 sm:flex">
          <Button variant="outline" size="sm" className="border-border/50">
            Previous
          </Button>
          <Button variant="outline" size="sm" className="border-border/50">
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
