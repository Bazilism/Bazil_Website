# Bazil — Portfolio

A responsive portfolio for product imagery, CGI, and motion work.

## Preview

Open `index.html` directly, or run:

```sh
node preview.cjs
```

Then visit http://127.0.0.1:4173. The local server supports video seeking.

## Contents

- 16 collections: eight image series and eight films.
- 51 portfolio images with optimized gallery thumbnails.
- Full-width project headers, image enlargement, and video playback.
- Three Instagram previews displayed in their original proportions and linked to the original posts.
- Responsive layout, keyboard navigation, and reduced-motion support.

Edit `projects.js` for project titles, descriptions, ordering, and media. Page structure is in `index.html`, styling in `style.css`, and interactions in `app.js`. Media is grouped by project under `assets/`.

No build step, framework, or remote dependency is required. To host the site, serve the repository root from a static hosting provider.

Instagram: [@the_bazilism](https://www.instagram.com/the_bazilism/).

The Instagram previews are saved thumbnails, not a live feed. The compilation reel is intentionally excluded. Artwork remains the property of its respective rights holders; no redistribution license is granted.
