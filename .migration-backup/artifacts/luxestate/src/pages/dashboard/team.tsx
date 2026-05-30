import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Users2,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Star,
  ClipboardList,
  Shield,
  Phone,
  Mail,
  MoreHorizontal,
  Award,
  CheckCircle2,
  Clock,
  Circle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { surfaceInputClass, surfaceSelectClass } from "@/lib/ui-classes"

type AgentTask = { title: string; due: string; done: boolean }

type Agent = {
  id: number
  name: string
  avatar: string
  role: string
  roleColor: string
  email: string
  phone: string
  leads: number
  deals: number
  revenue: number
  commission: number
  commissionRate: number
  winRate: number
  trend: "up" | "down"
  status: "active" | "inactive"
  joinDate: string
  tasks: AgentTask[]
  activityData: Array<{ day: string; calls: number; messages: number }>
}

const initialAgents: Agent[] = [
  {
    id: 1, name: "James Donovan", avatar: "JD", role: "Senior Agent",
    roleColor: "bg-primary/10 text-primary border-primary/20",
    email: "james@luxestate.com", phone: "+1 (555) 001-0001",
    leads: 12, deals: 4, revenue: 22400000, commission: 672000, commissionRate: 3, winRate: 33, trend: "up",
    status: "active", joinDate: "Jan 2022",
    tasks: [
      { title: "Follow up Sarah Mitchell", due: "Today", done: false },
      { title: "Send Beverly Hills comps", due: "Tomorrow", done: false },
      { title: "Prepare Q2 report", due: "Jun 1", done: true },
    ],
    activityData: [
      { day: "Mon", calls: 5, messages: 8 }, { day: "Tue", calls: 7, messages: 12 },
      { day: "Wed", calls: 3, messages: 6 }, { day: "Thu", calls: 9, messages: 15 },
      { day: "Fri", calls: 6, messages: 10 },
    ],
  },
  {
    id: 2, name: "Sarah Mitchell", avatar: "SM", role: "Senior Agent",
    roleColor: "bg-primary/10 text-primary border-primary/20",
    email: "sarah@luxestate.com", phone: "+1 (555) 002-0002",
    leads: 9, deals: 3, revenue: 15100000, commission: 453000, commissionRate: 3, winRate: 33, trend: "up",
    status: "active", joinDate: "Mar 2022",
    tasks: [
      { title: "Review Robert Chang inquiry", due: "Today", done: false },
      { title: "Property tour preparation", due: "May 30", done: false },
      { title: "Commission report", due: "May 28", done: true },
    ],
    activityData: [
      { day: "Mon", calls: 4, messages: 7 }, { day: "Tue", calls: 6, messages: 9 },
      { day: "Wed", calls: 5, messages: 11 }, { day: "Thu", calls: 8, messages: 13 },
      { day: "Fri", calls: 4, messages: 8 },
    ],
  },
  {
    id: 3, name: "Michael Chen", avatar: "MC", role: "Agent",
    roleColor: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    email: "michael@luxestate.com", phone: "+1 (555) 003-0003",
    leads: 11, deals: 2, revenue: 8700000, commission: 261000, commissionRate: 3, winRate: 18, trend: "down",
    status: "active", joinDate: "Aug 2023",
    tasks: [
      { title: "Send Emily Rodriguez comps", due: "Today", done: false },
      { title: "Update CRM notes", due: "Tomorrow", done: false },
      { title: "Team meeting", due: "May 27", done: true },
    ],
    activityData: [
      { day: "Mon", calls: 2, messages: 4 }, { day: "Tue", calls: 3, messages: 6 },
      { day: "Wed", calls: 4, messages: 5 }, { day: "Thu", calls: 3, messages: 7 },
      { day: "Fri", calls: 2, messages: 4 },
    ],
  },
  {
    id: 4, name: "Emily Rodriguez", avatar: "ER", role: "Junior Agent",
    roleColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    email: "emily@luxestate.com", phone: "+1 (555) 004-0004",
    leads: 8, deals: 3, revenue: 11200000, commission: 336000, commissionRate: 3, winRate: 38, trend: "up",
    status: "active", joinDate: "Feb 2024",
    tasks: [
      { title: "Schedule David Park viewing", due: "Today", done: false },
      { title: "Onboarding checklist", due: "Jun 3", done: false },
      { title: "First deal closed!", due: "May 20", done: true },
    ],
    activityData: [
      { day: "Mon", calls: 6, messages: 10 }, { day: "Tue", calls: 8, messages: 14 },
      { day: "Wed", calls: 7, messages: 12 }, { day: "Thu", calls: 9, messages: 16 },
      { day: "Fri", calls: 7, messages: 11 },
    ],
  },
]

const rolePermissions = [
  { role: "Senior Agent", permissions: ["View all leads", "Edit own leads", "Send proposals", "Manage clients", "View commissions", "Team reports"], color: "text-primary" },
  { role: "Agent", permissions: ["View own leads", "Edit own leads", "Send proposals", "Manage own clients", "View own commissions"], color: "text-blue-500" },
  { role: "Junior Agent", permissions: ["View own leads", "Edit own leads", "Send proposals"], color: "text-emerald-500" },
]

const fmt = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${(n / 1_000).toFixed(0)}K`

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "0.75rem",
}

const dueDateOptions = ["Today", "Tomorrow", "Jun 1", "Jun 5", "Jun 10", "Jun 15"]

export default function TeamPage() {
  const [agentsList, setAgentsList] = useState<Agent[]>(initialAgents)
  const [selectedAgentId, setSelectedAgentId] = useState<number>(initialAgents[0].id)
  const [tab, setTab] = useState<"performance" | "tasks" | "permissions">("performance")
  const [newTaskTitle, setNewTaskTitle] = useState("")
  const [newTaskDue, setNewTaskDue] = useState("Today")
  const [showAddTask, setShowAddTask] = useState(false)

  const selectedAgent = agentsList.find((a) => a.id === selectedAgentId) ?? agentsList[0]

  const toggleTask = (agentId: number, taskIdx: number) => {
    setAgentsList((prev) =>
      prev.map((a) => {
        if (a.id !== agentId) return a
        return {
          ...a,
          tasks: a.tasks.map((t, i) =>
            i === taskIdx ? { ...t, done: !t.done } : t
          ),
        }
      })
    )
  }

  const addTask = (agentId: number) => {
    if (!newTaskTitle.trim()) return
    setAgentsList((prev) =>
      prev.map((a) => {
        if (a.id !== agentId) return a
        return {
          ...a,
          tasks: [...a.tasks, { title: newTaskTitle.trim(), due: newTaskDue, done: false }],
        }
      })
    )
    setNewTaskTitle("")
    setNewTaskDue("Today")
    setShowAddTask(false)
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Team & Agent Management"
        description="Track performance, commissions, tasks and access roles."
        actions={
          <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
            <Plus className="h-4 w-4" />
            Add Agent
          </Button>
        }
      />

      {/* Team stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Agents",     value: agentsList.length,                                          icon: Users2 },
          { label: "Active Leads",     value: agentsList.reduce((s, a) => s + a.leads, 0),                icon: ClipboardList },
          { label: "Total Revenue",    value: fmt(agentsList.reduce((s, a) => s + a.revenue, 0)),         icon: DollarSign },
          { label: "Total Commission", value: fmt(agentsList.reduce((s, a) => s + a.commission, 0)),      icon: Star },
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
              <s.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-1 text-2xl font-bold text-foreground">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Agent cards + detail */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Agent list */}
        <div className="space-y-3">
          {agentsList.map((agent, i) => (
            <motion.button
              key={agent.id}
              onClick={() => { setSelectedAgentId(agent.id); setTab("performance") }}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className={cn(
                "w-full rounded-xl border p-4 text-left transition-all",
                selectedAgentId === agent.id
                  ? "border-primary/40 bg-primary/5"
                  : "border-border/40 bg-card hover:border-primary/20 hover:bg-secondary/20"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-accent/80 text-sm font-semibold text-primary-foreground">
                    {agent.avatar}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-card bg-emerald-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-foreground">{agent.name}</p>
                    {i === 0 && <Award className="h-4 w-4 text-primary" />}
                  </div>
                  <Badge variant="outline" className={cn("text-xs", agent.roleColor)}>
                    {agent.role}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{fmt(agent.revenue)}</p>
                  <p className={cn("flex items-center gap-0.5 text-xs justify-end font-medium",
                    agent.trend === "up" ? "text-emerald-500" : "text-red-500"
                  )}>
                    {agent.trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {agent.winRate}% win
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Agent detail panel */}
        <motion.div
          key={selectedAgent.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-2 glass-card p-6"
        >
          {/* Agent header */}
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/80 to-accent/80 text-lg font-bold text-primary-foreground">
                {selectedAgent.avatar}
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{selectedAgent.name}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("text-xs", selectedAgent.roleColor)}>
                    {selectedAgent.role}
                  </Badge>
                  <span className="text-xs text-muted-foreground">Since {selectedAgent.joinDate}</span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{selectedAgent.phone}</span>
                  <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{selectedAgent.email}</span>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass">
                <DropdownMenuItem>Edit profile</DropdownMenuItem>
                <DropdownMenuItem>Change role</DropdownMenuItem>
                <DropdownMenuItem>Assign leads</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Tabs */}
          <div className="mb-4 flex gap-1 rounded-xl border border-border/40 bg-secondary/20 p-1">
            {(["performance", "tasks", "permissions"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "flex-1 rounded-lg py-2 text-xs font-semibold capitalize transition-colors",
                  tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "performance" && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Leads",      value: selectedAgent.leads },
                  { label: "Deals",      value: selectedAgent.deals },
                  { label: "Revenue",    value: fmt(selectedAgent.revenue) },
                  { label: "Commission", value: fmt(selectedAgent.commission) },
                ].map((k) => (
                  <div key={k.label} className="rounded-xl border border-border/40 bg-secondary/20 p-3 text-center">
                    <p className="text-xs text-muted-foreground">{k.label}</p>
                    <p className="mt-0.5 text-base font-bold text-foreground">{k.value}</p>
                  </div>
                ))}
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Win Rate</span>
                  <span className={cn("font-bold", selectedAgent.trend === "up" ? "text-emerald-500" : "text-red-500")}>
                    {selectedAgent.winRate}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-border/50">
                  <div
                    className={cn("h-full rounded-full", selectedAgent.trend === "up" ? "bg-emerald-500" : "bg-red-500")}
                    style={{ width: `${selectedAgent.winRate}%` }}
                  />
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Weekly Activity
                </p>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedAgent.activityData} barGap={2}>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="calls" fill="oklch(0.65 0.15 75)" radius={[3, 3, 0, 0]} name="Calls" />
                      <Bar dataKey="messages" fill="oklch(0.55 0.15 200)" radius={[3, 3, 0, 0]} name="Messages" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {tab === "tasks" && (
            <div className="space-y-2">
              {selectedAgent.tasks.map((task, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3 transition-all",
                    task.done ? "border-border/30 bg-secondary/10 opacity-60" : "border-border/50 bg-secondary/20"
                  )}
                >
                  <button onClick={() => toggleTask(selectedAgent.id, i)} className="flex-shrink-0">
                    {task.done ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-border hover:text-primary transition-colors" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium", task.done ? "line-through text-muted-foreground" : "text-foreground")}>
                      {task.title}
                    </p>
                    <p className={cn("flex items-center gap-1 text-xs", task.due === "Today" ? "text-red-500 font-medium" : "text-muted-foreground")}>
                      <Clock className="h-3 w-3" />
                      {task.due}
                    </p>
                  </div>
                  {!task.done && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-600"
                      onClick={() => toggleTask(selectedAgent.id, i)}
                    >
                      Done
                    </Button>
                  )}
                </div>
              ))}

              {/* Add task form */}
              {showAddTask ? (
                <div className="mt-2 flex gap-2">
                  <Input
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Task title..."
                    className={cn("flex-1 h-9 text-sm", surfaceInputClass)}
                    onKeyDown={(e) => e.key === "Enter" && addTask(selectedAgent.id)}
                    autoFocus
                  />
                  <select
                    value={newTaskDue}
                    onChange={(e) => setNewTaskDue(e.target.value)}
                    className={cn("h-9 text-xs w-28", surfaceSelectClass)}
                  >
                    {dueDateOptions.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <Button
                    size="sm"
                    onClick={() => addTask(selectedAgent.id)}
                    className="h-9 bg-primary hover:bg-primary/90"
                  >
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setShowAddTask(false); setNewTaskTitle("") }}
                    className="h-9 border-border/50"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="mt-2 w-full gap-2 border-border/50"
                  onClick={() => setShowAddTask(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add task
                </Button>
              )}
            </div>
          )}

          {tab === "permissions" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-4 w-4 text-primary" />
                  <p className="font-semibold text-foreground">Current Role: {selectedAgent.role}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {rolePermissions.find((r) => r.role === selectedAgent.role)?.permissions.map((p) => (
                    <div key={p} className="flex items-center gap-1.5 text-sm text-foreground">
                      <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                      {p}
                    </div>
                  ))}
                </div>
              </div>
              <Button variant="outline" className="w-full gap-2 border-border/50">
                <Shield className="h-4 w-4" />
                Change role permissions
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Commission table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card p-6"
      >
        <div className="mb-4">
          <h3 className="font-semibold text-foreground">Commission Tracker</h3>
          <p className="text-sm text-muted-foreground">Month-to-date earnings per agent</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                {["Agent", "Deals Closed", "Revenue Generated", "Rate", "Commission Earned", "YTD Total"].map((h) => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {agentsList.map((agent) => (
                <tr key={agent.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary/50 to-accent/50 text-xs font-bold text-primary-foreground">
                        {agent.avatar}
                      </div>
                      <span className="font-medium text-foreground">{agent.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{agent.deals}</td>
                  <td className="px-3 py-3 font-semibold text-foreground">{fmt(agent.revenue)}</td>
                  <td className="px-3 py-3 text-muted-foreground">{agent.commissionRate}%</td>
                  <td className="px-3 py-3 font-bold text-primary">{fmt(agent.commission)}</td>
                  <td className="px-3 py-3 font-semibold text-foreground">{fmt(agent.commission * 4.2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
