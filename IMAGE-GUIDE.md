# IMAGE GUIDE — How to Replace the Placeholder Photos

Every photo slot on the site currently points at the same file:
`images/placeholder.jpg` (a navy "PHOTO COMING SOON" graphic).
This guide shows exactly how to swap in real photos.

---

## The 3-step swap

1. **Drop your photo into `/images`** with a short, descriptive,
   lowercase name. Suggested pattern: `page-subject.jpg`
   - `home-robotics.jpg`
   - `ied-3dprinting.jpg`
   - `morning-controlroom.jpg`

2. **Open the page's HTML file** and find the slide. Every slide is
   labeled with a comment telling you what photo belongs there:

   ```html
   <!-- Slide 2 · swap src → robotics build/competition photo -->
   <figure class="hero-slide">
       <img src="images/placeholder.jpg" loading="lazy"
            alt="Robotics team assembling a competition robot in the workshop">
       <figcaption class="slide-caption">Robotics Workshop</figcaption>
   </figure>
   ```

3. **Change ONLY the `src`** to your new filename:

   ```html
   <img src="images/home-robotics.jpg" loading="lazy"
        alt="Robotics team assembling a competition robot in the workshop">
   ```

That's the whole job. Don't touch the classes, the `loading="lazy"`
attribute, or the figcaption (unless the caption itself should change).

---

## Rules that keep the site looking right

- **Update the `alt` text** if your photo shows something different
  from what the alt describes. Alt text is what screen readers
  announce and what shows if the image fails — keep it honest.
- **Landscape, roughly 16:9.** Slides are letterboxed to 16:9 with
  `object-fit: cover`, so a 1600×900 (or larger) landscape photo fills
  the frame perfectly. Portrait photos will be heavily cropped.
- **Keep files under ~400 KB.** Export JPGs at quality 80–85, or use
  a compressor like squoosh.app. Big files = slow phones.
- **`loading="lazy"` stays** on every slide except the first one in
  each carousel (the first must load immediately; the rest can wait).
- **Get photo permission.** Follow school policy for photos of
  students — when in doubt, ask Ms. G before publishing a face.

---

## Where the photo slots are

| Page            | Carousel slots | Subjects (in order) |
|-----------------|---------------:|---------------------|
| index.html      | 10 | Engineering lab, robotics, 3D printing, woodworking, TV studio, STEM Night, CS lab, CAD, student projects, construction |
| ied.html        | 4  | Design sketching, CAD station, 3D prints, engineering notebook |
| poe.html        | 4  | VEX robotics, circuits lab, bridge testing, machine control |
| capstone.html   | 4  | Team build, research, testing, panel presentation |
| apcsp.html      | 4  | Python coding, app demo, data project, Create Task workshop |
| apcyber.html    | 4  | Virtual lab, network defense, threat analysis, CTF practice |
| vehicular.html  | 4  | Engine teardown, welding bay, plasma cutting, vehicle lift |
| morning.html    | 4  | Control room, anchor desk, field shoot, editing suite |

(about.html has no photo slots — it's diagrams and cards by design.)

Once every slide has a real photo, you can delete `placeholder.jpg`.
