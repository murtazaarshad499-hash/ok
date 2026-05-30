import { useCallback, useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import {
  Globe, RefreshCw, AlertTriangle, CheckCircle2, Clock, Zap,
  MoreHorizontal, Unplug, Link2, TrendingUp, Users, ArrowRight,
  WifiOff, Activity,
} from "lucide-react"
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa"
import { FaTiktok } from "react-icons/fa6"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { PlatformIcon } from "@/components/dashboard/integration-connect-modal"
import { IntegrationConnectModal } from "@/components/dashboard/integration-connect-modal"
import {
  Platform, Integration, ConnectionStatus, SyncEvent,
  PLATFORM_CONFIGS, getIntegrations, saveIntegrations,
  removeIntegration, getSyncLog, addSyncEvent,
  formatRelativeTime, formatNextSync, isOverdueForSync,
  simulateSyncLeads, getNextSyncTime,
} from "@/components/dashboard/integrations-data"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

// ── Status helpers ────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<ConnectionStatus, { label: string; color: string; dot: string; ring?: string }> = {
  disconnected: { label: "Not connected", color: "text-muted-foreground", dot: "bg-muted-foreground/30" },
  connecting:   { label: "Connecting…",   color: "text-amber-400",        dot: "bg-amber-400" },
  connected:    { label: "Connected",     color: "text-emerald-400",      dot: "bg-emerald-400", ring: "ring-emerald-400/30" },
  syncing:      { label: "Syncing…",      color: "text-sky-400",          dot: "bg-sky-400",     ring: "ring-sky-400/30" },
  error:        { label: "Error",         color: "text-destructive",      dot: "bg-destructive" },
  paused:       { label: "Paused",        color: "text-amber-400",        dot: "bg-amber-400" },
}

const PLATFORMS: Platform[] = ["facebook", "instagram", "tiktok", "whatsapp", "website"]

// ── Analytics chart data (last 7 days, simulated) ─────────────────────────
function buildChartData(integrations: Integration[]) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" })
  })

  const connected = integrations.filter((i) => i.status === "connected" || i.status === "syncing")

  return days.map((day, i) => {
    const row: Record<string, unknown> = { day: day.split(",")[0] }
    let total = 0
    connected.forEach((intg) => {
      const cfg = PLATFORM_CONFIGS[intg.platform]
      const val = Math.max(0, Math.floor((intg.leadsTotal / 7) * (0.5 + Math.random() * 0.8)) + (i === 6 ? intg.leadsSyncedToday : 0))
      row[cfg.name] = val
      total += val
    })
    row.total = total
    return row
  })
}

const CHART_COLORS: Record<Platform, string> = {
  facebook:  "#3b82f6",
  instagram: "#ec4899",
  tiktok:    "#71717a",
  whatsapp:  "#22c55e",
  website:   "#6366f1",
}

// ── Integration Card ──────────────────────────────────────────────────────
function IntegrationCard({
  platform,
  integration,
  onConnect,
  onSync,
  onDisconnect,
  onReconnect,
}: {
  platform: Platform
  integration: Integration | null
  onConnect: () => void
  onSync: () => void
  onDisconnect: () => void
  onReconnect: () => void
}) {
  const cfg = PLATFORM_CONFIGS[platform]
  const status: ConnectionStatus = integration?.status ?? "disconnected"
  const sc = STATUS_CONFIG[status]
  const isConnected = status === "connected" || status === "syncing"
  const isSyncing = status === "syncing"

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card flex flex-col gap-4 p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <PlatformIcon platform={platform} size="md" />
          <div>
            <p className="text-sm font-semibold">{cfg.name}</p>
            <Badge variant="outline" className="mt-0.5 text-[9px] px-1.5 py-0 border-border/30 text-muted-foreground">
              {cfg.category}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status dot */}
          <div className={cn("flex items-center gap-1.5 rounded-full px-2 py-0.5 border text-[10px] font-medium", isConnected ? "border-emerald-500/20 bg-emerald-500/5" : "border-border/30 bg-secondary/20")}>
            <span className={cn(
              "h-1.5 w-1.5 rounded-full",
              sc.dot,
              isSyncing && "animate-pulse",
              isConnected && !isSyncing && "animate-[pulse_3s_ease-in-out_infinite]"
            )} />
            <span className={sc.color}>{sc.label}</span>
          </div>

          {/* Menu */}
          {isConnected && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={onSync} disabled={isSyncing} className="gap-2 text-sm">
                  <RefreshCw className={cn("h-3.5 w-3.5", isSyncing && "animate-spin")} />
                  {isSyncing ? "Syncing…" : "Sync now"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onReconnect} className="gap-2 text-sm">
                  <Link2 className="h-3.5 w-3.5" /> Reconnect
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDisconnect} className="gap-2 text-sm text-destructive focus:text-destructive">
                  <Unplug className="h-3.5 w-3.5" /> Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Connected info */}
      {isConnected && integration ? (
        <div className="flex flex-col gap-2.5">
          <div className="rounded-lg border border-border/30 bg-secondary/10 px-3 py-2.5">
            <p className="text-[10px] text-muted-foreground">Connected as</p>
            <p className="text-sm font-medium mt-0.5 truncate">{integration.accountName}</p>
            {integration.adAccountName && (
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">{integration.adAccountName}</p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-1.5">
            <div className="flex flex-col items-center gap-0.5 rounded-lg border border-border/30 bg-secondary/10 px-2 py-2">
              <span className="text-base font-bold tabular-nums text-foreground">{integration.leadsTotal}</span>
              <span className="text-[9px] text-muted-foreground text-center">Total Leads</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-lg border border-border/30 bg-secondary/10 px-2 py-2">
              <span className="text-base font-bold tabular-nums text-emerald-400">{integration.leadsSyncedToday}</span>
              <span className="text-[9px] text-muted-foreground text-center">Today</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 rounded-lg border border-border/30 bg-secondary/10 px-2 py-2">
              <span className={cn("text-base font-bold tabular-nums", isSyncing ? "text-sky-400" : "text-muted-foreground")}>
                {isSyncing ? <RefreshCw className="h-4 w-4 animate-spin mx-auto" /> : formatNextSync(integration.nextSync)}
              </span>
              <span className="text-[9px] text-muted-foreground text-center">Next Sync</span>
            </div>
          </div>

          {/* Sync time */}
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last sync: {formatRelativeTime(integration.lastSync)}
            </span>
            <span className="flex items-center gap-1 text-sky-400 cursor-pointer hover:text-sky-300 transition-colors" onClick={onSync}>
              <RefreshCw className={cn("h-3 w-3", isSyncing && "animate-spin")} />
              {isSyncing ? "Syncing…" : "Sync now"}
            </span>
          </div>

          {/* Campaign badges */}
          {integration.campaigns.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {integration.campaigns.slice(0, 3).map((c) => (
                <Badge key={c} variant="outline" className="text-[9px] px-1.5 py-0 border-border/30 text-muted-foreground">
                  {c}
                </Badge>
              ))}
              {integration.campaigns.length > 3 && (
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-border/30 text-muted-foreground">
                  +{integration.campaigns.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
      ) : status === "error" ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
            <p className="text-xs text-destructive">{integration?.errorMessage ?? "Connection lost. Please reconnect."}</p>
          </div>
          <Button size="sm" variant="outline" className="w-full gap-1.5 border-border/50" onClick={onReconnect}>
            <RefreshCw className="h-3.5 w-3.5" /> Reconnect
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-xs text-muted-foreground leading-relaxed">{cfg.tagline}</p>
          <Button
            size="sm"
            className={cn("w-full gap-2 text-white shadow-sm", `bg-gradient-to-r ${cfg.gradient}`)}
            onClick={onConnect}
          >
            <Link2 className="h-3.5 w-3.5" />
            Connect {cfg.name}
            <ArrowRight className="h-3.5 w-3.5 ml-auto" />
          </Button>
        </div>
      )}
    </motion.div>
  )
}

// ── Sync log row ──────────────────────────────────────────────────────────
function SyncLogRow({ event }: { event: SyncEvent }) {
  const cfg = PLATFORM_CONFIGS[event.platform]
  const isSuccess = event.status === "success"
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/20 last:border-0">
      <PlatformIcon platform={event.platform} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">{cfg.name}</span>
          <Badge
            variant="outline"
            className={cn(
              "text-[9px] px-1.5 py-0",
              isSuccess ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" : "border-destructive/20 bg-destructive/5 text-destructive"
            )}
          >
            {isSuccess ? "Success" : "Error"}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">{event.message}</p>
      </div>
      <div className="text-right shrink-0">
        {isSuccess && <p className="text-sm font-semibold text-emerald-400">+{event.leadsAdded}</p>}
        <p className="text-[10px] text-muted-foreground">{formatRelativeTime(event.timestamp)}</p>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(() => getIntegrations())
  const [syncLog, setSyncLog] = useState<SyncEvent[]>(() => getSyncLog())
  const [connectingPlatform, setConnectingPlatform] = useState<Platform | null>(null)
  const syncTimerRef = useRef<number | null>(null)

  const getIntegration = (p: Platform) => integrations.find((i) => i.platform === p) ?? null

  const refreshState = useCallback(() => {
    setIntegrations(getIntegrations())
    setSyncLog(getSyncLog())
  }, [])

  // Auto-sync polling every 60 seconds
  useEffect(() => {
    const tick = () => {
      const all = getIntegrations()
      let changed = false
      all.forEach((intg) => {
        if (isOverdueForSync(intg)) {
          intg.status = "syncing"
          changed = true
          // Complete sync after 3 seconds
          setTimeout(() => {
            const current = getIntegrations().find((i) => i.platform === intg.platform)
            if (current) {
              const leads = simulateSyncLeads()
              const updated: Integration = {
                ...current,
                status: "connected",
                lastSync: new Date().toISOString(),
                nextSync: getNextSyncTime(current.syncIntervalMinutes),
                leadsTotal: current.leadsTotal + leads,
                leadsSyncedToday: current.leadsSyncedToday + leads,
                leadsSyncedThisWeek: current.leadsSyncedThisWeek + leads,
              }
              const rest = getIntegrations().filter((i) => i.platform !== intg.platform)
              saveIntegrations([...rest, updated])
              addSyncEvent({
                platform: intg.platform,
                accountName: intg.accountName,
                timestamp: new Date().toISOString(),
                leadsAdded: leads,
                status: "success",
                message: `Auto-sync completed — ${leads} new lead${leads !== 1 ? "s" : ""} captured`,
              })
              refreshState()
            }
          }, 3000)
        }
      })
      if (changed) { saveIntegrations(all); refreshState() }
    }

    tick()
    syncTimerRef.current = window.setInterval(tick, 60_000)
    return () => { if (syncTimerRef.current) clearInterval(syncTimerRef.current) }
  }, [refreshState])

  const handleConnected = (integration: Integration) => {
    refreshState()
    setConnectingPlatform(null)
  }

  const handleSync = (platform: Platform) => {
    const intg = getIntegration(platform)
    if (!intg) return
    const updated = { ...intg, status: "syncing" as ConnectionStatus }
    const rest = integrations.filter((i) => i.platform !== platform)
    setIntegrations([...rest, updated])
    saveIntegrations([...rest, updated])

    setTimeout(() => {
      const leads = simulateSyncLeads()
      const done: Integration = {
        ...updated,
        status: "connected",
        lastSync: new Date().toISOString(),
        nextSync: getNextSyncTime(updated.syncIntervalMinutes),
        leadsTotal: updated.leadsTotal + leads,
        leadsSyncedToday: updated.leadsSyncedToday + leads,
        leadsSyncedThisWeek: updated.leadsSyncedThisWeek + leads,
      }
      const r = getIntegrations().filter((i) => i.platform !== platform)
      saveIntegrations([...r, done])
      addSyncEvent({
        platform,
        accountName: intg.accountName,
        timestamp: new Date().toISOString(),
        leadsAdded: leads,
        status: "success",
        message: `Manual sync — ${leads} new lead${leads !== 1 ? "s" : ""} captured`,
      })
      refreshState()
    }, 3000)
  }

  const handleDisconnect = (platform: Platform) => {
    removeIntegration(platform)
    refreshState()
  }

  // ── Derived stats ──────────────────────────────────────────────────────
  const connected = integrations.filter((i) => i.status === "connected" || i.status === "syncing")
  const totalLeadsToday = connected.reduce((s, i) => s + i.leadsSyncedToday, 0)
  const totalLeadsWeek = connected.reduce((s, i) => s + i.leadsSyncedThisWeek, 0)
  const totalLeadsAll = connected.reduce((s, i) => s + i.leadsTotal, 0)
  const syncing = connected.filter((i) => i.status === "syncing").length
  const nextSyncIntg = connected
    .filter((i) => i.nextSync)
    .sort((a, b) => new Date(a.nextSync!).getTime() - new Date(b.nextSync!).getTime())[0]

  const chartData = buildChartData(integrations)

  const pageStats = [
    { label: "Connected Sources", value: `${connected.length} / ${PLATFORMS.length}`, icon: Link2, color: "text-primary", bg: "bg-primary/10" },
    { label: "Leads Today", value: totalLeadsToday, icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Leads This Week", value: totalLeadsWeek, icon: TrendingUp, color: "text-sky-500", bg: "bg-sky-500/10" },
    { label: "Total Synced", value: totalLeadsAll, icon: Zap, color: "text-amber-500", bg: "bg-amber-500/10" },
    {
      label: "Next Sync",
      value: nextSyncIntg ? formatNextSync(nextSyncIntg.nextSync) : "—",
      icon: syncing > 0 ? Activity : Clock,
      color: syncing > 0 ? "text-sky-500" : "text-muted-foreground",
      bg: syncing > 0 ? "bg-sky-500/10" : "bg-secondary/40",
    },
  ]

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Lead Sources"
        description="Connect your ad platforms and lead channels to auto-sync leads into your CRM."
      />

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      >
        {pageStats.map((stat) => (
          <div key={stat.label} className="glass-card flex items-center gap-3 p-4">
            <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", stat.bg)}>
              <stat.icon className={cn("h-4 w-4", stat.color)} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[11px] text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-bold tabular-nums text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Channel cards */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Lead Channels</h2>
          <span className="text-xs text-muted-foreground">{connected.length} of {PLATFORMS.length} connected</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLATFORMS.map((platform, i) => (
            <motion.div
              key={platform}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <IntegrationCard
                platform={platform}
                integration={getIntegration(platform)}
                onConnect={() => setConnectingPlatform(platform)}
                onSync={() => handleSync(platform)}
                onDisconnect={() => handleDisconnect(platform)}
                onReconnect={() => setConnectingPlatform(platform)}
              />
            </motion.div>
          ))}

          {/* Coming soon */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card flex flex-col items-center justify-center gap-3 p-6 border-dashed opacity-60"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-dashed border-border/50">
              <Link2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">More coming soon</p>
              <p className="text-xs text-muted-foreground/60 mt-0.5">LinkedIn, Zillow, Google Ads</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Analytics + Sync Log */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-4 lg:grid-cols-3"
      >
        {/* Chart */}
        <div className="glass-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Leads by Source</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Last 7 days</p>
            </div>
            {connected.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {connected.map((intg) => (
                  <div key={intg.platform} className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS[intg.platform] }} />
                    <span className="text-[10px] text-muted-foreground">{PLATFORM_CONFIGS[intg.platform].name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {connected.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <WifiOff className="h-10 w-10 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">No sources connected yet</p>
              <p className="text-xs text-muted-foreground/60">Connect a lead channel above to see analytics</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={12} barGap={2}>
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  width={28}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                  cursor={{ fill: "hsl(var(--secondary)/0.3)" }}
                />
                {connected.map((intg) => (
                  <Bar
                    key={intg.platform}
                    dataKey={PLATFORM_CONFIGS[intg.platform].name}
                    stackId="a"
                    fill={CHART_COLORS[intg.platform]}
                    radius={connected.indexOf(intg) === connected.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                    fillOpacity={0.85}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}

          {/* Source table */}
          {connected.length > 0 && (
            <div className="mt-4 rounded-lg border border-border/30 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/30 bg-secondary/20">
                    <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Source</th>
                    <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Today</th>
                    <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">This Week</th>
                    <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total</th>
                    <th className="px-3 py-2 text-right text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Last Sync</th>
                  </tr>
                </thead>
                <tbody>
                  {connected.map((intg) => (
                    <tr key={intg.platform} className="border-b border-border/20 last:border-0 hover:bg-secondary/10">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full" style={{ background: CHART_COLORS[intg.platform] }} />
                          <span className="font-medium">{PLATFORM_CONFIGS[intg.platform].name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right text-emerald-400 font-semibold">+{intg.leadsSyncedToday}</td>
                      <td className="px-3 py-2.5 text-right text-foreground">{intg.leadsSyncedThisWeek}</td>
                      <td className="px-3 py-2.5 text-right font-semibold text-foreground">{intg.leadsTotal}</td>
                      <td className="px-3 py-2.5 text-right text-muted-foreground">{formatRelativeTime(intg.lastSync)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sync log */}
        <div className="glass-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Sync Activity</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Recent sync events</p>
            </div>
            {syncing > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-sky-400">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Syncing
              </div>
            )}
          </div>

          {syncLog.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <Activity className="h-10 w-10 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">No sync activity yet</p>
              <p className="text-xs text-muted-foreground/60">Connect a source to start syncing</p>
            </div>
          ) : (
            <div className="max-h-[360px] overflow-y-auto pr-1">
              {syncLog.slice(0, 20).map((event) => (
                <SyncLogRow key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Connect modal */}
      {connectingPlatform && (
        <IntegrationConnectModal
          platform={connectingPlatform}
          open={true}
          onClose={() => setConnectingPlatform(null)}
          onConnected={handleConnected}
        />
      )}
    </div>
  )
}
