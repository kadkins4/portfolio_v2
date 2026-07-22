# Project Videos

Two ways to put video on a project page. Both take mp4s from
`public/videos/projects/` (create the dir on first use; served at
`/videos/projects/...`).

## 1. Hero video (replaces the screenshot)

A short **muted autoplay loop** in place of the hero image. The `image`
field stays required in practice — it becomes the video's poster frame
and is still used for OG/social previews.

**Keystatic UI** (`/keystatic` → Projects → pick one): upload under
**Hero Video**.

**By hand** — frontmatter in `content/projects/<slug>.mdoc`:

```yaml
image: /images/projects/loresmith/hero.png
heroVideo: /videos/projects/loresmith-demo.mp4
```

Notes:

- No `heroVideo` → identical behavior to before (image + enlarge lightbox).
- With a video, the ⛶ enlarge button is hidden (lightbox is image-only).
- Autoplay only works because the video is muted — don't ship audio here.

## 2. Inline video in the write-up (with controls)

A `{% video %}` Markdoc tag anywhere in the body. Renders a `<video>`
with controls, `preload="metadata"` (no autoplay — fine to include audio).

**Keystatic UI**: in the Content editor, insert the **Video** component
and upload the file.

**By hand** — in the `.mdoc` body:

```markdoc
{% video src="/videos/projects/loresmith-walkthrough.mp4" /%}
```

Registered in `keystatic.config.ts` (`videoBlock`), rendered by the
`"tag"` case in `src/lib/renderMarkdoc.tsx`.

## Encoding

Target: hero loops ≤ 10s and ≤ ~3 MB; inline clips ≤ ~60s and ≤ ~10 MB.
H.264 mp4 for compatibility (Safari included). From a screen recording:

```sh
# hero loop: strip audio, cap width at 1280, good compression
ffmpeg -i recording.mov -an -vf "scale=1280:-2" -c:v libx264 \
  -crf 28 -preset slow -movflags +faststart hero.mp4

# inline clip: keep audio
ffmpeg -i recording.mov -vf "scale=1280:-2" -c:v libx264 -crf 26 \
  -preset slow -c:a aac -b:a 96k -movflags +faststart clip.mp4
```

`-movflags +faststart` matters — it moves the index to the front so
playback starts before the file finishes downloading.

Grab the poster frame if you don't have a screenshot:

```sh
ffmpeg -i hero.mp4 -frames:v 1 poster.png
```
