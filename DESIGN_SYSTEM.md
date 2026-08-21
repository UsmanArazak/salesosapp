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

## 2. Color Tokens & Visual Weight
- **Primary Accent (`#fd6701` / `var(--accent)`)**: Buttons, CTAs, active pills. NEVER small body text on white.
- **Subtle Status Pills (No Over-Saturated Fills)**: Secondary info like `In Stock` must NOT flood the UI with heavy green boxes. Use subtle, small text with a soft dot (e.g. `🟢 12 in stock` or soft grey chip) so key actions stand out cleanly.
- **Primary Text (`#373435` / `var(--text-primary)`)**: Headings, body text, numbers.
- **Card Surface & Border Radius**: Cards use `rounded-2xl` (`16px`). Do NOT use overly bulbous `rounded-[24px]` for list cards. Cards sit on soft grey surfaces (`#f4f5f7` / `var(--bg-card)`).

## 3. In-App Notifications & Confirmations (NO NATIVE POPUPS)
- **NO `window.alert()` or `window.confirm()` popups**: Default browser dialogs look cheap and unprofessional.
- Always use **in-card inline confirm states** (e.g. inline *"Archive item? [Cancel] [Archive]"*) or styled in-app banner/toast notifications.
