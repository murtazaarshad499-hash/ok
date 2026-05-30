import { useState } from "react"
import { Link, useLocation } from "wouter"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Phone,
  Mail,
  MessageCircle,
  CalendarPlus,
  Edit2,
  Flame,
  CheckCircle2,
  Circle,
  Clock,
  Paperclip,
  Send,
  FileText,
  FileImage,
  File,
  Building2,
  User,
  DollarSign,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Tag,
  Star,
  MoreHorizontal,
  Bell,
} from "lucide-react"
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
import { surfaceInputClass } from "@/lib/ui-classes"
import { initialLeads, statusConfig, priorityConfig, pipelineOrder, agents } from "@/components/dashboard/leads-data"
import { Lead, LeadStatus } from "@/components/dashboard/leads-types"

type TimelineEvent = {
  id: string
  title: string
  description?: string
  time: string
  type: "message" | "call" | "email" | "meeting" | "deal" | "system"
}

type Message = {
  id: string
  from: "agent" | "lead"
  text: string
  time: string
  read: boolean
}

const supplementalData: Record<number, {
  fullTimeline: TimelineEvent[]
  messages: Message[]
  aiScore: number
  aiSummary: string
}> = {
  1: {
    fullTimeline: [
      { id: "t1", title: "WhatsApp follow-up sent", description: "Agent asked about HOA document status", time: "2 hours ago", type: "message" },
      { id: "t2", title: "Offer document shared via email", description: "Sent pricing proposal for Manhattan Penthouse", time: "Yesterday, 4:30 PM", type: "email" },
      { id: "t3", title: "Private evening viewing completed", description: "1.5h tour of the penthouse. Lead reacted positively.", time: "2 days ago, 7:00 PM", type: "meeting" },
      { id: "t4", title: "Lead qualified by James Donovan", description: "Financial verification complete. Budget confirmed at $5.2M.", time: "3 days ago", type: "system" },
      { id: "t5", title: "Phone call — 12 mins", description: "Discussed property features and HOA structure", time: "4 days ago", type: "call" },
      { id: "t6", title: "Lead created from referral", description: "Referred by Amanda Foster (existing client)", time: "5 days ago", type: "system" },
    ],
    messages: [
      { id: "m1", from: "agent", text: "Hi Sarah! Just checking in — have you had a chance to review the HOA documents we sent over?", time: "2h ago", read: true },
      { id: "m2", from: "lead", text: "Yes, going through them now with my attorney. Should have feedback by tomorrow.", time: "1h 45m ago", read: true },
      { id: "m3", from: "agent", text: "Perfect, no rush. Let me know if you have any questions in the meantime. The seller is flexible on the closing timeline.", time: "1h 30m ago", read: true },
      { id: "m4", from: "lead", text: "That's great to know. One thing — is parking included in the HOA?", time: "1h ago", read: false },
    ],
    aiScore: 94,
    aiSummary: "Sarah is a high-intent buyer who has reviewed the listing 7 times this week and responded positively to the HOA document. Her financial verification is complete and she's been silent for 2 days — historically a sign she's comparing offers. Immediate outreach recommended before 6 PM today.",
  },
  2: {
    fullTimeline: [
      { id: "t1", title: "Pricing proposal submitted", description: "Sent detailed proposal for Beverly Hills Estate", time: "1 day ago", type: "email" },
      { id: "t2", title: "Malibu comparables requested", description: "Lead asked for comparison with 2 Malibu properties", time: "2 days ago", type: "message" },
      { id: "t3", title: "Discovery call — 24 mins", description: "Discussed investment goals and timeline for purchase", time: "3 days ago", type: "call" },
      { id: "t4", title: "Website inquiry submitted", description: "Lead filled out the contact form for Beverly Hills Estate", time: "5 days ago", type: "system" },
    ],
    messages: [
      { id: "m1", from: "lead", text: "Can you send me comparables for the Malibu Beach House and Beverly Hills Estate side by side?", time: "2d ago", read: true },
      { id: "m2", from: "agent", text: "Of course! Sending the full comparison report now. Beverly Hills has a stronger rental yield by ~12%.", time: "1d 22h ago", read: true },
      { id: "m3", from: "agent", text: "Michael, just following up on the proposal. Happy to arrange another showing or a call with the seller's agent.", time: "1d ago", read: true },
      { id: "m4", from: "lead", text: "Sorry for the delay — reviewing with my legal team internationally. Will revert by Friday.", time: "18h ago", read: false },
    ],
    aiScore: 72,
    aiSummary: "Michael is an experienced investor comparing multiple listings. He requested Malibu comparables, indicating he's in active due diligence. The proposal has been unread for 18 hours — unusual for him. Personalized video tour or updated comps could re-engage him before end of week.",
  },
  3: {
    fullTimeline: [
      { id: "t1", title: "Qualification form completed", description: "Confirmed budget and timeline for Miami Beach Condo", time: "5 hours ago", type: "system" },
      { id: "t2", title: "WhatsApp message — viewing request", description: "Emily asked to schedule a weekend viewing", time: "8 hours ago", type: "message" },
      { id: "t3", title: "Lead created from Instagram ad", description: "Clicked on Miami Beach Condo sponsored post", time: "1 day ago", type: "system" },
    ],
    messages: [
      { id: "m1", from: "lead", text: "Hi! I saw your Miami Beach Condo listing and I'm very interested. Is it available for a viewing this weekend?", time: "8h ago", read: true },
      { id: "m2", from: "agent", text: "Hi Emily! Absolutely, we can arrange a private viewing Saturday or Sunday. Which works best for you?", time: "7h ago", read: true },
      { id: "m3", from: "lead", text: "Saturday at 11 AM would be perfect!", time: "6h ago", read: true },
      { id: "m4", from: "lead", text: "Also — what's the HOA fee per month?", time: "5h ago", read: false },
    ],
    aiScore: 87,
    aiSummary: "Emily has a hard June 30 tax deadline creating strong urgency. First-time luxury buyer with fast-track qualification and confirmed viewing interest. Risk of losing to a competitor is elevated — schedule the viewing and respond to her HOA question immediately.",
  },
  4: {
    fullTimeline: [
      { id: "t1", title: "Email inquiry received", description: "Interested in SF Loft and Manhattan Penthouse", time: "3 days ago", type: "email" },
      { id: "t2", title: "Lead assigned to Emily Rodriguez", description: "Auto-assigned based on territory", time: "3 days ago", type: "system" },
    ],
    messages: [
      { id: "m1", from: "lead", text: "Hello, I'm relocating from Seoul in Q3 and looking for a luxury loft or penthouse. Do you have any pet-friendly options?", time: "3d ago", read: true },
      { id: "m2", from: "agent", text: "Hi David! Welcome, we have several pet-friendly listings. The SF Loft allows 2 pets up to 50 lbs. Would you like to schedule a virtual tour?", time: "2d 22h ago", read: true },
    ],
    aiScore: 45,
    aiSummary: "David is in early-stage research with a Q3 relocation timeline. Low urgency currently — nurture with market insights and virtual tours. No recent contact in 3 days; a light follow-up email is recommended to maintain engagement.",
  },
  5: {
    fullTimeline: [
      { id: "t1", title: "Contract signed ✓", description: "Full purchase of Malibu Beach House at $16M completed", time: "1 week ago", type: "deal" },
      { id: "t2", title: "Final walkthrough completed", description: "All items from inspection report resolved", time: "10 days ago", type: "meeting" },
      { id: "t3", title: "Offer accepted by seller", description: "$16M cash offer, 14-day close", time: "2 weeks ago", type: "deal" },
      { id: "t4", title: "Financial verification complete", description: "Wire transfer pre-approved. Cash buyer confirmed.", time: "3 weeks ago", type: "system" },
      { id: "t5", title: "Private estate showing", description: "3-hour exclusive tour of Malibu Beach House", time: "4 weeks ago", type: "meeting" },
    ],
    messages: [
      { id: "m1", from: "lead", text: "James, thank you so much for everything. The property is absolutely stunning.", time: "1wk ago", read: true },
      { id: "m2", from: "agent", text: "Congratulations Amanda! It was a pleasure working with you. Enjoy your new Malibu home — you've made an incredible investment!", time: "1wk ago", read: true },
      { id: "m3", from: "lead", text: "I'll definitely be referring my colleagues to you. Two of my friends are looking in the $8–12M range.", time: "6d ago", read: true },
    ],
    aiScore: 95,
    aiSummary: "Deal successfully closed at $16M. Amanda is a highly satisfied client who has indicated she will refer colleagues. Follow up within 30 days to request referrals and offer complimentary property management consultation.",
  },
  6: {
    fullTimeline: [
      { id: "t1", title: "Cold call — expressed interest", description: "Interested in Dubai Marina Villa. Open to viewing.", time: "Yesterday", type: "call" },
      { id: "t2", title: "Lead created manually", description: "Added to CRM from cold outreach campaign", time: "Yesterday", type: "system" },
    ],
    messages: [
      { id: "m1", from: "agent", text: "Hi Robert! Following up on our call yesterday. I've attached the full property brochure for Dubai Marina Villa. Let me know your thoughts!", time: "Yesterday", read: true },
    ],
    aiScore: 58,
    aiSummary: "Robert is an early-stage international prospect. Warm interest level, looking to buy before year-end. Send Dubai market insights and arrange a virtual tour to build engagement.",
  },
  7: {
    fullTimeline: [
      { id: "t1", title: "Referral from Amanda Foster", description: "Amanda referred Lisa as a potential investor buyer", time: "2 days ago", type: "system" },
      { id: "t2", title: "Initial qualification call — 18 mins", description: "Discussed budget ($9.1M) and interest in Beverly Hills", time: "2 days ago", type: "call" },
    ],
    messages: [
      { id: "m1", from: "agent", text: "Hi Lisa! Amanda speaks very highly of you. I'd love to show you our Beverly Hills Estate — it's a perfect fit for your investment profile.", time: "2d ago", read: true },
      { id: "m2", from: "lead", text: "Thanks! I'm interested but want to see the rental yield data first. Can you send that over?", time: "1d 20h ago", read: false },
    ],
    aiScore: 67,
    aiSummary: "Lisa is a strong referral lead with a $9.1M budget aligned to Beverly Hills Estate. Possible overlap with Michael Chen's inquiry — monitor carefully. Send rental yield analysis to proceed.",
  },
}

const timelineIcon = (type: TimelineEvent["type"]) => {
  const map = {
    message: { Icon: MessageCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
    call: { Icon: Phone, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    email: { Icon: Mail, color: "text-purple-500", bg: "bg-purple-500/10" },
    meeting: { Icon: CalendarPlus, color: "text-primary", bg: "bg-primary/10" },
    deal: { Icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    system: { Icon: Circle, color: "text-muted-foreground", bg: "bg-secondary/50" },
  }
  return map[type]
}

function ScoreRing({ score }: { score: number }) {
  const r = 26
  const circ = 2 * Math.PI * r
  const fill = (score / 100) * circ
  const color = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444"
  return (
    <div className="relative flex h-16 w-16 items-center justify-center">
      <svg width={64} height={64} className="-rotate-90">
        <circle cx={32} cy={32} r={r} stroke="var(--border)" strokeWidth={5} fill="none" />
        <circle
          cx={32} cy={32} r={r}
          stroke={color}
          strokeWidth={5}
          fill="none"
          strokeDasharray={`${fill} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <span className="absolute text-sm font-bold text-foreground">{score}</span>
    </div>
  )
}

function FileIcon({ type }: { type: Lead["attachments"][number]["type"] }) {
  if (type === "pdf") return <FileText className="h-4 w-4 text-red-500" />
  if (type === "img") return <FileImage className="h-4 w-4 text-blue-500" />
  return <File className="h-4 w-4 text-muted-foreground" />
}

export default function LeadProfilePage({ params }: { params: { id: string } }) {
  const [, navigate] = useLocation()
  const [newMessage, setNewMessage] = useState("")
  const [newNote, setNewNote] = useState("")
  const [notes, setNotes] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<"timeline" | "messages" | "notes">("timeline")

  const id = parseInt(params.id, 10)
  const lead = initialLeads.find((l) => l.id === id)

  if (!lead) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-xl font-bold text-foreground">Lead not found</p>
        <Link href="/dashboard/leads">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Leads
          </Button>
        </Link>
      </div>
    )
  }

  const extra = supplementalData[id] ?? {
    fullTimeline: lead.timeline.map((t) => ({ ...t, type: "system" as const })),
    messages: [],
    aiScore: lead.score,
    aiSummary: lead.notes[0] ?? "",
  }

  const allNotes = [...lead.notes, ...notes]
  const stageIndex = pipelineOrder.indexOf(lead.status)
  const priorityCfg = priorityConfig[lead.priority]
  const statusCfg = statusConfig[lead.status]

  const openWhatsApp = () => {
    const msg = encodeURIComponent(`Hi ${lead.name}, following up regarding ${lead.property}.`)
    window.open(`https://wa.me/${lead.whatsappNumber.replace(/\D/g, "")}?text=${msg}`, "_blank", "noopener")
  }

  const sendMessage = () => {
    if (!newMessage.trim()) return
    setNewMessage("")
  }

  const addNote = () => {
    if (!newNote.trim()) return
    setNotes((prev) => [newNote.trim(), ...prev])
    setNewNote("")
  }

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/leads">
          <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            All Leads
          </Button>
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium text-foreground">{lead.name}</span>
      </div>

      {/* Profile header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/80 to-accent/80 text-2xl font-bold text-primary-foreground shadow-lg shadow-primary/20">
                {lead.avatar}
              </div>
              {lead.priority === "hot" && (
                <Flame className="absolute -right-1.5 -top-1.5 h-5 w-5 text-red-500" />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">{lead.name}</h1>
                <Badge variant="outline" className={cn("font-semibold", priorityCfg.className)}>
                  {priorityCfg.label}
                </Badge>
                <Badge variant="outline" className={cn(statusCfg.className)}>
                  {statusCfg.label}
                </Badge>
                {lead.duplicateOf && (
                  <Badge variant="outline" className="border-amber-500/20 bg-amber-500/10 text-amber-500">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Possible Duplicate
                  </Badge>
                )}
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{lead.email}</span>
                <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{lead.phone}</span>
                <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{lead.source}</span>
              </div>

              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {lead.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="border-border/50 bg-secondary/40 text-xs text-muted-foreground">
                    <Tag className="mr-1 h-2.5 w-2.5" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="mb-1 text-xs font-medium text-muted-foreground">Lead Score</p>
              <ScoreRing score={extra.aiScore} />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass">
                <DropdownMenuItem>Edit lead</DropdownMenuItem>
                <DropdownMenuItem>Change assignee</DropdownMenuItem>
                <DropdownMenuItem>Move pipeline stage</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Archive lead</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-5 flex flex-wrap gap-2 border-t border-border/50 pt-5">
          <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20">
            <Phone className="h-4 w-4" />
            Call
          </Button>
          <Button onClick={openWhatsApp} variant="outline" className="gap-2 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </Button>
          <Button variant="outline" className="gap-2 border-border/50">
            <Mail className="h-4 w-4" />
            Email
          </Button>
          <Button variant="outline" className="gap-2 border-border/50">
            <CalendarPlus className="h-4 w-4" />
            Schedule Viewing
          </Button>
          <Button variant="outline" className="gap-2 border-border/50">
            <Edit2 className="h-4 w-4" />
            Edit Lead
          </Button>
        </div>

        {/* Pipeline stages */}
        <div className="mt-5 border-t border-border/50 pt-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pipeline Progress</p>
          <div className="flex items-center gap-0">
            {pipelineOrder.filter(s => s !== "lost").map((stage, i, arr) => {
              const isDone = pipelineOrder.indexOf(stage) < stageIndex
              const isCurrent = stage === lead.status
              const isLast = i === arr.length - 1
              return (
                <div key={stage} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                      isDone ? "border-primary bg-primary text-primary-foreground" :
                      isCurrent ? "border-primary bg-primary/10 text-primary" :
                      "border-border/50 bg-secondary/20 text-muted-foreground"
                    )}>
                      {isDone ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                    </div>
                    <span className={cn(
                      "text-[10px] font-medium capitalize whitespace-nowrap",
                      isCurrent ? "text-primary" : isDone ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {statusConfig[stage].label}
                    </span>
                  </div>
                  {!isLast && (
                    <div className={cn("mb-4 h-0.5 flex-1 transition-all", isDone ? "bg-primary" : "bg-border/50")} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Main content grid */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Left: Timeline / Messages / Notes */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="xl:col-span-2 glass-card p-6"
        >
          {/* Tabs */}
          <div className="mb-5 flex gap-1 rounded-xl border border-border/40 bg-secondary/20 p-1">
            {(["timeline", "messages", "notes"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={cn(
                  "flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition-colors",
                  activeTab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t === "messages" ? `Messages (${extra.messages.length})` : t === "notes" ? `Notes (${allNotes.length})` : "Timeline"}
              </button>
            ))}
          </div>

          {/* TIMELINE */}
          {activeTab === "timeline" && (
            <div className="relative space-y-0">
              {extra.fullTimeline.map((event, i) => {
                const { Icon, color, bg } = timelineIcon(event.type)
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="relative flex gap-4 pb-6 last:pb-0"
                  >
                    {/* Vertical line */}
                    {i < extra.fullTimeline.length - 1 && (
                      <div className="absolute left-4 top-9 bottom-0 w-px bg-border/50" />
                    )}
                    <div className={cn("relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-border/40", bg)}>
                      <Icon className={cn("h-4 w-4", color)} />
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5">
                      <p className="font-semibold text-foreground">{event.title}</p>
                      {event.description && (
                        <p className="mt-0.5 text-sm text-muted-foreground">{event.description}</p>
                      )}
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {event.time}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* MESSAGES */}
          {activeTab === "messages" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                <MessageCircle className="h-4 w-4 text-emerald-500" />
                <p className="text-xs text-muted-foreground">
                  WhatsApp thread with <span className="font-medium text-foreground">{lead.name}</span>
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {extra.messages.map((msg, i) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className={cn("flex", msg.from === "agent" ? "justify-end" : "justify-start")}
                  >
                    {msg.from === "lead" && (
                      <div className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center self-end rounded-full bg-gradient-to-br from-primary/60 to-accent/60 text-xs font-bold text-primary-foreground">
                        {lead.avatar}
                      </div>
                    )}
                    <div className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm",
                      msg.from === "agent"
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-secondary/60 text-foreground"
                    )}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <div className="mt-1 flex items-center justify-end gap-1">
                        <p className={cn("text-[10px]", msg.from === "agent" ? "text-primary-foreground/60" : "text-muted-foreground")}>
                          {msg.time}
                        </p>
                        {msg.from === "agent" && (
                          <span className={cn("text-[10px]", msg.read ? "text-primary-foreground/80" : "text-primary-foreground/40")}>✓✓</span>
                        )}
                        {msg.from === "lead" && !msg.read && (
                          <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">1</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-2 border-t border-border/50 pt-3">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a WhatsApp message..."
                  className={`flex-1 ${surfaceInputClass}`}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  size="icon"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* NOTES */}
          {activeTab === "notes" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addNote()}
                  placeholder="Add a note about this lead..."
                  className={`flex-1 ${surfaceInputClass}`}
                />
                <Button
                  onClick={addNote}
                  disabled={!newNote.trim()}
                  className="bg-primary hover:bg-primary/90"
                >
                  Add
                </Button>
              </div>

              <div className="space-y-2">
                {allNotes.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border/60 py-10 text-center">
                    <Star className="h-8 w-8 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">No notes yet. Add one above.</p>
                  </div>
                ) : (
                  allNotes.map((note, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 rounded-xl border border-border/40 bg-secondary/20 px-4 py-3"
                    >
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                      <p className="flex-1 text-sm text-foreground">{note}</p>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Right sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          {/* Lead details */}
          <div className="glass-card p-5">
            <h3 className="mb-4 font-semibold text-foreground">Lead Details</h3>
            <div className="space-y-3">
              {[
                { label: "Budget", value: lead.budget, icon: DollarSign },
                { label: "Property Interest", value: lead.interestedProperties.join(", "), icon: Building2 },
                { label: "Assigned Agent", value: lead.assignedTo, icon: User },
                { label: "Source", value: lead.source, icon: TrendingUp },
                { label: "Last Contact", value: lead.lastContact, icon: Clock },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-start gap-2.5">
                  <Icon className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-medium text-foreground">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Insight */}
          <div className="glass-card border border-primary/20 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-foreground">AI Insight</h3>
              <Badge className="ml-auto bg-primary/10 text-primary border-primary/20 text-xs">
                Score {extra.aiScore}
              </Badge>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{extra.aiSummary}</p>
          </div>

          {/* Reminder */}
          {lead.reminder && (
            <div className="glass-card border border-amber-500/20 p-5">
              <div className="mb-3 flex items-center gap-2">
                <Bell className="h-4 w-4 text-amber-500" />
                <h3 className="font-semibold text-foreground">Reminder</h3>
              </div>
              <p className="text-sm font-medium text-foreground">{lead.reminder.date}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{lead.reminder.note}</p>
              <Button variant="outline" size="sm" className="mt-3 w-full border-amber-500/30 text-amber-500 hover:bg-amber-500/10">
                Mark as Done
              </Button>
            </div>
          )}

          {/* Attachments */}
          {lead.attachments.length > 0 && (
            <div className="glass-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-foreground">Documents</h3>
                <Badge variant="outline" className="ml-auto border-border/50 text-xs">
                  {lead.attachments.length}
                </Badge>
              </div>
              <div className="space-y-2">
                {lead.attachments.map((att, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-border/40 bg-secondary/20 p-2.5">
                    <FileIcon type={att.type} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-foreground">{att.name}</p>
                      <p className="text-[10px] text-muted-foreground">{att.size}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                      <TrendingUp className="h-3 w-3 rotate-90" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="mt-3 w-full border-border/50">
                <Paperclip className="mr-2 h-3.5 w-3.5" />
                Upload file
              </Button>
            </div>
          )}

          {/* Duplicate warning */}
          {lead.duplicateOf && (
            <div className="glass-card border border-amber-500/20 p-5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" />
                <div>
                  <p className="font-semibold text-foreground">Possible Duplicate</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    This lead may overlap with{" "}
                    <Link href={`/dashboard/leads/${lead.duplicateOf}`}>
                      <span className="cursor-pointer font-medium text-primary underline-offset-2 hover:underline">
                        {initialLeads.find((l) => l.id === lead.duplicateOf)?.name ?? `Lead #${lead.duplicateOf}`}
                      </span>
                    </Link>
                    . Review both before proceeding.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
