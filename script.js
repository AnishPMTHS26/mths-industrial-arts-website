/* ════════════════════════════════════════════════════════════════════
   MTHS INDUSTRIAL ARTS DEPARTMENT — SHARED SCRIPT (script.js)
   Loaded by every page with <script src="script.js" defer></script>

   • "defer" means the browser finishes building the page BEFORE this
     file runs — so every element we look up below already exists and
     no DOMContentLoaded wrapper is needed.
   • Project style rules followed throughout:
       - plain  function () {}  syntax only (no arrow functions)
       - links that exist purely for JavaScript use javascript:void(0)
       - the hero/course carousel is INDEX-BASED (no DOM cloning)

   TABLE OF CONTENTS
   ─────────────────
    0. Tiny helpers ($, $$, each)
    1. Scroll-reveal animation (IntersectionObserver)
    2. One scroll handler: sticky nav + progress bar + blueprint rail
    3. Mobile hamburger menu
    4. Courses dropdown (click-to-open mega-menu)
    5. Slide carousels — hero + course photos  [data-carousel]
    6. Snap carousels — events / testimonials  [data-snap]
    7. Event cards + "Add to Google Calendar"
    8. Footer year auto-update
   ════════════════════════════════════════════════════════════════════ */

(function () {
    "use strict";

    /* ────────────────────────────────────────────────────────────────
       0. TINY HELPERS
       • $  — find ONE element (shorthand for querySelector)
       • $$ — find ALL matching elements, returned as a real array
       • each — loop over a list; the callback gets (item, index).
         Because each callback call is its own function scope, loop
         counters can never "leak" between iterations (the classic
         var-in-a-loop bug is impossible by construction).
       ──────────────────────────────────────────────────────────────── */
    function $(selector, scope) {
        return (scope || document).querySelector(selector);
    }

    function $$(selector, scope) {
        var list = (scope || document).querySelectorAll(selector);
        return Array.prototype.slice.call(list);
    }

    function each(list, fn) {
        for (var i = 0; i < list.length; i++) {
            fn(list[i], i);
        }
    }

    /* One shared answer to "does this visitor prefer less motion?"
       • Checked before every animation/autoplay below.
       • Mirrors the CSS media query in style.css Section 26, so the
         two files always agree. */
    var REDUCED_MOTION =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;


    /* ────────────────────────────────────────────────────────────────
       1. SCROLL-REVEAL ANIMATION
       • Elements marked  data-reveal  fade-and-rise into view.
       • SAFETY-FIRST DESIGN (pairs with style.css Section 25):
           - By default NOTHING is hidden.
           - We only add  .reveal-armed  to <html> — which lets CSS
             hide unrevealed elements — AFTER confirming JavaScript is
             running, IntersectionObserver exists, and the visitor has
             not asked for reduced motion.
           - Net result: if JS fails or motion is off, every bit of
             content is simply visible. No blank pages, ever.
       • IntersectionObserver is the browser's built-in "tell me when
         this enters the viewport" API — far cheaper than measuring
         positions inside a scroll handler.
       ──────────────────────────────────────────────────────────────── */
    var revealTargets = $$("[data-reveal]");

    if (revealTargets.length && "IntersectionObserver" in window && !REDUCED_MOTION) {
        document.documentElement.className += " reveal-armed";

        var revealObserver = new IntersectionObserver(
            function (entries) {
                each(entries, function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.className += " revealed";
                        /* Each element animates once, then we stop
                           watching it — keeps the observer light. */
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            /* Fire slightly BEFORE the element fully enters the screen
               (negative bottom margin) so the rise feels responsive. */
            { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
        );

        each(revealTargets, function (el) {
            revealObserver.observe(el);
        });
    }


    /* ────────────────────────────────────────────────────────────────
       2. ONE SCROLL HANDLER — three jobs, one listener
       • Jobs: (a) navbar gains .scrolled after 40px,
               (b) the gold progress bar fills left→right,
               (c) the course-page "blueprint rail" draws itself.
       • PERFORMANCE NOTES:
           - { passive: true } tells the browser this listener never
             blocks scrolling → smoother on touch devices.
           - requestAnimationFrame + a "ticking" flag means we repaint
             at most once per screen refresh, no matter how many scroll
             events fire between frames.
           - The progress bar animates with transform: scaleX(...)
             instead of width — transforms skip layout work entirely,
             so the bar is butter-smooth even on weak hardware.
       ──────────────────────────────────────────────────────────────── */
    var siteNav = $(".site-nav");
    var progressBar = $("#scrollProgress");
    var rail = $(".course-rail");
    var railDraw = rail ? $(".rail-draw", rail) : null;
    var railNode = rail ? $(".rail-node", rail) : null;
    var railLength = 0;
    var ticking = false;

    function onScrollFrame() {
        ticking = false;

        var doc = document.documentElement;
        var scrolled = window.pageYOffset || doc.scrollTop || 0;
        /* How much scrollable distance the page has in total: */
        var maxScroll = doc.scrollHeight - window.innerHeight;
        /* progress = 0 at the top → 1 at the very bottom.
           Math.max(1, …) prevents divide-by-zero on short pages. */
        var progress = Math.min(1, scrolled / Math.max(1, maxScroll));

        /* (a) Solidify the navbar once the hero starts sliding under it */
        if (siteNav) {
            if (scrolled > 40) {
                if (siteNav.className.indexOf("scrolled") === -1) {
                    siteNav.className += " scrolled";
                }
            } else {
                siteNav.className = siteNav.className.replace(" scrolled", "");
            }
        }

        /* (b) Fill the progress bar */
        if (progressBar) {
            progressBar.style.transform = "scaleX(" + progress + ")";
        }

        /* (c) Draw the blueprint rail (course pages only)
           • THE STROKE-DASH TRICK, in plain words:
               1. Ask the SVG path how long it is (getTotalLength).
               2. Make the dash pattern exactly that long — so the
                  whole line is ONE dash followed by ONE gap.
               3. stroke-dashoffset slides that dash along the path:
                  offset = full length  → only gap shows (invisible)
                  offset = 0            → only dash shows (fully drawn)
           • Tying the offset to scroll progress makes the line
             "draw itself" as you read down the page.
           • The small gear node rides along at the same percentage. */
        if (railDraw) {
            if (!railLength) {
                /* Measured lazily: if the rail starts hidden (narrow
                   window), the length reads 0 — we simply retry on the
                   next scroll after the window grows. */
                railLength = railDraw.getTotalLength ? railDraw.getTotalLength() : 0;
                if (railLength) {
                    railDraw.style.strokeDasharray = railLength;
                }
            }
            if (railLength) {
                railDraw.style.strokeDashoffset = railLength * (1 - progress);
                if (railNode) {
                    /* The rail path runs from y=14 to y=326 in the SVG's
                       own coordinate system → 312 units of travel. */
                    railNode.setAttribute("cy", 14 + 312 * progress);
                }
            }
        }
    }

    function requestScrollFrame() {
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(onScrollFrame);
        }
    }

    window.addEventListener("scroll", requestScrollFrame, { passive: true });
    window.addEventListener("resize", requestScrollFrame);
    /* Run once on load so everything is correct before any scrolling */
    onScrollFrame();


    /* ────────────────────────────────────────────────────────────────
       3. MOBILE HAMBURGER MENU
       • ≤880px the nav links live in a slide-down panel (CSS S.27).
       • The button toggles .open on itself (bars morph into an X)
         and on the panel (clip-path slides it open).
       • aria-expanded keeps screen readers in sync with the visuals.
       ──────────────────────────────────────────────────────────────── */
    var navToggle = $(".nav-toggle");
    var navLinks = $(".nav-links");

    function closeMobileMenu() {
        if (navToggle) {
            navToggle.className = navToggle.className.replace(" open", "");
            navToggle.setAttribute("aria-expanded", "false");
        }
        if (navLinks) {
            navLinks.className = navLinks.className.replace(" open", "");
        }
    }

    if (navToggle && navLinks) {
        navToggle.addEventListener("click", function () {
            var isOpen = navToggle.className.indexOf("open") !== -1;
            if (isOpen) {
                closeMobileMenu();
                closeDropdown(); /* fold the accordion away too */
            } else {
                navToggle.className += " open";
                navToggle.setAttribute("aria-expanded", "true");
                navLinks.className += " open";
            }
        });
    }


    /* ────────────────────────────────────────────────────────────────
       4. COURSES DROPDOWN (mega-menu)
       • Opens on CLICK, not hover — deliberate fix for the old site's
         flicker: a hover menu closes the instant the cursor slips off
         it, and never works on touch screens. A click menu does both.
       • Three ways to close, all standard menu manners:
           1. press Escape   2. click anywhere outside   3. click a link
       • The trigger is a real <button aria-expanded> so the state is
         announced to assistive tech; CSS flips the caret off it.
       ──────────────────────────────────────────────────────────────── */
    var dropdown = $(".nav-dropdown");
    var dropdownBtn = dropdown ? $(".nav-link[aria-expanded]", dropdown) : null;

    function closeDropdown() {
        if (dropdown && dropdown.className.indexOf("open") !== -1) {
            dropdown.className = dropdown.className.replace(" open", "");
            if (dropdownBtn) {
                dropdownBtn.setAttribute("aria-expanded", "false");
            }
        }
    }

    if (dropdown && dropdownBtn) {
        dropdownBtn.addEventListener("click", function (event) {
            /* Without this, the same click would instantly reach the
               document listener below and re-close the menu. */
            event.stopPropagation();
            var isOpen = dropdown.className.indexOf("open") !== -1;
            if (isOpen) {
                closeDropdown();
            } else {
                dropdown.className += " open";
                dropdownBtn.setAttribute("aria-expanded", "true");
            }
        });

        /* Close after choosing a course (the page is navigating away,
           but this keeps the UI tidy for same-page anchors too). */
        each($$(".dropdown-item", dropdown), function (link) {
            link.addEventListener("click", function () {
                closeDropdown();
                closeMobileMenu();
            });
        });

        /* Any click outside the dropdown closes it */
        document.addEventListener("click", function (event) {
            if (!dropdown.contains(event.target)) {
                closeDropdown();
            }
        });

        /* Escape closes the dropdown AND the mobile panel */
        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" || event.key === "Esc") {
                closeDropdown();
                closeMobileMenu();
            }
        });
    }


    /* ────────────────────────────────────────────────────────────────
       5. SLIDE CAROUSELS — hero photos + course-page photos
       • One engine powers every element marked  data-carousel .
       • HOW IT MOVES (the index-based rule):
           - All slides sit in one flex row (.hero-track).
           - We keep a single number, "index", and slide the row with
             transform: translateX(-index × 100%).
           - Wrapping uses modulo math:  (index + count) % count
             turns -1 into the last slide and "count" back into 0 —
             so the loop is seamless with NO cloned slides and no
             jump-cut, which was the old carousel's glitch source.
       • Dots are built here in JS so their count always matches the
         number of slides — add a slide in HTML and a dot appears.
       • Autoplay (4s) politely pauses while the visitor hovers or
         keyboard-focuses the carousel, and never runs at all for
         reduced-motion visitors.
       ──────────────────────────────────────────────────────────────── */
    function initSlideCarousel(frame) {
        var track = $(".hero-track", frame);
        if (!track || track.children.length === 0) {
            return;
        }

        var slideCount = track.children.length;
        var prevBtn = $(".carousel-prev", frame);
        var nextBtn = $(".carousel-next", frame);
        /* The dots strip lives just OUTSIDE the frame (so it is not
           clipped by overflow:hidden) — find it via the shared parent. */
        var dotsBox = frame.parentNode ? $(".carousel-dots", frame.parentNode) : null;
        var dots = [];
        var index = 0;
        var timer = null;

        /* Build one dot button per slide */
        if (dotsBox) {
            for (var i = 0; i < slideCount; i++) {
                var dot = document.createElement("button");
                dot.type = "button";
                dot.setAttribute("aria-label", "Show slide " + (i + 1) + " of " + slideCount);
                /* A tiny function-factory gives each dot its own copy
                   of "i" — sidestepping the shared-counter pitfall. */
                dot.addEventListener("click", makeDotHandler(i));
                dotsBox.appendChild(dot);
                dots.push(dot);
            }
        }

        function makeDotHandler(slideIndex) {
            return function () {
                goTo(slideIndex);
                restartAutoplay();
            };
        }

        function goTo(rawIndex) {
            /* Modulo wrap: works for -1, works past the end */
            index = ((rawIndex % slideCount) + slideCount) % slideCount;
            track.style.transform = "translateX(" + (index * -100) + "%)";
            for (var d = 0; d < dots.length; d++) {
                if (d === index) {
                    dots[d].setAttribute("aria-current", "true");
                } else {
                    dots[d].removeAttribute("aria-current");
                }
            }
        }

        function stopAutoplay() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        function startAutoplay() {
            if (REDUCED_MOTION || slideCount < 2 || timer) {
                return;
            }
            timer = window.setInterval(function () {
                goTo(index + 1);
            }, 4000);
        }

        function restartAutoplay() {
            stopAutoplay();
            startAutoplay();
        }

        if (prevBtn) {
            prevBtn.addEventListener("click", function () {
                goTo(index - 1);
                restartAutoplay();
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener("click", function () {
                goTo(index + 1);
                restartAutoplay();
            });
        }

        /* Pause while the visitor is "in" the carousel */
        frame.addEventListener("mouseenter", stopAutoplay);
        frame.addEventListener("mouseleave", startAutoplay);
        frame.addEventListener("focusin", stopAutoplay);
        frame.addEventListener("focusout", startAutoplay);

        goTo(0);
        startAutoplay();
    }

    each($$("[data-carousel]"), initSlideCarousel);


    /* ────────────────────────────────────────────────────────────────
       6. SNAP CAROUSELS — events, testimonials, highlights
       • The row itself is plain CSS scroll-snap (style.css Section 9):
         the BROWSER owns all sizing and scrolling, which is what makes
         this pattern glitch-proof — there are no cached widths for a
         window-resize or phone-rotation to invalidate.
       • JavaScript's only jobs here:
           1. arrow buttons nudge scrollLeft by exactly one card,
           2. optional autoplay does the same on a timer.
       • "One card" is measured LIVE at the moment of each nudge
         (offsetWidth + the row's current gap) — never stored — so it
         is always correct for the current screen size.
       • Reaching the end wraps back to the start (scrollLeft = 0),
         giving autoplay a clean loop.
       ──────────────────────────────────────────────────────────────── */
    function initSnapCarousel(wrap) {
        var row = $(".snap-row", wrap);
        if (!row || row.children.length === 0) {
            return;
        }

        var prevBtn = $("[data-snap-prev]", wrap);
        var nextBtn = $("[data-snap-next]", wrap);
        var autoplayMs = parseInt(wrap.getAttribute("data-autoplay"), 10) || 0;
        var timer = null;

        function stepSize() {
            var card = row.children[0];
            var styles = window.getComputedStyle(row);
            /* column-gap reads like "17.6px" → parseFloat → 17.6 */
            var gap = parseFloat(styles.columnGap || styles.gap) || 16;
            return card.offsetWidth + gap;
        }

        function nudge(direction) {
            var max = row.scrollWidth - row.clientWidth;
            if (direction > 0 && row.scrollLeft >= max - 4) {
                row.scrollLeft = 0;            /* wrap end → start      */
            } else if (direction < 0 && row.scrollLeft <= 4) {
                row.scrollLeft = max;          /* wrap start → end      */
            } else {
                row.scrollLeft = row.scrollLeft + direction * stepSize();
            }
        }

        function stopAutoplay() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        function startAutoplay() {
            if (REDUCED_MOTION || !autoplayMs || timer) {
                return;
            }
            timer = window.setInterval(function () {
                nudge(1);
            }, autoplayMs);
        }

        if (prevBtn) {
            prevBtn.addEventListener("click", function () {
                nudge(-1);
                stopAutoplay();
                startAutoplay();
            });
        }
        if (nextBtn) {
            nextBtn.addEventListener("click", function () {
                nudge(1);
                stopAutoplay();
                startAutoplay();
            });
        }

        /* Hands (or focus, or fingers) on the row = autoplay waits */
        wrap.addEventListener("mouseenter", stopAutoplay);
        wrap.addEventListener("mouseleave", startAutoplay);
        wrap.addEventListener("focusin", stopAutoplay);
        wrap.addEventListener("focusout", startAutoplay);
        row.addEventListener("touchstart", stopAutoplay, { passive: true });
        row.addEventListener("touchend", startAutoplay, { passive: true });

        startAutoplay();
    }

    each($$("[data-snap]"), initSnapCarousel);


    /* ────────────────────────────────────────────────────────────────
       7. EVENT CARDS + "ADD TO GOOGLE CALENDAR"
       • Clicking a card (or pressing Enter/Space while it has keyboard
         focus) toggles .expanded — CSS animates the details open with
         the 0fr→1fr grid trick (style.css Section 10).
       • The calendar button STOPS the click from bubbling up, so
         pressing it never accidentally collapses the card.
       • addToGCal() builds Google's "render?action=TEMPLATE" URL from
         the card's data-gcal-* attributes:
             data-gcal-title    event name
             data-gcal-date     start day, YYYYMMDD
             data-gcal-end      day AFTER the last day (Google treats
                                the end of all-day events as EXCLUSIVE)
             data-gcal-details  description text
             data-gcal-location where it happens
         encodeURIComponent() makes every value URL-safe (spaces,
         ampersands, accents — all handled).
       • The tab opens with "noopener" so the new page gets no handle
         back to ours — standard security hygiene for window.open.
       ──────────────────────────────────────────────────────────────── */
    function addToGCal(card) {
        var base = "https://calendar.google.com/calendar/render?action=TEMPLATE";
        var title = card.getAttribute("data-gcal-title") || "MTHS Event";
        var start = card.getAttribute("data-gcal-date") || "";
        var end = card.getAttribute("data-gcal-end") || start;
        var details = card.getAttribute("data-gcal-details") || "";
        var location = card.getAttribute("data-gcal-location") || "Monroe Township High School";

        var url = base +
            "&text=" + encodeURIComponent(title) +
            "&dates=" + encodeURIComponent(start + "/" + end) +
            "&details=" + encodeURIComponent(details) +
            "&location=" + encodeURIComponent(location);

        window.open(url, "_blank", "noopener");
    }
    /* Exposed on window so it can also be called from the console or
       reused by future pages without re-wiring listeners. */
    window.addToGCal = addToGCal;

    function toggleEventCard(card) {
        var isOpen = card.className.indexOf("expanded") !== -1;
        if (isOpen) {
            card.className = card.className.replace(" expanded", "");
            card.setAttribute("aria-expanded", "false");
        } else {
            card.className += " expanded";
            card.setAttribute("aria-expanded", "true");
        }
    }

    each($$(".event-card"), function (card) {
        card.addEventListener("click", function () {
            toggleEventCard(card);
        });

        /* Cards carry tabindex="0" + role="button" in the HTML, so
           they sit in the Tab order — this makes the keys work too. */
        card.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
                event.preventDefault();       /* stop Space scrolling  */
                toggleEventCard(card);
            }
        });

        var gcalBtn = $(".gcal-btn", card);
        if (gcalBtn) {
            gcalBtn.addEventListener("click", function (event) {
                event.stopPropagation();      /* don't collapse card   */
                addToGCal(card);
            });
        }
    });


    /* ────────────────────────────────────────────────────────────────
       8. FOOTER YEAR
       • Every footer prints "2026" in the HTML as a no-JS fallback;
         this swaps in the real current year so the copyright line
         never goes stale.
       ──────────────────────────────────────────────────────────────── */
    each($$("[data-year]"), function (el) {
        el.textContent = new Date().getFullYear();
    });

})();
