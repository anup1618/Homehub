---
name: HomeHub
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45464d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#0b1c30'
  on-tertiary-container: '#75859d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style
The design system is anchored in **Professional Modernism**, balancing high-end real estate authority with approachable digital efficiency. The target audience includes discerning homebuyers and professional real estate investors who value clarity, precision, and a premium "white-glove" digital experience.

The visual language emphasizes:
- **Trust & Stability:** Grounded by a deep, authoritative primary palette.
- **Precision:** Through generous whitespace, mathematical alignment, and refined typography.
- **Vitality:** Using a vibrant emerald accent to signal action and growth.

The aesthetic utilizes a blend of **Minimalism** and **Modern Corporate** styles, focusing on high-quality imagery and a structured hierarchy that removes friction from the property search process.

## Colors
This design system utilizes a sophisticated, high-contrast palette to establish a premium feel.

- **Primary (Slate Navy):** Used for headlines, primary navigation, and core brand elements to convey depth and reliability.
- **Secondary (Emerald):** A vibrant accent reserved for primary calls-to-action, success states, and key interactive highlights.
- **Neutral (Slate/Gray):** A range of cool grays used for secondary text, borders, and subtle background layering to maintain a clean, airy feel.
- **Backgrounds:** Pure white is used for primary content cards and containers, while an off-white `neutral` hex is used for page backgrounds to reduce glare and add a sense of luxury.

## Typography
The system uses **Inter** exclusively to ensure a systematic, utilitarian, yet modern appearance. 

- **Headlines:** Set with tighter letter-spacing and heavier weights to create a strong visual anchor.
- **Body Text:** Optimised for readability with a generous 1.5-1.6 line-height.
- **Labels:** Used for metadata (e.g., property features like "3 BED • 2 BATH") should be set in medium weight with slight tracking for professional clarity.
- **Hierarchy:** Ensure a clear distinction between property titles (Headline-MD) and price points (Headline-LG) to guide the user's eye toward the most critical data first.

## Layout & Spacing
The design system employs a **Fixed Grid** model for desktop to maintain a premium, editorial feel, transitioning to a fluid model for mobile devices.

- **Desktop (1280px+):** 12-column grid with 24px gutters and 48px side margins.
- **Tablet (768px - 1279px):** 8-column fluid grid with 24px margins.
- **Mobile (Below 768px):** 4-column fluid grid with 16px margins.

Spacing follows a strict 8px linear scale. Use `lg` (48px) for section vertical padding to emphasize the "premium" spaciousness of the brand. Property listings should be presented in a 3-column layout on desktop, moving to a single column on mobile.

## Elevation & Depth
Depth is communicated through **Tonal Layers** and extremely subtle **Ambient Shadows**.

- **Level 0 (Background):** Used for the main canvas, typically the off-white neutral color.
- **Level 1 (Cards/Surface):** Pure white surfaces with a 1px border in `surface_subtle` to provide definition without heaviness.
- **Level 2 (Hover/Active):** An ultra-soft shadow (Y: 4px, Blur: 20px, 4% Opacity) to indicate interactivity.
- **Level 3 (Modals/Filters):** Higher elevation with a more pronounced, diffused shadow to pull the element forward from the property map or gallery.

Avoid heavy drop shadows or glows; the goal is a flat, architectural appearance where depth is felt rather than seen.

## Shapes
The shape language is **Rounded**, reflecting a balance between professional structure and a welcoming home environment.

- **Standard Elements:** Buttons, input fields, and small cards use a 0.5rem (8px) radius.
- **Large Containers:** Property cards and image galleries use a 1rem (16px) radius to soften the high-resolution architectural photography.
- **Interactive Icons:** Search icons and social buttons may use a full pill shape (rounded-full) to provide a distinct visual contrast from functional data fields.

## Components
Consistent component styling ensures the real estate browsing experience feels unified and high-end.

- **Property Cards:** Feature a large aspect-ratio image (3:2) at the top with a subtle "Heart" icon overlay for favorites. Text content should be padded with `md` (24px) spacing, showing price in `headline-md` and address in `body-md`.
- **Search Filters:** Horizontal bar with segmented controls. Use `surface_subtle` backgrounds for inactive states and `primary` for active selections. Use clean icons for "Bed," "Bath," and "Price Range."
- **Buttons:** 
  - *Primary:* Emerald background, white text, 8px radius. 
  - *Secondary:* Transparent with a 1px Slate Navy border.
- **Image Gallery:** Implement a large hero image with a "View All Photos" floating button in the bottom right. Thumbnails should maintain a 1:1 aspect ratio with a 4px gap.
- **Chips:** Small, low-contrast tags for property status (e.g., "New Construction," "Open House") using `label-md` typography.
- **Input Fields:** Large, 48px height fields with a 1px border. Focus states should use a 2px Emerald ring.