import { Switch, Route, Router as WouterRouter } from "wouter"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/components/theme-provider"
import NotFound from "@/pages/not-found"
import MarketingPage from "@/pages/marketing"
import { DashboardLayout } from "@/pages/dashboard/layout"
import OverviewPage from "@/pages/dashboard/overview"
import LeadsPage from "@/pages/dashboard/leads"
import LeadProfilePage from "@/pages/dashboard/lead-profile"
import PropertiesPage from "@/pages/dashboard/properties"
import MessagesPage from "@/pages/dashboard/messages"
import AnalyticsPage from "@/pages/dashboard/analytics"
import AIIntelligencePage from "@/pages/dashboard/ai-intelligence"
import AutomationsPage from "@/pages/dashboard/automations"
import TeamPage from "@/pages/dashboard/team"
import DealsPage from "@/pages/dashboard/deals"
import DocumentsPage from "@/pages/dashboard/documents"
import CalendarPage from "@/pages/dashboard/calendar"
import LeadIntakePage from "@/pages/dashboard/lead-intake"
import SettingsPage from "@/pages/dashboard/settings"

const queryClient = new QueryClient()

function DashboardRoutes() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/dashboard" component={OverviewPage} />
        <Route path="/dashboard/leads" component={LeadsPage} />
        <Route path="/dashboard/lead-intake" component={LeadIntakePage} />
        <Route path="/dashboard/properties" component={PropertiesPage} />
        <Route path="/dashboard/messages" component={MessagesPage} />
        <Route path="/dashboard/analytics" component={AnalyticsPage} />
        <Route path="/dashboard/ai-intelligence" component={AIIntelligencePage} />
        <Route path="/dashboard/automations" component={AutomationsPage} />
        <Route path="/dashboard/team" component={TeamPage} />
        <Route path="/dashboard/deals" component={DealsPage} />
        <Route path="/dashboard/documents" component={DocumentsPage} />
        <Route path="/dashboard/calendar" component={CalendarPage} />
        <Route path="/dashboard/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  )
}

function LeadProfileRoute({ params }: { params: { id: string } }) {
  return (
    <DashboardLayout>
      <LeadProfilePage params={params} />
    </DashboardLayout>
  )
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={MarketingPage} />
      <Route path="/dashboard/leads/:id" component={LeadProfileRoute} />
      <Route path="/dashboard" component={DashboardRoutes} />
      <Route path="/dashboard/:rest*" component={DashboardRoutes} />
      <Route component={NotFound} />
    </Switch>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
