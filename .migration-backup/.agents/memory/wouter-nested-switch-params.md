---
name: Wouter v3 nested Switch param routes
description: Parameterized routes (:id) fail to match when placed inside a nested Switch — must be in the outermost Switch.
---

# Wouter v3 nested Switch — parameterized routes

## The Rule
Do NOT put routes with URL params (`:id`, `:slug`, etc.) inside a nested `<Switch>`. They must live in the **outermost** Switch.

**Why:** Wouter v3 does not correctly match parameterized route segments when the route lives inside an inner `<Switch>` that is rendered by a catch-all parent route (e.g. `/dashboard/:rest*`). The inner Switch falls through to the `<Route component={NotFound} />` catch-all even though the path looks correct.

**How to apply:** When a new parameterized sub-route is needed inside a layout (e.g. `/dashboard/leads/:id`), add it to the outer Router Switch *before* the general catch-all, and wrap it with its own layout component:

```jsx
// WRONG: inside a nested Switch
function DashboardRoutes() {
  return <DashboardLayout><Switch>
    <Route path="/dashboard/leads/:id" component={LeadProfilePage} /> {/* ← never matches */}
  </Switch></DashboardLayout>
}

// CORRECT: in the outermost Switch, before the catch-all
function LeadProfileRoute({ params }) {
  return <DashboardLayout><LeadProfilePage params={params} /></DashboardLayout>
}
function Router() {
  return <Switch>
    <Route path="/dashboard/leads/:id" component={LeadProfileRoute} /> {/* ← works */}
    <Route path="/dashboard/:rest*" component={DashboardRoutes} />
  </Switch>
}
```
