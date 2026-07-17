# CLAUDE.md — Frontend Website Rules

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If reference is internal (own design): refine for clarity and conversion without changing structure
- If no reference image: design from scratch with high craft (see guardrails below).
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.

## Local Server
- **Always serve on localhost** — never screenshot a `file:///` URL.
- Start the dev server: `node serve.mjs` (serves the project root at `http://localhost:3000`)
- `serve.mjs` lives in the project root. Start it in the background before taking any screenshots.
- If the server is already running, do not start a second instance.

## Screenshot Workflow
- Puppeteer is installed at `C:/Users/nateh/AppData/Local/Temp/puppeteer-test/`. Chrome cache is at `C:/Users/nateh/.cache/puppeteer/`.
- **Always screenshot from localhost:** `node screenshot.mjs http://localhost:3000`
- Screenshots are saved automatically to `./temporary screenshots/screenshot-N.png` (auto-incremented, never overwritten).
- Optional label suffix: `node screenshot.mjs http://localhost:3000 label` → saves as `screenshot-N-label.png`
- `screenshot.mjs` lives in the project root. Use it as-is.
- After screenshotting, read the PNG from `temporary screenshots/` with the Read tool — Claude can see and analyze the image directly.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px"
- Check: spacing/padding, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing

## Output Defaults
- Single `index.html` file, all styles inline, unless user says otherwise
- Tailwind CSS via CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive

## Brand Assets
- Always check the `brand_assets/` folder before designing. It may contain logos, color guides, style guides, or images.
- If assets exist there, use them. Do not use placeholders where real assets are available.
- If a logo is present, use it. If a color palette is defined, use those exact values — do not invent brand colors.

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.). Pick a custom brand color and derive from it.
- **Shadows:** Never use flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Typography:** Never use the same font for headings and body. Pair a display/serif with a clean sans. Apply tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`. Use spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Images:** Add a gradient overlay (`bg-gradient-to-t from-black/60`) and a color treatment layer with `mix-blend-multiply`.
- **Spacing:** Use intentional, consistent spacing tokens — not random Tailwind steps.
- **Depth:** Surfaces should have a layering system (base → elevated → floating), not all sit at the same z-plane.

## Conversion Rules (CRITICAL)


- One goal per section
- Always show next step
- Keep friction low

Primary CTA:
→ Book Appointment / Book Self-Care

Secondary CTA:
→ Social follow (community section only)

## Unique Touch Brand Feel

-- Warm, not loud  
- Confident, not flashy  
- Elegant, not overdesigned  
- Human, not corporate  

Speak like:
→ A trusted beautician who understands you  

Not like:
→ A marketing agency or generic salon

### Core Emotion
- Calm
- Intimate
- Personal
- Trustworthy
- Effortless luxury

The brand should feel like:
→ A moment of care, not a transaction  
→ A safe space, not a service list  
→ A personal connection, not a business

## Motion & Interaction Principles

- Motion should guide attention, not decorate
- Prefer scroll-based transitions over autoplay animations
- Use motion to indicate progress (steps, flows, transformation)
- Keep animations slow, smooth, and intentional
- Avoid multiple competing animations on screen
- One dominant motion per section

## 🧩 Signature Section (Services)

- This section is the primary conversion point and must drive bookings immediately  
- Use a center-focused card system with one dominant service and supporting side cards  
- Each service must clearly show name, price, and a simple benefit  
- Include category filters to help users quickly find what they need  
- Interaction should feel guided: scroll or drag to explore services naturally  
- Always provide a clear “Book Now” CTA as the next step  


## Copywriting Style

- Speak directly to the client
- Keep sentences short
- Focus on feelings + outcomes

Use:
- “You”
- Emotional language (confidence, care, relaxation)

Avoid:
- Buzzwords
- Long explanations"

## Hard Rules
- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design — match it
- Do not stop after one screenshot pass
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color

---

## Design System — Tokens & Components

These are the confirmed, implemented values from the live site. Use them exactly.

### CSS Custom Properties (`:root`)
```css
--bg:         #0A0906   /* page background */
--bg-card:    #161310   /* card surfaces */
--gold:       #C9A84C   /* primary accent */
--gold-light: #E0C46A   /* hover / wipe reveal */
--gold-dim:   rgba(201,168,76,0.12)   /* subtle gold tint */
--cream:      #F4EDD6
--white:      #FFFFFF
--muted:      rgba(255,255,255,0.52)
--dim:        rgba(255,255,255,0.28)
```

### Typography Scale
| Role | Family | Weight | Size |
|---|---|---|---|
| Display / hero title | Cinzel | 400 | `clamp(5rem, 10.278vw, 148px)` |
| Section heading | Cinzel | 400 | varies by section |
| Body / UI | Montserrat | 300–600 | — |
| Hero tagline | Montserrat | 400–600 italic | `32px` |
| Hero sub | Montserrat | 300–400 | `16px` |
| Nav / buttons | Montserrat | 500 | `0.6875rem` |
| Small labels | Montserrat | 400–500 | `0.625rem–0.8125rem` |

- Load via Google Fonts: `Cinzel:wght@400;500` + `Montserrat:wght@300;400;500;600`

### Easings (named)
| Name | Value | Use |
|---|---|---|
| Spring | `cubic-bezier(0.22,0.8,0.32,1)` | Cards, reveal animations |
| Overshoot | `cubic-bezier(0.34,1.56,0.64,1)` | Badges, pop elements |
| Sharp-out | `cubic-bezier(0.65,0,0.076,1)` | Button pill expand |
| Button-wipe | `cubic-bezier(0.65,0,0.35,1)` | Primary/secondary button hover (0.55s) |
| Material | `cubic-bezier(0.4,0,0.2,1)` | Nav, menu icon, general UI |

### Glass-Card Token
Reusable token for any frosted panel surface (menu, modals, overlays):
```css
background: rgba(0,0,0,0.10);
backdrop-filter: blur(35px);
-webkit-backdrop-filter: blur(35px);
border-radius: 20px;
border: 1px solid rgba(201,168,76,0.75);
box-shadow: 0 8px 32px rgba(0,0,0,0.45);
```

### Hero Card
The main hero framing card — used as the reference shape for scroll transitions:
```css
position: absolute; top: 0; left: 24px; right: 24px; bottom: 0;
border-radius: 0 0 16px 16px;
border: 1px solid rgba(212,175,55,0.5);
box-shadow: 0 0 20px rgba(212,175,55,0.5);
overflow: hidden;
```

---

## Button Components

### Primary Button — `btn-gold`
Arrow LEFT at rest; color-fill wipes left→right on hover; arrow slides to RIGHT.

**HTML structure (required):**
```html
<a class="btn-gold">
  <span class="btn-arrow"><!-- arrow SVG 14×14 --></span>
  <span class="btn-label">LABEL TEXT</span>
</a>
```

**CSS:**
```css
.btn-gold {
  position: relative; display: inline-flex; align-items: center; justify-content: center;
  font-family: 'Montserrat', sans-serif; font-size: 0.6875rem; font-weight: 500;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--bg); background: var(--gold);
  padding: 10px 32px; border-radius: 100px;
  text-decoration: none; overflow: hidden; isolation: isolate;
}
.btn-gold::before {
  content: ''; position: absolute; inset: 0;
  background: var(--gold-light);
  clip-path: inset(0 100% 0 0); border-radius: inherit;
  transition: clip-path 0.55s cubic-bezier(0.65,0,0.35,1); z-index: 0;
}
.btn-gold:hover::before { clip-path: inset(0 0% 0 0); }
.btn-gold .btn-arrow {
  position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
  z-index: 1; transition: left 0.55s cubic-bezier(0.65,0,0.35,1);
}
.btn-gold:hover .btn-arrow { left: calc(100% - 26px); }
.btn-gold .btn-label { position: relative; z-index: 1; }
```

Arrow SVG (14×14):
```html
<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
  <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
```

### Secondary Button — `btn-ghost`
Arrow-only pill at rest; pill stretches to engulf label on hover. Same gold color throughout.

**HTML structure (required):**
```html
<a class="btn-ghost">
  <span class="btn-arrow"><!-- arrow SVG 14×14 --></span>
  <span class="btn-label">LABEL TEXT</span>
</a>
```

**CSS:**
```css
.btn-ghost {
  position: relative; display: inline-flex; align-items: center;
  height: 2.25rem;
}
.btn-ghost::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0;
  width: 2.25rem; background: var(--gold); border-radius: 100px;
  transition: width 0.55s cubic-bezier(0.65,0,0.35,1); z-index: 0;
}
.btn-ghost:hover::before { width: 100%; }
.btn-ghost .btn-arrow {
  position: relative; z-index: 1;
  width: 2.25rem; height: 2.25rem;
  display: flex; align-items: center; justify-content: center;
}
.btn-ghost .btn-label {
  position: relative; z-index: 1;
  padding: 0 0.875rem 0 0.5rem;
  color: var(--white); font-size: 0.875rem; font-weight: 500;
  transition: color 0.3s ease 0.1s;
}
.btn-ghost:hover .btn-label { color: var(--bg); }
```

---

## Nav Component

**Layout:** `[ buller-list.svg  MENU ]` (top-left) · `[ → BOOK MY APPOINTMENT ]` (top-right)
- No logo. Menu button opens frosted glass panel.
- Panel reveal: width expands RIGHT (0→320px, 0.32s), then height expands DOWN (0→340px, 0.36s)
- Panel close: height collapses first, then width
- Panel uses glass-card token + gold border

**Menu link hover:** text turns `var(--gold)`, arrow slides in from left, text nudges right

---

## Video Badge (Hero)

- Ring SVG: 164×164px — text path r=74, center 82,82
- Video circle: 160×160px, `border-radius: 50%`, thin gold border `rgba(201,168,76,0.45)`
- Text: `⬩ Scroll to Open ⬩ Scroll to Open` — 24px / weight 300 (light), "Scroll" words = 500 (medium)
- Rotation: `22s linear infinite` via `@keyframes vb-spin`
- Autoplay: IntersectionObserver on `#hero` (threshold 0.25), not on page load

---

## Preloader

- Full-screen `#0A0906` overlay, z-index 1000
- Layout: `UNIQUE · (progress circle 80×80) · TOUCH` centered horizontally
- "Beauty Salon" above TOUCH (Cinzel, ~34px, rgba(255,255,255,0.88))
- Counter: GSAP 0→100%, simultaneously fills SVG `stroke-dasharray: 220.9`
- Exit: 0.35s pause → secondary text fades → UNIQUE+TOUCH FLIP to hero positions → ellipse morphs to hero card → preloader fades
- Hero starts `visibility:hidden; opacity:0`, revealed during preloader exit

---

## Video Reveal Section (`#video-reveal`)

Inserted between `#hero` and `#services`. Height: `300vh`. GSAP ScrollTrigger pinned.
- `scrub: 1.5` (weighted scroll lag = premium feel)
- Badge expands from 160×160 circle → `calc(100vw - 48px) × calc(100vh - 48px)` rectangle, `border-radius: 16px`
- Gold border + glow animate in proportionally during expansion
- Vignette overlay, video scale settle 1.04→1.0, audio control at 95%

---

## Asset Naming Convention (`brand_assets/`)
| Purpose | Filename |
|---|---|
| Hero background | `herobg-.webp` |
| Hero video | `hero-video.mp4` |
| Massage card | `massage-card.webp` |
| Wax card | `wax-card.webp` |
| Lashes card | `lashes-card.webp` |
| Nails card | `nails-card.webp` |
| Makeup card | `makeup-card.webp` |
| Facials card | `facials-card.webp` |
| Courses bg | `coursebg-.webp` |
| Reviews bg | `reviewsbg.webp` |
| Footer bg | `footerbg-.webp` |
| Bullet icon | `buller-list.svg` (gold ellipse cross) |

**Image loading attributes:**
- Hero bg: `loading="eager" fetchpriority="high" decoding="async"`
- All others: `loading="lazy" decoding="async"`
