import { getDictionary } from '@/lib/get-dictionary';
import RequestsPage from '@/components/requests/requests-page';

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    return <RequestsPage dict={dict} />;
}
