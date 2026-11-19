# Vice Cover Studio

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/Abir2021/gta6-cover-art-01-abir/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/Abir2021/gta6-cover-art-01-abir/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

[![License: MIT](https://img.shields.io/badge/license-MIT-8ebd42.svg)](LICENSE)

An entry for [make.fun's GTA 6 cover art bounty](https://make.fun/bounty/gta6-cover-art-01): a web app that turns your photos into a bold multi-panel poster cover in the style of a Vice City sunset poster — and exports it as a PNG to share.

## What it does

- **Multi-panel mosaic** — 5 layouts: 1 Hero, 2 Split, 3 Strip, 4 Grid, 6 Mosaic, separated by thin white gutters.
- **Any photo** — upload one photo for all panels, or a different photo per panel. Click a panel to select it, drag on the cover to pan it, and use the zoom slider to crop it.
- **Caption lettering** — a bold condensed uppercase caption with a gradient fill, dark outline and drop shadow, plus a sub-caption; size and position (top / middle / bottom) are adjustable.
- **Colour grades** — Sunset, Neon Nights, Vice Teal and Mono Noir washes, with a bright horizon sun strip and a vignette.
- **Fast export** — one click exports a PNG in 1080×1080, 1080×1350 or 1920×1080.

## Run

No build step, no network: every script, image and font is a file under `app/` (the lettering uses the system condensed stack — Arial Narrow / Impact / sans-serif bold), and photos are read on your own machine, never uploaded.

```sh
node serve.ts   # then open http://localhost:8080
```

Or open `app/index.html` from any static file server. `?shot=cover` and `?shot=editor` set up fixed scenes (see `shots.json`) for screenshots.

## Samples

`app/samples/boulevard.jpg` and `pier.jpg` were made with an image model for make.fun and are free to use. `app/samples/neon.jpg` is a procedural sunset-street scene drawn with a PIL script written for this entry — no real people, no game artwork.

## Originality

This is an original design. It uses no Rockstar Games logo, wordmark, official artwork, character or font.

## Hand-in

`main.ts` (Node standard library only) copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json` with `buildDossier` from `vendor/makefun-app.ts`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```
