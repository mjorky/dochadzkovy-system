# i18n Migration Guide

This guide explains how to add translations to existing components and pages in our Next.js application.

## Overview

We've set up a comprehensive i18n system with:
- **Dictionaries**: `frontend/src/dictionaries/sk.json` and `en.json`
- **Type Safety**: `frontend/src/lib/dictionary-types.ts`
- **Context Provider**: `frontend/src/contexts/dictionary-context.tsx`
- **Server-side loader**: `frontend/src/lib/get-dictionary.ts`

## Quick Start

### Step 1: Import the translation hook

For **client components** (`'use client'`):

```typescript
import { useTranslations } from '@/contexts/dictionary-context';

export function MyComponent() {
  const t = useTranslations();
  
  return <div>{t.common.loading}</div>;
}
```

For **server components**:

```typescript
import { getDictionary } from '@/lib/get-dictionary';
import type { Locale } from '@/lib/dictionary-types';

export default async function MyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = await getDictionary(lang as Locale);
  
  return <div>{t.common.loading}</div>;
}
```

### Step 2: Replace hardcoded strings

**Before:**
```typescript
<Button>{loading ? "Saving..." : "Save"}</Button>
```

**After:**
```typescript
<Button>{loading ? t.common.saving : t.common.save}</Button>
```

## Dictionary Structure

Our dictionary is organized by feature/domain:

```typescript
{
  sidebar: { ... },           // Sidebar navigation
  common: { ... },            // Common UI text (buttons, actions)
  workRecords: { ... },       // Work Records page
  employees: { ... },         // Employees page
  projects: { ... },          // Projects page
  overtime: { ... },          // Overtime page
  balances: { ... },          // Balances page
  reports: { ... },           // Reports pages
  data: { ... },              // Data page
  login: { ... },             // Login page
  filters: { ... },           // Filter controls
  absenceTypes: { ... },      // Absence type labels
  validation: { ... },        // Form validation messages
  table: { ... },             // Table UI
  toast: { ... },             // Toast notifications
  navigation: { ... }         // Navigation/breadcrumbs
}
```

## Common Patterns

### 1. Loading States

```typescript
const t = useTranslations();

{loading ? t.common.loading : t.common.save}
```

### 2. Conditional Text

```typescript
const t = useTranslations();

<DialogTitle>
  {mode === 'create' ? t.workRecordDialog.createTitle : t.workRecordDialog.editTitle}
</DialogTitle>
```

### 3. Placeholders

```typescript
const t = useTranslations();

<Input placeholder={t.workRecords.searchPlaceholder} />
```

### 4. Toast Messages

```typescript
const t = useTranslations();

toast.success(t.reports.pdfGenerated);
toast.error(t.workRecords.failedToLoad);
```

### 5. Labels

```typescript
const t = useTranslations();

<Label>{t.employees.firstName}</Label>
```

### 6. Buttons

```typescript
const t = useTranslations();

<Button>
  <Plus className="h-4 w-4" />
  {t.workRecords.addEntry}
</Button>
```

## Migration Checklist for a Component

When migrating a component, follow these steps:

- [ ] Add `'use client'` if not already present (for client components)
- [ ] Import `useTranslations` hook
- [ ] Call `const t = useTranslations()` at the top of the component
- [ ] Find all hardcoded strings in JSX
- [ ] Replace each string with appropriate translation key
- [ ] Check button text (including loading states)
- [ ] Check form labels and placeholders
- [ ] Check error messages and toasts
- [ ] Check dialog titles and descriptions
- [ ] Test in both languages (Slovak and English)

## Example: Full Component Migration

**Before:**

```typescript
'use client';

export function MyDialog({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Record</DialogTitle>
          <DialogDescription>
            Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        
        <Input placeholder="Enter name..." />
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**After:**

```typescript
'use client';

import { useTranslations } from '@/contexts/dictionary-context';

export function MyDialog({ open, onClose }) {
  const [loading, setLoading] = useState(false);
  const t = useTranslations();
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.workRecordDialog.createTitle}</DialogTitle>
          <DialogDescription>
            {t.workRecordDialog.fillDetails}
          </DialogDescription>
        </DialogHeader>
        
        <Input placeholder={t.workRecordDialog.enterDescription} />
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button disabled={loading}>
            {loading ? t.common.saving : t.common.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

## Adding New Translation Keys

If you need a translation that doesn't exist:

1. Add it to both `sk.json` AND `en.json`:

```json
// sk.json
{
  "myFeature": {
    "newKey": "Nový text v slovenčine"
  }
}

// en.json
{
  "myFeature": {
    "newKey": "New text in English"
  }
}
```

2. Update the TypeScript types in `dictionary-types.ts`:

```typescript
export interface Dictionary {
  // ... existing keys
  myFeature: {
    newKey: string;
  };
}
```

3. Use it in your component:

```typescript
const t = useTranslations();
return <div>{t.myFeature.newKey}</div>;
```

## Best Practices

1. **Always add translations to BOTH language files** - Keep them in sync
2. **Use semantic keys** - `workRecords.addEntry` not `buttons.button1`
3. **Group by feature** - Keep related translations together
4. **Type safety** - Always update `dictionary-types.ts` when adding new keys
5. **Avoid inline translations** - Don't concatenate strings, use complete phrases
6. **Test both languages** - Switch languages and verify all text appears correctly

## Files to Migrate

Priority order:

### High Priority (User-facing)
- [ ] `work-records/page.tsx` - Work Records page
- [ ] `components/work-record-dialog.tsx` - Work Record dialog
- [ ] `components/work-records-table.tsx` - Work Records table
- [ ] `components/employee-selector.tsx` - Employee selector
- [ ] `login/page.tsx` - Login page

### Medium Priority
- [ ] `admin/employees/page.tsx` - Employees page
- [ ] `admin/projects/page.tsx` - Projects page
- [ ] `overtime/page.tsx` - Overtime page
- [ ] `balances/page.tsx` - Balances page
- [ ] `reports/work-report/page.tsx` - Work Report
- [ ] `reports/work-list/page.tsx` - Work List

### Low Priority (Settings/Internal)
- [ ] `data/page.tsx` - Data management
- [ ] Various filter components
- [ ] Table components
- [ ] Dialog components

## Testing

After migration:

1. **Visual test**: Check the page in both languages
2. **Interaction test**: Click buttons, submit forms, check error messages
3. **Toast messages**: Trigger success/error toasts
4. **Form validation**: Check validation error messages
5. **Empty states**: Check "no data" messages
6. **Loading states**: Check loading text

## Language Switching

Users can switch languages using the language selector in the sidebar. The app will:
1. Update the URL (e.g., `/sk/work-records` → `/en/work-records`)
2. Re-render with new translations
3. Save preference in a cookie

## Common Issues

### Issue: "useDictionary must be used within a DictionaryProvider"
**Solution**: Make sure the component is rendered within the `DictionaryProvider` (should be automatic via layout)

### Issue: TypeScript error - property doesn't exist
**Solution**: Update `dictionary-types.ts` with the new translation key

### Issue: Translation shows as `undefined`
**Solution**: Check both `sk.json` and `en.json` have the key

### Issue: Component not re-rendering on language change
**Solution**: Make sure you're using `useTranslations()` hook, not importing dictionaries directly

## Support

For questions or issues with i18n:
1. Check this guide first
2. Look at example components like `employee-selector-i18n.tsx`
3. Review the Sidebar component (fully implemented with i18n)
4. Ask the team for help

---

**Remember**: Complete, accurate translations make the app accessible to all users. Take time to do it right! 🌍