# FriendCAPTCHA — Design Direction v2

## Core Philosophy
This is a REAL-looking internet verification product. The humor comes from the copy, not the design.
Think Cloudflare Turnstile + Google reCAPTCHA + Stripe + Linear + Notion.

## Mode
LIGHT MODE ONLY. No dark mode. No gradients. No glassmorphism. No neon.

## Typography
- Font: **Inter** via Google Fonts
- Sizes: 13px body, 15px card text, 18px headings, 24px titles
- Weights: 400 normal, 500 medium, 600 semibold, 700 bold
- Letter-spacing: -0.01em on headings
- Line-height: 1.5 body, 1.25 headings

## Color System
- Background: #ffffff (pure white)
- Surface: #fafafa
- Surface-2: #f4f4f5
- Border: #e4e4e7
- Border-strong: #d1d5db
- Text: #09090b
- Text-secondary: #52525b
- Text-muted: #a1a1aa
- Accent: #2563eb (blue — trust, verification)
- Accent-hover: #1d4ed8
- Accent-light: #eff6ff
- Success: #16a34a
- Success-light: #f0fdf4
- Error: #dc2626
- Error-light: #fef2f2
- Shadow: 0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)
- Shadow-md: 0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.04)

## Layout
- Max-width: 520px for CAPTCHA cards, 600px for create flow, centered
- Card padding: 32px desktop, 24px mobile
- Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48
- Border-radius: 12px cards, 8px buttons/inputs, 6px small elements
- Mobile-first, responsive

## Components
### Cards
- White background, 1px border #e4e4e7, border-radius 12px, shadow-sm
- CAPTCHA card: special treatment — centered on screen, max-w 480px
- Has a tiny logo/badge in top-right corner (⊕ FriendCAPTCHA)

### Buttons
- Primary: #2563eb bg, white text, 8px radius, 10px 20px padding, 500 weight
- Secondary: white bg, #e4e4e7 border, #09090b text
- Hover: slight bg shift, no scale
- Disabled: opacity 0.5

### Inputs
- 1px border #e4e4e7, 8px radius, 14px font, 10px 12px padding
- Focus: 2px outline #2563eb at 30% opacity, border #2563eb

### Image tiles
- Clean white card, 1px border
- Selected: 2px #2563eb border, subtle blue tint overlay, blue checkmark badge
- Aspect ratio 1:1
- Border-radius 8px

## Anti-patterns (DO NOT USE)
- No purple gradients
- No neon/glow effects
- No dark backgrounds
- No emoji in UI chrome (only in copy)
- No cartoon/party aesthetic
- No Inter alternatives — use Inter
