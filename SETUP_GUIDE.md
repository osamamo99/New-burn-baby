# Hamari Duniya - Premium Roman Urdu Baby Memories Website

## 1. Overview & Architecture

“Hamari Duniya” is a full-stack, production-ready digital baby memory book application built to celebrate a newborn baby and preserve precious memories with emotional Roman Urdu narratives, secure private owner photo uploads, and server-side Gemini Vision AI caption generation.

### System Architecture:
- **Frontend**: React 19 + TypeScript + Tailwind CSS with dynamic theme switching (Champagne Gold/Cream, Soft Baby Pink, Pastel Sky Blue, Dreamy Lavender, Fresh Mint).
- **Backend**: Express server (`server.ts`) handling secure authorization, image uploads, data persistence, and Gemini Vision API integration.
- **AI Engine**: `@google/genai` utilizing `gemini-3.8-flash` on the server-side to analyze baby photos (clothing, blankets, mood, expressions, toys, surroundings) and generate contextually appropriate Roman Urdu titles, emotional captions, 3 distinct style alternatives (Dua, Poetic, Cute), categories, and tags.
- **Audio Engine**: Client-side Web Audio synthesized nursery music box / celesta chime player (Brahms' Lullaby, Twinkle Star) — 100% royalty-free, responsive, with zero autoplay without user interaction.
- **Storage & Security**: Strict backend verification on all privileged mutating routes (upload, memory edit, delete, timeline, blessings, settings, backup export/import). Public visitors can only view published memories.

---

## 2. Private Owner Security & Authentication

1. **Owner Access**:
   - Only the authorized owner can upload photos, change captions, generate AI captions, delete memories, manage milestones, manage blessings, and update website settings.
   - Public visitors have read-only access to published content. Private drafts and owner notes remain strictly hidden from unauthenticated API responses.
2. **Owner Credentials**:
   - Default initial owner password: `BabyLove2026!`
   - To change the owner password: Log into the Owner Portal, open the **Security & Backup** tab, enter the current password, and choose a new secure password.
   - Passwords are salt-hashed using `pbkdf2Sync` (SHA-512 with 10,000 iterations).
   - Session tokens are securely HMAC-signed with the server secret.
   - All file uploads are verified on the backend: MIME types (`image/jpeg`, `image/png`, `image/webp`), 15MB file size limit, and randomized non-guessable storage filenames.

---

## 3. AI-Powered Roman Urdu Caption Workflow

1. In the **Owner Dashboard**, navigate to **"Photo Upload Karein"**.
2. Select or drag-and-drop a baby photograph.
3. Click **"AI Se Roman Urdu Caption Banwayein ✨"**.
4. The server sends the image buffer securely to Gemini Vision:
   - Analyzes visible physical details (e.g. peaceful sleep, gentle smile, romper, swaddle blanket, toys).
   - Generates an authentic Roman Urdu title and 2–3 sentence heartfelt caption.
   - Suggests relevant tags and the best-fitting category (e.g. *Neend Ke Haseen Lamhe*, *Pyari Si Muskurahat*, *Hamari Nanhi Jaan*).
   - Generates 3 alternative caption styles (*Dua-based*, *Poetic*, *Cute & Playful*).
5. The owner reviews, edits, selects an alternative, or adjusts the text before saving.
6. Set the memory to **"Published"** or **"Draft"**, and click **"Yaad Gallery Mein Shamil Karein ✨"**.

---

## 4. Testing Checklist

- [x] **Public Gallery Browsing**: Category filtering, live search by Roman Urdu title/caption/tags, newest/oldest/favorites sorting.
- [x] **Memory of the Day**: Featured spotlight card with preview and Roman Urdu quote.
- [x] **Full-Screen Lightbox**: High-res zoom in/out, next/prev navigation, touch swipe on mobile, alternative Roman Urdu style switcher, slideshow mode, and link sharing.
- [x] **Baby Age & Milestones**: Accurate age calculation (Years, Months, Days), total days count, and countdown to next birthday.
- [x] **Memory Timeline**: Milestone markers, Roman Urdu narrative cards, and dates.
- [x] **Blessings Section**: Starry night background, Roman Urdu duas, and interactive Ameen counter.
- [x] **Theme Switcher**: Instant switching between Cream, Pink, Sky Blue, Lavender, and Mint.
- [x] **Nursery Music Box**: Gentle celesta synthesizer with volume slider and track switcher.
- [x] **Owner Authentication**: Protected backend endpoints reject unauthenticated POST/PUT/DELETE requests with HTTP 401.
- [x] **Photo Upload & Gemini Vision**: Server-side image storage and Roman Urdu caption generation.
- [x] **Backup & Restore**: One-click JSON metadata download and restore support.
