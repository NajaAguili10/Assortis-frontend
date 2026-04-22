---
description: >
  International Tender Collection App — Project-wide conventions for safe, maintainable development.
  Enforces module organization, design system preservation, SOLID principles, and safe refactoring.
---

# International Tender Collection App — Developer Instructions

## Project Overview

**Tech Stack:** React 18 + TypeScript + Vite + Router + i18n (EN/FR/ES) + Material-UI/Radix UI + Tailwind CSS

**Purpose:** Multilingual international tender collection, expert matching, organization partnerships, training, and technical assistance marketplace.

**Core Principle:** Safe, incremental improvements without changing functionality, UI/UX, or external behavior.

---

## 1. Module Organization

The codebase is organized into **actor-based modules** with clear separation of concerns.

### Module Structure
```
src/app/modules/
  expert/              ← Expert-specific features
    pages/
    hooks/
    services/
    types/
  
  organization/        ← Organization-specific features
    pages/
    hooks/
    data/
  
  administrator/       ← Admin-only features
    pages/
    hooks/
  
  public/              ← Unauthenticated pages
    pages/
  
  shared/              ← Cross-cutting features (Tenders, Projects, Training, etc.)
    pages/
    hooks/

src/app/
  components/          ← Shared UI components (NEVER move these to modules)
  contexts/            ← React contexts (NEVER move these)
  hooks/               ← Shared hooks (NEVER move actor-specific ones out of modules)
  services/            ← Shared services (permissions, email, etc.)
  types/               ← Shared DTOs and types
  config/
  utils/
  i18n/                ← All translations
```

### Responsibilities
- **Expert module**: Expert profiles, CVs, pipeline, matching with organizations
- **Organization module**: Organization profiles, teams, partnerships, invitations
- **Administrator module**: Dashboard, notifications, insights, system states
- **Public module**: Authentication, terms, privacy, about, contact, search
- **Shared module**: Everything else (tenders, projects, training, assistance, offers)
- **Account/Mon-espace**: Existing modules (leave untouched unless refactoring imports)

### When to Add New Files
1. **New page**: Add to appropriate module's `pages/` directory
2. **New hook**: Add to appropriate module's `hooks/` (not `src/app/hooks/`)
3. **New type/DTO**: Add to `src/app/types/` if used by 2+ modules; otherwise to module's `types/`
4. **New component**: Add to `src/app/components/` (shared); never create `components/` in modules
5. **New service**: Add to appropriate module's `services/` if actor-specific; otherwise `src/app/services/`

---

## 2. Import Conventions & Path Aliases

### Path Aliases (DO NOT USE RELATIVE IMPORTS)
```typescript
// ✅ CORRECT — use @app alias
import { useLanguage } from '@app/contexts/LanguageContext';
import { useExperts } from '@app/modules/expert/hooks/useExperts';
import { Button } from '@app/components/ui/button';
import { SECTOR_SUBSECTOR_MAP } from '@app/config/subsectors.config';

// ❌ WRONG — relative imports (fragile, break on moves)
import { useLanguage } from '../../../contexts/LanguageContext';
import { useExperts } from '../../../../hooks/useExperts';
```

### Actor-Specific Imports
**Expert actors always import from expert module paths:**
```typescript
// In any file importing from expert module
import { useExperts } from '@app/modules/expert/hooks/useExperts';
import { ExpertDTO } from '@app/modules/expert/types/expert.dto';
import { cvGenerator } from '@app/modules/expert/services/cvGenerator.service';
```

**Organization actors always import from organization module paths:**
```typescript
import { useOrganizations } from '@app/modules/organization/hooks/useOrganizations';
import { myOrganizationData } from '@app/modules/organization/data/myOrganizationData';
```

**Administrator actors always import from administrator module paths:**
```typescript
import { useNotifications } from '@app/modules/administrator/hooks/useNotifications';
import { useInsights } from '@app/modules/administrator/hooks/useInsights';
```

### Shared Type Imports
**These are always in `@app/types/` (used by multiple modules):**
```typescript
import { NotificationDTO } from '@app/types/notification.dto';
import { InsightsKPIsDTO } from '@app/types/insights.dto';
import { TenderListDTO } from '@app/types/tender.dto';
import { ProjectStatusEnum } from '@app/types/project.dto';
import { TrainingKPIsDTO } from '@app/types/training.dto';
```

### Rule: Before File Edits
✅ **Always check the current import paths in the file first** — if it uses relative imports, they may need updating after any restructuring.

---

## 3. Design System Preservation

✅ Use existing colors, typography, spacing, and visual patterns defined in the project
✅ Reuse shared UI components from @app/components/ui/*
✅ Maintain overall visual consistency across the application


### Existing Component System (REUSE THESE)
```typescript
// Always use these instead of creating duplicates
import { Button } from '@app/components/ui/button';
import { Input } from '@app/components/ui/input';
import { Badge } from '@app/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@app/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@app/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@app/components/ui/card';
import { Separator } from '@app/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@app/components/ui/popover';
import { PageBanner, PageContainer, SubMenu } from '@app/components';
```

### If New Component Required
1. **Match existing design system** — use exact colors, spacing, typography from existing components
2. **Reuse props** — follow established pattern props (`variant`, `size`, `state`, etc.)
3. **Place in** `src/app/components/` (shared, not in modules)
4. **Test consistency** — ensure it matches Page/Card/Button/Badge styling
5. **Document**: Add JSDoc with usage example

---

## 4. Safe Refactoring (PRESERVE BEHAVIOR 100%)

### ✅ Safe Operations
- **Rename** variables/functions for clarity (same logic)
- **Extract** duplicated code into helper functions (no behavior change)
- **Move** files to correct modules (update imports only)
- **Consolidate** similar types/enums (dedup same-content definitions)
- **Update** import paths to use aliases (no logic change)
- **Reorganize** code structure (reorder methods, functions; same behavior)
- **Add** documentation/comments (no runtime change)

### ❌ FORBIDDEN (WITHOUT CONFIRMING FIRST)
- Changing which components are displayed
- Altering API request/response handling
- Modifying business logic or algorithms
- Changing state management flow
- Adding/removing form fields
- Changing number formats, date formats, text rendering
- Removing or hiding UI elements
- Changing route handlers or middleware
- **Any** change that could affect end-user behavior

### Before Each Refactoring
1. **State explicitly:** "This change does NOT alter functionality"
2. **Explain why:** What improves (readability, maintainability, performance)?
3. **Verify after:** Run `npm run build` and confirm no new errors
4. **Test scenarios:** If a page moves, verify routes still work

---

## 5. SOLID Principles

### Single Responsibility
- Each module owns ONE actor's features (expert, org, admin, public, or shared domain)
- Each hook manages ONE concern (data fetching, form state, notification history)
- Each service provides ONE logical capability (email sending, permission checking)

**Apply:** When adding hooks or services, ask "Does this belong to one module, or is it shared?"

### Open/Closed
- Modules are **open for extension** (add new pages, hooks, services)
- **Closed for modification** (don't change another module's types, hooks, services — extend instead)

**Apply:** Use inheritance, composition, and provider patterns instead of modifying shared code.

### Liskov Substitution
- Custom hooks and services follow the same interface patterns
- Context providers are interchangeable (e.g., `LanguageContext`, `AuthContext`)

**Apply:** Don't create hook variants with different signatures — extend the existing hook or create a new one.

### Interface Segregation
- Components accept only the props they use (don't pass large objects when 2 props are needed)
- Hooks export only what callers need (not internal state)
- Types split by concern (e.g., separate DTO, Filter, and Response types)

**Apply:** Review props/exports before committing — remove unused parameters.

### Dependency Inversion
- Components depend on abstractions (contexts, custom hooks) not implementation
- Services inject dependencies (contexts passed as arguments)

**Apply:** Use React contexts and dependency injection over global state or direct imports.

---

## 6. Role-Based Access Control (RBAC)

### Account Types
```typescript
type AccountType = 'expert' | 'organization' | 'expert-organization' | 'admin' | 'public';
```

### Module Access Rules
| Module | expert | organization | expert-org | admin | public |
|--------|:------:|:------------:|:----------:|:-----:|:------:|
| Expert features | ✅ | ❌ | ✅ | ✅ | ❌ |
| Organization features | ❌ | ✅ | ✅ | ✅ | ❌ |
| Admin dashboard | ❌ | ❌ | ❌ | ✅ | ❌ |
| Tenders/Calls | ❌ | ✅ | ✅ | ✅ | ❌ |
| Projects | ✅ | ✅ | ✅ | ✅ | ❌ |
| Training | ✅ | ✅ | ✅ | ✅ | ❌ |
| Assistance | ✅ | ✅ | ✅ | ✅ | ✅ |

### Permission Checks
```typescript
// CORRECT — use permissions service
import { hasTendersAccess, hasExpertsAccess } from '@app/services/permissions.service';

if (hasTendersAccess(user?.accountType)) {
  // show tenders
} else {
  // show AccessDenied or redirect
}
```

### Rule: No Hardcoded Roles
✅ Always use `permissions.service.ts` functions — never hardcode role checks:
```typescript
// ❌ WRONG
if (accountType === 'admin' || accountType === 'expert-organization') { }

// ✅ CORRECT
if (hasAdminAccess(accountType)) { }
```

---

## 7. Internationalization (i18n)

### Translation Files
All translations live in `@app/i18n/` — one file per domain:
- `tenders.ts`, `projects.ts`, `experts.ts`, `organizations.ts`
- `training.ts`, `assistance.ts`, `offers.ts`
- `auth.ts`, `account.ts`, `permissions.ts`, etc.

### Usage Pattern
```typescript
import { useLanguage } from '@app/contexts/LanguageContext';

export default function MyComponent() {
  const { t } = useLanguage();
  
  return (
    <h1>{t('module.key.subkey')}</h1>
  );
}
```

### Translation Keys Structure
```typescript
export const myModuleTranslations = {
  en: {
    'mymodule.page.title': 'Title',
    'mymodule.button.submit': 'Submit',
    'mymodule.error.validation': 'Please fill all fields',
  },
  fr: {
    'mymodule.page.title': 'Titre',
    // ... French translations
  },
  es: {
    'mymodule.page.title': 'Título',
    // ... Spanish translations
  },
};
```

### Rule: Adding New Text
1. **Never hardcode text** — always use `t()` with a key
2. **Add key to i18n file** for all three languages (EN/FR/ES)
3. **Load translations** in `LanguageContext.tsx`

---

## 8. TypeScript & Typing

### DTO/Type Naming
```typescript
// ✅ CORRECT — clear, predictable names
export interface ExpertListDTO { }
export interface ExpertProfileDTO { }
export enum ExpertStatusEnum { }
export type PaginatedResponseDTO<T> = { }

// ❌ WRONG — vague names
export interface Expert { }
export interface ExpertProps { }
export type ApiResponse = { }
```

### Enums vs Union Types
```typescript
// Use ENUM for backend API values
export enum TenderStatusEnum {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

// Use UNION TYPE for local component state
type FilterMode = 'active' | 'archived' | 'all';
```

### Nullable vs Optional
```typescript
// ✅ Optional (property may not exist)
interface User {
  email?: string;
}

// ✅ Nullable (property exists but value is null)
interface Address {
  zip: string | null;
}
```

---

## 9. Best Practices Checklist

Before submitting code:

- [ ] **No relative imports** — all imports use `@app/*` or `@app/modules/*/*`
- [ ] **Design preserved** — no layout, color, spacing, or component behavior changes
- [ ] **i18n complete** — all user-facing text in translation files (EN/FR/ES)
- [ ] **RBAC checked** — permissions validated before showing features
- [ ] **Module correct** — file placed in right actor module (or shared if multi-use)
- [ ] **Types defined** — new data structures have DTOs/interfaces
- [ ] **Hooks clean** — custom hooks don't duplicate existing ones
- [ ] **Components reused** — no duplicate Button, Input, Card, etc.
- [ ] **Functionality unchanged** — behavior identical before/after
- [ ] **Build succeeds** — `npm run build` passes with 0 new errors
- [ ] **No unused imports** — clean up dead code

---

## 10. When to Ask for Clarification

Before proceeding:

1. **Moving a file?** → Confirm new location won't break imports
2. **Adding a hook?** → Check if one already exists (search `useX` in modules + `src/app/hooks/`)
3. **Changing a type?** → Verify no 10+ usages that will break
4. **Creating a component?** → Confirm design matches existing system
5. **Merging duplicate code?** → Ensure both uses are truly identical before deduping
6. **Adding a module?** → Only if the feature truly belongs to a new actor group
7. **Changing permission logic?** → Verify impact across all 5 account types

---

## 11. Quick Reference Commands

```bash
# Development
npm run dev              # Start dev server (Vite)
npm run build            # Production build
npm run type-check       # TypeScript validation (if added)

# Build must succeed with 0 new errors before committing
```

---

## Example Scenarios

### Scenario 1: Add Expert Feature Page
```typescript
// ✅ Create at: src/app/modules/expert/pages/ExpertNewFeature.tsx
// Imports:
import { useLanguage } from '@app/contexts/LanguageContext';
import { useExperts } from '@app/modules/expert/hooks/useExperts';
import { Button } from '@app/components/ui/button';
import { PageBanner } from '@app/components';
// Route: Add to App.tsx under /experts/... path
```

### Scenario 2: Consolidate Duplicate Types
```typescript
// ❌ Before: NotificationDTO defined in 3 files
// ✅ After: Single source in @app/types/notification.dto
// Update all imports: '@app/types/notification.dto'
// Verify: npm run build (0 errors), all 3 modules still work
```

### Scenario 3: Extract Duplicated Logic
```typescript
// ❌ Before: 2 hooks with identical filtering logic
// ✅ After: Create useFilteredList hook, both call it
// Location: @app/hooks/useFilteredList (shared, not actor-specific)
// Test: Both original hooks work identically to before
```

### Scenario 4: Fix Broken Import After Refactoring
```typescript
// ❌ File moved but old import path exists:
import { useExperts } from '../hooks/useExperts';
// ✅ Update to:
import { useExperts } from '@app/modules/expert/hooks/useExperts';
```

---

## Questions?

If something is ambiguous or conflicts with these guidelines:
1. Check the conversation summary for project context
2. Review the current file structure (may have evolved)
3. Ask for clarification before proceeding
4. Verify `npm run build` succeeds before closing the task

---

**Last Updated:** April 6, 2026  
**Project:** International Tender Collection App  
**Maintainers:** Development Team
