'use client';

import { useTranslations } from '@/contexts/dictionary-context';

export default function ReportsPage() {
  const t = useTranslations();

  return <div className="text-muted-foreground">{t.reports.comingSoon}</div>;
}
