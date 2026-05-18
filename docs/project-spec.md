# RESERVE237 PROJECT SPECIFICATION

## PROJECT OVERVIEW

Reserve237 is a premium multi-category booking and reservation platform for Cameroon focused on Yaounde and Douala.

The platform allows users to:
- Discover restaurants and nightlife venues
- Reserve tables and lounge spaces
- Browse guest houses and stays
- Book event halls and corporate venues
- Save favorite listings
- Search and filter listings in real time
- View detailed venue information
- Access responsive premium UI experiences

This is currently a frontend-only MVP.

The application should simulate functionality using:
- mock data
- Zustand
- localStorage persistence

No backend, database, or API integration should be implemented yet.

---

# DESIGN PHILOSOPHY

Neo-minimalist premium UI with:
- subtle luxury aesthetics
- glassmorphism
- dark premium interfaces
- soft gradients
- smooth motion animations
- modern startup-level polish
- mobile-first responsiveness

The UI should feel:
- premium
- elegant
- sophisticated
- smooth
- modern
- immersive

Avoid:
- clutter
- overly colorful UI
- cartoon styling
- generic dashboard appearance

---

# DESIGN SYSTEM

## Core Colors

```css
:root {
  --background: #121212;
  --foreground: #F5F5F7;
  --card: #1a1a1a;

  --primary: #C19A6B;
  --primary-foreground: #121212;

  --secondary: #2a2a2a;

  --muted: #1a1a1a;
  --muted-foreground: #9CA3AF;

  --accent: #C19A6B;

  --border: rgba(193, 154, 107, 0.15);
  --input: rgba(193, 154, 107, 0.1);

  --glass-bg: rgba(26, 26, 26, 0.7);
  --glass-border: rgba(193, 154, 107, 0.2);

  --input-background: rgba(255,255,255,0.05);
}

