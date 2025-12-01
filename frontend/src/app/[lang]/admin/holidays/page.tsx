import { AdminGuard } from "@/components/admin-guard";
import { HolidayManager } from "@/components/admin/holiday-manager";

export default async function AdminGeneralPage({
    params,
}: {
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    return (
        <AdminGuard>
            <div className="container mx-auto py-6">
                <HolidayManager lang={lang} />
            </div>
        </AdminGuard>
    );
}
