# SalesOS UI Design System Rules

All UI components and page restyles in SalesOS MUST strictly follow these design rules:

## 1. Iconography Standards (STRICT)
- **NO EMOJIS (`📦`, `📁`, `🔍`, `💡`, `💵`, `🏦`, `💳`) in UI components or cards.**
- **Chunky Solid SVGs Only**: All icons must use solid filled SVG paths (`fill="currentColor"`, 20x20 or 24x24). Outline stroke icons (`stroke="currentColor"`) are not allowed.
- **Soft Tinted Icon Circles**: Every icon sits inside a 36–40px circular background (`rounded-full`):
  - **Success / Money-In**: `var(--icon-success-bg)` / `var(--icon-success-text)` (Green tint)
  - **Warning / Debt / Pending**: `var(--icon-warning-bg)` / `var(--icon-warning-text)` (Amber tint)
  - **Danger / Low Stock / Error**: `var(--icon-danger-bg)` / `var(--icon-danger-text)` (Red tint)
  - **Accent / Action**: `var(--icon-accent-bg)` / `var(--icon-accent-text)` (Orange tint)
  - **Neutral / Default**: `var(--icon-neutral-bg)` / `var(--icon-neutral-text)` (Light grey tint)

## 2. Color Tokens
- **Primary Accent (`#fd6701` / `var(--accent)`)**: Buttons, CTAs, active pills. NEVER small body text on white.
- **Accent Surface (`#fdece2` / `var(--accent-dim)`)**: Background for chips, badges, mobile active pills. Text: `#a34419`.
- **Primary Text (`#373435` / `var(--text-primary)`)**: Headings, body text, numbers.
- **Surface / Cards (`#f4f5f7` / `var(--bg-card)`)**: Cards are NEVER plain white on white. Soft grey background with `rounded-[24px]` and `boxShadow: var(--card-shadow)`.

## 3. Card Separation & Layout
- List items (Sales, Products, Customers, Expenses, Cart items) MUST be rendered as **physically separated floating cards** (`space-y-3` or `space-y-2.5`) with `rounded-[24px]` and `background: var(--bg-card)`.
- Corner Radius: Cards `rounded-[24px]`, Buttons/Inputs `rounded-2xl`, Badges `rounded-xl`.
