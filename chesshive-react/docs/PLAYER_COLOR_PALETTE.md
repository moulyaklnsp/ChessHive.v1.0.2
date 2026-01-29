# Player Color Palette

This app uses CSS variables for Player pages.

**Where palettes live**
- Light palette variables: `src/styles/playerNeoNoir.css` (selector: `body.player:not(.player-dark)`)
- Dark palette variables: `src/styles/darkTheme.css` (selector: `body.player-dark .player, body.player-dark .player-neo`)

**Requested active pick ("try 7,7")**
- Light #7: **Minimal Rank**
- Dark #7: **Neon Check**

---

## Light Mode Themes (10)

### 1) Grandmaster White
Classic & professional
- Background: `#FFFFFF`
- Primary: `#1E1E1E`
- Accent: `#C9A24D`
- Secondary: `#F2F2F2`

### 2) Ivory Board
Soft, readable, traditional
- Background: `#FAF9F6`
- Primary: `#3A3A3A`
- Accent: `#8B6F47`
- Borders: `#E0DED8`

### 3) Modern Arena
Clean sports-tech
- Background: `#F7F8FA`
- Primary: `#1C2A39`
- Accent: `#2F80ED`
- Success: `#27AE60`

### 4) Classic Tournament
Official & calm
- Background: `#F4F6F3`
- Primary: `#2E2E2E`
- Accent: `#6B8E23`
- Highlight: `#DAD7CD`

### 5) Marble Hall
Luxury chess club
- Background: `#FDFDFD`
- Primary: `#2B2B2B`
- Accent: `#BFA980`
- Secondary: `#EFEFEF`

### 6) Scholar’s Desk
Academic & thoughtful
- Background: `#FBFBF8`
- Primary: `#2F3E46`
- Accent: `#588157`
- Notes: `#CAD2C5`

### 7) Minimal Rank
Ultra-minimal UI
- Background: `#FFFFFF`
- Primary: `#111111`
- Accent: `#5E5E5E`
- Divider: `#EAEAEA`

### 8) Chessboard Pastel
Friendly & modern
- Background: `#F9FAFB`
- Primary: `#374151`
- Accent: `#A78BFA`
- Highlight: `#EDE9FE`

### 9) FIDE Neutral
Formal & official
- Background: `#F1F3F5`
- Primary: `#212529`
- Accent: `#ADB5BD`
- Alert: `#FA5252`

### 10) Morning Blitz
Energetic but light
- Background: `#FFFFFF`
- Primary: `#1F2937`
- Accent: `#F59E0B`
- Info: `#0EA5E9`

---

## Dark Mode Themes (10)

### 1) Midnight Grandmaster
Premium & serious
- Background: `#0B0F14`
- Primary: `#E5E7EB`
- Accent: `#D4AF37`
- Secondary: `#1F2937`

### 2) Obsidian Board
Deep contrast
- Background: `#0F172A`
- Primary: `#F8FAFC`
- Accent: `#64748B`
- Divider: `#1E293B`

### 3) Carbon Arena
Esports style
- Background: `#121212`
- Primary: `#E0E0E0`
- Accent: `#00E5FF`
- Danger: `#FF5252`

### 4) Night Tournament
Formal & calm
- Background: `#111827`
- Primary: `#D1D5DB`
- Accent: `#10B981`
- Highlight: `#064E3B`

### 5) Royal Black
Luxury chess club
- Background: `#0A0A0A`
- Primary: `#F5F5F5`
- Accent: `#B08D57`
- Secondary: `#1A1A1A`

### 6) Deep Strategy
Analytical focus
- Background: `#0F172A`
- Primary: `#E2E8F0`
- Accent: `#38BDF8`
- Muted: `#334155`

### 7) Neon Check
Modern & fast
- Background: `#020617`
- Primary: `#E5E7EB`
- Accent: `#22D3EE`
- Warning: `#F97316`

### 8) Dark Wood
Classic chessboard feel
- Background: `#1C1917`
- Primary: `#FAFAF9`
- Accent: `#A16207`
- Panel: `#292524`

### 9) Stealth Mode
Ultra-dark & minimal
- Background: `#000000`
- Primary: `#D1D5DB`
- Accent: `#6B7280`
- Divider: `#1F1F1F`

### 10) Endgame Purple
Unique & modern
- Background: `#12091E`
- Primary: `#E9D5FF`
- Accent: `#A855F7`
- Highlight: `#3B0764`

---

## Where it’s applied
- Player pages add `player` on `<body>`.
- Dark mode adds `player-dark` on `<body>`.

