import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Send,
  Paperclip,
  MoreHorizontal,
  Phone,
  StickyNote,
  ChevronDown,
  CheckCheck,
  MessageSquare,
  Link2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { surfaceInputClass } from "@/lib/ui-classes"

type MessageType = "text" | "template" | "note"
type MessageSender = "agent" | "lead"

interface ChatMessage {
  id: string
  text: string
  sender: MessageSender
  time: string
  type: MessageType
  read?: boolean
}

interface Conversation {
  id: number
  leadName: string
  leadAvatar: string
  leadPhone: string
  linkedProperty: string
  lastMessage: string
  time: string
  unread: number
  status: "active" | "resolved" | "pending"
  messages: ChatMessage[]
}

const templates = [
  {
    id: 1,
    name: "Initial Outreach",
    text: "Hi! I'm reaching out regarding a luxury property that matches your criteria perfectly. Would you be available for a quick call this week?",
  },
  {
    id: 2,
    name: "Viewing Follow-up",
    text: "Thank you for visiting the property today! I'd love to hear your thoughts. Are you ready to take the next step?",
  },
  {
    id: 3,
    name: "Offer Confirmation",
    text: "Great news! Your offer has been received by our team. We'll have a response within 24–48 hours.",
  },
  {
    id: 4,
    name: "Document Request",
    text: "To proceed with your application, we'll need a few documents. I'll send the checklist momentarily.",
  },
  {
    id: 5,
    name: "Price Update",
    text: "I wanted to let you know that the asking price for the property you're interested in has been updated. Let's connect!",
  },
]

const quickReplies = [
  "On my way!",
  "Available today at 3 pm",
  "I'll send the docs shortly",
  "Let me check and get back to you",
  "Confirmed, see you then!",
]

const initialConversations: Conversation[] = [
  {
    id: 1,
    leadName: "Sarah Mitchell",
    leadAvatar: "SM",
    leadPhone: "+1 (555) 123-4567",
    linkedProperty: "Manhattan Penthouse",
    lastMessage: "That sounds perfect, can we schedule a viewing?",
    time: "2h ago",
    unread: 2,
    status: "active",
    messages: [
      {
        id: "m1",
        text: "Hi Sarah, I wanted to follow up on the Manhattan Penthouse.",
        sender: "agent",
        time: "10:00 AM",
        type: "text",
        read: true,
      },
      {
        id: "m2",
        text: "Yes! I've been thinking about it a lot. What's the best time to view?",
        sender: "lead",
        time: "10:15 AM",
        type: "text",
      },
      {
        id: "m3",
        text: "We can arrange a private evening showing this Thursday at 7 pm. The views are spectacular at sunset.",
        sender: "agent",
        time: "10:18 AM",
        type: "text",
        read: true,
      },
      {
        id: "m4",
        text: "That sounds perfect, can we schedule a viewing?",
        sender: "lead",
        time: "10:45 AM",
        type: "text",
      },
    ],
  },
  {
    id: 2,
    leadName: "Michael Chen",
    leadAvatar: "MC",
    leadPhone: "+1 (555) 234-5678",
    linkedProperty: "Beverly Hills Estate",
    lastMessage: "I'll review the proposal tonight and get back to you.",
    time: "1d ago",
    unread: 0,
    status: "pending",
    messages: [
      {
        id: "m5",
        text: "Michael, I've prepared a detailed proposal for the Beverly Hills Estate.",
        sender: "agent",
        time: "Yesterday 2:00 PM",
        type: "template",
        read: true,
      },
      {
        id: "m6",
        text: "Great, could you also include comparables from the Malibu area?",
        sender: "lead",
        time: "Yesterday 3:30 PM",
        type: "text",
      },
      {
        id: "m7",
        text: "Absolutely! I'll add those comps. Expect the updated document within the hour.",
        sender: "agent",
        time: "Yesterday 3:45 PM",
        type: "text",
        read: true,
      },
      {
        id: "m8",
        text: "I'll review the proposal tonight and get back to you.",
        sender: "lead",
        time: "Yesterday 6:00 PM",
        type: "text",
      },
    ],
  },
  {
    id: 3,
    leadName: "Emily Rodriguez",
    leadAvatar: "ER",
    leadPhone: "+1 (555) 345-6789",
    linkedProperty: "Miami Beach Condo",
    lastMessage: "The fast closing timeline is exactly what I need.",
    time: "5h ago",
    unread: 1,
    status: "active",
    messages: [
      {
        id: "m9",
        text: "Hi Emily! I saw you completed the qualification form for Miami Beach Condo.",
        sender: "agent",
        time: "8:00 AM",
        type: "text",
        read: true,
      },
      {
        id: "m10",
        text: "Yes! I'm very interested. What's the earliest we could close?",
        sender: "lead",
        time: "8:20 AM",
        type: "text",
      },
      {
        id: "m11",
        text: "Emily mentioned she needs to close before June 30 for tax reasons.",
        sender: "agent",
        time: "8:22 AM",
        type: "note",
        read: true,
      },
      {
        id: "m12",
        text: "Given the seller's motivation, we could potentially close in 3 weeks with the right documentation.",
        sender: "agent",
        time: "8:25 AM",
        type: "text",
        read: true,
      },
      {
        id: "m13",
        text: "The fast closing timeline is exactly what I need.",
        sender: "lead",
        time: "9:00 AM",
        type: "text",
      },
    ],
  },
  {
    id: 4,
    leadName: "Amanda Foster",
    leadAvatar: "AF",
    leadPhone: "+1 (555) 567-8901",
    linkedProperty: "Malibu Beach House",
    lastMessage: "Deal closed! Congratulations and thank you.",
    time: "1wk ago",
    unread: 0,
    status: "resolved",
    messages: [
      {
        id: "m14",
        text: "Amanda, the contract has been signed and all documents are processed.",
        sender: "agent",
        time: "Last week",
        type: "text",
        read: true,
      },
      {
        id: "m15",
        text: "Deal closed! Congratulations and thank you.",
        sender: "lead",
        time: "Last week",
        type: "text",
      },
    ],
  },
  {
    id: 5,
    leadName: "David Park",
    leadAvatar: "DP",
    leadPhone: "+1 (555) 456-7890",
    linkedProperty: "San Francisco Loft",
    lastMessage: "I'll be relocating in Q3, let's stay in touch.",
    time: "3d ago",
    unread: 0,
    status: "pending",
    messages: [
      {
        id: "m16",
        text: "Hi David, welcome! I understand you're looking for a property for your relocation to San Francisco.",
        sender: "agent",
        time: "3 days ago",
        type: "template",
        read: true,
      },
      {
        id: "m17",
        text: "I'll be relocating in Q3, let's stay in touch.",
        sender: "lead",
        time: "3 days ago",
        type: "text",
      },
    ],
  },
]

const convStatusConfig = {
  active: { label: "Active", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  pending: { label: "Pending", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  resolved: { label: "Resolved", className: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20" },
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations)
  const [selectedId, setSelectedId] = useState<number>(initialConversations[0].id)
  const [messageText, setMessageText] = useState("")
  const [isNoteMode, setIsNoteMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "pending" | "resolved">("all")

  const selectedConversation = conversations.find((c) => c.id === selectedId) ?? conversations[0]

  const filteredConversations = conversations.filter((c) => {
    const matchesSearch = c.leadName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === "all" || c.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0)

  const selectConversation = (id: number) => {
    setSelectedId(id)
    setConversations((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)))
  }

  const sendMessage = (text?: string) => {
    const msgText = text ?? messageText.trim()
    if (!msgText) return
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      text: msgText,
      sender: "agent",
      time: "Just now",
      type: isNoteMode ? "note" : "text",
      read: true,
    }
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedId
          ? { ...c, messages: [...c.messages, newMessage], lastMessage: msgText, time: "Just now" }
          : c
      )
    )
    setMessageText("")
    setIsNoteMode(false)
  }

  const useTemplate = (t: (typeof templates)[number]) => {
    setMessageText(t.text)
    setIsNoteMode(false)
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Messages"
        description="Manage all client communications in one unified inbox."
        actions={
          <div className="flex items-center gap-2">
            {totalUnread > 0 && (
              <Badge className="bg-primary text-primary-foreground">{totalUnread} unread</Badge>
            )}
            <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
              <MessageSquare className="h-4 w-4" />
              New Conversation
            </Button>
          </div>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card overflow-hidden"
        style={{ height: "calc(100vh - 220px)", minHeight: 560 }}
      >
        <div className="flex h-full">
          {/* Conversation list */}
          <div className="flex w-80 flex-shrink-0 flex-col border-r border-border/50">
            <div className="space-y-2 border-b border-border/50 p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-9 ${surfaceInputClass}`}
                />
              </div>
              <div className="flex gap-1 rounded-lg bg-secondary/30 p-0.5">
                {(["all", "active", "pending", "resolved"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterStatus(s)}
                    className={cn(
                      "flex-1 rounded-md py-1 text-xs font-medium capitalize transition-colors",
                      filterStatus === s
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((convo) => (
                <button
                  key={convo.id}
                  onClick={() => selectConversation(convo.id)}
                  className={cn(
                    "w-full border-b border-border/30 p-3 text-left transition-colors hover:bg-secondary/30",
                    selectedId === convo.id && "bg-secondary/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-accent/80 text-sm font-semibold text-primary-foreground">
                        {convo.leadAvatar}
                      </div>
                      {convo.status === "active" && (
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="truncate text-sm font-medium text-foreground">{convo.leadName}</p>
                        <span className="flex-shrink-0 text-xs text-muted-foreground">{convo.time}</span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{convo.lastMessage}</p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <Badge
                          variant="outline"
                          className={cn("py-0 text-xs", convStatusConfig[convo.status].className)}
                        >
                          {convStatusConfig[convo.status].label}
                        </Badge>
                        {convo.unread > 0 && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                            {convo.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat area */}
          <div className="flex flex-1 flex-col min-w-0">
            {/* Chat header */}
            <div className="flex items-center justify-between border-b border-border/50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-accent/80 text-sm font-semibold text-primary-foreground">
                  {selectedConversation.leadAvatar}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{selectedConversation.leadName}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Link2 className="h-3 w-3" />
                    <span>{selectedConversation.linkedProperty}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={convStatusConfig[selectedConversation.status].className}
                >
                  {convStatusConfig[selectedConversation.status].label}
                </Badge>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Phone className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass">
                    <DropdownMenuItem>View lead profile</DropdownMenuItem>
                    <DropdownMenuItem>Mark as resolved</DropdownMenuItem>
                    <DropdownMenuItem>Assign to agent</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 p-4">
              <AnimatePresence initial={false}>
                {selectedConversation.messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex",
                      msg.type === "note"
                        ? "justify-center"
                        : msg.sender === "agent"
                          ? "justify-end"
                          : "justify-start"
                    )}
                  >
                    {msg.type === "note" ? (
                      <div className="flex max-w-md items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2 text-xs text-amber-600">
                        <StickyNote className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="italic">{msg.text}</span>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "flex max-w-xs flex-col gap-1 lg:max-w-md xl:max-w-lg",
                          msg.sender === "agent" ? "items-end" : "items-start"
                        )}
                      >
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                            msg.sender === "agent"
                              ? "rounded-tr-md bg-primary text-primary-foreground"
                              : "rounded-tl-md bg-secondary text-foreground"
                          )}
                        >
                          {msg.type === "template" && (
                            <p className="mb-1 text-xs font-semibold opacity-60">Template</p>
                          )}
                          {msg.text}
                        </div>
                        <div
                          className={cn(
                            "flex items-center gap-1",
                            msg.sender === "agent" ? "justify-end" : "justify-start"
                          )}
                        >
                          <span className="text-xs text-muted-foreground">{msg.time}</span>
                          {msg.sender === "agent" && (
                            <CheckCheck
                              className={cn(
                                "h-3.5 w-3.5",
                                msg.read ? "text-primary" : "text-muted-foreground"
                              )}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Quick replies */}
            <div className="border-t border-border/30 px-4 py-2">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => sendMessage(reply)}
                    className="flex-shrink-0 rounded-full border border-border/50 bg-secondary/30 px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            </div>

            {/* Compose area */}
            <div className="border-t border-border/50 p-4">
              {isNoteMode && (
                <div className="mb-2 flex items-center gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-600">
                  <StickyNote className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>Internal note — only visible to your team</span>
                  <button onClick={() => setIsNoteMode(false)} className="ml-auto underline">
                    Cancel
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 flex-shrink-0 text-muted-foreground hover:text-foreground"
                  title="Attach file"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-9 flex-shrink-0",
                    isNoteMode ? "text-amber-500" : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setIsNoteMode(!isNoteMode)}
                  title="Add internal note"
                >
                  <StickyNote className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 flex-shrink-0 gap-1 text-muted-foreground hover:text-foreground"
                    >
                      Templates
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="glass w-80" align="start" side="top">
                    {templates.map((t) => (
                      <DropdownMenuItem
                        key={t.id}
                        onClick={() => useTemplate(t)}
                        className="flex-col items-start gap-0.5"
                      >
                        <p className="text-sm font-medium">{t.name}</p>
                        <p className="line-clamp-2 text-xs text-muted-foreground">{t.text}</p>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <Input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  placeholder={isNoteMode ? "Write an internal note..." : "Type a message..."}
                  className={cn(
                    "flex-1",
                    surfaceInputClass,
                    isNoteMode && "border-amber-500/30 focus-visible:ring-amber-500/20"
                  )}
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!messageText.trim()}
                  size="icon"
                  className="h-9 w-9 flex-shrink-0 bg-primary p-0 hover:bg-primary/90 shadow-md shadow-primary/20"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
