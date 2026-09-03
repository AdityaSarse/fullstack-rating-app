# Store Ratings Platform — UI Design Spec

**Stack:** React + Tailwind CSS
**Direction:** Clean, minimal SaaS — quiet neutral surfaces, one accent color reserved for ratings and primary actions.

---

## 1. Concept

Three different people use this product and each wants something different from it in the first five seconds:

- **Admin** wants scale at a glance — counts, tables, filters.
- **Normal user** wants to browse and rate stores quickly — this should feel light and almost consumer-facing, closer to a review app than an admin panel.
- **Store owner** wants one number (their average) and the people behind it.

The design language stays consistent across all three (same tokens, same components), but density and layout shift per role. The star is the only piece of color-as-meaning in the system — it always means "rating," never decoration. Everything else is neutral ink-on-stone so the star (and your primary actions) are the only things that pop.

---

## 2. Color System

Warm-neutral base (not pure gray, not cold blue-gray) with a single amber accent tied to ratings.

| Token | Hex | Use |
|---|---|---|
| `bg` | `#FAFAF9` | Page background |
| `surface` | `#FFFFFF` | Cards, tables, modals |
| `surface-raised` | `#FFFFFF` + shadow-sm | Popovers, dropdowns |
| `border` | `#E7E5E4` | Dividers, table lines, input borders |
| `border-strong` | `#D6D3D1` | Focus-adjacent borders, active table row |
| `text-primary` | `#1C1917` | Headings, primary content |
| `text-secondary` | `#57534E` | Body copy, labels |
| `text-muted` | `#A8A29E` | Placeholders, timestamps, disabled |
| `accent` (gold) | `#F5A524` | Filled stars, primary rating emphasis |
| `accent-hover` | `#DC8F0B` | Accent hover/active state |
| `accent-subtle` | `#FEF3E2` | Accent background wash (badges, selected state) |
| `success` | `#15803D` | Confirmations, "saved" states |
| `success-subtle` | `#F0FDF4` | Success banner background |
| `danger` | `#DC2626` | Errors, destructive actions |
| `danger-subtle` | `#FEF2F2` | Error banner background |

**Role badge colors** (used only on the badge chip, nowhere else — keeps roles scannable in tables without theming the whole page):

| Role | Text | Background |
|---|---|---|
| System Administrator | `#4338CA` | `#EEF2FF` |
| Store Owner | `#0F766E` | `#F0FDFA` |
| Normal User | `#57534E` | `#F5F5F4` |

Tailwind config extend:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: '#FAFAF9',
        surface: '#FFFFFF',
        border: { DEFAULT: '#E7E5E4', strong: '#D6D3D1' },
        ink: { primary: '#1C1917', secondary: '#57534E', muted: '#A8A29E' },
        accent: { DEFAULT: '#F5A524', hover: '#DC8F0B', subtle: '#FEF3E2' },
        success: { DEFAULT: '#15803D', subtle: '#F0FDF4' },
        danger: { DEFAULT: '#DC2626', subtle: '#FEF2F2' },
        role: {
          admin: { text: '#4338CA', bg: '#EEF2FF' },
          owner: { text: '#0F766E', bg: '#F0FDFA' },
          user: { text: '#57534E', bg: '#F5F5F4' },
        },
      },
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
}
```

---

## 3. Typography

One family, doing all the work: **Manrope** (Google Fonts, free). It's a geometric sans with slightly more character than Inter, still fully legible at small sizes in tables — good for a data-dense app that shouldn't feel cold.

Use `font-variant-numeric: tabular-nums` on any numeric column (ratings, counts) so digits align in tables.

| Role | Size / Line-height | Weight | Tailwind |
|---|---|---|---|
| Page title | 24px / 32px | 600 | `text-2xl font-semibold` |
| Section heading | 18px / 28px | 600 | `text-lg font-semibold` |
| Card stat (big number) | 32px / 36px | 700 | `text-3xl font-bold tabular-nums` |
| Body | 14px / 20px | 400 | `text-sm` |
| Label / form label | 13px / 18px | 500 | `text-[13px] font-medium` |
| Table header | 12px / 16px | 500 | `text-xs font-medium` (sentence case, not all-caps) |
| Caption / timestamp | 12px / 16px | 400, `text-ink-muted` | `text-xs` |

Avoid all-caps labels and tracked-out eyebrows — sentence case throughout, including table headers. Line length for any paragraph copy (empty states, helper text): keep under ~70 characters.

---

## 4. Layout

**Admin** — sidebar-driven, dense, table-first:

```
┌──────────┬─────────────────────────────────────┐
│          │  Dashboard                            │
│  Logo    │  ┌────────┐ ┌────────┐ ┌────────┐    │
│          │  │ Users  │ │ Stores │ │ Ratings│    │
│ Dashboard│  └────────┘ └────────┘ └────────┘    │
│ Users    │                                        │
│ Stores   │  Stores                    [+ Add]     │
│          │  [Search] [Filter▾]                    │
│ ⎋ Logout │  ┌───────────────────────────────┐    │
│          │  │ Name │ Email │ Address │ Rating│    │
│          │  └───────────────────────────────┘    │
└──────────┴─────────────────────────────────────┘
```

Fixed left sidebar, 240px, `surface` background with a right `border`. Content area max-width unconstrained (admin wants density) but with 32px padding.

**Normal user** — top bar, card-grid browsing, feels lighter:

```
┌─────────────────────────────────────────────────┐
│  Logo          [Search stores...]      Avatar ▾  │
├─────────────────────────────────────────────────┤
│  Stores                                           │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐       │
│  │ Store name│ │ Store name│ │ Store name│       │
│  │ Address   │ │ Address   │ │ Address   │       │
│  │ ★★★★☆ 4.2 │ │ ★★★☆☆ 3.1 │ │ ★★★★★ 5.0 │       │
│  │ Your: ★★★☆☆│ │ Your: —   │ │ Your: ★★★★★│      │
│  └───────────┘ └───────────┘ └───────────┘       │
└─────────────────────────────────────────────────┘
```

Top bar only, no sidebar — this role never needs deep navigation. Content constrained to `max-w-6xl mx-auto`, centered. Store cards in a responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).

**Store owner** — top bar, single-focus dashboard:

```
┌─────────────────────────────────────────────────┐
│  Logo                                  Avatar ▾  │
├─────────────────────────────────────────────────┤
│  Your store                                       │
│  ┌─────────────────────────┐                     │
│  │      ★ 4.3               │  ← big number,     │
│  │   avg. of 128 ratings    │    accent color     │
│  └─────────────────────────┘                     │
│  Recent ratings                                   │
│  ┌───────────────────────────────┐               │
│  │ User │ Rating │ Date          │               │
│  └───────────────────────────────┘               │
└─────────────────────────────────────────────────┘
```

Same top bar as normal user (shared shell, different nav items), content `max-w-4xl mx-auto` — this role has one job, so don't give it admin-width sprawl.

**Grid/spacing scale:** 4px base unit. Page padding 32px desktop / 16px mobile. Card padding 20px. Gap between cards/table rows 16px.

---

## 5. Components

**Buttons**
- Primary: `bg-accent text-white hover:bg-accent-hover`, 8px radius, 10px/16px padding, `font-medium text-sm`. Use for the single most important action per screen (Submit rating, Save, Add store).
- Secondary: `bg-white border border-border text-ink-primary hover:bg-stone-50`.
- Destructive: `text-danger border border-danger/30 hover:bg-danger-subtle` (outline, not filled — destructive actions shouldn't be the loudest thing on screen).
- Disabled: `opacity-40 cursor-not-allowed`, no hover state.

**Inputs**
- `border border-border rounded-lg px-3 py-2 text-sm`, focus: `ring-2 ring-accent/30 border-accent`.
- Label above field, `text-ink-secondary`, 6px gap.
- Error state: `border-danger`, helper text below in `text-danger text-xs` — be specific ("Must be 8–16 characters" not "Invalid password").
- Password field: show a live checklist (length, uppercase, special char) rather than a single error after submit — this form has three simultaneous rules and users shouldn't have to guess which one failed.

**Star rating (the one recurring motif)**
- Filled: `text-accent`. Empty: `text-stone-200`. Never any other color for stars.
- Interactive rating (click-to-rate): stars at 20px, hover fills up to cursor position, click commits. Show the numeric value next to it in `tabular-nums` once set.
- Static display rating: stars at 14px inline with the numeric average, e.g. `★★★★☆ 4.2 (128)`.

**Table**
- Header row: `bg-stone-50 text-ink-secondary text-xs font-medium border-b border-border`, sentence case.
- Row: `border-b border-border`, hover `bg-stone-50`. Row height 48px — enough to breathe without wasting the density admins want.
- Sortable header: small chevron appears on hover, filled chevron when active. No underline-on-hover gimmicks.
- Empty state inside table: centered, one line ("No stores match your filters"), `text-ink-muted`, with a text-link to clear filters.

**Badge / role chip**
- `rounded-full px-2.5 py-0.5 text-xs font-medium`, colors per role table in section 2.

**Card (stat card, store card)**
- `bg-surface border border-border rounded-xl p-5`. Shadow only on hover-interactive cards (store cards you can click into), not on static stat cards — reserve elevation for things that respond to interaction.

**Modal**
- Used for "Add user / Add store" (admin) and "Update password." Max-width 480px, centered, `rounded-xl`, backdrop `bg-black/30`.
- Title + close (×) in header, footer right-aligned with secondary then primary button.

**Toast / inline alert**
- Success: `bg-success-subtle text-success border border-success/20`.
- Error: `bg-danger-subtle text-danger border border-danger/20`.
- Toasts auto-dismiss at 4s, top-right, one at a time (queue, don't stack).

---

## 6. Screen notes

- **Login/Signup:** centered card, `max-w-sm`, no sidebar/topbar chrome at all — this is the one screen that should feel calm and empty. Logo above the card, not inside it.
- **Admin dashboard:** three stat cards (Users / Stores / Ratings) using the big-number card style, no charts needed — a challenge like this doesn't need decorative graphs, plain numbers are more honest.
- **Admin listings (Users/Stores):** filter row directly above the table (Name/Email/Address/Role as simple inputs + a role `<select>`), not in a separate drawer — keeps filter-and-scan in one glance.
- **Store detail (admin viewing a Store Owner):** same detail layout as any user, with an extra "Rating" row shown only for that role — don't build a separate page template for it.
- **Normal user store browser:** search bar in the top bar (global, always visible), not a separate search page. Each card shows overall rating and the user's own rating distinctly labeled ("Your rating") so it's never confused with the aggregate.

---

## 7. Accessibility floor

- All interactive elements keyboard-reachable, visible focus ring (`ring-2 ring-accent/40`), never `outline-none` without a replacement.
- Color is never the only signal: role badges and star ratings always pair color with text/shape (the star glyph itself, the role name in the chip).
- Contrast: `text-ink-secondary` (#57534E) on white passes AA for body text; don't go lighter than that for anything readable.
- Form errors announced via `aria-describedby` linking input to its error message.
