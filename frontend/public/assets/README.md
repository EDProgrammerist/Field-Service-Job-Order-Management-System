# Public asset manifest

The files in this directory are static public-page media. Vite serves them from `/assets/...`.

## Art direction

- Built-in image-generation tool
- Editorial 3D field-service illustration
- Filipino customers and technicians
- Charcoal and navy clothing with restrained `#4F46E5` indigo and `#06B6D4` cyan accents
- Transparent PNG output with no text, logos, watermarks, or fake application interfaces
- Soft studio lighting, practical equipment, realistic anatomy, and clean silhouettes

The homepage team image was generated first and used as the style and uniform reference for the remaining images. Exact facial identity is not required to repeat between scenes.

## Files

| File | Dimensions | Placement | Accessibility |
| --- | ---: | --- | --- |
| `public-pages/home-technician-team.png` | 1536 x 1024 | Homepage hero | Meaningful alt text in the media registry |
| `public-pages/home-technician-choice.png` | 1254 x 1254 | Technician profiles service card | Decorative because adjacent copy describes it |
| `public-pages/home-dispatcher-scheduling.png` | 1254 x 1254 | Schedule coordination service card | Decorative because adjacent copy describes it |
| `public-pages/home-repair-progress.png` | 1254 x 1254 | Job order history service card | Decorative because adjacent copy describes it |
| `public-pages/auth-technician-sign-in.png` | 1024 x 1536 | Sign-in page | Decorative because the form supplies the page meaning |
| `public-pages/auth-customer-registration.png` | 1024 x 1536 | Customer registration page | Decorative because the form supplies the page meaning |

Runtime paths, intrinsic sizes, alt text, and loading priority are centralized in `frontend/src/content/public-media.ts`.

## Final prompts

### Homepage technician team

```text
Use case: stylized-concept
Asset type: transparent landing-page hero illustration
Primary request: three Filipino field-service technicians ready for equipment repair work
Scene/backdrop: genuinely transparent background with no floor rectangle and no environment panel
Subject: a balanced team of three Filipino adults, two women and one man, wearing practical charcoal and navy field-service uniforms; one technician holds a diagnostic tablet, one carries a compact tool bag, and one holds a safe handheld electrical meter; competent, approachable expressions; natural realistic hands and proportions
Style/medium: polished editorial 3D illustration, premium soft dimensional rendering, clean contemporary shapes, realistic enough to feel professional rather than toy-like
Composition/framing: landscape group composition, full figures visible from head to shoes, subjects grouped toward the right with breathing room on the left, clean silhouette suitable for layering over a website gradient
Lighting/mood: soft studio lighting, calm confidence, subtle shadows contained within the cutout
Color palette: charcoal and navy uniforms with restrained indigo #4F46E5 and cyan #06B6D4 accents, neutral skin tones and equipment
Materials/textures: matte fabric, subtle molded plastic, brushed metal tools
Constraints: actual transparent alpha background; no text; no logos; no watermark; no badges with writing; no fake interface; plausible diagnostic equipment; complete uncropped bodies and tools
Avoid: malformed hands, extra fingers, duplicated tools, hard hats unless occupationally necessary, construction-site styling, glossy toy aesthetic, neon glow, busy background
```

### Technician choice

```text
Use case: stylized-concept
Asset type: transparent homepage service-card illustration
Input images: Image 1 is the approved visual-style and uniform reference only
Primary request: represent a customer choosing among several field-service technicians
Scene/backdrop: genuinely transparent background, no environment panel and no fake interface
Subject: three approachable Filipino field-service technicians shown as distinct waist-up portraits in a clean staggered composition; mixed genders and ages; practical charcoal and navy uniforms; subtle differences in tools and specialization such as diagnostic tablet, compact meter, and wrench; professional, trustworthy expressions
Style/medium: match Image 1's polished editorial 3D rendering, material finish, lighting, uniform design, and restrained realism
Composition/framing: square composition with three clearly separated portrait figures, clean silhouette, centered with generous transparent margins for a small website card
Lighting/mood: soft studio lighting, welcoming and competent
Color palette: charcoal and navy with restrained indigo #4F46E5 and cyan #06B6D4 accents
Constraints: actual transparent alpha background; no text; no logos; no watermark; no profile cards; no check marks; no interface chrome; anatomically natural hands; do not crop heads
Avoid: duplicate faces, malformed hands, extra fingers, busy background, neon glow, glossy toy aesthetic
```

### Dispatcher scheduling

```text
Use case: stylized-concept
Asset type: transparent homepage service-card illustration
Input images: Image 1 is the approved visual-style and uniform reference only
Primary request: show dispatcher scheduling coordination for a selected field technician
Scene/backdrop: genuinely transparent background with no room, no wall panel, and no fake software screen
Subject: a Filipino dispatcher in smart charcoal office clothing holding a plain tablet and gesturing toward a simple floating calendar made only of blank geometric tiles, beside one Filipino field-service technician in the same navy and cyan uniform as Image 1 receiving the schedule on a handheld device; natural professional interaction
Style/medium: match Image 1's polished editorial 3D rendering, material finish, lighting, and restrained realism
Composition/framing: compact square two-person composition, dispatcher slightly left and technician slightly right, complete heads and hands, clean silhouette, generous transparent margins
Lighting/mood: soft studio lighting, organized and calm
Color palette: charcoal and navy with restrained indigo #4F46E5 and cyan #06B6D4 accents
Constraints: actual transparent alpha background; no readable text; no numbers; no logos; no watermark; no branded devices; no detailed fake interface; anatomically natural hands
Avoid: malformed hands, extra fingers, construction site, wall calendar with writing, neon glow, busy background, glossy toy aesthetic
```

### Repair progress

```text
Use case: stylized-concept
Asset type: transparent homepage service-card illustration
Input images: Image 1 is the approved visual-style and uniform reference only
Primary request: a Filipino field-service technician actively diagnosing and repairing equipment while recording progress
Scene/backdrop: genuinely transparent background with no room or environment panel
Subject: one Filipino woman technician in the same charcoal, navy, indigo, and cyan uniform as Image 1; kneeling beside a compact, generic commercial equipment unit with its safe service panel open; using a handheld diagnostic meter with one hand while checking a plain tablet resting nearby; a small organized tool bag at her side; focused and capable expression
Style/medium: match Image 1's polished editorial 3D rendering, material finish, lighting, and restrained realism
Composition/framing: compact square composition, complete technician head, hands, equipment, and tools visible; clean silhouette with transparent margins
Lighting/mood: soft studio lighting, precise and dependable
Color palette: charcoal and navy with restrained indigo #4F46E5 and cyan #06B6D4 accents
Constraints: actual transparent alpha background; no text; no logos; no watermark; no readable screen interface; electrically safe pose; plausible tools and equipment; anatomically natural hands
Avoid: sparks, hazards, exposed live wiring, malformed hands, extra fingers, construction site, busy background, neon glow, glossy toy aesthetic
```

### Sign-in technician

```text
Use case: stylized-concept
Asset type: transparent sign-in page illustration
Input images: Image 1 is the approved visual-style and uniform reference only
Primary request: a confident Filipino field-service technician ready to access a digital workspace
Scene/backdrop: genuinely transparent background with no environment panel
Subject: one Filipino man technician in the same charcoal and navy uniform with restrained blue accents as Image 1; standing in a relaxed three-quarter pose, holding a rugged blank tablet in one hand and a compact closed tool bag in the other; friendly, capable expression
Style/medium: match Image 1's polished editorial 3D rendering, material finish, lighting, and restrained realism
Composition/framing: portrait composition with full body from head to shoes, centered slightly to the right, clean silhouette and transparent margins, suitable beside a sign-in form
Lighting/mood: soft studio lighting, secure and welcoming
Color palette: charcoal and navy with restrained indigo #4F46E5 and cyan #06B6D4 accents
Constraints: actual transparent alpha background; no text; no logos; no watermark; blank tablet screen; no interface; complete uncropped body and tools; anatomically natural hands
Avoid: malformed hands, extra fingers, duplicated tools, construction-site styling, hard hat, neon glow, busy background, glossy toy aesthetic
```

### Customer registration

```text
Use case: stylized-concept
Asset type: transparent customer-registration page illustration
Input images: Image 1 is the approved visual-style and uniform reference only
Primary request: a Filipino customer beginning a repair request with help from a field-service technician
Scene/backdrop: genuinely transparent background with no room or environment panel
Subject: a Filipino woman customer in clean casual clothing using a plain smartphone while speaking with a Filipino woman field-service technician in the same charcoal and navy uniform as Image 1; the technician holds a closed clipboard and gestures helpfully toward a compact generic appliance beside them; warm professional interaction that represents creating an account and requesting service
Style/medium: match Image 1's polished editorial 3D rendering, material finish, lighting, and restrained realism
Composition/framing: portrait two-person composition, full figures visible from head to shoes, compact appliance fully visible, centered slightly right with transparent margins, suitable beside a registration form
Lighting/mood: soft studio lighting, welcoming and reassuring
Color palette: charcoal and navy with restrained indigo #4F46E5 and cyan #06B6D4 accents; customer clothing in quiet neutral tones
Constraints: actual transparent alpha background; no text; no logos; no watermark; blank phone screen; no readable clipboard content; no fake interface; complete uncropped bodies; anatomically natural hands
Avoid: malformed hands, extra fingers, sales or retail scene, construction-site styling, neon glow, busy background, glossy toy aesthetic
```

## Replacement rules

1. Inspect `Design.md` and this manifest before generating a replacement.
2. Use the built-in image-generation tool and keep the approved team image as the style reference.
3. Do not overwrite a current asset unless replacement was explicitly requested. Use a versioned filename during review.
4. Verify transparency, anatomy, tool plausibility, crop, and absence of unwanted text at original resolution.
5. Update the media registry and this manifest if filename, dimensions, placement, or alt treatment changes.
6. Run the frontend build, lint, and public-page responsive checks.
