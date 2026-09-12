# Abidi Motors website

This repository contains the first browser-based Abidi Motors showroom prototype.

## Open the website

Open `index.html` directly in a modern browser. For the most consistent local behaviour, serve the folder with any static web server, for example:

```powershell
python -m http.server 5500
```

Then open the local address printed in the terminal.

## Pages

- `index.html` — public showroom, catalogue, vehicle presentation and enquiry form.
- `admin.html` — prototype inventory dashboard.
- `PRODUCT_BLUEPRINT.md` — product and implementation plan.

## Prototype data

Admin edits are saved in the current browser's `localStorage`, making them immediately visible on the public page in that browser. This is only for prototype testing. A production release must replace it with authenticated server-side administration, a database, asset storage, and real enquiry delivery.

The Volkswagen T-Roc Grenardo entry includes an original AI-generated sixteen-angle sprite and manual drag/swipe 360-degree presentation in the vehicle viewer. Its optimized self-hosted source is `assets/cars/volkswagen-t-roc/t-roc-360-sprite-16-white-v3.jpg`. It is labelled as a preview because exact vehicle details may differ.

The white Roewe i5 uses an optimized self-hosted sixteen-angle sprite in its vehicle detail view at `assets/cars/roewe-i5/roewe-i5-detail-360-16-white-v4.jpg`.

The public T-Roc viewer is fully self-hosted and makes no request to an external 3D platform. A future polygonal GLB model should likewise be stored and served from Abidi Motors infrastructure after its commercial licence is verified.

All runtime showroom and catalogue images are served from the local `assets` folder. A genuine free-camera 3D viewer requires a licensed GLB/glTF model; the T-Roc prototype currently demonstrates a photographic spin viewer.

## Performance profile

Touch devices, reduced-motion users, data-saver connections and low-memory hardware automatically use the lightweight showroom profile. It keeps local room transitions and the full catalogue, but skips GSAP, cursor depth, blur-heavy effects and continuous decorative animation. Catalogue photos load only as the visitor approaches them.
