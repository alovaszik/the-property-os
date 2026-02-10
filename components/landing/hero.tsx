import Image from "next/image"
import { ArrowRight } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-16 lg:px-8 lg:pb-32 lg:pt-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-muted-foreground">
              Now in Early Access
            </span>
          </div>

          <h1 className="max-w-4xl text-balance text-4xl font-bold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl">
            The Operating System for Your Property
          </h1>

          <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
            Seamlessly connect landlords and tenants. Manage payments, maintenance
            requests, and communication -- all in one powerful platform.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="#"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Request Access
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#features"
              className="inline-flex min-h-[48px] items-center justify-center rounded-lg border border-border bg-card px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Explore Features
            </a>
          </div>

          <div className="mt-16 w-full max-w-3xl">
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-xl shadow-primary/5">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-destructive/60" />
                <div className="h-3 w-3 rounded-full bg-yellow-400/60" />
                <div className="h-3 w-3 rounded-full bg-emerald-400/60" />
                <span className="ml-3 text-xs text-muted-foreground">
                  propertyos.app/dashboard
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
                <DashboardCard label="Active Properties" value="12" />
                <DashboardCard label="Monthly Revenue" value="$24,800" />
                <DashboardCard label="Open Requests" value="3" />
                <DashboardCard label="Tenant Score" value="98%" />
              </div>
              <div className="grid gap-3 p-4 pt-0 md:grid-cols-2">
                <div className="rounded-xl bg-secondary p-4">
                  <p className="text-xs font-medium text-muted-foreground">Recent Activity</p>
                  <div className="mt-3 flex flex-col gap-2">
                    <ActivityRow text="Rent payment received" time="2h ago" />
                    <ActivityRow text="Maintenance request resolved" time="5h ago" />
                    <ActivityRow text="New tenant application" time="1d ago" />
                  </div>
                </div>
                <div className="rounded-xl bg-secondary p-4">
                  <p className="text-xs font-medium text-muted-foreground">Upcoming</p>
                  <div className="mt-3 flex flex-col gap-2">
                    <ActivityRow text="Lease renewal - Unit 4B" time="Mar 1" />
                    <ActivityRow text="Property inspection" time="Mar 5" />
                    <ActivityRow text="Insurance renewal" time="Mar 15" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function DashboardCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-bold text-foreground">{value}</p>
    </div>
  )
}

function ActivityRow({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-foreground">{text}</p>
      <span className="text-xs text-muted-foreground">{time}</span>
    </div>
  )
}
