import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  FolderOpen,
  Search,
  Upload,
  FileText,
  FileImage,
  File,
  Download,
  Eye,
  Trash2,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  Shield,
  Hash,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { surfaceInputClass } from "@/lib/ui-classes"

type DocCategory = "all" | "contracts" | "property" | "client_id" | "receipts" | "signed"
type DocType = "pdf" | "doc" | "img" | "other"

type Doc = {
  id: number
  name: string
  type: DocType
  size: string
  uploadedBy: string
  uploadedAt: string
  category: Exclude<DocCategory, "all">
  lead?: string
  property?: string
  signed: boolean
  verified: boolean
}

const docs: Doc[] = [
  { id: 1, name: "Manhattan_Penthouse_Contract.pdf", type: "pdf", size: "5.4 MB", uploadedBy: "James Donovan", uploadedAt: "May 20, 2026", category: "contracts", property: "Manhattan Penthouse", lead: "Sarah Mitchell", signed: false, verified: true },
  { id: 2, name: "Malibu_Purchase_Agreement_Signed.pdf", type: "pdf", size: "4.7 MB", uploadedBy: "James Donovan", uploadedAt: "May 21, 2026", category: "signed", property: "Malibu Beach House", lead: "Amanda Foster", signed: true, verified: true },
  { id: 3, name: "Beverly_Hills_Property_Report.pdf", type: "pdf", size: "8.2 MB", uploadedBy: "Sarah Mitchell", uploadedAt: "May 22, 2026", category: "property", property: "Beverly Hills Estate", signed: false, verified: false },
  { id: 4, name: "Sarah_Mitchell_ID.pdf", type: "pdf", size: "1.1 MB", uploadedBy: "James Donovan", uploadedAt: "May 18, 2026", category: "client_id", lead: "Sarah Mitchell", signed: false, verified: true },
  { id: 5, name: "Amanda_Foster_Financial_Statement.pdf", type: "pdf", size: "2.4 MB", uploadedBy: "James Donovan", uploadedAt: "May 10, 2026", category: "client_id", lead: "Amanda Foster", signed: false, verified: true },
  { id: 6, name: "Malibu_Closing_Receipt.pdf", type: "pdf", size: "1.8 MB", uploadedBy: "James Donovan", uploadedAt: "May 21, 2026", category: "receipts", property: "Malibu Beach House", lead: "Amanda Foster", signed: true, verified: true },
  { id: 7, name: "Miami_Beach_Floor_Plan.jpg", type: "img", size: "3.2 MB", uploadedBy: "Michael Chen", uploadedAt: "May 15, 2026", category: "property", property: "Miami Beach Villa", signed: false, verified: false },
  { id: 8, name: "Beverly_Hills_Inspection_Report.pdf", type: "pdf", size: "11.4 MB", uploadedBy: "Sarah Mitchell", uploadedAt: "May 24, 2026", category: "property", property: "Beverly Hills Estate", signed: false, verified: false },
  { id: 9, name: "Michael_Chen_Proof_of_Funds.pdf", type: "pdf", size: "3.2 MB", uploadedBy: "Sarah Mitchell", uploadedAt: "May 23, 2026", category: "client_id", lead: "Michael Chen", signed: false, verified: true },
  { id: 10, name: "Manhattan_Signed_Contract.pdf", type: "pdf", size: "5.1 MB", uploadedBy: "James Donovan", uploadedAt: "May 27, 2026", category: "signed", property: "Manhattan Penthouse", lead: "Sarah Mitchell", signed: true, verified: true },
  { id: 11, name: "Emily_Rodriguez_Qualification.pdf", type: "pdf", size: "0.9 MB", uploadedBy: "Michael Chen", uploadedAt: "May 27, 2026", category: "client_id", lead: "Emily Rodriguez", signed: false, verified: false },
  { id: 12, name: "Dubai_Villa_Property_Docs.pdf", type: "pdf", size: "6.7 MB", uploadedBy: "Sarah Mitchell", uploadedAt: "May 25, 2026", category: "property", property: "Dubai Marina Villa", signed: false, verified: false },
]

const categoryConfig: Record<DocCategory, { label: string; color: string }> = {
  all: { label: "All Documents", color: "" },
  contracts: { label: "Contracts", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  property: { label: "Property Files", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  client_id: { label: "Client IDs", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  receipts: { label: "Receipts", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  signed: { label: "Signed Docs", color: "bg-primary/10 text-primary border-primary/20" },
}

function DocTypeIcon({ type }: { type: DocType }) {
  if (type === "pdf") return <FileText className="h-5 w-5 text-red-500" />
  if (type === "img") return <FileImage className="h-5 w-5 text-blue-500" />
  if (type === "doc") return <FileText className="h-5 w-5 text-blue-600" />
  return <File className="h-5 w-5 text-muted-foreground" />
}

export default function DocumentsPage() {
  const [category, setCategory] = useState<DocCategory>("all")
  const [search, setSearch] = useState("")
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  const filtered = docs.filter((d) => {
    const matchCat = category === "all" || d.category === category
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.lead ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (d.property ?? "").toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id])
  }

  const categoryCounts = Object.keys(categoryConfig).reduce<Record<string, number>>((acc, k) => {
    acc[k] = k === "all" ? docs.length : docs.filter((d) => d.category === k).length
    return acc
  }, {})

  const totalSize = docs.reduce((s, d) => {
    const n = parseFloat(d.size)
    return s + n
  }, 0)

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Document Management"
        description="Contracts, property files, client IDs, signed documents and receipts."
        actions={
          <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
            <Upload className="h-4 w-4" />
            Upload Files
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Documents", value: docs.length, icon: FolderOpen },
          { label: "Signed Docs", value: docs.filter((d) => d.signed).length, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Pending Verification", value: docs.filter((d) => !d.verified).length, icon: Clock, color: "text-amber-500" },
          { label: "Storage Used", value: `${totalSize.toFixed(0)} MB`, icon: Hash },
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
          </motion.div>
        ))}
      </div>

      {/* Main panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6"
      >
        {/* Toolbar */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documents, leads, properties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`pl-9 ${surfaceInputClass}`}
            />
          </div>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{selectedIds.length} selected</span>
              <Button variant="outline" size="sm" className="gap-1.5 border-border/50">
                <Download className="h-3.5 w-3.5" />
                Download
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 border-red-500/30 text-red-500 hover:bg-red-500/10">
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Category tabs */}
        <div className="mb-5 flex flex-wrap gap-2">
          {(Object.keys(categoryConfig) as DocCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                category === cat
                  ? cat === "all"
                    ? "bg-primary text-primary-foreground border-transparent"
                    : categoryConfig[cat].color
                  : "border-border/50 text-muted-foreground hover:text-foreground"
              )}
            >
              {categoryConfig[cat].label} ({categoryCounts[cat]})
            </button>
          ))}
        </div>

        {/* Document list */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                <th className="w-8 px-2 py-3" />
                <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Document</th>
                <th className="hidden px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground md:table-cell">Category</th>
                <th className="hidden px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground lg:table-cell">Related To</th>
                <th className="hidden px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground xl:table-cell">Uploaded By</th>
                <th className="px-2 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</th>
                <th className="px-2 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              <AnimatePresence>
                {filtered.map((doc, i) => (
                  <motion.tr
                    key={doc.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={cn(
                      "group transition-colors hover:bg-secondary/20",
                      selectedIds.includes(doc.id) && "bg-primary/5"
                    )}
                  >
                    <td className="px-2 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(doc.id)}
                        onChange={() => toggleSelect(doc.id)}
                        className="h-4 w-4 rounded border-border/50 accent-primary"
                      />
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-3">
                        <DocTypeIcon type={doc.type} />
                        <div className="min-w-0">
                          <p className="truncate max-w-[180px] font-medium text-foreground">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.size} · {doc.uploadedAt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-2 py-3 md:table-cell">
                      <Badge variant="outline" className={cn("text-xs", categoryConfig[doc.category].color)}>
                        {categoryConfig[doc.category].label}
                      </Badge>
                    </td>
                    <td className="hidden px-2 py-3 lg:table-cell">
                      <div className="text-xs text-muted-foreground">
                        {doc.property && <p className="truncate max-w-[140px]">{doc.property}</p>}
                        {doc.lead && <p className="truncate max-w-[140px]">{doc.lead}</p>}
                      </div>
                    </td>
                    <td className="hidden px-2 py-3 xl:table-cell">
                      <p className="text-sm text-muted-foreground">{doc.uploadedBy}</p>
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex flex-col gap-1">
                        {doc.signed && (
                          <span className="flex items-center gap-1 text-xs font-medium text-emerald-500">
                            <CheckCircle2 className="h-3 w-3" />
                            Signed
                          </span>
                        )}
                        {doc.verified ? (
                          <span className="flex items-center gap-1 text-xs text-emerald-500">
                            <Shield className="h-3 w-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-amber-500">
                            <Clock className="h-3 w-3" />
                            Pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass">
                            <DropdownMenuItem>Preview</DropdownMenuItem>
                            <DropdownMenuItem>Download</DropdownMenuItem>
                            <DropdownMenuItem>Share link</DropdownMenuItem>
                            <DropdownMenuItem>Mark as signed</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <FolderOpen className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
              <p className="font-semibold text-foreground">No documents found</p>
              <p className="text-sm text-muted-foreground">Try a different category or search term.</p>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
          <p className="text-sm text-muted-foreground">
            Showing {filtered.length} of {docs.length} documents
          </p>
          <Button variant="outline" size="sm" className="gap-2 border-border/50">
            <Upload className="h-3.5 w-3.5" />
            Upload more
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
