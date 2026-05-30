import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { PropertyShowcase } from "@/components/dashboard/property-showcase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, LayoutGrid, List } from "lucide-react"
import { cn } from "@/lib/utils"
import { surfaceInputClass, surfaceSelectClass } from "@/lib/ui-classes"

export default function PropertiesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [propertyType, setPropertyType] = useState("All Types")
  const [priceRange, setPriceRange] = useState("Price: Any")
  const [bedroomFilter, setBedroomFilter] = useState("Any")
  const [availabilityFilter, setAvailabilityFilter] = useState("All")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Property Listings"
        description="Manage and showcase your luxury property portfolio."
        actions={
          <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25">
            <Plus className="h-4 w-4" />
            Add Property
          </Button>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap gap-3">
            <div className="relative min-w-48 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-9 ${surfaceInputClass}`}
              />
            </div>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className={cn("w-full sm:w-40", surfaceSelectClass)}
            >
              <option>All Types</option>
              <option>Penthouse</option>
              <option>Estate</option>
              <option>Villa</option>
              <option>Mansion</option>
            </select>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className={cn("w-full sm:w-40", surfaceSelectClass)}
            >
              <option>Price: Any</option>
              <option>$1M - $5M</option>
              <option>$5M - $10M</option>
              <option>$10M+</option>
            </select>
            <select
              value={bedroomFilter}
              onChange={(e) => setBedroomFilter(e.target.value)}
              className={cn("w-full sm:w-36", surfaceSelectClass)}
            >
              <option value="Any">Beds: Any</option>
              <option value="4+">4+ Beds</option>
              <option value="6+">6+ Beds</option>
              <option value="7+">7+ Beds</option>
            </select>
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className={cn("w-full sm:w-40", surfaceSelectClass)}
            >
              <option value="All">All Status</option>
              <option value="Available">Available</option>
              <option value="Under Offer">Under Offer</option>
              <option value="Sold">Sold</option>
            </select>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-border/50 p-1 self-start sm:self-auto">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                viewMode === "list"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <PropertyShowcase
          searchQuery={searchQuery}
          propertyType={propertyType}
          priceRange={priceRange}
          bedroomFilter={bedroomFilter}
          availabilityFilter={availabilityFilter}
          viewMode={viewMode}
        />
      </motion.div>
    </div>
  )
}
