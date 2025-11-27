# i18n Implementation Summary

## Overview

This document summarizes the internationalization (i18n) implementation for the Attendance System frontend. The system now supports multiple languages (Slovak and English) with a robust, type-safe translation infrastructure.

## What Has Been Implemented

### 1. Core Infrastructure

#### Dictionary Files
- **Location**: `frontend/src/dictionaries/`
- **Files**:
  - `sk.json` - Slovak translations
  - `en.json` - English translations

#### Type Definitions
- **Location**: `frontend/src/lib/dictionary-types.ts`
- **Purpose**: TypeScript interfaces for type-safe translations
- **Exports**:
  - `Dictionary` interface - Complete translation structure
  - `Locale` type - Valid locale values ('sk' | 'en')

#### Context Provider
- **Location**: `frontend/src/contexts/dictionary-context.tsx`
- **Purpose**: React context for accessing translations in client components
- **Exports**:
  - `DictionaryProvider` - Context provider component
  - `useDictionary()` - Hook to access dictionary and locale
  - `useTranslations()` - Convenience hook for translations only
  - `useLocale()` - Convenience hook for locale only

#### Server-side Dictionary Loader
- **Location**: `frontend/src/lib/get-dictionary.ts`
- **Purpose**: Server-side function to load dictionaries
- **Usage**: In server components and layouts

### 2. Translation Categories

The dictionary is organized into the following categories:

#### sidebar
Navigation items and user interface elements in the sidebar:
- Application title
- Menu items (Work Records, Balances, Data, Overtime, Reports, Admin, etc.)
- Settings options (Language, Appearance)
- User actions (Logout, Logged in as)

#### common
General UI elements used across the application:
- Action buttons (Save, Cancel, Delete, Edit, Create, etc.)
- Status labels (Active, Inactive, Loading, Error, etc.)
- Navigation (Back, Next, Previous)
- Common phrases (Yes, No, All, None)

#### workRecords
Work Records page specific translations:
- Page elements (From Date, To Date, Whole Month)
- Actions (Export CSV, Add Entry)
- Messages (No records found, Loading more records)
- Table headers (Date, Project, Hours, Description, Type)
- Filters and search

#### workRecordDialog
Work Record dialog specific translations:
- Dialog titles (Create/Edit)
- Form labels and placeholders
- Button text
- Help text

#### deleteDialog
Delete confirmation dialog:
- Dialog title and description
- Warning messages
- Confirmation button

#### employees
Employees page translations:
- Page title and actions
- Form fields (First Name, Last Name, Email, etc.)
- Table headers
- Search and filter placeholders

#### projects
Projects page translations:
- Page title and actions
- Form fields (Name, Number, Description, Dates)
- Status labels
- Search placeholders

#### overtime
Overtime management page:
- Balance display
- Correction form
- History table
- Overtime types (Flexi, SC SR Trip, SC Abroad, Unpaid)

#### balances
My Balances page:
- Current balances display
- Balance types (Vacation, Sick Leave, Overtime)
- Units (days, hours)

#### reports
Reports pages (Work Report, Work List):
- Report types
- Form controls
- PDF generation messages
- Signature upload
- Success/error messages

#### data
Data management page:
- Page title and description
- Data categories (Absence Types, Productivity Types, Work Types, Holidays)

#### login
Login page:
- Form fields
- Button text
- Error messages
- Welcome messages

#### filters
Filter controls used across tables:
- Filter categories
- Status options
- Clear/remove actions

#### absenceTypes
Labels for absence types:
- Vacation
- Sick Leave
- Doctor
- Accompanying
- Disabled Child Accompanying

#### validation
Form validation messages:
- Required field
- Invalid formats (email, number, date)
- Length constraints

#### table
Table UI elements:
- Empty state
- Pagination
- Selection indicators

#### toast
Toast notification messages:
- Success messages
- Error messages
- Warning messages
- Info messages

#### navigation
Navigation and breadcrumb elements:
- Home link
- Dashboard link
- Breadcrumb labels

## Integration Points

### 1. Root Layout
**File**: `frontend/src/app/[lang]/layout.tsx`

The root layout now:
1. Loads the dictionary server-side using `getDictionary()`
2. Wraps the application in `DictionaryProvider`
3. Passes dictionary and locale to all child components

```typescript
const dictionary = await getDictionary(lang as Locale);

<DictionaryProvider dictionary={dictionary} locale={lang as Locale}>
  <AppLayout lang={lang}>{children}</AppLayout>
</DictionaryProvider>
```

### 2. Sidebar Component
**File**: `frontend/src/components/sidebar.tsx`

Fully implemented with translations:
- All menu items use dictionary keys
- Language switcher integrated
- Dynamic label rendering based on locale

### 3. Site Pages Configuration
**File**: `frontend/src/lib/site-pages.ts`

Currently uses hardcoded labels but should be updated to use translation keys in the future.

## Usage Examples

### Client Components

```typescript
'use client';

import { useTranslations } from '@/contexts/dictionary-context';

export function MyComponent() {
  const t = useTranslations();
  
  return (
    <div>
      <h1>{t.workRecords.title}</h1>
      <Button>{t.common.save}</Button>
      <p>{t.workRecords.noRecordsFound}</p>
    </div>
  );
}
```

### Server Components

```typescript
import { getDictionary } from '@/lib/get-dictionary';
import type { Locale } from '@/lib/dictionary-types';

export default async function MyPage({ 
  params 
}: { 
  params: Promise<{ lang: string }> 
}) {
  const { lang } = await params;
  const t = await getDictionary(lang as Locale);
  
  return (
    <div>
      <h1>{t.workRecords.title}</h1>
      <p>{t.common.loading}</p>
    </div>
  );
}
```

### Conditional Text

```typescript
const t = useTranslations();

<DialogTitle>
  {mode === 'create' 
    ? t.workRecordDialog.createTitle 
    : t.workRecordDialog.editTitle}
</DialogTitle>

<Button disabled={loading}>
  {loading ? t.common.saving : t.common.save}
</Button>
```

### Toast Messages

```typescript
const t = useTranslations();

toast.success(t.reports.pdfGenerated);
toast.error(t.workRecords.failedToLoad);
toast.warning(t.reports.pleaseSelectEmployee);
```

## Language Switching

The language switcher in the Sidebar allows users to switch between languages:

1. User clicks language option (SK or EN)
2. `useTransition()` hook manages the transition
3. `router.replace()` updates the URL with new locale
4. Cookie stores the language preference
5. Page re-renders with new translations
6. No full page reload - smooth transition

## Type Safety

All translations are fully type-checked:

```typescript
// ✅ This works - 'title' exists in workRecords
const title = t.workRecords.title;

// ❌ TypeScript error - 'nonexistent' doesn't exist
const bad = t.workRecords.nonexistent;
```

Adding new translations requires updating:
1. `sk.json` - Slovak translation
2. `en.json` - English translation
3. `dictionary-types.ts` - TypeScript interface

## Migration Status

### ✅ Fully Implemented
- Sidebar navigation
- Dictionary infrastructure
- Context provider
- Type definitions
- Root layout integration

### 🔄 Partially Implemented
- Some components may still have hardcoded strings

### ⏳ Not Yet Migrated
Most page components still need migration:
- Work Records page (`work-records/page.tsx`)
- Work Record Dialog (`components/work-record-dialog.tsx`)
- Work Records Table (`components/work-records-table.tsx`)
- Employee pages
- Project pages
- Overtime page
- Balances page
- Reports pages
- Data page
- Login page
- Various filter and table components

See `I18N_MIGRATION_GUIDE.md` for step-by-step migration instructions.

## Example Component

**File**: `frontend/src/components/employee-selector-i18n.tsx`

This is a fully translated example component showing best practices:
- Uses `useTranslations()` hook
- Supports prop overrides for labels/placeholders
- Falls back to translations when props not provided
- Type-safe translation access

## Benefits

1. **Type Safety**: All translations are type-checked at compile time
2. **DRY Principle**: No duplicate translation logic
3. **Easy Switching**: Users can switch languages without page reload
4. **Maintainable**: Centralized translation files
5. **Scalable**: Easy to add new languages
6. **Developer-Friendly**: Clear structure and helpful TypeScript errors

## Next Steps

1. **Migrate Components**: Follow the migration guide to add translations to all pages and components
2. **Test Coverage**: Ensure all translations work in both languages
3. **Add More Languages**: If needed, add more locale files (e.g., `cs.json` for Czech)
4. **Update Site Pages**: Consider making breadcrumb labels translatable
5. **Optimize Loading**: Consider lazy-loading dictionaries if they grow large

## Resources

- **Migration Guide**: `I18N_MIGRATION_GUIDE.md` - Detailed instructions for migrating components
- **Example Component**: `components/employee-selector-i18n.tsx` - Reference implementation
- **Dictionary Types**: `lib/dictionary-types.ts` - TypeScript type definitions
- **Slovak Dictionary**: `dictionaries/sk.json` - Slovak translations
- **English Dictionary**: `dictionaries/en.json` - English translations

## Maintenance

### Adding a New Translation Key

1. Add to both `sk.json` and `en.json`:
```json
{
  "myFeature": {
    "newKey": "Translation text"
  }
}
```

2. Update `dictionary-types.ts`:
```typescript
export interface Dictionary {
  myFeature: {
    newKey: string;
  };
}
```

3. Use in components:
```typescript
const t = useTranslations();
<div>{t.myFeature.newKey}</div>
```

### Adding a New Language

1. Create new dictionary file: `dictionaries/de.json`
2. Add locale to `i18n-config.ts`:
```typescript
export const i18n = {
  defaultLocale: 'sk',
  locales: ['sk', 'en', 'de'],
};
```
3. Update `Locale` type in `dictionary-types.ts`:
```typescript
export type Locale = 'sk' | 'en' | 'de';
```
4. Add to dictionary loader in `get-dictionary.ts`:
```typescript
const dictionaries = {
  sk: () => import("@/dictionaries/sk.json").then(m => m.default),
  en: () => import("@/dictionaries/en.json").then(m => m.default),
  de: () => import("@/dictionaries/de.json").then(m => m.default),
};
```

## Performance Considerations

- Dictionaries are loaded once per request (server-side)
- Client-side context provides instant access
- No additional network requests for translations
- Type checking happens at build time (zero runtime cost)

## Accessibility

The i18n implementation supports accessibility:
- Proper `lang` attribute on HTML element
- No layout shift on language change (uses transition)
- All user-facing text can be translated
- Screen readers work correctly in both languages

---

**Status**: Infrastructure complete, component migration in progress
**Last Updated**: 2024
**Maintained By**: Development Team