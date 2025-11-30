import { AdminGuard } from "@/components/admin-guard";
import { HolidayManager } from "@/components/admin/holiday-manager";

export default function AdminGeneralPage({
    params: { lang },
}: {
    params: { lang: string };
}) {
    return (
        <AdminGuard>
            <div className="container mx-auto py-6">
                <HolidayManager lang={lang} />
            </div>
        </AdminGuard>
    );
}
