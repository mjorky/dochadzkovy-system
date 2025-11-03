import { HealthCheck } from "@/components/health-check";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <main className="flex flex-col items-center gap-8 max-w-2xl w-full">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            Attendance System
          </h1>
          <h2 className="text-2xl font-serif text-muted-foreground">
            Dochádzkový Systém
          </h2>
          <p className="text-sm text-muted-foreground mt-4">
            Modern web-based time tracking and workforce management platform
          </p>
        </div>

        <div className="w-full">
          <HealthCheck />
        </div>

        <div className="text-center text-sm text-muted-foreground">
          <p>Phase 1: Project Scaffolding & Database Connection</p>
        </div>
      </main>
    </div>
  );
}
