# Interactive showroom

## Preview

Open `index.html` with VS Code Live Server, or run from this folder:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Visit `http://127.0.0.1:8765/index.html`. Hard refresh with Ctrl+F5 after editing.

## Experience

- Arrival: a clean architectural entrance with no vehicle covering the showroom.
- Walkthrough: an uncluttered architectural transition with no vehicle cards.
- Collection: clickable T-Roc and Jetour displays linked to the existing inventory, revealed only at the final stage.
- The three-screen pinned journey scrubs from arrival to walkthrough to collection as the visitor scrolls. The previous lounge stage was removed.
- Mouse movement shifts and tilts the architecture, foreground pillar, reflections and lighting at different depths.
- Hotspots, itinerary buttons and previous/next controls move to the corresponding point in the journey. Normal page scrolling continues into the full catalogue.
- Touch screens use buttons; itinerary arrows/Home/End support keyboard navigation. Motion can be paused and follows the system's reduced-motion setting.

This is a photographic, layered visual tour, not a freely navigable 3D model or a scan of the physical premises. The existing Roewe sprite has 16 angles. Rendering a single opaque angle avoids doubled wheels/transparent bodywork; continuous 3D-quality rotation would require denser, consistent photography or an actual licensed model.

## Implementation

- `index.html`: tour markup and existing catalogue/contact sections.
- `tour.css`: scoped room layouts, perspective layers and responsive presentation.
- `tour.js`: room state, GSAP camera transitions, pointer smoothing and accessible controls.
- `showroom.js`: existing vehicle details and inventory reveal animations; conflicting legacy hero animations remain disabled.
- `data.js`, `script.js` and admin files retain their existing data and business behavior. No backend or production admin authentication was added.

Tour displays use published entries from the existing inventory. Prices retain the existing `M` notation. No additional vehicles are introduced.

## Browser regression checks

Install Playwright in your development environment, start the preview server, then run:

```powershell
node tests/tour-check.cjs
```

If installed outside the project, set `NODE_PATH` to that installation's `node_modules`. Optional variables: `TEST_BASE_URL` (defaults to the local URL above) and `CHROME_PATH`. Windows defaults to the standard Chrome installation; other systems use Playwright's installed Chromium.

The checks cover camera transitions, fixed vehicle size, pause, details, filtering and card reveals, favourites, comparison, reduced motion, touch navigation, mobile menu and horizontal overflow. WhatsApp is intercepted locally: no message is sent. Screenshots go to the OS temporary folder.

## Generated showroom asset

`assets/showroom/abidi-showroom-panorama-v2.png` was generated with the built-in image-generation tool for this project.

Final prompt: "Create a completely new, ultra-premium photorealistic automobile showroom interior for a full-width interactive website background, with three connected spaces: a dramatic arrival hall, refined vehicle gallery, and private consultation lounge. Use an expansive eye-level panoramic composition with strong horizontal depth, open central floor for an overlaid car, and a darker left area for website copy. Use blue-hour exterior light, warm interior pools of light, dark emerald panels, charcoal stone, smoked glass, dark wood, and restrained champagne brass. No vehicles, people, logos, brand names, readable text, watermark, signage, UI, or distorted architecture."
