# DESIGN.md: Kalkulator TOPSIS (3D Emboss Liquid Glass, Poppins, Three.js & GSAP)

## Design Read
Reading this as: Multi-Criteria Decision Analysis (TOPSIS) Interactive Web & Mobile App for analysts, students, and decision-makers, in a Serene 3D Emboss Liquid Glass visual language (borderless 3D convex/concave glass surfaces, Three.js 3D Euclidean refractive background, GSAP + Lenis smooth scrolling choreography, and Poppins geometric typography), dial `ENERGY 2 / RHYTHM 2 / MOTION 3`.

## R-37 Direction Override Record
- **R-10, R-12, & R-19 Overrides (Explicitly Instructed by Owner):** The owner explicitly requested removing all solid borders/outlines (`border: none`), replacing them with 3D emboss/deboss shadows (`inset` specular highlights + multi-layered 3D drop shadows), using **Poppins** typography, and adding **smooth scrolling (Lenis)**, **Three.js 3D WebGL geometry**, and **GSAP animations**.

## Brand Identity & Personality
- **Identity:** Precision multi-criteria decision analysis (Hwang & Yoon, 1981) sculpted inside a tactile, borderless 3D Liquid Glass workspace backed by a live Three.js Euclidean crystal lightfield and choreographed with GSAP + Lenis smooth scrolling.
- **Personality:** Serene, futuristic, tactile 3D depth, cool silver-blue and sapphire-grey atmosphere.

## Color Palette & Contrast Verification (`contrast-check.py`)
- **Luminous Silver-Blue 3D Glass Mode (Default `data-theme="light"`):**
  - **Ambient 3D Lightfield Canvas:** Cool Silver-Blue & Periwinkle Mist (`#C2D3E6` to `#DAE6F4`) with a live Three.js 3D WebGL Euclidean crystal scene behind the frosted glass.
  - **3D Convex Frosted Glass Pod:** Translucent Ice-Blue Glass (`rgba(225, 237, 250, 0.68)` / effective `#DCE7F4`) with `backdrop-filter: blur(14px) saturate(175%)` and 3D emboss bevel (`inset 2px 2px 5px rgba(255, 255, 255, 0.92), inset -3px -3px 7px rgba(115, 145, 182, 0.28)`).
  - **3D Recessed (Concave) Input & Formula Wells:** Carved Ice Well (`#D6E3F3`) with inner deboss shadow (`inset 3px 3px 6px rgba(42, 72, 112, 0.20), inset -2px -2px 5px rgba(255, 255, 255, 0.88)`).
  - **Primary Text on Light 3D Glass:** Deep Sapphire-Slate (`#0F1E36`, contrast ratio **13.32:1** on `#DCE7F4` and **12.82:1** on `#D6E3F3`).
  - **Secondary Text on Light 3D Glass:** Cool Slate-Blue (`#344B6A`, contrast ratio **7.11:1** on `#DCE7F4`).
  - **Primary 3D Cobalt Glass Button:** Glossy 3D Cobalt-Azure (`#1E56B8` to `#2563EB`) with crisp white text (`#FFFFFF`, contrast ratio **6.82:1**).
  - **Deep 3D Sapphire Spotlight Block:** Translucent Sapphire (`#142642`) with `#F4F8FF` text (contrast ratio **14.23:1**).
- **Twilight Sapphire 3D Glass Mode (`data-theme="dark"`):**
  - **Ambient 3D Canvas:** Deep Twilight Slate-Blue (`#132034` to `#1C2F4A`) with glowing cyan-blue 3D Three.js polyhedra.
  - **3D Convex Glass Pod:** Translucent Cobalt-Slate (`rgba(32, 52, 82, 0.68)` / effective `#203452`) with 3D top-left specular gleam and bottom-right emboss shadow.
  - **Primary Text on Dark 3D Glass:** Crisp Ice White (`#F4F8FF`, contrast ratio **11.78:1** on `#203452`).
  - **Secondary Text on Dark 3D Glass:** Soft Silver-Blue (`#BDD2EC`, contrast ratio **8.12:1** on `#203452`).

## Typography
- **Primary UI & Display Font:** `"Poppins", sans-serif` (weights 300, 400, 500, 600, 700), explicitly requested by the user for modern, rounded geometric clarity on 3D glass surfaces.
- **Monospace (Mathematical Matrices & Formulas):** `"JetBrains Mono", "SFMono-Regular", Consolas, monospace` for aligned 4-decimal numerical matrices.

## Dials
- **Dial:** `ENERGY 2 / RHYTHM 2 / MOTION 3`
- **MOTION 3 (Choreographed 3D & Smooth Inertia):** Lenis smooth inertia scrolling synced to the GSAP ticker, GSAP 3D staggered card transitions on tab/preset switches, interactive GSAP 3D tilt on the Champion Spotlight card, and a Three.js 3D Euclidean glass polyhedra background that responds to scroll and pointer parallax while respecting `prefers-reduced-motion: reduce`.

## One-Line Reasons for Major Decisions (R-31)
- **Why Poppins typography?** Explicitly requested by the owner to give the 3D Liquid Glass interface a clean, modern geometric voice.
- **Why zero solid borders (`border: none`) replaced by 3D emboss/deboss shadows?** Explicitly requested by the owner so surfaces read as sculpted 3D liquid glass (convex raised cards and concave carved input wells) instead of flat outlined boxes.
- **Why Three.js 3D Euclidean polyhedra in the background?** Provides real moving 3D geometric light refraction behind the frosted glass panels (`backdrop-filter: blur(14px)`) while visually symbolizing the n-dimensional Euclidean space of TOPSIS.
- **Why GSAP + Lenis smooth scrolling?** Delivers fluid inertia scrolling between TOPSIS stages and choreographed 3D card entrances when switching presets or tabs.
- **Why differentiated border radii (28px outer pods, 20px inner 3D cards, 13px recessed inputs/buttons)?** Reinforces the 3D molded glass hierarchy across nested layers (R-11).
