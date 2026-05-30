export type LeadStatus = "new" | "qualified" | "proposal" | "negotiation" | "won" | "lost"
export type LeadPriority = "hot" | "warm" | "cold"

export type Lead = {
  id: number
  name: string
  email: string
  phone: string
  whatsappNumber: string
  interestedProperties: string[]
  property: string
  budget: string
  status: LeadStatus
  priority: LeadPriority
  source: "Website" | "Referral" | "Social Media" | "Email" | "Cold Call"
  assignedTo: string
  lastContact: string
  avatar: string
  notes: string[]
  timeline: Array<{ id: string; title: string; time: string }>
  score: number
  tags: string[]
  reminder?: { date: string; note: string }
  attachments: Array<{ name: string; size: string; type: "pdf" | "doc" | "img" | "other" }>
  duplicateOf?: number
}
