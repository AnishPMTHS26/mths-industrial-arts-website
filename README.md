# MTHS Industrial Arts Department — Website

The official site of the **MTHS Industrial Arts Department** at Monroe
Township High School: four pathways (PLTW Engineering, Computer Science
& Cybersecurity, Materials & Construction, Video Production & Media),
course flowcharts, faculty, events, and detailed pages for seven
spotlight courses.

Built with plain **HTML + CSS + vanilla JavaScript** — no frameworks,
no build step — so it deploys straight to GitHub Pages and any student
can maintain it.

> ⚠ **Before any commit/publish:** content must be approved by Ms. G
> (Vanitha Gaurishanker). Open items to confirm are listed below.

---

## File map

| File | What it is |
|------|------------|
| `index.html` | Home — hero carousel, events, pathway preview, student voices |
| `about.html` | About — PLTW intro, pathways, faculty tree, **Build Your Track** flowcharts, clubs |
| `ied.html` `poe.html` `capstone.html` | PLTW Engineering course pages |
| `apcsp.html` `apcyber.html` | AP Computer Science course pages |
| `vehicular.html` `morning.html` | Materials & Media course pages |
| `style.css` | The entire design system — one shared stylesheet, 27 documented sections |
| `script.js` | All behavior — one shared script, 8 documented sections |
| `favicon.svg` | Gold gear on navy |
| `images/placeholder.jpg` | The shared "photo coming soon" graphic |
| `IMAGE-GUIDE.md` | **How to swap in real photos** (read this first) |

Every file is commented in plain English: section banners explain what
each block does, and bullet comments explain *why* the tricky parts
work the way they do.

## How the site is wired

- **One stylesheet, one script.** All 9 pages load the same
  `style.css` + `script.js`. Page-specific looks come from which CSS
  classes the HTML uses — there is no per-page CSS or JS.
- **Fluid sizing.** The root font size scales with the viewport via
  `clamp()`, and every dimension is in `rem`, so the whole layout
  grows/shrinks proportionally on any screen (see `style.css` §2).
- **Carousels, two kinds:**
  - *Slide carousels* (`data-carousel`) — hero + course photos.
    Index-based `translateX`, no DOM cloning.
  - *Snap carousels* (`data-snap`) — events, testimonials, highlights.
    CSS scroll-snap owns all sizing; JS only nudges and autoplays.
    This is the fix for the old site's resize glitches.
- **SVG scroll features:** the gold progress bar on every page, plus
  the "blueprint rail" on course pages that draws itself as you scroll
  (`script.js` §2).
- **Shared blocks:** the `<header>` nav and `<footer>` are identical
  across all 9 files — if you edit one, copy the change to the rest
  (each block is labeled with a reminder comment).

## Editing cheat-sheet

| Task | Where |
|------|-------|
| Change colors / fonts / spacing | `style.css` §1 Design Tokens — change variables only |
| Add/replace photos | `IMAGE-GUIDE.md` |
| Update events (dates are placeholders!) | `index.html` → Events section — update the visible text **and** the `data-gcal-*` attributes |
| Edit course info / prerequisites | The course's HTML + the matching node in `about.html` Build Your Track |
| Add a testimonial | Copy any `testimonial-card` / `mini-testimonial` block; cards marked `MOCK` should be replaced with real quotes |
| Update faculty | `about.html` Faculty section + the instructor cards on relevant course pages |

## Run it locally

No build step. Either open `index.html` in a browser, or (nicer URLs):

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository (after Ms. G's approval).
2. Repo → Settings → Pages → Source: `main` branch, `/ (root)`.
3. The site appears at `https://<user>.github.io/<repo>/`.

## ⚠ Confirm with Ms. G before publishing

- [ ] **Event dates** on the home page are projected 2026–27
      placeholders — replace with the real calendar.
- [ ] **Faculty email format** — site uses the short form
      (`zmorolda@monroe.k12.nj.us`) per the project breakdown; the
      handoff doc shows `firstname.lastname` — verify which is right.
- [ ] **Instructor TBDs** — Capstone (2 slots) and Vehicular Systems
      (1 slot; likely teachers are pre-filled in comments).
- [ ] **Jia Shibi's POE quote** may be truncated — check the original
      testimonial sheet (flagged with a comment in `poe.html`).
- [ ] **The Morning Show description** was written by the team because
      the 2026–27 Program of Studies entry duplicates the Writing for
      Electronic Media text (PoS copy-paste bug) — review the wording.
- [ ] **Mock testimonials** (marked with `MOCK` comments) should be
      swapped for real student quotes as they're collected.
- [ ] **Arjun Sarsam's contact links** are commented out on the home
      page until he shares what he wants published.
