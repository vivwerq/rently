# Rently Codebase Refactoring Plan & Architecture Roadmap

> **Target**: Structural refactoring to eliminate monolithic CSS, oversized multi-concern components, and un-scoped styling while strictly preserving all branding, routes, interactions, category rules, and Apple HIG design schemes.

---

## 1. Executive Summary

Rently is an hyperlocal rental & circular economy marketplace built with React 19, TypeScript, and Vite. While feature-rich and visually polished (conforming to Apple Human Interface Guidelines and dark mode specifications), the codebase has accumulated architectural bloat:

- **Monolithic Styling**: `src/index.css` has grown to **6,309 lines (131.6 KB)** containing reset rules, design variables, utility classes, page layouts, carousels, responsive media queries, and component-specific modal styles all in one un-scoped file.
- **Oversized Components**:
  - `src/pages/HomePage.tsx` (1,110 lines): mixes category switching, carousel rendering, dynamic distance calculations, filter states, and 4 distinct transaction row layouts.
  - `src/App.tsx` (778 lines): handles route matching, URL normalization, state persistence, modal dispatching, and dev console toggles.
  - `src/components/Navbar.tsx` (763 lines): combines desktop navigation, capsule search bar rendering, mobile navigation drawer, account menu dropdown, and theme toggling.
- **Scattered Boundaries**: Search capsule bars and booking date modals were added with styles appended to the end of `index.css` rather than co-located with their feature directory.

To ensure stability and zero UI regressions, this refactoring follows a **5-Phase Incremental Strategy**, beginning with a safe, representative refactor of the search capsule and booking modal subsystem before touching core layout and page components.

---

## 2. Phase 0: Baseline Inventory & Audit

### 2.1 File Size & Code Distribution
- **Total Source Files**: 62 files (excluding configuration & root documentation)
- **Total Source Lines**: 19,442 lines
- **Total Stylesheet Lines**: 6,493 lines (`src/index.css`: 6,309 lines; `src/App.css`: 184 lines)

#### Top Largest Files
| File Path | Lines | Size (Bytes) | Primary Responsibility & Debt |
| :--- | :--- | :--- | :--- |
| `src/index.css` | 6,309 | 131,646 | Monolithic stylesheet containing global reset, tokens, navbar, carousels, modals, pages, and utility overrides. |
| `src/pages/HomePage.tsx` | 1,110 | 46,747 | HomePage orchestrator mixing hero, category switches, filter logic, distance slider, item cards. |
| `src/App.tsx` | 778 | 30,122 | Root router, state persistence, 6 modal coordinators, hash route normalizer. |
| `src/components/Navbar.tsx` | 763 | 28,124 | Desktop navbar, mobile hamburger drawer, locality dropdown, theme switcher. |
| `src/data/mockData.ts` | 683 | 32,593 | Localities array, initial mock listings, Haversine formula distance calculation. |
| `src/components/HeroCarousel.tsx` | 649 | 26,450 | Category-based auto-rotating hero slider, custom slide transitions. |
| `src/components/search/RentalDateRangeModal.tsx` | 425 | 15,317 | Dual-month interactive calendar, rental duration computation, rate promo banner. |

### 2.2 Production Bundle Baseline
Tested via `tsc -b && vite build` (Vite v8.3.4, React 19):
- **HTML**: `dist/index.html` — 1.68 kB (gzip: 0.91 kB)
- **Production CSS**: `dist/assets/index-Cs9RA24M.css` — **98.85 kB** (gzip: 16.60 kB)
- **Production JS**: `dist/assets/index-BH85AXgd.js` — **673.13 kB** (gzip: 179.25 kB)
- **Lint Status (`oxlint`)**: 0 errors, 13 warnings (React purity warning on `Date()`, React fast refresh note, unused error parameter).
- **Typecheck Status (`tsc -b`)**: 0 errors.

### 2.3 CSS Debt & Collision Hotspots
1. **Specificity Escalation**: 19 instances of `!important` across `index.css` to override active states, badge colors, and portal button colors.
2. **Repeated Media Queries**: 23 `@media` query blocks scattered throughout `index.css` with varying breakpoints (`max-width: 1024px`, `max-width: 900px`, `max-width: 768px`, `max-width: 680px`, `max-width: 480px`).
3. **Dead / Superseded Styles**: `src/App.css` (184 lines) is largely unused/superseded by `src/index.css`.
4. **Appended Feature CSS**: Lines 5294–6309 in `src/index.css` (~1,015 lines) were appended for the `RentalCapsuleBar`, `CitySelectorModal`, and `RentalDateRangeModal`, rather than being modularized in `src/components/search/`.

---

## 3. Target Architecture & Proposed Structure

The refactored architecture retains Vite + React 19 + TypeScript + Vanilla CSS without introducing unnecessary external CSS-in-JS runtimes or heavy abstraction frameworks. It establishes clear domain ownership:

```
src/
├── assets/                  # Static media, icons, brand marks
├── components/
│   ├── auth/                # AuthModal, LoginForm, PhoneOTPForm
│   ├── commerce/            # EquipmentRentalModal, ResaleInquiryModal, MakerOrderModal
│   ├── layout/              # Navbar (Desktop + Mobile Drawer), Footer, MobileBottomTabBar
│   ├── search/              # Search Capsule & Booking Date Cluster
│   │   ├── RentalCapsuleBar.tsx
│   │   ├── CitySelectorModal.tsx
│   │   ├── RentalDateRangeModal.tsx
│   │   ├── CityLandmarkIcons.tsx
│   │   ├── FilterSidebar.tsx
│   │   ├── ActiveFilterChips.tsx
│   │   ├── rentalSearch.css  # <-- Co-located styles for search & booking modals
│   │   └── index.ts          # Clean export barrel
│   ├── ui/                  # Reusable primitives (Modal, Button, Badge, RatingStars)
│   ├── CarQuoteModal.tsx
│   ├── HeroCarousel.tsx
│   ├── InspectionModal.tsx
│   └── MobileSimulatorView.tsx
├── context/                 # AuthContext, ThemeContext, CartContext
├── data/                    # mockData.ts (Localities & seed items)
├── pages/                   # Route-level screens (HomePage, SearchResults, Detail, Orders, etc.)
│   └── home/                # (Phase 3: HeroSection, CategoryBar, ListingRows)
├── services/                # API client, catalog service, geolocation
├── styles/                  # Foundation CSS layers
│   ├── tokens.css           # Canonical design tokens (:root and [data-theme="dark"])
│   ├── base.css             # Reset, typography, focus rings, reduced-motion
│   └── index.css            # Clean root stylesheet aggregating foundations
├── types/                   # Domain TypeScript models (listing, order, user)
└── utils/                   # Pure helper functions (formatters, storage)
```

---

## 4. Five-Phase Implementation Roadmap

### Phase 0: Inventory & Baseline (COMPLETED)
- [x] Measure source lines, file distribution, and bundle size.
- [x] Audit linting, build pipeline, and TypeScript validation.
- [x] Capture visual baseline screenshots (desktop light/dark, mobile viewport, category views).
- [x] Create comprehensive refactoring roadmap.

### Phase 1: Representative Refactor — Search & Booking Capsule Module (COMPLETED)
- [x] Extract lines 5294–6309 from `src/index.css` (~1,015 lines) into `src/components/search/rentalSearch.css`.
- [x] Co-locate styles with `RentalCapsuleBar.tsx`, `CitySelectorModal.tsx`, and `RentalDateRangeModal.tsx`.
- [x] Create clean module export in `src/components/search/index.ts`.
- [x] Validate bundle output, lint status, and run visual diff verification via browser subagent.

### Phase 2: CSS Foundations & Token Consolidation (COMPLETED)
- [x] Extract design tokens (`--surface-primary`, `--accent-indigo`, `--radius-lg`, typography, Apple HIG dark mode vars) into `src/styles/tokens.css`.
- [x] Extract CSS reset, base typography, scrollbar styling, and accessibility/reduced-motion rules into `src/styles/base.css`.
- [x] Audit and eliminate `src/App.css` (184 lines of obsolete code).
- [x] Wire `@import './styles/tokens.css';` and `@import './styles/base.css';` into canonical base layers.
- [x] Validate build output, lint status, and run visual diff verification across desktop light, dark mode, and mobile viewports.

### Phase 3: Component & Feature Boundaries (COMPLETED)
- [x] Split `src/pages/HomePage.tsx` (reduced from 1,111 to 318 lines, -71.4%):
  - `src/pages/home/CategoryShortcutsSection.tsx`
  - `src/pages/home/DriveTypesSection.tsx`
  - `src/pages/home/HowItWorksHomeSection.tsx`
  - `src/pages/home/KnowBeforeYouBookSection.tsx`
  - `src/pages/home/SecondaryCommerceSection.tsx`
  - `src/pages/home/SupplierInviteSection.tsx`
  - `src/pages/home/FaqHomeSection.tsx`
  - `src/pages/home/MarketplaceSection.tsx`
- [x] Split `src/components/Navbar.tsx` (reduced from 764 to 260 lines, -66.0%):
  - `src/components/layout/NavUserDropdown.tsx`
  - `src/components/layout/NavbarMobileDrawer.tsx`
- [x] Validate build output, lint status, and verify with browser subagent.

### Phase 4: Dead Code & Modular Stylesheet Pruning (COMPLETED)
- [x] Extracted domain stylesheets from monolithic `src/index.css`:
  - `src/pages/home/homeSections.css` (626 lines)
  - `src/components/ui/uiPrimitives.css` (515 lines)
  - `src/components/heroCarousel.css` (600 lines)
  - `src/components/welcomePrompt.css` (348 lines)
  - `src/components/layout/footer.css` (115 lines)
  - `src/components/commerce/commerce.css` (407 lines)
- [x] Reduced `src/index.css` from 6,309 lines to **2,543 lines** (-59.7% reduction).
- [x] Pruned unused template assets (`src/assets/react.svg`, `src/assets/vite.svg`) and unreferenced `src/App.css` (185 lines).
- [x] Resolved all compiler purity and fast-refresh warnings:
  - Extracted `useAuth` hook into `src/context/useAuth.ts` and `AuthContext` into `src/context/authContextDef.ts`.
  - Replaced synchronous `useEffect` state synchronization with React 19 render-time state resets.
  - Reduced `oxlint` warnings from 13 down to **0 warnings and 0 errors** across 90 files.

### Phase 5: Comprehensive Integration & Verification (COMPLETED)
- [x] Full-spectrum verification across all marketplace categories, transaction types, and devices:
  - **Self-Drive Cars**: Verified dynamic rates, kilometre package switching (Standard 120km vs Extended 300km), transparent price breakdowns, and keyboard/modal dismissals.
  - **Room & Study Gear**: Verified rental duration computation, category filters, and student pricing.
  - **Pre-Loved Resale**: Verified condition tags ("Like New", "Good"), defect disclosures, and inquiry modals.
  - **Maker Lab 3D Printing**: Verified custom artisan specifications, material selections, and lead times.
  - **Student Pass & Account**: Verified CU student credentials, 50% deposit waiver, and address sync.
  - **Theme Switcher**: Verified seamless switching between Apple HIG Light Mode and Deep Obsidian Dark Mode.
- [x] Production build validation: `tsc -b && vite build` built cleanly in 602ms with 0 type errors.
- [x] Browser session recordings and visual artifacts captured in `.system_generated/` and artifact repository.
