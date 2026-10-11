---
name: Aetheris Prime
colors:
  surface: '#101415'
  surface-dim: '#101415'
  surface-bright: '#363a3b'
  surface-container-lowest: '#0b0f10'
  surface-container-low: '#191c1e'
  surface-container: '#1d2022'
  surface-container-high: '#272a2c'
  surface-container-highest: '#323537'
  on-surface: '#e0e3e5'
  on-surface-variant: '#c6c6cd'
  inverse-surface: '#e0e3e5'
  inverse-on-surface: '#2d3133'
  outline: '#909097'
  outline-variant: '#45464d'
  surface-tint: '#bec6e0'
  primary: '#bec6e0'
  on-primary: '#283044'
  primary-container: '#0f172a'
  on-primary-container: '#798098'
  inverse-primary: '#565e74'
  secondary: '#44e2cd'
  on-secondary: '#003731'
  secondary-container: '#03c6b2'
  on-secondary-container: '#004d44'
  tertiary: '#4de082'
  on-tertiary: '#003919'
  tertiary-container: '#001d0a'
  on-tertiary-container: '#00954b'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#62fae3'
  secondary-fixed-dim: '#3cddc7'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005047'
  tertiary-fixed: '#6dfe9c'
  tertiary-fixed-dim: '#4de082'
  on-tertiary-fixed: '#00210c'
  on-tertiary-fixed-variant: '#005227'
  background: '#101415'
  on-background: '#e0e3e5'
  surface-variant: '#323537'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 84px
    fontWeight: '700'
    lineHeight: 92px
    letterSpacing: -0.02em
  display-sm:
    fontFamily: Playfair Display
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 38px
  body-xl:
    fontFamily: Montserrat
    fontSize: 20px
    fontWeight: '400'
    lineHeight: 32px
    letterSpacing: 0.02em
  body-md:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Montserrat
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.15em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 32px
  margin-mobile: 24px
  margin-desktop: 64px
  section-gap: 128px
---

## Brand & Style
The design system embodies an **Avant-Garde Luxury** aesthetic, specifically tailored for ultra-high-net-worth individuals in the real estate tech space. It disrupts the traditional "beige and gold" luxury tropes by leaning into a futuristic, tech-forward "Midnight Neon" palette.

The style is a hybrid of **High-End Editorial** and **Hyper-Modern Glassmorphism**. It utilizes expansive whitespace, cinematic imagery, and glowing interactive elements to evoke a sense of exclusivity and technological superiority. The emotional response is one of awe, precision, and "Elite Digital Craftsmanship."

## Colors
This design system utilizes a "Deep Space" foundation with high-energy accents.

- **Primary (Midnight Slate):** Used for the core background and structural surfaces. It provides the canvas for high-contrast light effects.
- **Secondary (Electric Teal):** The primary action color, used for CTA buttons, primary icons, and active states.
- **Tertiary (Neon Mint):** Used sparingly for highlights, success states, and price fluctuations to maintain a tech-forward "Pulse."
- **Glass Surfaces:** Built using white or teal at 5-10% opacity with a 24px-40px background blur to create depth without clutter.
- **Text:** Primary headings use Neutral (#f8fafc). Secondary text uses a muted slate (#94a3b8) to maintain hierarchy.

## Typography
The typography strategy relies on the tension between the classic elegance of **Playfair Display** and the wide, geometric modernity of **Montserrat**.

- **Display & Headlines:** Always Playfair Display. Use tight letter-spacing for large displays to create a high-fashion masthead feel.
- **Body Text:** Montserrat with generous tracking (+1% to +2%) to ensure legibility and a sense of "breathable luxury."
- **Labels:** Use "Label-Caps" for property categories and metadata to create a structured, architectural feel.
- **Contrast:** High-contrast serif headlines should often overlap or sit closely to immersive imagery to bridge the gap between content and interface.

## Layout & Spacing
The design system follows a **Fluid-Fixed Hybrid** model. While the content is constrained to a 1440px max-width container, the background elements and glassmorphic panels often bleed to the edges of the viewport to maximize the "immersive" feel.

- **Grid:** A 12-column grid with wide 32px gutters to allow high-end imagery room to breathe.
- **Rhythm:** Spacing is aggressive. Section gaps are significantly larger (128px+) than standard SaaS applications to signal "Luxury Scale."
- **Mobile:** Margins remain generous at 24px. Multi-column grids collapse into a single-column aesthetic that prioritizes full-bleed vertical imagery.

## Elevation & Depth
This design system eschews traditional shadows in favor of **Luminous Depth**. 

- **Glassmorphism:** Depth is created through semi-transparent layers. The "Surface" layer uses a 10% white tint with a 32px background blur. The "Elevated" layer (modals/drawers) uses a 15% white tint with a 64px blur.
- **Glows:** Instead of drop shadows, use "Outer Glows" for active elements. A soft, 20% opacity teal blur (#2dd4bf) should emanate from primary CTA buttons.
- **Borders:** Surfaces are defined by a 1px "Inner Stroke" using a linear gradient (Top-Left: White 20% to Bottom-Right: White 0%) to simulate the edge of a glass pane.

## Shapes
The shape language is ultra-soft and organic, contrasting with the technical color palette. 

- **Primary Radius:** 32px (rounded-xl) for all main property cards and structural containers.
- **Pill Shapes:** Used for all buttons and status tags to emphasize the "fluid" and approachable nature of the technology.
- **Consistency:** Avoid sharp corners entirely. Even input fields and secondary elements should maintain a minimum of 16px radius to ensure a consistent premium feel.

## Components
Consistent styling across components reinforces the disruptive luxury theme.

- **Primary Buttons:** Pill-shaped, Electric Teal (#2dd4bf) background with Midnight Slate text. Add a subtle teal glow on hover.
- **Glass Cards:** 32px corner radius, background blur (40px), 1px gradient border. Titles within cards should be Playfair Display.
- **Input Fields:** Semi-transparent midnight background, 1px white (10%) border, 16px radius. On focus, the border transitions to a Teal-to-Mint gradient.
- **Immersive Lists:** List items are separated by wide gaps (16px) rather than lines, using glassmorphic backgrounds to define the row area.
- **Price Chips:** High-contrast Neon Mint (#4ade80) text on a blurred dark background, using Montserrat Bold for maximum impact.
- **Property Hero:** Always full-bleed with a bottom-to-top dark gradient overlay to ensure text legibility while maintaining image dominance.