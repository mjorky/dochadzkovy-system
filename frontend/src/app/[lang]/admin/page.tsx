import { AdminGuard } from "@/components/admin-guard";

export default function AdminPage() {
  return (
    <AdminGuard>
      <div className="text-sm text-muted-foreground">
        Select an option from the menu to get started.
      </div>
    </AdminGuard>
  );
}
