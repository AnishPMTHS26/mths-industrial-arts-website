/* ═══════════════════════════════════════════════════════════════════
   MTHS Industrial Arts Department — Main JavaScript
   ─────────────────────────────────────────────────────────────────
   FILE: script.js
   USED BY: index.html (Home) and about.html (About Us)
   
   WHAT THIS FILE DOES:
   1. Hamburger menu toggle (mobile navigation)
   2. Navbar shadow on scroll (adds depth when scrolled)
   3. Hero image carousel (10 slides, 4s auto-advance, hover pause)
   4. Events carousel (3 visible, 5s auto-advance, hover pause, infinite wrap)
   5. Testimonials carousel (same behavior as events)
   6. Event card expand/collapse (click to show details)
   7. Scroll reveal animations (elements fade up as they enter viewport)
   8. Smooth scroll for anchor links
   9. Google Calendar integration (addToGCal function)
   
   IMPORTANT NOTES:
   - Uses plain function() syntax (not arrow =>) for maximum browser support
   - All carousels pause on hover and resume on mouse leave
   - Card widths for events/testimonials are calculated by JS, not CSS
   - The addToGCal() function is global (outside DOMContentLoaded) so
     inline onclick handlers in the HTML can call it
   ═══════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

    /* ────────────────────────────────────────────────────────────
       HAMBURGER MENU (mobile only)
       The hamburger button and nav-links are defined in the HTML.
       On click, we toggle the .open class on both elements:
       - .hamburger.open rotates the 3 bars into an X shape (CSS)
       - .nav-links.open makes the dropdown menu visible (CSS)
       Clicking any nav link inside the menu also closes it.
       ──────────────────────────────────────────────────────────── */
    var hamburger = document.getElementById('hamburger');
    var navLinks = document.getElementById('navLinks');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function () {
            hamburger.classList.toggle('open');
            navLinks.classList.toggle('open');
        });
        var links = navLinks.querySelectorAll('.nav-link');
        for (var i = 0; i < links.length; i++) {
            links[i].addEventListener('click', function () {
                hamburger.classList.remove('open');
                navLinks.classList.remove('open');
            });
        }
    }

    /* ────────────────────────────────────────────────────────────
       NAVBAR SCROLL SHADOW
       When the user scrolls past 40px, we add the .scrolled class
       to the navbar, which triggers a box-shadow in CSS.
       This gives the nav a "floating" appearance once scrolled.
       ──────────────────────────────────────────────────────────── */
    var navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', function () {
            if (window.pageYOffset > 40) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        });
    }

    /* ══════════════════════════════════════════════════════════════
       HERO IMAGE CAROUSEL (index.html home page)
       ────────────────────────────────────────────────────────────
       - 10 slides displayed one at a time (full width of carousel)
       - Auto-advances every 4 seconds (heroStart/heroTimer)
       - Pauses when mouse hovers over the carousel wrapper
       - Resumes when mouse leaves
       - Manual control via prev/next arrow buttons and dot navigation
       - Swipe support on touch devices (touchstart/touchend)
       - Infinite loop: index wraps from last→first and first→last
       
       HOW IT WORKS:
       Each slide is min-width:100%, so all 10 sit in a horizontal row.
       heroGo(n) moves the track with translateX(-n * 100%) to show
       slide N. The dots are built dynamically by JS on page load.
       ══════════════════════════════════════════════════════════════ */
    var heroTrack = document.getElementById('heroTrack');
    var heroDots  = document.getElementById('heroDots');
    var heroPrev  = document.getElementById('heroPrev');
    var heroNext  = document.getElementById('heroNext');

    if (heroTrack && heroDots) {
        var slides = heroTrack.querySelectorAll('.carousel-slide');
        var total  = slides.length;
        var cur    = 0;
        var heroTimer;

        for (var d = 0; d < total; d++) {
            var dot = document.createElement('span');
            dot.className = d === 0 ? 'dot active' : 'dot';
            dot.setAttribute('data-i', d);
            dot.addEventListener('click', function () {
                heroGo(+this.getAttribute('data-i'));
                heroReset();
            });
            heroDots.appendChild(dot);
        }
        var dots = heroDots.querySelectorAll('.dot');

        /* heroGo(n) — jump to slide N.
           Uses modulo arithmetic to wrap: slide 10 becomes 0, slide -1 becomes 9.
           Updates the track position and highlights the correct dot. */
        function heroGo(n) {
            cur = ((n % total) + total) % total;
            heroTrack.style.transform = 'translateX(-' + (cur * 100) + '%)';
            for (var j = 0; j < dots.length; j++) {
                dots[j].className = j === cur ? 'dot active' : 'dot';
            }
        }
        /* Navigation helpers */
        function heroFwd()   { heroGo(cur + 1); }   /* Move to next slide */
        function heroBack()  { heroGo(cur - 1); }  /* Move to previous slide */
        /* Auto-advance timer: clears any existing timer first to prevent
           double-speed if called multiple times (defensive programming) */
        function heroStart() { clearInterval(heroTimer); heroTimer = setInterval(heroFwd, 4000); }
        function heroReset() { clearInterval(heroTimer); heroStart(); }
        heroStart();

        if (heroPrev) heroPrev.addEventListener('click', function () { heroBack(); heroReset(); });
        if (heroNext) heroNext.addEventListener('click', function () { heroFwd();  heroReset(); });

        /* Hover pause — stop auto-advance when mouse is over the carousel.
           Also handles swipe gestures for mobile: if user drags >50px
           horizontally, advance forward (right swipe) or back (left swipe). */
        var heroWrap = document.getElementById('heroCarousel');
        if (heroWrap) {
            heroWrap.addEventListener('mouseenter', function () { clearInterval(heroTimer); });
            heroWrap.addEventListener('mouseleave', heroStart);
            var hx = 0;
            heroWrap.addEventListener('touchstart', function (e) { hx = e.changedTouches[0].screenX; }, { passive: true });
            heroWrap.addEventListener('touchend', function (e) {
                var diff = hx - e.changedTouches[0].screenX;
                if (Math.abs(diff) > 50) { diff > 0 ? heroFwd() : heroBack(); heroReset(); }
            }, { passive: true });
        }
    }

    /* ══════════════ EVENTS CAROUSEL ══════════════
       3 visible · scrolls 1 at a time · wraps around
       5 s auto-advance · pauses on hover                */
    var eventsTrack = document.getElementById('eventsTrack');
    var eventsPrev  = document.getElementById('eventsPrev');
    var eventsNext  = document.getElementById('eventsNext');

    if (eventsTrack) {
        var cards     = eventsTrack.querySelectorAll('.event-card');
        var cardCount = cards.length;
        var evtIndex  = 0;
        var evtTimer;

        /* visibleCount() — how many cards should be visible based on screen width.
           These breakpoints match the CSS @media queries. */
        function visibleCount() {
            if (window.innerWidth <= 600)  return 1;
            if (window.innerWidth <= 900)  return 2;
            return 3;
        }

        /* stepPct() — the percentage width of one card step.
           If 3 are visible, each card is 33.33% of the track. */
        function stepPct() { return 100 / visibleCount(); }

        /* sizeCards() — dynamically sets each card's width and margin.
           Called on init and window resize. The 20px gap matches the
           visual spacing between cards. */
        function sizeCards() {
            var pct = stepPct();
            var gap = 20;
            for (var c = 0; c < cards.length; c++) {
                cards[c].style.width      = 'calc(' + pct + '% - ' + gap + 'px)';
                cards[c].style.marginRight = gap + 'px';
                cards[c].style.flexShrink  = '0';
            }
        }

        /* evtGo(n) — scroll to position N.
           maxIdx is the furthest we can scroll before cards run out.
           If N goes past the end, wrap to 0. If before start, wrap to end. */
        function evtGo(n) {
            var maxIdx = cardCount - visibleCount();
            if (maxIdx < 0) maxIdx = 0;
            if (n > maxIdx) n = 0;
            if (n < 0)      n = maxIdx;
            evtIndex = n;
            eventsTrack.style.transition = 'transform .55s cubic-bezier(.4,0,.2,1)';
            eventsTrack.style.transform  = 'translateX(-' + (evtIndex * stepPct()) + '%)';
        }

        function evtFwd()   { evtGo(evtIndex + 1); }
        function evtBack()  { evtGo(evtIndex - 1); }
        function evtStart() { clearInterval(evtTimer); evtTimer = setInterval(evtFwd, 5000); }
        function evtReset() { clearInterval(evtTimer); evtStart(); }

        sizeCards();
        evtGo(0);
        evtStart();

        if (eventsNext) eventsNext.addEventListener('click', function () { evtFwd();  evtReset(); });
        if (eventsPrev) eventsPrev.addEventListener('click', function () { evtBack(); evtReset(); });

        var evtWrap = document.querySelector('.events-carousel-wrap');
        if (evtWrap) {
            evtWrap.addEventListener('mouseenter', function () { clearInterval(evtTimer); });
            evtWrap.addEventListener('mouseleave', function () { evtStart(); });
        }

        var ex = 0;
        eventsTrack.addEventListener('touchstart', function (e) { ex = e.changedTouches[0].screenX; }, { passive: true });
        eventsTrack.addEventListener('touchend', function (e) {
            var diff = ex - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) { diff > 0 ? evtFwd() : evtBack(); evtReset(); }
        }, { passive: true });

        window.addEventListener('resize', function () { sizeCards(); evtGo(evtIndex); });
    }

    /* ══════════════════════════════════════════════════════════════
       TESTIMONIALS CAROUSEL (index.html home page)
       ────────────────────────────────────────────────────────────
       Identical scrolling behavior to the events carousel:
       3 visible on desktop, 5s auto-advance, hover pause, infinite wrap.
       The only differences are the element IDs (testimonialsTrack,
       testPrev, testNext) and the card styling (dark navy cards).
       ══════════════════════════════════════════════════════════════ */
    var testTrack = document.getElementById('testimonialsTrack');
    var testPrev  = document.getElementById('testPrev');
    var testNext  = document.getElementById('testNext');

    if (testTrack) {
        var tCards     = testTrack.querySelectorAll('.testimonial-card');
        var tCount     = tCards.length;
        var tIndex     = 0;
        var tTimer;

        function tVisible() {
            if (window.innerWidth <= 600)  return 1;
            if (window.innerWidth <= 900)  return 2;
            return 3;
        }
        function tStep() { return 100 / tVisible(); }

        function tSize() {
            var pct = tStep();
            var gap = 20;
            for (var c = 0; c < tCards.length; c++) {
                tCards[c].style.width       = 'calc(' + pct + '% - ' + gap + 'px)';
                tCards[c].style.marginRight  = gap + 'px';
                tCards[c].style.flexShrink   = '0';
            }
        }
        function tGo(n) {
            var maxIdx = tCount - tVisible();
            if (maxIdx < 0) maxIdx = 0;
            if (n > maxIdx) n = 0;
            if (n < 0)      n = maxIdx;
            tIndex = n;
            testTrack.style.transition = 'transform .55s cubic-bezier(.4,0,.2,1)';
            testTrack.style.transform  = 'translateX(-' + (tIndex * tStep()) + '%)';
        }
        function tFwd()   { tGo(tIndex + 1); }
        function tBack()  { tGo(tIndex - 1); }
        function tStart() { clearInterval(tTimer); tTimer = setInterval(tFwd, 5000); }
        function tReset() { clearInterval(tTimer); tStart(); }

        tSize();
        tGo(0);
        tStart();

        if (testNext) testNext.addEventListener('click', function () { tFwd();  tReset(); });
        if (testPrev) testPrev.addEventListener('click', function () { tBack(); tReset(); });

        var tWrap = document.querySelector('.testimonials-carousel-wrap');
        if (tWrap) {
            tWrap.addEventListener('mouseenter', function () { clearInterval(tTimer); });
            tWrap.addEventListener('mouseleave', function () { tStart(); });
        }

        var tx = 0;
        testTrack.addEventListener('touchstart', function (e) { tx = e.changedTouches[0].screenX; }, { passive: true });
        testTrack.addEventListener('touchend', function (e) {
            var diff = tx - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) { diff > 0 ? tFwd() : tBack(); tReset(); }
        }, { passive: true });

        window.addEventListener('resize', function () { tSize(); tGo(tIndex); });
    }

    /* ────────────────────────────────────────────────────────────
       EVENT CARD EXPAND / COLLAPSE
       When a user clicks an event card, the .expanded class is toggled.
       CSS uses max-height transition on .event-details to animate the
       detail panel sliding open. Only one card can be expanded at a time:
       clicking a new card closes the previously open one.
       
       Clicking the Google Calendar button (.gcal-btn) does NOT toggle
       the card — the event.stopPropagation() in the onclick handler
       prevents the click from bubbling up to this listener.
       
       Clicking anywhere outside a card closes all expanded cards.
       ──────────────────────────────────────────────────────────── */
    document.addEventListener('click', function (e) {
        if (e.target.closest('.gcal-btn')) return;

        var card = e.target.closest('.event-card');
        if (card) {
            var wasOpen = card.classList.contains('expanded');
            var allOpen = document.querySelectorAll('.event-card.expanded');
            for (var k = 0; k < allOpen.length; k++) allOpen[k].classList.remove('expanded');
            if (!wasOpen) card.classList.add('expanded');
        } else {
            var open = document.querySelectorAll('.event-card.expanded');
            for (var k = 0; k < open.length; k++) open[k].classList.remove('expanded');
        }
    });

    /* ────────────────────────────────────────────────────────────
       SCROLL REVEAL ANIMATION
       Uses IntersectionObserver to watch elements as they enter the
       viewport. Each element starts with opacity:0 and translateY(18px),
       and transitions to visible when it scrolls into view.
       
       The staggered delay (i * 0.04s) creates a cascading entrance
       effect when multiple cards enter the viewport simultaneously.
       
       Once revealed, the element is unobserved to save performance.
       ──────────────────────────────────────────────────────────── */
    var reveals = document.querySelectorAll(
        '.pathway-card, .stat-card, .faculty-card, .club-card, .course-card, .track-section'
    );
    if (reveals.length && 'IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (entries) {
            for (var r = 0; r < entries.length; r++) {
                if (entries[r].isIntersecting) {
                    entries[r].target.style.opacity   = '1';
                    entries[r].target.style.transform  = 'translateY(0)';
                    io.unobserve(entries[r].target);
                }
            }
        }, { threshold: 0.08 });
        for (var r = 0; r < reveals.length; r++) {
            reveals[r].style.opacity    = '0';
            reveals[r].style.transform  = 'translateY(18px)';
            reveals[r].style.transition = 'opacity .55s ease ' + (r * 0.04) + 's, transform .55s ease ' + (r * 0.04) + 's';
            io.observe(reveals[r]);
        }
    }

    /* ────────────────────────────────────────────────────────────
       SMOOTH SCROLL FOR ANCHOR LINKS
       Intercepts clicks on any <a href="#section-id"> and scrolls
       smoothly instead of jumping. Skips bare "#" hrefs to avoid
       the querySelector('#') error that breaks in the Claude preview.
       Wrapped in try/catch as extra safety for invalid selectors.
       ──────────────────────────────────────────────────────────── */
    var anchors = document.querySelectorAll('a[href^="#"]');
    for (var a = 0; a < anchors.length; a++) {
        anchors[a].addEventListener('click', function (e) {
            var href = this.getAttribute('href');
            if (!href || href === '#') { e.preventDefault(); return; }
            try {
                var t = document.querySelector(href);
                if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
            } catch (err) { /* ignore */ }
        });
    }

}); /* end DOMContentLoaded */


/* ═══════════════════════════════════════════════════════════════════
   GOOGLE CALENDAR INTEGRATION
   ─────────────────────────────────────────────────────────────────
   This function is GLOBAL (outside DOMContentLoaded) so that inline
   onclick handlers in the HTML can call it directly.
   
   HOW IT WORKS:
   1. Reads data-gcal-* attributes from the clicked event card:
      - data-gcal-title: Event name
      - data-gcal-date: Start date in YYYYMMDD format (e.g., "20260515")
      - data-gcal-end: End date in YYYYMMDD format
      - data-gcal-details: Event description text
      - data-gcal-location: Venue/location string
   2. Builds a Google Calendar "create event" URL with those values
   3. Opens the URL in a new browser tab
   
   TO ADD A NEW EVENT: Add a new .event-card div in index.html with
   the data-gcal-* attributes. The dates must be in YYYYMMDD format.
   ═══════════════════════════════════════════════════════════════════ */
function addToGCal(card) {
    if (!card) return;
    var title    = card.getAttribute('data-gcal-title')    || '';
    var start    = card.getAttribute('data-gcal-date')     || '';
    var end      = card.getAttribute('data-gcal-end')      || start;
    var details  = card.getAttribute('data-gcal-details')  || '';
    var location = card.getAttribute('data-gcal-location') || '';

    var url = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
        + '&text='     + encodeURIComponent(title)
        + '&dates='    + start + '/' + end
        + '&details='  + encodeURIComponent(details)
        + '&location=' + encodeURIComponent(location);

    window.open(url, '_blank', 'noopener');
}


/* ═══════════════════════════════════════════════════════════════════
   COURSE HIGHLIGHTS PAGE — Additional JavaScript
   Handles: nav dropdown, per-course image carousels, mini carousels
   for testimonials and highlights, and sticky course-nav active state.
   ═══════════════════════════════════════════════════════════════════ */

/* ────────────── NAV DROPDOWN TOGGLE ──────────────
   Clicking the "Course Highlights" nav item toggles the dropdown.
   Clicking anywhere else closes it. Works on all pages. */
var dropdown = document.getElementById('courseDropdown');
var ddToggle = document.getElementById('courseDropdownToggle');
if (dropdown && ddToggle) {
    ddToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('open');
    });
    document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target)) dropdown.classList.remove('open');
    });
    /* Close dropdown when a link inside it is clicked */
    var ddLinks = dropdown.querySelectorAll('.nav-dropdown-menu a');
    for (var d = 0; d < ddLinks.length; d++) {
        ddLinks[d].addEventListener('click', function() { dropdown.classList.remove('open'); });
    }
}

/* ────────────── COURSE IMAGE CAROUSELS ──────────────
   Each course section has its own image carousel marked with
   data-course-carousel. Works identically to the hero carousel:
   one slide at a time, prev/next arrows, dot navigation. */
var courseCarousels = document.querySelectorAll('[data-course-carousel]');
for (var ci = 0; ci < courseCarousels.length; ci++) {
    (function(wrap) {
        var track = wrap.querySelector('.course-carousel-track');
        var slides = wrap.querySelectorAll('.course-carousel-slide');
        var prevBtn = wrap.querySelector('.course-carousel-prev');
        var nextBtn = wrap.querySelector('.course-carousel-next');
        var dotsWrap = wrap.parentElement.querySelector('.course-carousel-dots');
        if (!track || !slides.length) return;

        var cur = 0;
        /* Build dots */
        if (dotsWrap) {
            for (var s = 0; s < slides.length; s++) {
                var dot = document.createElement('span');
                dot.className = s === 0 ? 'dot active' : 'dot';
                dot.setAttribute('data-i', s);
                dot.addEventListener('click', function() { goTo(+this.getAttribute('data-i')); });
                dotsWrap.appendChild(dot);
            }
        }
        var dots = dotsWrap ? dotsWrap.querySelectorAll('.dot') : [];

        function goTo(n) {
            cur = ((n % slides.length) + slides.length) % slides.length;
            track.style.transform = 'translateX(-' + (cur * 100) + '%)';
            for (var j = 0; j < dots.length; j++) {
                dots[j].className = j === cur ? 'dot active' : 'dot';
            }
        }
        if (prevBtn) prevBtn.addEventListener('click', function() { goTo(cur - 1); });
        if (nextBtn) nextBtn.addEventListener('click', function() { goTo(cur + 1); });
    })(courseCarousels[ci]);
}

/* ────────────── MINI CAROUSELS (testimonials + highlights) ──────────────
   Elements with data-mini-carousel="5000" are auto-scrolling carousels
   that show 3 cards (desktop), 2 (tablet), 1 (mobile). Same behavior
   as the events carousel: hover to pause, arrows to navigate. */
var miniCarousels = document.querySelectorAll('[data-mini-carousel]');
for (var mi = 0; mi < miniCarousels.length; mi++) {
    (function(track) {
        var cards = track.children;
        var count = cards.length;
        var idx = 0;
        var interval = parseInt(track.getAttribute('data-mini-carousel')) || 5000;
        var timer;
        var wrap = track.closest('.course-testimonials-wrap, .course-highlights-wrap');
        var prevBtn = wrap ? wrap.querySelector('[data-mini-prev]') : null;
        var nextBtn = wrap ? wrap.querySelector('[data-mini-next]') : null;

        function vis() {
            if (window.innerWidth <= 600) return 1;
            if (window.innerWidth <= 900) return 2;
            return 3;
        }
        function step() { return 100 / vis(); }
        function size() {
            var pct = step(); var gap = 16;
            for (var c = 0; c < cards.length; c++) {
                cards[c].style.width = 'calc(' + pct + '% - ' + gap + 'px)';
                cards[c].style.marginRight = gap + 'px';
                cards[c].style.flexShrink = '0';
            }
        }
        function go(n) {
            var mx = count - vis();
            if (mx < 0) mx = 0;
            if (n > mx) n = 0;
            if (n < 0) n = mx;
            idx = n;
            track.style.transition = 'transform .5s cubic-bezier(.4,0,.2,1)';
            track.style.transform = 'translateX(-' + (idx * step()) + '%)';
        }
        function fwd() { go(idx + 1); }
        function back() { go(idx - 1); }
        function start() { clearInterval(timer); timer = setInterval(fwd, interval); }

        size(); go(0); start();
        if (nextBtn) nextBtn.addEventListener('click', function() { fwd(); clearInterval(timer); start(); });
        if (prevBtn) prevBtn.addEventListener('click', function() { back(); clearInterval(timer); start(); });

        /* Hover pause */
        if (wrap) {
            wrap.addEventListener('mouseenter', function() { clearInterval(timer); });
            wrap.addEventListener('mouseleave', function() { start(); });
        }
        window.addEventListener('resize', function() { size(); go(idx); });
    })(miniCarousels[mi]);
}

/* ────────────── COURSE NAV ACTIVE STATE ──────────────
   Highlights the correct course tab in the sticky course-nav
   as the user scrolls through the course sections. */
var courseNavLinks = document.querySelectorAll('.course-nav-link');
if (courseNavLinks.length > 0 && 'IntersectionObserver' in window) {
    var courseObs = new IntersectionObserver(function(entries) {
        for (var e = 0; e < entries.length; e++) {
            if (entries[e].isIntersecting) {
                var id = entries[e].target.getAttribute('id');
                for (var n = 0; n < courseNavLinks.length; n++) {
                    var href = courseNavLinks[n].getAttribute('href');
                    courseNavLinks[n].classList.toggle('active', href === '#' + id);
                }
            }
        }
    }, { rootMargin: '-20% 0px -80% 0px' });
    var courseSections = document.querySelectorAll('.course-section');
    for (var cs = 0; cs < courseSections.length; cs++) courseObs.observe(courseSections[cs]);
}
