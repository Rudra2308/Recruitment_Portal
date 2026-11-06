# Malati Group Recruitment Portal --- White / Orange Design Language System

**Version:** 5.0\
**Brand:** Malati Group\
**Visual Direction:** Industrial Precision × Modern Engineering\
**Primary Theme:** White surfaces with Malati Orange accents\
**Reference Basis:** Existing recruitment portal design language +
supplied Malati Group brand assets

------------------------------------------------------------------------

## 1. Design Vision

The redesigned Malati Group website should feel like a modern
engineering company rather than a generic corporate website.

The visual language combines:

-   **Clean white space** for clarity and premium presentation.
-   **Malati Orange** as the primary visual accent.
-   **Dark charcoal / near-black** for engineering credibility and
    strong typography.
-   **Geometric forms** inspired by the angular Malati Group `M` mark.
-   **Industrial imagery** used as controlled background context rather
    than decoration.
-   **Precision layouts** with strong alignment, measured spacing and
    restrained effects.
-   **Minimal UI chrome** so the company, manufacturing capability and
    recruitment content remain the focus.

### Core design statement

> **Precision in structure. Energy in orange. Clarity in white.**

The design should communicate:

**Engineering → Precision → Reliability → Manufacturing → Scale**

------------------------------------------------------------------------

# 2. Brand Personality

The interface should consistently express five characteristics.

  -----------------------------------------------------------------------
  Characteristic                      UI Expression
  ----------------------------------- -----------------------------------
  **Industrial**                      Strong geometry, technical
                                      photography, structured grids

  **Precise**                         Consistent spacing, sharp
                                      alignment, controlled typography

  **Modern**                          Large whitespace, clean cards,
                                      restrained motion

  **Confident**                       Bold headlines, orange accents,
                                      large visual sections

  **Human**                           Clear language, approachable
                                      application flow, simple
                                      interactions
  -----------------------------------------------------------------------

Avoid making the website look like:

-   a generic HR portal
-   a flashy startup landing page
-   an automotive dealership website
-   a dark cyberpunk interface
-   a template-heavy corporate site

------------------------------------------------------------------------

# 3. Visual Reference Interpretation

The supplied Malati Group assets establish a clear visual direction.

## 3.1 Logo Geometry

The Malati logo is built around a symmetrical angular `M` construction.

Use this geometry as a subtle design motif:

-   angled section separators
-   triangular / chevron accents
-   clipped image corners
-   geometric background patterns
-   directional arrows
-   architectural grid intersections
-   subtle watermark shapes

The logo geometry should **inspire the interface**, not be repeated
everywhere.

### Rule

Do not place large decorative `M` shapes behind every section.

Use the geometry selectively at approximately **5--15% visual opacity**
when used as a background motif.

------------------------------------------------------------------------

# 3.5 Primary Logo — Mandatory Brand Asset

The supplied **orange Malati `M` mark** is the **main and primary logo for the website**.

Use this exact logo as the default brand mark throughout the website. Do not substitute it with the older metallic/silver version, a text-only `MALATI GROUP` treatment, or an independently recreated interpretation.

## Primary Logo Asset

The primary logo is the orange angular **Malati `M` symbol on a white background**, as supplied in the current brand assets.

### Logo hierarchy

```text
PRIMARY
Orange Malati M mark
        ↓
SECONDARY
Malati Group wordmark / full lockup
        ↓
UTILITY
Monochrome variants where required
```

### Mandatory implementation rules

- Treat the supplied **orange `M` logo as the main website logo**.
- Use the supplied logo asset rather than recreating the geometry with CSS, SVG primitives, text, or a different icon.
- Preserve the original proportions and geometry.
- Never stretch, squash, rotate, skew, crop, or otherwise distort the logo.
- Do not recolor the primary logo arbitrarily.
- Do not apply gradients, shadows, glow effects, bevels, outlines, or other effects to the primary logo.
- Keep sufficient clear space around the logo so surrounding UI does not visually merge with it.
- On white and light surfaces, use the primary orange logo.
- If the logo is placed on a dark surface and the supplied primary asset does not provide sufficient contrast, use an approved monochrome/alternate brand asset rather than modifying the primary logo.
- The logo must remain visually identifiable at every responsive breakpoint.
- Do not use the logo as a generic decorative pattern. The logo itself is a brand identifier.

### Header

The primary orange `M` logo should be the default logo displayed in the main navigation.

Recommended treatment:

```text
[ ORANGE MALATI M ]    About   Capabilities   Industries   Careers   Contact
```

The logo should remain the strongest brand anchor in the header without overpowering the navigation.

### Footer

The primary logo may be used in the footer, with the appropriate light/dark variant selected according to the footer background.

### Favicon / compact contexts

Use the **orange `M` mark** as the preferred compact brand identifier where its scale remains legible.

### Logo clear space

Maintain a minimum clear space approximately equal to the height of the inner lower orange stroke around the mark.

Never place:

- text directly against the logo
- buttons touching the logo
- decorative lines through the logo
- other icons overlapping the logo

### Logo sizing

The logo should scale proportionally.

Recommended website ranges:

```text
Desktop header: 36–52px mark height
Mobile header: 30–40px mark height
Footer: 40–64px mark height
Favicon / compact: platform-defined
```

Do not make the logo unnecessarily large simply to fill empty space.

### Brand consistency rule

**The orange Malati `M` mark is the source of truth for the website's primary visual identity.**

All other logo treatments are supporting variants, not replacements for the primary logo.

---

# 4. Color System

## 4.1 Primary Palette

  -------------------------------------------------------------------------------
  Token            CSS Variable                            Value Usage
  ---------------- ----------------------- --------------------- ----------------
  **Malati         `--color-brand`                     `#F4512A` Primary CTA,
  Orange**                                                       highlights,
                                                                 active states

  **Orange Deep**  `--color-brand-dark`                `#D83B1E` Hover / pressed
                                                                 states

  **Orange Light** `--color-brand-light`               `#FFF1EC` Highlight
                                                                 surfaces, badges

  **White**        `--color-white`                     `#FFFFFF` Main page
                                                                 background

  **Off White**    `--color-surface`                   `#F7F7F5` Alternate
                                                                 sections, cards

  **Ink**          `--color-ink`                       `#171717` Main text,
                                                                 headings

  **Charcoal**     `--color-charcoal`                  `#262626` Dark sections,
                                                                 secondary text

  **Muted**        `--color-muted`                     `#6B6B6B` Supporting text

  **Line**         `--color-line`                      `#E5E5E5` Borders and
                                                                 dividers
  -------------------------------------------------------------------------------

### Recommended hierarchy

``` text
WHITE
│
├── Ink / Charcoal
│   └── Primary typography
│
├── Malati Orange
│   └── Action + emphasis
│
└── Light Orange
    └── Supporting visual state
```

------------------------------------------------------------------------

# 5. Orange Usage Rules

Orange is the **brand signal**, not the default background color.

### Use orange for

-   primary CTA buttons
-   active navigation states
-   section eyebrows
-   important statistics
-   links on hover
-   progress indicators
-   selected filters
-   application status
-   small geometric accents
-   key words in hero typography
-   timeline indicators
-   visual separators

### Do not use orange for

-   every heading
-   every card
-   large blocks of body text
-   entire page backgrounds
-   every border
-   excessive gradients
-   decorative elements with no functional purpose

### Recommended visual ratio

A typical page should visually read approximately as:

**70--80% white / off-white**\
**15--25% charcoal / dark content**\
**5--10% orange accent**

Orange should therefore feel **valuable and intentional**.

------------------------------------------------------------------------

# 6. Optional Orange Gradient

Gradients are permitted only as a brand enhancement.

Preferred:

``` css
background:
  linear-gradient(
    135deg,
    #F4512A 0%,
    #FF7A35 100%
  );
```

Use gradients for:

-   hero accent shapes
-   selected CTA treatments
-   large visual highlights
-   subtle logo-inspired elements

Do not use gradients on every button or card.

The default brand color remains solid **`#F4512A`**.

------------------------------------------------------------------------

# 7. Typography

The existing system uses Inter. Retain **Inter** as the primary UI
typeface.

``` css
font-family:
  Inter,
  ui-sans-serif,
  system-ui,
  -apple-system,
  "Segoe UI",
  sans-serif;
```

## 7.1 Type Scale

  Role                   Size     Weight   Tracking
  ---------------- ---------- ---------- ----------
  Hero Display       52--72px   600--700    -0.04em
  Hero Mobile        36--46px   600--700   -0.035em
  H1                 32--42px   600--700    -0.03em
  H2                 24--30px        600   -0.025em
  H3                 17--20px        600   -0.015em
  Body Large         16--18px        400     normal
  Body               14--16px        400     normal
  Label              11--12px        600    +0.12em
  Caption            11--13px   400--500     normal
  Technical / ID     11--12px        500     normal

### Typography principle

Headlines should have **large visual authority**.

Body copy should remain compact and readable.

Do not create a page where every element competes for attention.

------------------------------------------------------------------------

# 8. Heading Style

Headlines should generally be:

-   short
-   bold
-   left aligned
-   high contrast
-   tightly spaced

Preferred structure:

``` text
BUILDING
WHAT MOVES
INDUSTRY
```

or:

``` text
ENGINEERED
FOR PRECISION.
```

Use orange to emphasize a selected word rather than coloring the
complete heading.

Example:

``` text
Engineering
<span class="text-brand">Precision</span>
```

------------------------------------------------------------------------

# 9. Layout Philosophy

The layout follows a **large editorial grid** rather than a collection
of equally sized cards.

## Desktop

-   Maximum content width: **1200--1280px**
-   Side padding: **32--48px**
-   Large section spacing
-   Strong horizontal alignment
-   Wide hero compositions
-   Asymmetric image/text layouts where appropriate

## Tablet

-   Maximum width: **960--1100px**
-   Side padding: **24--32px**

## Mobile

-   Side padding: **18--20px**
-   Avoid horizontal overflow
-   Stack visual compositions
-   Maintain generous vertical rhythm

------------------------------------------------------------------------

# 10. Spacing System

Use an 8-point structural grid with a 4-point micro-grid.

``` text
4px
8px
12px
16px
24px
32px
40px
48px
64px
80px
96px
120px
```

### Recommended section spacing

Desktop:

``` text
80–120px
```

Mobile:

``` text
56–80px
```

Large visual sections may use up to:

``` text
144px
```

Spacing should create **calmness and hierarchy**.

------------------------------------------------------------------------

# 11. Corner Radius

The brand assets contain strong geometric/angular forms, so UI corners
should remain restrained.

  Component                  Radius
  ------------------------ --------
  Inputs                        6px
  Small buttons                 6px
  Standard buttons              7px
  Cards                        10px
  Large image containers       12px
  Modal                        12px
  Pills                       999px

Do not use excessive rounded cards.

The website should feel engineered rather than playful.

------------------------------------------------------------------------

# 12. Borders & Dividers

Use thin neutral borders.

``` css
border: 1px solid #E5E5E5;
```

Orange borders are reserved for:

-   selected states
-   active cards
-   important status indicators
-   focus states

Avoid thick decorative borders.

------------------------------------------------------------------------

# 13. Shadows

Use shadows sparingly.

Preferred:

``` css
box-shadow:
  0 8px 30px rgba(0, 0, 0, 0.06);
```

For elevated cards:

``` css
box-shadow:
  0 12px 40px rgba(0, 0, 0, 0.08);
```

Never use heavy black shadows.

The visual hierarchy should primarily come from:

**spacing + typography + contrast + geometry**

rather than shadows.

------------------------------------------------------------------------

# 14. Hero System

The homepage hero is the primary opportunity to establish the Malati
identity.

## Hero structure

Recommended:

``` text
[Small orange eyebrow]

MAIN ENGINEERING
HEADLINE
WITH ORANGE
ACCENT

Supporting company statement.

[Primary CTA] [Secondary CTA]

                         [Industrial image]
```

### Hero principles

-   Large typography
-   White or near-white base
-   Orange accent
-   Strong industrial image
-   Generous whitespace
-   Minimal navigation clutter

### Hero image treatment

Industrial photographs should not simply be placed as generic
rectangles.

Preferred treatments:

-   clipped geometric corners
-   subtle white overlay
-   orange accent line
-   asymmetrical crop
-   controlled grayscale / low-saturation treatment
-   logo-inspired angular mask

------------------------------------------------------------------------

# 15. Industrial Photography

Photography is an important part of the new design language.

Use imagery showing:

-   foundry operations
-   CNC/VMC machining
-   metal casting
-   factory interiors
-   engineering teams
-   inspection
-   manufacturing equipment
-   precision components
-   finished castings

## Image treatment

Images should feel:

**real → technical → premium → industrial**

Avoid generic stock photography where possible.

### Overlay

For dark photographic sections:

``` css
background:
  linear-gradient(
    rgba(17,17,17,0.15),
    rgba(17,17,17,0.55)
  );
```

For light editorial sections, use the image naturally with a thin orange
or charcoal framing element.

------------------------------------------------------------------------

# 16. Navigation

The navigation should be minimal.

### Desktop structure

``` text
MALATI GROUP

About
Capabilities
Industries
Careers
Contact

                 [Apply / Contact]
```

Logo remains the strongest visual anchor.

### Navigation behavior

-   White background by default
-   Thin bottom border
-   Dark text
-   Orange active indicator
-   Orange hover state
-   Sticky on scroll
-   Compact height after scrolling

Avoid oversized navigation bars.

------------------------------------------------------------------------

# 17. Navigation Active State

Preferred:

``` text
Careers
───────
```

Use a short orange underline or small orange indicator.

Do not use:

-   glowing navigation
-   large filled pills
-   animated blobs
-   excessive shadows

------------------------------------------------------------------------

# 18. Buttons

Buttons should feel precise and deliberate.

## Primary

``` text
[ APPLY NOW → ]
```

``` css
background: #F4512A;
color: #FFFFFF;
border: 1px solid #F4512A;
```

Hover:

``` css
background: #D83B1E;
```

## Secondary

``` text
[ EXPLORE CAPABILITIES ]
```

``` css
background: #171717;
color: #FFFFFF;
```

## Outline

``` text
[ VIEW DETAILS ]
```

``` css
background: transparent;
color: #171717;
border: 1px solid #D8D8D8;
```

Hover:

``` text
Orange border + orange text
```

------------------------------------------------------------------------

# 19. Button Geometry

Minimum touch target:

``` text
44px
```

Desktop primary button:

``` text
Height: 44–48px
Padding: 0 20–24px
Radius: 6–7px
```

Button typography:

``` text
12–13px
600
Uppercase or sentence case
```

Use arrows sparingly.

Preferred directional symbols:

``` text
→
↗
```

------------------------------------------------------------------------

# 20. Cards

Cards should not dominate the interface.

Use cards when information needs grouping.

### Standard card

``` text
White surface
1px border
10px radius
24px padding
Subtle hover elevation
```

### Orange accent card

Use an orange vertical bar or small top accent instead of making the
whole card orange.

Example:

``` text
| ORANGE ACCENT

ENGINEERING
CAPABILITY

Description...
```

------------------------------------------------------------------------

# 21. Capability / Manufacturing Sections

Manufacturing capability should feel technical and structured.

Example:

``` text
01
CNC / VMC MACHINING

High-precision machining
for demanding industrial
components.

[ VIEW CAPABILITY → ]
```

Use numbered sections:

``` text
01
02
03
04
```

Numbers may use orange.

This creates a technical editorial rhythm.

------------------------------------------------------------------------

# 22. Statistics

Large statistics should be treated as engineering metrics.

Example:

``` text
25+
YEARS

50K+
CASTINGS

X+
CUSTOMERS

X+
INDUSTRIES
```

Recommended treatment:

-   large dark number
-   small orange indicator
-   uppercase label
-   generous whitespace
-   thin separators

Avoid giant colorful dashboard widgets.

------------------------------------------------------------------------

# 23. Industry Sections

Industry cards should use photography and structured metadata.

Example:

``` text
AUTOMOTIVE
Precision components
for demanding vehicle
applications.

→ EXPLORE
```

Possible industries:

-   Automotive
-   Engineering
-   Industrial Equipment
-   Infrastructure
-   Heavy Machinery
-   Other served sectors

Use orange only for the active or highlighted interaction.

------------------------------------------------------------------------

# 24. Careers / Recruitment Design

The recruitment portal should inherit the new visual language without
becoming visually identical to the corporate homepage.

### Candidate experience

The application flow remains:

``` text
POSITION
   ↓
PERSONAL DETAILS
   ↓
EXPERIENCE
   ↓
CV
   ↓
REVIEW
   ↓
SUBMIT
```

The current no-login and dynamic branching principles remain valid.

------------------------------------------------------------------------

# 25. Recruitment Hero

Preferred structure:

``` text
BUILD YOUR
CAREER AT
MALATI.

Engineering careers
built around precision,
learning and responsibility.

[ VIEW OPEN POSITIONS ]
```

Use orange on:

``` text
CAREER
MALATI
APPLY
```

only where useful.

------------------------------------------------------------------------

# 26. Job Cards

Job listings should be highly scannable.

Example:

``` text
PRODUCTION

CNC MACHINE OPERATOR

Pune / Plant
Full Time
0–3 Years

[ VIEW POSITION → ]
```

The card should clearly distinguish:

-   department
-   job title
-   location
-   employment type
-   experience
-   action

------------------------------------------------------------------------

# 27. Application Form

The form should retain the existing **zero-friction** principle.

Use:

-   white background
-   dark typography
-   orange progress indicator
-   clear field labels
-   minimal borders
-   large touch targets

Progress:

``` text
01 ━━━━━ 02 ━━━━━ 03 ━━━━━ 04
```

Completed steps use orange.

------------------------------------------------------------------------

# 28. Form Focus States

Default:

``` css
border: 1px solid #E5E5E5;
```

Focus:

``` css
border-color: #F4512A;
box-shadow: 0 0 0 3px #FFF1EC;
```

Error:

``` css
border-color: #D83B1E;
```

Success:

``` css
border-color: #17694A;
```

------------------------------------------------------------------------

# 29. Status System

Brand status:

``` text
NEW
```

Orange.

Success:

``` text
SHORTLISTED
SELECTED
```

Green.

Pending:

``` text
UNDER REVIEW
```

Amber.

Neutral:

``` text
CLOSED
REJECTED
```

Gray.

The status system should remain semantically distinct from the primary
orange brand color.

------------------------------------------------------------------------

# 30. Dark Sections

Dark sections are allowed and should provide contrast against the white
majority.

Use:

``` css
background: #171717;
color: #FFFFFF;
```

Orange remains the accent.

Ideal locations:

-   footer
-   manufacturing statement
-   major CTA section
-   selected capability section
-   company positioning statement

Avoid making the entire website dark.

------------------------------------------------------------------------

# 31. Footer

Footer should feel substantial but clean.

Suggested structure:

``` text
MALATI GROUP

Engineering precision.
Manufacturing capability.

Company
Capabilities
Industries
Careers
Contact

--------------------------------

© Malati Group
Privacy
Terms
```

Use a dark charcoal background with orange micro-accents.

------------------------------------------------------------------------

# 32. Geometric Motif System

Derived from the Malati `M` logo.

Approved motifs:

### Chevron

``` text
──────╲
       ╲
       ╱
──────╱
```

### Angular corner

``` text
┌────
│
│
```

### Split diagonal

``` text
╲
 ╲
  ╲
```

### Repeated engineering lines

Use multiple thin diagonal lines with very low opacity.

These should appear as **background structure**, not foreground content.

------------------------------------------------------------------------

# 33. Background Patterns

Optional background pattern:

``` css
background-image:
  linear-gradient(
    135deg,
    rgba(244,81,42,0.035) 1px,
    transparent 1px
  );
```

Or use subtle angular polygons.

Opacity should remain low:

``` text
2–6%
```

The pattern must never compete with text.

------------------------------------------------------------------------

# 34. Motion Language

Animation should communicate interaction, not decoration.

### Default transition

``` css
transition:
  150ms ease;
```

### Large visual reveal

``` text
300–500ms
```

### Approved interactions

-   button color transition
-   card elevation
-   image scale 1.02--1.04
-   navigation indicator
-   section reveal
-   progress advancement

Avoid:

-   parallax-heavy pages
-   constant floating animations
-   spinning machinery graphics
-   excessive page transitions
-   decorative particle systems

------------------------------------------------------------------------

# 35. Image Hover

For capability and industry imagery:

``` css
transform: scale(1.02);
```

Duration:

``` text
300ms
```

Overlay may transition from transparent to:

``` text
rgba(244,81,42,0.08)
```

The effect should remain subtle.

------------------------------------------------------------------------

# 36. Iconography

Icons should be:

-   line-based
-   geometric
-   simple
-   technical
-   consistent in stroke width

Recommended:

``` text
1.5–2px stroke
```

Use icons for:

-   location
-   experience
-   industry
-   machinery
-   contact
-   navigation

Do not mix multiple icon styles.

------------------------------------------------------------------------

# 37. Technical Visual Language

Small technical labels can reinforce the engineering identity.

Examples:

``` text
MG / ENGINEERING
01 — PRECISION
02 — QUALITY
03 — SCALE
```

or:

``` text
SYSTEM / 01
PROCESS / CNC
STATUS / ACTIVE
```

These should be used sparingly.

They are visual flavor, not required information.

------------------------------------------------------------------------

# 38. Accessibility

Maintain WCAG-oriented accessibility standards.

### Contrast

Normal text:

``` text
≥ 4.5:1
```

Large text:

``` text
≥ 3:1
```

Orange should not be used as the only indicator of state.

Combine orange with:

-   text
-   icons
-   borders
-   labels
-   position

### Focus

Every interactive element must have a visible focus state.

------------------------------------------------------------------------

# 39. Responsive Behavior

## Desktop

Use:

-   split hero layouts
-   large imagery
-   horizontal capability sections
-   multi-column grids

## Tablet

Use:

-   2-column grids
-   reduced hero typography
-   smaller navigation spacing

## Mobile

Use:

-   single-column layout
-   stacked CTAs
-   horizontal scrolling where appropriate
-   18--20px page padding
-   44px minimum touch targets

### Mobile principle

Do not simply shrink the desktop design.

**Recompose it.**

------------------------------------------------------------------------

# 40. Design Rules --- Do / Don't

## Do

-   Use white as the dominant canvas.
-   Use orange as a deliberate accent.
-   Use real industrial imagery.
-   Use large confident typography.
-   Use geometric details derived from the logo.
-   Maintain generous whitespace.
-   Keep layouts aligned and precise.
-   Make recruitment flows fast and simple.
-   Use dark sections for contrast.
-   Keep interactions subtle.

## Don't

-   Cover pages in orange.
-   Use generic SaaS gradients.
-   Use excessive rounded cards.
-   Use glassmorphism.
-   Use neon effects.
-   Use excessive shadows.
-   Overuse the logo as decoration.
-   Make every section look like a card grid.
-   Use orange for every heading.
-   Add animation without purpose.

------------------------------------------------------------------------

# 41. Page-Level Composition

A typical corporate page should follow:

``` text
NAVIGATION
     ↓
HERO
     ↓
COMPANY / CAPABILITY STATEMENT
     ↓
KEY METRICS
     ↓
CAPABILITIES / INDUSTRIES
     ↓
INDUSTRIAL IMAGE STORY
     ↓
CAREERS / CTA
     ↓
FOOTER
```

A recruitment page:

``` text
NAVIGATION
     ↓
CAREER HERO
     ↓
WHY MALATI
     ↓
OPEN POSITIONS
     ↓
HIRING PROCESS
     ↓
EMPLOYEE / CULTURE SECTION
     ↓
APPLICATION CTA
     ↓
FOOTER
```

------------------------------------------------------------------------

# 42. CSS Token Reference

``` css
:root {
  --color-brand: #F4512A;
  --color-brand-dark: #D83B1E;
  --color-brand-light: #FFF1EC;

  --color-white: #FFFFFF;
  --color-surface: #F7F7F5;

  --color-ink: #171717;
  --color-charcoal: #262626;
  --color-muted: #6B6B6B;
  --color-line: #E5E5E5;

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --radius-xl: 12px;
  --radius-pill: 999px;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 40px;
  --space-8: 48px;
  --space-9: 64px;
  --space-10: 80px;
  --space-11: 96px;
  --space-12: 120px;

  --container-max: 1280px;

  --font-sans:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    "Segoe UI",
    sans-serif;

  --transition-fast: 150ms ease;
  --transition-standard: 300ms ease;
}
```

------------------------------------------------------------------------

# 43. Developer Implementation Rules

The design language must be implemented as reusable tokens rather than
isolated page-specific values.

### Required

-   CSS variables for colors
-   reusable button components
-   reusable typography classes
-   reusable card primitives
-   consistent container widths
-   responsive spacing tokens
-   accessible focus states
-   reusable status components
-   image aspect-ratio utilities
-   reduced-motion support

### Avoid

``` text
Random hex values
Random border radii
Random shadows
Page-specific typography
Page-specific orange shades
Inconsistent button heights
```

------------------------------------------------------------------------

# 44. Brand Asset Usage

The Malati Group logo should remain visually dominant wherever it
appears.

### Full logo

Use for:

-   header
-   footer
-   official documents
-   recruitment portal branding

### Mark only

Use for:

-   favicon
-   compact navigation
-   loading states
-   small brand identifiers
-   subtle watermark

### Monochrome logo

Use where the background or production context requires a single-color
treatment.

### Orange logo

Use primarily against:

-   white
-   off-white
-   very dark neutral backgrounds where contrast is sufficient

Never distort the logo.

Never change its proportions.

Never apply arbitrary effects.

------------------------------------------------------------------------

# 45. Visual Priority System

Every page should have a clear hierarchy:

``` text
LEVEL 1
Main message / CTA

LEVEL 2
Supporting statement / key capability

LEVEL 3
Information / metadata

LEVEL 4
Technical details / secondary actions
```

Orange should primarily reinforce **Level 1 and selected Level 2
elements**.

------------------------------------------------------------------------

# 46. Final Design Principle

The new Malati Group interface should feel like the digital equivalent
of a precision-engineered component.

Every element should appear:

**Measured.**

**Intentional.**

**Reliable.**

**Modern.**

The visual identity is not created by using orange everywhere.

It is created by using **white space, precision, geometry, typography,
industrial imagery and controlled orange accents together**.

> **Malati Group --- Industrial Precision, presented with modern
> clarity.**
