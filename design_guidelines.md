# InnovaUz - Innovatsion Ishlanmalar Portali: Design Guidelines

## Design Approach

**Reference-Based Approach** inspired by modern content platforms like Medium, Notion, and LinkedIn - combining clean typography, card-based layouts, and professional aesthetics suitable for an innovation showcase portal.

**Design Principles:**
1. Content-first hierarchy with strong typographic system
2. Clean, professional appearance reflecting innovation and progress
3. Card-based modular design for flexible content display
4. Spacious layouts emphasizing readability and visual breathing room

## Core Design Elements

### A. Typography

**Font Family:** Inter or Onest (Uzbek-optimized, modern sans-serif via Google Fonts)

**Type Scale:**
- Headings: 3xl (36px), 2xl (24px), xl (20px), lg (18px) - font-semibold to font-bold
- Body: base (16px) - font-normal, line-height relaxed (1.625)
- Captions/Meta: sm (14px), xs (12px) - font-medium
- Emphasis: Use font-semibold for article titles in cards, font-bold for main headings

### B. Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Common paddings: p-4, p-6, p-8
- Section spacing: py-12, py-16, py-20
- Card gaps: gap-6, gap-8
- Container max-width: max-w-7xl for main content, max-w-4xl for article reading

**Grid System:**
- Homepage: 3-column grid for featured items (lg:grid-cols-3, md:grid-cols-2, grid-cols-1)
- Article cards: 2-column for listings (lg:grid-cols-2)
- Categories: 4-column for category badges (lg:grid-cols-4)

### C. Component Library

**Navigation:**
- Sticky header with logo left, main nav center, language/user right
- Nav items: "Bosh sahifa", "Innovatsiyalar", "Maqolalar", "Yangiliklar", "G'oyalar", "Biz haqimizda", "Aloqa"
- Search bar integrated into header (expandable on mobile)

**Content Cards:**
- Elevated cards with subtle shadow (shadow-md on hover: shadow-lg)
- Image ratio: 16:9 for article thumbnails, 4:3 for news items
- Card structure: Image → Category badge → Title (text-xl font-semibold) → Meta (author, date, read time) → Excerpt (2 lines) → "Batafsil" link

**Hero Section:**
- Large featured innovation slider/carousel (h-96 to h-[32rem])
- Overlay gradient on images for text readability
- Buttons on images: backdrop-blur-sm bg-white/20 treatment
- Hero text: Large heading (text-4xl to text-5xl), supporting text below

**Category Filters:**
- Pill-shaped filter buttons with hover states
- Active state with filled background
- Horizontal scroll on mobile

**Article Detail Page:**
- Max-width prose container (max-w-4xl)
- Featured image full-width at top
- Author card with avatar, name, publish date
- Social share buttons (Telegram, Facebook, LinkedIn, Twitter) - icon-only, subtle styling
- Rich text content with proper heading hierarchy
- Related articles section at bottom (3-column grid)
- Comment section with nested replies support

**Forms:**
- Input fields: border-2 with focus ring
- Spacing: space-y-4 for form groups
- Labels: text-sm font-medium mb-2
- Contact form: 2-column layout (name/email side-by-side, message full-width)

**Admin Panels:**
- Sidebar navigation (w-64) with collapsed mobile state
- Dashboard cards showing statistics
- Rich text editor for article creation (Quill or TinyMCE inspired styling)
- File upload areas with drag-drop visual indication
- Data tables with sortable columns, pagination

**File Gallery:**
- Masonry grid for images
- List view with icons for documents (PDF, DOCX, PPTX)
- File cards showing: icon, name, size, upload date, download button

**Footer:**
- 4-column layout: About, Quick Links, Categories, Contact & Social
- Newsletter subscription form (email input + submit)
- Social media icons row
- Copyright and SAYD.X branding

### D. Animations

**Minimal, purposeful animations only:**
- Card hover: gentle scale (hover:scale-[1.02]) and shadow elevation
- Page transitions: Simple fade-in for content
- NO complex scroll animations or parallax effects
- Loading states: Simple spinner or skeleton screens

## Images

**Hero Section:** Large, inspiring innovation-themed image (lab equipment, tech workspace, or collaborative innovation scene) - full-width, h-96 minimum

**Article Cards:** Innovation-related images matching content (technology, medical, educational, startup environments)

**About Page:** Team photos in grid layout, office/workspace imagery

**Placement Strategy:**
- Always use images in article cards for visual engagement
- Full-width hero image on homepage
- Article detail pages have featured image at top
- Gallery sections showcase file thumbnails and document previews
- Category sections can have decorative icon illustrations

## Layout Specifics

**Homepage Structure:**
1. Hero slider with 3-4 featured innovations (h-[32rem])
2. Category filter bar (horizontal scroll, py-8)
3. "Eng ko'p o'qilgan" section - 3-column card grid (py-16)
4. "So'nggi yangiliklar" section - 2-column with sidebar stats (py-16)
5. "Loyihalar va G'oyalar" showcase - 3-column grid (py-16)
6. CTA section - "Innovatsiya joylashtiring" (py-20)
7. Footer (py-12)

**Vertical Rhythm:** Consistent py-16 to py-20 for desktop sections, py-8 to py-12 for mobile

**Accessibility:**
- All interactive elements have focus states (ring-2 ring-offset-2)
- Form labels properly associated
- Alt text for all images
- Semantic HTML structure
- Uzbek language attribute set

This design creates a modern, professional innovation portal that balances visual appeal with content readability, optimized for Uzbek language users across all devices.