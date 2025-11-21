import { AdminGuard } from "@/components/admin-guard"

export default function AdminPage() {
  return (
    <AdminGuard>
    <div className="p-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p className="mt-4 text-muted-foreground">Welcome to the admin panel. Use the menu to navigate.</p>
    </div>
    </AdminGuard>
  )
}
