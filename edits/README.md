# edits

The studio's promo videos, made in code with [Remotion](https://remotion.dev).
Each video is React: every frame is drawn from the frame number, and Remotion
turns the frames into an MP4.

## The promo

About 20 seconds at 60 fps, in Arabic and English, in three versions:

| Version | Size | For |
| --- | --- | --- |
| Phone | 1080 × 1920 | Reels, Stories, TikTok (a plain black phone) |
| iPhone | 1080 × 1920 | the same, on an iPhone 15 Pro with Safari |
| Mac | 1920 × 1080 | YouTube, LinkedIn, the site (a MacBook Pro whose lid opens) |
| Mac reel | 1080 × 1920 | the Mac version upright, for Reels: the screen spans the frame |

1. **Logo**: the letters write in, in reading order; the dot drops onto the end and bounces.
2. **Site**: the device arrives and the real site scrolls through Work, Services, About and Contact. A fingertip shows each swipe on the phones; on the Mac the site's own cursor moves and clicks Copy.
3. **Contact**: the dark ground opens, the email types itself out, then Instagram, the site and "Start a project".

Colours, fonts and words come from the site (`web/src/styles/tokens.css`,
`web/src/data`), gathered in `src/brand.ts`. Timing is in `src/timeline.json`.

## How it's made

- `scripts/record.mjs` films the site in headless Chrome, frame by frame on a
  stand-in clock, so every animation on the site plays exactly as for a
  visitor, without a dropped frame. Out: `public/rec/<device>-<locale>.mp4`.
- `scripts/sounds.mjs` synthesises the music bed and the effects (whooshes,
  the dot's pop, key clicks, the riser and hit) into `public/sfx/`. Nothing to
  license. To use a licensed track instead, replace `public/sfx/music.wav`.
- `src/devices/` draws the phone, iPhone and MacBook in CSS; `src/scenes/` the three scenes.

## Commands

Run from inside `edits/`:

```
npm install
npm run studio            # live preview in the browser
npm run record            # re-film the site (needs `astro dev` running in web/)
npm run sounds            # remake the music and effects
npm run render            # all eight to out/; or name some: npm run render -- IphoneAr MacReelAr
```

`npm run record` films the local dev server by default; to film the live
site: `node scripts/record.mjs iphone ar https://rasf.studio` (device, language, address).

Checking a draft without watching it: `node scripts/sheet.mjs IphoneAr 60,300,900`
renders those frames side by side into `out/check/`.

Remotion is free for individuals and for companies of up to three people;
larger teams need a [company licence](https://remotion.pro).
