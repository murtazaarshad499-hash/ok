export type LeadStatus = "new" | "qualified" | "proposal" | "negotiation" | "won" | "lost"
export type LeadPriority = "hot" | "warm" | "cold"
export type LeadSource =
  | "Website"
  | "Referral"
  | "Social Media"
  | "Email"
  | "Cold Call"
  | "Facebook Ad"
  | "Google Ad"
  | "Instagram Ad"
  | "LinkedIn"

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
  source: LeadSource
  assignedTo: string
  lastContact: string
  avatar: string
  notes: string[]
  timeline: Array<{ id: string; title: string; time: string }>
  score: number
  urgencyScore: number
  tags: string[]
  reminder?: { date: string; note: string }
  attachments: Array<{ name: string; size: string; type: "pdf" | "doc" | "img" | "other" }>
  duplicateOf?: number
  campaign?: string
  adSource?: string
  aiSummary?: string
  suggestedActions?: string[]
}
