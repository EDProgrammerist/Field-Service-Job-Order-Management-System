---
version: "neuform-top-creators-featured"
name: "Auralis - Neural Audio Engine"
description: "Auralis Neural Login Section is designed for authenticating users through a focused access flow. Key features include reusable structure, responsive behavior, and production-ready presentation. It is suitable for authentication screens in web products."
colors:
  primary: "#4F46E5"
  secondary: "#FFFFFF"
  accent: "#06B6D4"
  background: "#FFFFFF"
  surface: "#1C1C1E"
  text-primary: "#111827"
  text-secondary: "#4B5563"
  border: "#E5E7EB"
typography:
  display-lg:
    fontFamily: "Geist"
    fontSize: "64px"
    fontWeight: 500
    lineHeight: "1.04"
    letterSpacing: "0"
  body-md:
    fontFamily: "Geist"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "1.6"
  label-md:
    fontFamily: "JetBrains Mono"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: "1.2"
spacing:
  base: "8px"
  gap: "16px"
  card-padding: "24px"
  section-padding: "80px"
rounded:
  card: "8px"
  control: "8px"
  pill: "9999px"
components:
  card:
    background: "Use the surface token with subtle borders and HTML-matched shadow depth"
    radius: "Match the declared card radius token"
  button:
    background: "Use primary or accent colors for the main action"
    radius: "Use the control or pill radius based on the source HTML"
---
# Auralis - Neural Audio Engine
Source: Neuform Featured templates from top creators. Author: Sourasith Phomhome (@madebysourasith). Views: 536; favorites: 31; remixes: 26.
Tags: login, animated, webgl, threejs, security, input, validation, effect.
## Overview
Auralis Neural Login Section is designed for authenticating users through a focused access flow. Key features include reusable structure, responsive behavior, and production-ready presentation. It is suitable for authentication screens in web products.

AURALIS ° Platform Solutions Developers Company Docs Sign in Next-Gen Audio Synthesis Speak Naturally. Across Borders. Limitless Reach. Synthesize human-like audio instantly, clone vocal profiles with striking accuracy.…
## Composition
Use the attached HTML reference as the source of truth. Preserve the visible hierarchy, first-screen composition, section rhythm, density, and interaction tone before adapting copy or content.
Key visible headings include: Speak Naturally. Across Borders. Limitless Reach.; Fluid Dictation; Vocal Replication; Commercial-Grade.
## Colors
Anchor the palette in primary #4F46E5, secondary #FFFFFF, accent #06B6D4, background #FFFFFF, surface #1C1C1E, text-primary #111827. Keep background, surface, text, and border roles distinct so generated layouts retain the same contrast pattern as the source.
## Typography
Use Geist for display moments and Geist for body copy unless the HTML clearly demands a compatible fallback. Labels and technical metadata should use JetBrains Mono or an equivalent mono face.
## Layout
Keep spacing deliberate and stable. Favor the same grid direction, max-width behavior, card density, and responsive stacking seen in the HTML. Do not replace distinctive source structures with generic SaaS sections.
## Components
Authentication and CTA controls should preserve the source button hierarchy, input density, and focused conversion path.
## Motion
Preserve existing motion cues such as masked reveals, staggered entrance, hover lift, scroll-triggered transitions, and ambient movement. Keep easing smooth and restrained.
## WebGL & Effects

If the source includes canvas, WebGL, Three.js, gradients, particles, or atmospheric effects, rebuild them as supporting layers behind the content. Keep effects performant, responsive, and secondary to the interface.

## Guardrails
- Do not flatten the source into a generic card grid.
- Do not swap the color mode unless the source clearly supports it.
- Preserve the first viewport signal, focal object, and visual density.
- Keep buttons, cards, and badges aligned to the same radius and border language.

---

# Field Service adaptation

The Auralis specification above is preserved as a **source reference**. Its audio-product wording, example navigation, and prototype implementation are not instructions to add audio features or unrelated pages to this application.

## Scope

Redesign only the public homepage (`/`), sign-in (`/login`), and customer registration (`/customer/register`). Keep the Field Service identity, existing application workflows, role dashboards, backend, and private-page styling unchanged.

## Homepage composition

Preserve the Auralis first-screen structure: header, left-aligned hero with a small label and two actions, right-side animated canvas with five glass slices, and a three-item feature strip. This is the opening viewport, not the entire homepage. Continue below it with project-specific About, Services, How It Works, Contact, and footer sections. Keep the first-screen layout and animation unchanged; extend its indigo/cyan palette, typography, spacing, and restrained motion to the remaining sections.

Use accurate Field Service copy:

- Hero label: “FIELD SERVICE WORKFLOW”
- Hero headline: “Request Service. Choose Your Technician. Track Every Step.”
- Supporting text: Explain that customers can request repairs, review technician profiles, and follow job progress.
- Feature 1: “Choose a technician” — customers review available technician profiles.
- Feature 2: “Dispatcher scheduling” — the dispatcher assigns schedule dates.
- Feature 3: “Repair progress” — customers follow their job order’s status.

Do not advertise pricing, audio generation, live notifications, or any workflow that is not implemented.

| Element | Destination |
| --- | --- |
| Brand/home link | `/` |
| Header and footer section links | `/#about`, `/#services`, `/#how-it-works`, `/#contact` |
| Header sign-in link | `/login` |
| Header create-account link | `/customer/register` |
| Primary hero action, “Create Customer Account” | `/customer/register` |
| Secondary hero action, “Explore Workflow” | `/#how-it-works` |

The first-screen feature strip retains `id="features"`. All header and footer destinations point to real homepage sections or existing authentication routes.

## Authentication pages

Use the Auralis visual shell for `/login` and `/customer/register`: functional form content on the left, atmospheric animated visual on the right. The registration page may scroll to accommodate its longer form. Preserve all existing field names, validation rules, API calls, error handling, and successful role redirects. Registration remains customer-only; sign-in remains available to all supported roles.

## WebGL and motion implementation

Rebuild the reference’s animated indigo/cyan shader and five glass slices as one reusable public-page visual component. Use locally installed `three` and TypeScript definitions through npm rather than CDN scripts. Retain the visible entrance timing—approximately 0.8 seconds with 120 ms stagger—while making the canvas responsive and cleaning up animation frames, listeners, and GPU resources when React unmounts it.

If WebGL is unavailable, show a static visual with the same palette and composition. Respect reduced-motion preferences by stopping ambient movement and disabling entrance transforms while keeping content visible.

## Accessibility and styling boundaries

Keep text and controls readable above the effect. The canvas and decorative glass slices must not intercept input or enter keyboard navigation. Preserve visible focus states and form labels. Scope all new styles to the three public pages; do not change shared dashboard design tokens.