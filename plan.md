# Plan: Expert Search & My Experts for Organisations

## What we're building
- Two new pages: `ExpertSearchPage.tsx` and `MyExpertsPage.tsx` in `src/app/modules/expert/pages/`
- Add routes in `App.tsx`: `experts/search` and `experts/my-experts`
- Update `ExpertsSubMenu.tsx` to add "Expert Search" and "My Experts" tabs (org/admin only)
- Add translation keys to `src/app/i18n/experts.ts`

## Existing patterns to reuse
- ExpertsDatabase.tsx — filter sidebar + result cards + pagination
- expertSearch.service.ts — `ExpertSearchFilters`, `searchExperts()`, `getExpertPreview()`
- expertSearchFilters.ts — `SECTOR_GROUPS`, `COUNTRY_GROUPS`, `NATIONALITY_OPTIONS`, etc.
- CVCreditsContext — `useCVCredits()` for download status
- PageBanner + PageContainer + ExpertsSubMenu — standard layout
- SubMenu pattern via ExpertsSubMenu.tsx

## Routes
- `experts/search` → ExpertSearchPage
- `experts/my-experts` → MyExpertsPage

## SubMenu tabs (org/admin only)
- Expert Search → /experts/search
- My Experts → /experts/my-experts

## Status: IMPLEMENTING
