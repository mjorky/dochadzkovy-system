import { getDictionary } from '@/lib/get-dictionary';
import ApprovalsPage from '@/components/approvals/approvals-page';

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return <ApprovalsPage dict={dict} />;
}
