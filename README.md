# Abidi Motors website

This repository contains the first browser-based Abidi Motors showroom prototype.

## Open the website

Open `index.html` directly in a modern browser. For the most consistent local behaviour, serve the folder with any static web server, for example:

```powershell
npx.cmd serve .
```

Then open the local address printed in the terminal.

## Pages

- `index.html` — public showroom, catalogue, vehicle presentation and enquiry form.
- `admin.html` — prototype inventory dashboard.
- `PRODUCT_BLUEPRINT.md` — product and implementation plan.

## Prototype data

Admin edits are saved in the current browser's `localStorage`, making them immediately visible on the public page in that browser. This is only for prototype testing. A production release must replace it with authenticated server-side administration, a database, asset storage, and real enquiry delivery.

The Volkswagen T-Roc Grenardo entry includes an original AI-generated sixteen-angle sprite and manual drag/swipe 360-degree presentation in the vehicle viewer. Its source is `assets/cars/volkswagen-t-roc/t-roc-360-sprite-16-white-v3.png`. It is labelled as a preview because exact vehicle details may differ.

The white Roewe i5 is the hero vehicle and uses automatic, draggable canvas rotation. Its rebuilt reference-matched sixteen-angle source is stored at `assets/cars/roewe-i5/roewe-i5-reference-360-16-chroma-v4.png`; the hero canvas removes the uniform chroma background with feathered edges and spill correction before rendering.

The public T-Roc viewer is fully self-hosted and makes no request to an external 3D platform. A future polygonal GLB model should likewise be stored and served from Abidi Motors infrastructure after its commercial licence is verified.

Other illustrated cars are temporary visual placeholders. Licensed vehicle photography, real 360-degree image sequences, or optimized commercially licensed GLB models should replace them when source assets are available. A genuine free-camera 3D viewer requires a licensed GLB/glTF model; the T-Roc prototype currently demonstrates a photographic spin viewer.
