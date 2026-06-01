# FriendCAPTCHA — REDESIGN

## Status: REBUILDING

## Design Direction
- LIGHT MODE ONLY. White bg, subtle gray borders, minimal shadows
- Inspired by Cloudflare Turnstile, Google reCAPTCHA, Stripe, Linear, Notion, Apple
- Humor from COPY not from design
- Visitor should think "is this a real CAPTCHA?" 
- Font: Inter (clean, professional)
- Colors: white, #f9f9f9, #e5e7eb borders, #111 text, #6e6e6e muted, #1a56db blue accent

## New DB Schema
- captchas: id, creator_name, created_at
- captcha_images: id, captcha_id, image_url, image_key, sort_order
- captcha_challenges: id, captcha_id, question, sort_order
- challenge_correct_images: id, challenge_id, image_id (references captcha_images)

## New Creator Flow (3 steps)
1. Step 1: Name + upload 10-15 photos
2. Step 2: Create 3-5 challenges — each is a question + mark correct photos
3. Step 3: Success — realistic URL, copy link, open CAPTCHA

## New Player Flow (/v/:id)
- Screen 1: CAPTCHA card intro — "Verify that you know [name]"
- Screen 2+: Per-challenge card — question + photo grid
- Result: Score-based badge (100% = Identity Confirmed, etc.)

## Files to rewrite
- design.md
- schema.ts + db:push
- api/index.ts (new routes)
- styles.css (light theme)
- pages/index.tsx
- pages/create.tsx (multi-step)
- pages/success.tsx
- pages/captcha.tsx → pages/verify.tsx (/v/:id)
- components/ImageGrid.tsx
- app.tsx
