import { useEffect, useRef } from "react"
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react"
import { publishableKeyFromHost } from "@clerk/react/internal"
import { shadcn } from "@clerk/themes"
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter"
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query"
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
import IntegrationsPage from "@/pages/dashboard/integrations"
import OnboardingPage from "@/pages/auth/onboarding"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
})

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
)

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "")

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY")
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: "clerk",
  options: {
    logoPlacement: "inside" as const,
    logoLinkUrl: basePath || "/",
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: "#C4841A",
    colorForeground: "#1C1408",
    colorMutedForeground: "#7A6A50",
    colorDanger: "#DC2626",
    colorBackground: "#FAFAF7",
    colorInput: "#F0EDE6",
    colorInputForeground: "#1C1408",
    colorNeutral: "#C8BEAB",
    fontFamily: "Inter, system-ui, sans-serif",
    borderRadius: "0.75rem",
  },
  elements: {
    rootBox: "w-full flex justify-center",
    cardBox: "bg-white rounded-2xl w-[440px] max-w-full overflow-hidden shadow-xl shadow-black/10",
    card: "!shadow-none !border-0 !bg-transparent !rounded-none",
    footer: "!shadow-none !border-0 !bg-transparent !rounded-none",
    headerTitle: "text-[#1C1408] font-semibold",
    headerSubtitle: "text-[#7A6A50]",
    socialButtonsBlockButtonText: "text-[#1C1408] font-medium",
    formFieldLabel: "text-[#1C1408] font-medium text-sm",
    footerActionLink: "text-[#C4841A] font-medium",
    footerActionText: "text-[#7A6A50]",
    dividerText: "text-[#7A6A50]",
    identityPreviewEditButton: "text-[#C4841A]",
    formFieldSuccessText: "text-green-600",
    alertText: "text-[#1C1408]",
    logoBox: "flex justify-center py-2",
    logoImage: "h-10 w-auto",
    socialButtonsBlockButton: "border-[#C8BEAB] hover:bg-[#F0EDE6]",
    formButtonPrimary: "bg-[#C4841A] hover:bg-[#A36A10] text-white font-semibold",
    formFieldInput: "bg-[#F0EDE6] border-[#C8BEAB] text-[#1C1408]",
    footerAction: "bg-[#F8F5F0]",
    dividerLine: "bg-[#C8BEAB]",
    alert: "bg-[#FEF3E2]",
    otpCodeFieldInput: "border-[#C8BEAB] bg-[#F0EDE6] text-[#1C1408]",
    formFieldRow: "",
    main: "",
  },
}

function AuthPageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-background to-orange-50 px-4 py-12">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/25">
          <span className="text-lg font-bold text-primary-foreground">L</span>
        </div>
        <span className="text-2xl font-semibold tracking-tight">
          Luxe<span className="text-primary">State</span>
        </span>
      </div>
      {children}
    </div>
  )
}

function SignInPage() {
  return (
    <AuthPageWrapper>
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        afterSignInUrl={`${basePath}/dashboard`}
      />
    </AuthPageWrapper>
  )
}

function SignUpPage() {
  return (
    <AuthPageWrapper>
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        afterSignUpUrl={`${basePath}/onboarding`}
      />
    </AuthPageWrapper>
  )
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk()
  const qc = useQueryClient()
  const prevUserIdRef = useRef<string | null | undefined>(undefined)

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear()
      }
      prevUserIdRef.current = userId
    })
    return unsubscribe
  }, [addListener, qc])

  return null
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <MarketingPage />
      </Show>
    </>
  )
}

function DashboardRoutes() {
  return (
    <>
      <Show when="signed-in">
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
            <Route path="/dashboard/integrations" component={IntegrationsPage} />
            <Route component={NotFound} />
          </Switch>
        </DashboardLayout>
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  )
}

function LeadProfileRoute({ params }: { params: { id: string } }) {
  return (
    <>
      <Show when="signed-in">
        <DashboardLayout>
          <LeadProfilePage params={params} />
        </DashboardLayout>
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  )
}

function OnboardingRoute() {
  return (
    <>
      <Show when="signed-in">
        <OnboardingPage />
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  )
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route path="/onboarding" component={OnboardingRoute} />
      <Route path="/dashboard/leads/:id" component={LeadProfileRoute} />
      <Route path="/dashboard" component={DashboardRoutes} />
      <Route path="/dashboard/:rest*" component={DashboardRoutes} />
      <Route component={NotFound} />
    </Switch>
  )
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation()

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: "Welcome back",
            subtitle: "Sign in to your LuxeState account",
          },
        },
        signUp: {
          start: {
            title: "Join LuxeState",
            subtitle: "Create your account to get started",
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ClerkProvider>
  )
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  )
}

export default App
