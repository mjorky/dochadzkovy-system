import { AdminGuard } from "@/components/admin-guard"
import AdminEmployeesPage from "./employees/page"
import AdminProjectsPage from "./projects/page"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      {children}
    </AdminGuard>
  )
}

