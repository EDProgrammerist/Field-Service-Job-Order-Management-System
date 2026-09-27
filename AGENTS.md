# Repository guidance

These instructions apply to the entire repository.

## Public-page assets

- Read [the public asset manifest](frontend/public/assets/README.md) and `Design.md` before changing the homepage, sign-in page, or customer registration page.
- Store public-page raster media in `frontend/public/assets/`. Vite serves this directory at `/assets/...`.
- Generate project illustrations with the image model. Do not hotlink stock images or introduce remote image URLs, base64 blobs, watermarks, logos, or text baked into generated artwork.
- Keep stable, descriptive, kebab-case filenames. Do not overwrite an existing asset unless replacement was explicitly requested; otherwise add a version suffix.
- Record every generated asset in the manifest with its page placement, dimensions, accessibility treatment, final prompt, and generation method.
- Preserve intrinsic dimensions, meaningful alt text where needed, empty alt text for adjacent decorative illustrations, responsive behavior, reduced-motion behavior, and the WebGL fallback.
- Keep public-page artwork and styling out of admin, dispatcher, technician, and customer dashboards. Dynamic technician profile photos must continue to come from application data.
- After changing public assets or their layouts, run `npm run build` and `npm run lint` from `frontend/` and check `/`, `/login`, and `/customer/register` at mobile and desktop widths.

## Project safety

- Preserve authentication fields, validation, API calls, routes, role redirects, and backend authorization unless the task explicitly changes them.
- Keep unrelated user changes intact and inspect `git status` before editing.
