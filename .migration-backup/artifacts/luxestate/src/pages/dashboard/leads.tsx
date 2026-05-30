import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { LeadsTable } from "@/components/dashboard/leads-table"
import { AddLeadModal } from "@/components/dashboard/add-lead-modal"
import { Button } from "@/components/ui/button"
import { Plus, Download, UserPlus } from "lucide-react"
import { initialLeads } from "@/components/dashboard/leads-data"
import { Lead } from "@/components/dashboard/leads-types"

function exportLeadsCSV(leads: Lead[]) {
  const headers = [
    "Name", "Email", "Phone", "Status", "Priority", "Source",
    "Budget", "Property", "Assigned To", "Score", "Last Contact", "Tags",
  ]
  const rows = leads.map((l) => [
    `"${l.name}"`,
    `"${l.email}"`,
    `"${l.phone}"`,
    l.status,
    l.priority,
    `"${l.source}"`,
    `"${l.budget}"`,
    `"${l.property}"`,
    `"${l.assignedTo}"`,
    l.score,
    `"${l.lastContact}"`,
    `"${l.tags.join("; ")}"`,
  ])
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `luxestate-leads-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [showAddLead, setShowAddLead] = useState(false)

  const handleAddLead = (lead: Lead) => {
    setLeads((prev) => [lead, ...prev])
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Lead Management"
        description="Track, manage, and convert your luxury real estate prospects."
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => exportLeadsCSV(leads)}
              className="gap-2 border-border/50"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button
              onClick={() => setShowAddLead(true)}
              className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25"
            >
              <Plus className="h-4 w-4" />
              Add Lead
            </Button>
          </>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total Leads", value: leads.length, icon: UserPlus, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Hot Leads", value: leads.filter((l) => l.priority === "hot").length, icon: UserPlus, color: "text-red-500", bg: "bg-red-500/10" },
            { label: "Deals Won", value: leads.filter((l) => l.status === "won").length, icon: UserPlus, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "In Negotiation", value: leads.filter((l) => l.status === "negotiation").length, icon: UserPlus, color: "text-amber-500", bg: "bg-amber-500/10" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-4">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <LeadsTable leads={leads} setLeads={setLeads} />
      </motion.div>

      <AddLeadModal
        open={showAddLead}
        onClose={() => setShowAddLead(false)}
        onAdd={handleAddLead}
      />
    </div>
  )
}
